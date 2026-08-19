import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  phone: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  address: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let profile = await prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      // Auto-create blank profile if missing
      profile = await prisma.customerProfile.create({
        data: {
          userId,
          fullName: 'Customer',
          businessName: 'My Organization',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });
    }

    return sendSuccess(res, { profile });
  } catch (error) {
    console.error('getProfile error:', error);
    return sendError(res, 'Failed to fetch customer profile', 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const validated = updateProfileSchema.parse(req.body);

    const profile = await prisma.customerProfile.upsert({
      where: { userId },
      update: {
        ...(validated.fullName && { fullName: validated.fullName }),
        ...(validated.businessName && { businessName: validated.businessName }),
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.logoUrl !== undefined && { logoUrl: validated.logoUrl }),
        ...(validated.brandColor !== undefined && { brandColor: validated.brandColor }),
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.website !== undefined && { website: validated.website }),
        ...(validated.whatsappNumber !== undefined && { whatsappNumber: validated.whatsappNumber }),
      },
      create: {
        userId,
        fullName: validated.fullName || 'Customer',
        businessName: validated.businessName || 'My Organization',
        phone: validated.phone || null,
        logoUrl: validated.logoUrl || null,
        brandColor: validated.brandColor || '#7B2525',
        address: validated.address || null,
        website: validated.website || null,
        whatsappNumber: validated.whatsappNumber || null,
      },
    });

    return sendSuccess(res, { profile }, 'Profile updated successfully');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 422);
    }
    console.error('updateProfile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
};
