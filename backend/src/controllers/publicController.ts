import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getPublicCampaign = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        posterFile: true,
        template: {
          include: {
            elements: {
              where: { visible: true },
              orderBy: { zIndex: 'asc' },
            },
            backgroundFile: true,
          },
        },
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
        customer: {
          select: {
            profile: {
              select: {
                fullName: true,
                businessName: true,
                logoUrl: true,
                brandColor: true,
                website: true,
                whatsappNumber: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found.', 404);
    }

    if (campaign.status === 'PAUSED') {
      return sendError(
        res,
        'This campaign is currently paused by the organizer. Please check back later.',
        403,
        { status: 'PAUSED', title: campaign.title }
      );
    }

    if (campaign.status === 'DRAFT') {
      return sendError(res, 'This campaign has not been published yet.', 403);
    }

    // Increment views count asynchronously
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(console.error);

    prisma.analyticsEvent.create({
      data: {
        campaignId: campaign.id,
        type: 'VIEW',
        ipHash: req.ip ? String(req.ip) : null,
        userAgent: req.headers['user-agent'] || null,
      },
    }).catch(console.error);

    return sendSuccess(res, { campaign });
  } catch (error) {
    console.error('getPublicCampaign error:', error);
    return sendError(res, 'Failed to load campaign', 500);
  }
};
