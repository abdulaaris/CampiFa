import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { storageService } from '../services/storageService';
import { imageService, DynamicElement } from '../services/imageService';
import { sendSuccess, sendError } from '../utils/response';

export const generatePoster = async (req: Request, res: Response) => {
  try {
    const { campaignId, fieldValues: fieldValuesRaw, anonymousSessionId } = req.body;

    if (!campaignId) {
      return sendError(res, 'Campaign ID is required', 400);
    }

    let fieldValues: Record<string, string> = {};
    if (typeof fieldValuesRaw === 'string') {
      try {
        fieldValues = JSON.parse(fieldValuesRaw);
      } catch (e) {
        fieldValues = {};
      }
    } else if (fieldValuesRaw && typeof fieldValuesRaw === 'object') {
      fieldValues = fieldValuesRaw;
    }

    // 1. Fetch Campaign & Template
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        posterFile: true,
        template: {
          include: {
            elements: { orderBy: { zIndex: 'asc' } },
            backgroundFile: true,
          },
        },
        fields: true,
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found', 404);
    }

    // Check status: Allow PUBLISHED, or allow preview if customer is owner
    const isOwner = req.user && req.user.id === campaign.customerId;
    if (campaign.status !== 'PUBLISHED' && !isOwner) {
      return sendError(
        res,
        campaign.status === 'PAUSED'
          ? 'This campaign is temporarily paused by the organizer.'
          : 'This campaign is not published yet.',
        400
      );
    }

    if (!campaign.posterFile && !campaign.template?.backgroundFile) {
      return sendError(res, 'Base poster artwork not found for this campaign.', 400);
    }

    const posterAsset = campaign.posterFile || campaign.template?.backgroundFile;
    const posterFilePath = storageService.getFilePath(posterAsset!.storageKey);

    if (!fs.existsSync(posterFilePath)) {
      return sendError(res, 'Base poster image file is missing on storage server.', 500);
    }

    const basePosterBuffer = await fs.promises.readFile(posterFilePath);

    // 2. Process user photo buffer
    let userPhotoBuffer: Buffer | null = null;
    if (req.file) {
      userPhotoBuffer = req.file.buffer;
    } else if (fieldValues.photoUrl) {
      // If photoUrl was passed, read it
      const photoStorageKey = fieldValues.photoUrl.replace('/uploads/', '');
      const photoPath = storageService.getFilePath(photoStorageKey);
      if (fs.existsSync(photoPath)) {
        userPhotoBuffer = await fs.promises.readFile(photoPath);
      }
    } else if (fieldValues.photoBase64) {
      const base64Data = fieldValues.photoBase64.replace(/^data:image\/\w+;base64,/, '');
      userPhotoBuffer = Buffer.from(base64Data, 'base64');
    }

    // 3. Build DynamicElements list from template
    const templateElements = campaign.template?.elements || [];
    const elementsToRender: DynamicElement[] = [];

    for (const elem of templateElements) {
      if (!elem.visible) continue;

      let styles: any = {};
      try {
        styles = JSON.parse(elem.stylesJson);
      } catch (e) {
        styles = {};
      }

      if (elem.type === 'PHOTO') {
        if (userPhotoBuffer) {
          elementsToRender.push({
            type: 'PHOTO',
            x: elem.x,
            y: elem.y,
            width: elem.width,
            height: elem.height,
            rotation: elem.rotation,
            zIndex: elem.zIndex,
            styles: {
              shape: styles.shape || 'circle',
              borderRadius: styles.borderRadius,
              borderWidth: styles.borderWidth || 0,
              borderColor: styles.borderColor || '#ffffff',
              shadow: styles.shadow,
            },
            photoBuffer: userPhotoBuffer,
          });
        }
      } else if (elem.type === 'TEXT') {
        const fieldName = elem.fieldId || 'name';
        const rawValue = fieldValues[fieldName] || (fieldName === 'name' ? 'YOUR NAME' : '');
        
        elementsToRender.push({
          type: 'TEXT',
          x: elem.x,
          y: elem.y,
          width: elem.width,
          height: elem.height,
          rotation: elem.rotation,
          zIndex: elem.zIndex,
          styles: {
            fontFamily: styles.fontFamily || 'Inter, sans-serif',
            fontSize: styles.fontSize || 32,
            fontWeight: styles.fontWeight || 'bold',
            color: styles.color || '#242424',
            textAlign: styles.textAlign || 'left',
            letterSpacing: styles.letterSpacing || 0,
            lineHeight: styles.lineHeight || 1.2,
          },
          value: rawValue,
        });
      } else if (elem.type === 'SHAPE') {
        elementsToRender.push({
          type: 'SHAPE',
          x: elem.x,
          y: elem.y,
          width: elem.width,
          height: elem.height,
          rotation: elem.rotation,
          zIndex: elem.zIndex,
          styles: {
            backgroundColor: styles.backgroundColor,
            borderRadius: styles.borderRadius,
          },
        });
      }
    }

    // 4. Render personalized poster using Sharp
    const renderedBuffer = await imageService.renderPersonalizedPoster(basePosterBuffer, elementsToRender);

    // 5. Save generated image
    const outputFilename = `CampiFa-${campaign.slug}-${Date.now()}.png`;
    const savedAsset = await storageService.saveBuffer(
      renderedBuffer,
      'generated',
      outputFilename,
      'image/png'
    );

    // 6. Record Generation in DB & Increment counters
    const generation = await prisma.generation.create({
      data: {
        campaignId: campaign.id,
        anonymousSessionId: anonymousSessionId || null,
        metadataJson: JSON.stringify({
          fieldsProvided: Object.keys(fieldValues),
          timestamp: new Date().toISOString(),
        }),
        outputUrl: savedAsset.url,
      },
    });

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { generationsCount: { increment: 1 } },
    });

    // Record generation analytics event
    await prisma.analyticsEvent.create({
      data: {
        campaignId: campaign.id,
        type: 'GENERATION',
        ipHash: req.ip ? String(req.ip) : null,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    return sendSuccess(
      res,
      {
        generationId: generation.id,
        outputUrl: savedAsset.url,
        downloadUrl: savedAsset.url,
        filename: outputFilename,
      },
      'Personalized poster generated successfully!'
    );
  } catch (error: any) {
    console.error('generatePoster error:', error);
    return sendError(res, error.message || 'Failed to generate personalized poster', 500);
  }
};

export const getGenerationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const generation = await prisma.generation.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!generation) {
      return sendError(res, 'Generation record not found', 404);
    }

    return sendSuccess(res, { generation });
  } catch (error) {
    console.error('getGenerationById error:', error);
    return sendError(res, 'Failed to fetch generation record', 500);
  }
};
