import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

const elementSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['PHOTO', 'TEXT', 'SHAPE']),
  fieldId: z.string().nullable().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  zIndex: z.number().default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  stylesJson: z.string().default('{}'),
});

const fieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.string().default('text'),
  required: z.boolean().default(false),
  placeholder: z.string().nullable().optional(),
  maxLength: z.number().nullable().optional(),
  optionsJson: z.string().nullable().optional(),
  orderIndex: z.number().default(0),
});

const saveTemplateSchema = z.object({
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  backgroundFileId: z.string().nullable().optional(),
  elements: z.array(elementSchema),
  fields: z.array(fieldSchema).optional(),
});

export const getTemplate = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, customerId },
      include: {
        posterFile: true,
        template: {
          include: {
            elements: {
              orderBy: { zIndex: 'asc' },
            },
            backgroundFile: true,
          },
        },
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    // If template does not exist yet, create default
    let template = campaign.template;
    if (!template) {
      template = await prisma.campaignTemplate.create({
        data: {
          campaignId: campaign.id,
          width: 1080,
          height: 1350,
          backgroundFileId: campaign.posterFileId,
        },
        include: {
          elements: true,
          backgroundFile: true,
        },
      });
    }

    return sendSuccess(res, {
      template,
      posterFile: campaign.posterFile,
      fields: campaign.fields,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        status: campaign.status,
      },
    });
  } catch (error) {
    console.error('getTemplate error:', error);
    return sendError(res, 'Failed to fetch template', 500);
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { campaignId } = req.params;
    const validated = saveTemplateSchema.parse(req.body);

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, customerId },
      include: { template: true },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert template
      const template = await tx.campaignTemplate.upsert({
        where: { campaignId },
        update: {
          ...(validated.width && { width: validated.width }),
          ...(validated.height && { height: validated.height }),
          ...(validated.backgroundFileId !== undefined && { backgroundFileId: validated.backgroundFileId }),
          version: { increment: 1 },
        },
        create: {
          campaignId,
          width: validated.width || 1080,
          height: validated.height || 1350,
          backgroundFileId: validated.backgroundFileId || campaign.posterFileId,
        },
      });

      // 2. Replace elements
      await tx.templateElement.deleteMany({
        where: { templateId: template.id },
      });

      if (validated.elements.length > 0) {
        await tx.templateElement.createMany({
          data: validated.elements.map((el, idx) => ({
            templateId: template.id,
            type: el.type,
            fieldId: el.fieldId || null,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation || 0,
            zIndex: el.zIndex !== undefined ? el.zIndex : idx + 1,
            visible: el.visible !== undefined ? el.visible : true,
            locked: el.locked !== undefined ? el.locked : false,
            stylesJson: typeof el.stylesJson === 'string' ? el.stylesJson : JSON.stringify(el.stylesJson || {}),
          })),
        });
      }

      // 3. Update fields if provided
      if (validated.fields) {
        await tx.campaignField.deleteMany({
          where: { campaignId },
        });

        if (validated.fields.length > 0) {
          await tx.campaignField.createMany({
            data: validated.fields.map((f, idx) => ({
              campaignId,
              name: f.name,
              label: f.label,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder || null,
              maxLength: f.maxLength || null,
              optionsJson: f.optionsJson || null,
              orderIndex: idx,
            })),
          });
        }
      }

      return tx.campaignTemplate.findUnique({
        where: { id: template.id },
        include: {
          elements: { orderBy: { zIndex: 'asc' } },
          backgroundFile: true,
        },
      });
    });

    return sendSuccess(res, { template: result }, 'Template saved successfully');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 422);
    }
    console.error('updateTemplate error:', error);
    return sendError(res, 'Failed to update template', 500);
  }
};

export const validateTemplate = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, customerId },
      include: {
        posterFile: true,
        template: {
          include: {
            elements: true,
          },
        },
        fields: true,
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Poster presence
    if (!campaign.posterFileId) {
      errors.push('Poster background is missing. Please upload a ready-made poster.');
    }

    // 2. Elements presence
    if (!campaign.template || campaign.template.elements.length === 0) {
      errors.push('No personalization areas configured. Add at least a photo area or a text area.');
    } else {
      const template = campaign.template;
      const elements = template.elements;
      const fields = campaign.fields;
      const fieldNames = new Set(fields.map((f) => f.name));

      // 3. Field to element mapping check
      for (const el of elements) {
        if (el.fieldId && !fieldNames.has(el.fieldId)) {
          errors.push(`Element is mapped to field "${el.fieldId}" which does not exist in campaign fields.`);
        }

        // Element bounds check
        if (el.x < 0 || el.y < 0 || el.x + el.width > template.width || el.y + el.height > template.height) {
          warnings.push(`An element extends beyond the poster canvas boundary.`);
        }
      }

      // 4. Photo field presence
      const hasPhotoField = fields.some((f) => f.type === 'photo');
      const hasPhotoElement = elements.some((el) => el.type === 'PHOTO');
      if (hasPhotoField && !hasPhotoElement) {
        warnings.push('A photo field is configured, but no photo area placeholder exists on the canvas.');
      }
    }

    const isValid = errors.length === 0;

    return sendSuccess(res, {
      isValid,
      errors,
      warnings,
    });
  } catch (error) {
    console.error('validateTemplate error:', error);
    return sendError(res, 'Failed to validate template', 500);
  }
};
