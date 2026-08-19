import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { period = '30d' } = req.query;

    // Get all campaigns owned by this customer
    const campaigns = await prisma.campaign.findMany({
      where: { customerId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewsCount: true,
        generationsCount: true,
        downloadsCount: true,
        sharesCount: true,
        createdAt: true,
        posterFile: {
          select: { url: true },
        },
      },
    });

    const campaignIds = campaigns.map((c) => c.id);

    // Calculate totals
    const totalViews = campaigns.reduce((acc, c) => acc + c.viewsCount, 0);
    const totalGenerations = campaigns.reduce((acc, c) => acc + c.generationsCount, 0);
    const totalDownloads = campaigns.reduce((acc, c) => acc + c.downloadsCount, 0);
    const totalShares = campaigns.reduce((acc, c) => acc + c.sharesCount, 0);
    const totalCampaigns = campaigns.length;
    const publishedCampaigns = campaigns.filter((c) => c.status === 'PUBLISHED').length;
    const draftCampaigns = campaigns.filter((c) => c.status === 'DRAFT').length;

    // Date filtering for time-series events
    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate = new Date(0); // All time
    }

    const events = await prisma.analyticsEvent.findMany({
      where: {
        campaignId: { in: campaignIds },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group events by day
    const timeSeriesMap: Record<string, { date: string; views: number; generations: number; downloads: number; shares: number }> = {};
    
    // Seed days if 7d or 30d
    const daysCount = period === '7d' ? 7 : period === '30d' ? 30 : period === 'today' ? 1 : 14;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      timeSeriesMap[key] = { date: key, views: 0, generations: 0, downloads: 0, shares: 0 };
    }

    for (const ev of events) {
      const key = ev.createdAt.toISOString().split('T')[0];
      if (!timeSeriesMap[key]) {
        timeSeriesMap[key] = { date: key, views: 0, generations: 0, downloads: 0, shares: 0 };
      }
      if (ev.type === 'VIEW') timeSeriesMap[key].views++;
      else if (ev.type === 'GENERATION') timeSeriesMap[key].generations++;
      else if (ev.type === 'DOWNLOAD') timeSeriesMap[key].downloads++;
      else if (ev.type === 'SHARE') timeSeriesMap[key].shares++;
    }

    const timeSeries = Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));

    return sendSuccess(res, {
      totals: {
        views: totalViews,
        generations: totalGenerations,
        downloads: totalDownloads,
        shares: totalShares,
        campaigns: totalCampaigns,
        published: publishedCampaigns,
        drafts: draftCampaigns,
      },
      timeSeries,
      campaignPerformance: campaigns,
    });
  } catch (error) {
    console.error('getCustomerAnalytics error:', error);
    return sendError(res, 'Failed to fetch analytics', 500);
  }
};

export const getCampaignAnalytics = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, customerId },
      include: {
        posterFile: true,
      },
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or access denied', 404);
    }

    const events = await prisma.analyticsEvent.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return sendSuccess(res, {
      campaign,
      events,
    });
  } catch (error) {
    console.error('getCampaignAnalytics error:', error);
    return sendError(res, 'Failed to fetch campaign analytics', 500);
  }
};

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { campaignId, type } = req.body;

    if (!campaignId || !type) {
      return sendError(res, 'campaignId and type are required', 400);
    }

    const validTypes = ['VIEW', 'GENERATION', 'DOWNLOAD', 'SHARE'];
    if (!validTypes.includes(type)) {
      return sendError(res, 'Invalid event type', 400);
    }

    // Increment corresponding campaign counter
    const updateData: any = {};
    if (type === 'VIEW') updateData.viewsCount = { increment: 1 };
    else if (type === 'GENERATION') updateData.generationsCount = { increment: 1 };
    else if (type === 'DOWNLOAD') updateData.downloadsCount = { increment: 1 };
    else if (type === 'SHARE') updateData.sharesCount = { increment: 1 };

    await Promise.all([
      prisma.campaign.update({
        where: { id: campaignId },
        data: updateData,
      }),
      prisma.analyticsEvent.create({
        data: {
          campaignId,
          type,
          ipHash: req.ip ? String(req.ip) : null,
          userAgent: req.headers['user-agent'] || null,
        },
      }),
    ]);

    return sendSuccess(res, null, 'Event recorded');
  } catch (error) {
    console.error('trackEvent error:', error);
    return sendError(res, 'Failed to record event', 500);
  }
};
