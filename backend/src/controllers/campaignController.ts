import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { slugify } from '../utils/slugify';

const createCampaignSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().default('general'),
  posterFileId: z.string().optional(),
});

const updateCampaignSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  posterFileId: z.string().optional(),
});

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { status, search, limit = 50, page = 1 } = req.query;

    const where: any = {
      customerId, // STRICT TENANT ISOLATION
    };

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
        include: {
          posterFile: true,
          template: {
            include: {
              elements: true,
            },
          },
          fields: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return sendSuccess(res, {
      campaigns,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('getCampaigns error:', error);
    return sendError(res, 'Failed to fetch campaigns', 500);
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        customerId, // Strict tenant isolation
      },
      include: {
        posterFile: true,
        template: {
          include: {
            elements: true,
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

    return sendSuccess(res, { campaign });
  } catch (error) {
    console.error('getCampaignById error:', error);
    return sendError(res, 'Failed to fetch campaign details', 500);
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const validated = createCampaignSchema.parse(req.body);

    // Generate unique slug
    let baseSlug = slugify(validated.title);
    if (!baseSlug) baseSlug = 'campaign';
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.campaign.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create campaign with default template and default fields
    const campaign = await prisma.campaign.create({
      data: {
        customerId,
        title: validated.title,
        slug,
        description: validated.description || null,
        category: validated.category || 'general',
        status: 'DRAFT',
        posterFileId: validated.posterFileId || null,
        template: {
          create: {
            width: 1080,
            height: 1350,
            backgroundFileId: validated.posterFileId || null,
            elements: {
              create: [
                {
                  type: 'PHOTO',
                  fieldId: 'photo',
                  x: 390,
                  y: 750,
                  width: 300,
                  height: 300,
                  zIndex: 1,
                  stylesJson: JSON.stringify({
                    shape: 'circle',
                    borderWidth: 6,
                    borderColor: '#ffffff',
                    shadow: true,
                  }),
                },
                {
                  type: 'TEXT',
                  fieldId: 'name',
                  x: 100,
                  y: 1080,
                  width: 880,
                  height: 60,
                  zIndex: 2,
                  stylesJson: JSON.stringify({
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 42,
                    fontWeight: 'bold',
                    color: '#7B2525',
                    textAlign: 'center',
                  }),
                },
                {
                  type: 'TEXT',
                  fieldId: 'designation',
                  x: 100,
                  y: 1150,
                  width: 880,
                  height: 45,
                  zIndex: 3,
                  stylesJson: JSON.stringify({
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 26,
                    fontWeight: 'normal',
                    color: '#4A4A4A',
                    textAlign: 'center',
                  }),
                },
              ],
            },
          },
        },
        fields: {
          create: [
            {
              name: 'photo',
              label: 'Your Photo',
              type: 'photo',
              required: true,
              orderIndex: 0,
            },
            {
              name: 'name',
              label: 'Your Name',
              type: 'text',
              placeholder: 'e.g. ABDUL AARIS',
              required: true,
              maxLength: 60,
              orderIndex: 1,
            },
            {
              name: 'designation',
              label: 'Designation / Title',
              type: 'text',
              placeholder: 'e.g. General Secretary / Student',
              required: false,
              maxLength: 80,
              orderIndex: 2,
            },
          ],
        },
      },
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

    return sendSuccess(res, { campaign }, 'Campaign created successfully', 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 422);
    }
    console.error('createCampaign error:', error);
    return sendError(res, 'Failed to create campaign', 500);
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;
    const validated = updateCampaignSchema.parse(req.body);

    const existing = await prisma.campaign.findFirst({
      where: { id, customerId },
    });

    if (!existing) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.category && { category: validated.category }),
        ...(validated.posterFileId && {
          posterFileId: validated.posterFileId,
          template: {
            update: {
              backgroundFileId: validated.posterFileId,
            },
          },
        }),
      },
      include: {
        posterFile: true,
        template: {
          include: { elements: true },
        },
        fields: true,
      },
    });

    return sendSuccess(res, { campaign: updated }, 'Campaign updated successfully');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 422);
    }
    console.error('updateCampaign error:', error);
    return sendError(res, 'Failed to update campaign', 500);
  }
};

export const publishCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, customerId },
      include: {
        posterFile: true,
        template: {
          include: { elements: true },
        },
        fields: true,
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    // Validation checks before publishing
    if (!campaign.posterFileId) {
      return sendError(res, 'Cannot publish: Please upload a ready-made poster first.', 400);
    }

    if (!campaign.template || campaign.template.elements.length === 0) {
      return sendError(res, 'Cannot publish: Template must have at least one personalized element (photo or text area).', 400);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: campaign.publishedAt || new Date(),
      },
    });

    return sendSuccess(res, { campaign: updated }, 'Campaign published successfully! It is now live to the public.');
  } catch (error) {
    console.error('publishCampaign error:', error);
    return sendError(res, 'Failed to publish campaign', 500);
  }
};

export const pauseCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, customerId },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    return sendSuccess(res, { campaign: updated }, 'Campaign paused. Public access is now temporarily disabled.');
  } catch (error) {
    console.error('pauseCampaign error:', error);
    return sendError(res, 'Failed to pause campaign', 500);
  }
};

export const resumeCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, customerId },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    return sendSuccess(res, { campaign: updated }, 'Campaign resumed! Public access is active.');
  } catch (error) {
    console.error('resumeCampaign error:', error);
    return sendError(res, 'Failed to resume campaign', 500);
  }
};

export const duplicateCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const source = await prisma.campaign.findFirst({
      where: { id, customerId },
      include: {
        template: {
          include: { elements: true },
        },
        fields: true,
      },
    });

    if (!source) {
      return sendError(res, 'Source campaign not found', 404);
    }

    const title = `${source.title} (Copy)`;
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.campaign.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const duplicate = await prisma.campaign.create({
      data: {
        customerId,
        title,
        slug,
        description: source.description,
        category: source.category,
        status: 'DRAFT',
        posterFileId: source.posterFileId,
        template: source.template
          ? {
              create: {
                width: source.template.width,
                height: source.template.height,
                backgroundFileId: source.template.backgroundFileId,
                elements: {
                  create: source.template.elements.map((el) => ({
                    type: el.type,
                    fieldId: el.fieldId,
                    x: el.x,
                    y: el.y,
                    width: el.width,
                    height: el.height,
                    rotation: el.rotation,
                    zIndex: el.zIndex,
                    visible: el.visible,
                    locked: el.locked,
                    stylesJson: el.stylesJson,
                  })),
                },
              },
            }
          : undefined,
        fields: {
          create: source.fields.map((f) => ({
            name: f.name,
            label: f.label,
            type: f.type,
            required: f.required,
            placeholder: f.placeholder,
            maxLength: f.maxLength,
            optionsJson: f.optionsJson,
            orderIndex: f.orderIndex,
          })),
        },
      },
      include: {
        posterFile: true,
        template: { include: { elements: true } },
        fields: true,
      },
    });

    return sendSuccess(res, { campaign: duplicate }, 'Campaign duplicated successfully');
  } catch (error) {
    console.error('duplicateCampaign error:', error);
    return sendError(res, 'Failed to duplicate campaign', 500);
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.campaign.findFirst({
      where: { id, customerId },
    });

    if (!existing) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    await prisma.campaign.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Campaign deleted successfully');
  } catch (error) {
    console.error('deleteCampaign error:', error);
    return sendError(res, 'Failed to delete campaign', 500);
  }
};
