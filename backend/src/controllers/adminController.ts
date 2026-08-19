import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    const [
      totalCustomers,
      totalCampaigns,
      publishedCampaigns,
      totalGenerations,
      totalDownloads,
      recentCampaigns,
      recentCustomers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'PUBLISHED' } }),
      prisma.generation.count(),
      prisma.analyticsEvent.count({ where: { type: 'DOWNLOAD' } }),
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            include: { profile: true },
          },
          posterFile: true,
        },
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          _count: { select: { campaigns: true } },
        },
      }),
    ]);

    return sendSuccess(res, {
      stats: {
        totalCustomers,
        totalCampaigns,
        publishedCampaigns,
        totalGenerations,
        totalDownloads,
      },
      recentCampaigns,
      recentCustomers,
    });
  } catch (error) {
    console.error('getAdminOverview error:', error);
    return sendError(res, 'Failed to fetch admin overview', 500);
  }
};

export const getAdminCustomers = async (req: Request, res: Response) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const where: any = { role: 'CUSTOMER' };

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { email: { contains: search } },
        { profile: { fullName: { contains: search } } },
        { profile: { businessName: { contains: search } } },
      ];
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          _count: {
            select: { campaigns: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, {
      customers,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('getAdminCustomers error:', error);
    return sendError(res, 'Failed to fetch customers', 500);
  }
};

export const getAdminCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        campaigns: {
          include: {
            posterFile: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    return sendSuccess(res, { customer });
  } catch (error) {
    console.error('getAdminCustomerById error:', error);
    return sendError(res, 'Failed to fetch customer details', 500);
  }
};

export const suspendCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'Customer not found', 404);
    }

    if (user.role === 'SUPER_ADMIN') {
      return sendError(res, 'Cannot suspend Super Admin accounts', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
      include: { profile: true },
    });

    return sendSuccess(res, { user: updated }, 'Customer account suspended');
  } catch (error) {
    console.error('suspendCustomer error:', error);
    return sendError(res, 'Failed to suspend customer', 500);
  }
};

export const activateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { profile: true },
    });

    return sendSuccess(res, { user: updated }, 'Customer account reactivated');
  } catch (error) {
    console.error('activateCustomer error:', error);
    return sendError(res, 'Failed to activate customer', 500);
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'Customer not found', 404);
    }

    if (user.role === 'SUPER_ADMIN') {
      return sendError(res, 'Cannot delete Super Admin accounts', 400);
    }

    await prisma.user.delete({ where: { id } });

    return sendSuccess(res, null, 'Customer account deleted successfully');
  } catch (error) {
    console.error('deleteCustomer error:', error);
    return sendError(res, 'Failed to delete customer', 500);
  }
};

export const getAdminCampaigns = async (req: Request, res: Response) => {
  try {
    const { search, status, page = 1, limit = 30 } = req.query;

    const where: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { customer: { email: { contains: search } } },
        { customer: { profile: { businessName: { contains: search } } } },
      ];
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            include: { profile: true },
          },
          posterFile: true,
          _count: {
            select: { generations: true },
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
    console.error('getAdminCampaigns error:', error);
    return sendError(res, 'Failed to fetch campaigns', 500);
  }
};

export const adminPauseCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
    return sendSuccess(res, { campaign }, 'Campaign paused by administrator');
  } catch (error) {
    return sendError(res, 'Failed to pause campaign', 500);
  }
};

export const adminResumeCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
    return sendSuccess(res, { campaign }, 'Campaign resumed by administrator');
  } catch (error) {
    return sendError(res, 'Failed to resume campaign', 500);
  }
};

export const adminDeleteCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.campaign.delete({ where: { id } });
    return sendSuccess(res, null, 'Campaign deleted by administrator');
  } catch (error) {
    return sendError(res, 'Failed to delete campaign', 500);
  }
};
