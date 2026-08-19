import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { storageService } from '../services/storageService';
import { imageService } from '../services/imageService';
import { sendSuccess, sendError } from '../utils/response';

export const uploadPosterHandler = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const file = req.file;

    if (!file) {
      return sendError(res, 'No poster file uploaded', 400);
    }

    // Inspect image metadata
    const metadata = await imageService.getImageMetadata(file.buffer);

    // Save original poster
    const posterAsset = await storageService.saveFile(file, 'posters');

    // Create database FileAsset record
    const fileRecord = await prisma.fileAsset.create({
      data: {
        customerId,
        type: 'POSTER',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: posterAsset.storageKey,
        url: posterAsset.url,
      },
    });

    // Generate thumbnail
    try {
      const thumbBuffer = await imageService.generateThumbnail(file.buffer, 400);
      const thumbAsset = await storageService.saveBuffer(
        thumbBuffer,
        'thumbnails',
        `thumb_${file.originalname}.webp`,
        'image/webp'
      );
      await prisma.fileAsset.create({
        data: {
          customerId,
          type: 'THUMBNAIL',
          originalName: `thumb_${file.originalname}`,
          mimeType: 'image/webp',
          size: thumbBuffer.length,
          storageKey: thumbAsset.storageKey,
          url: thumbAsset.url,
        },
      });
    } catch (thumbErr) {
      console.warn('Thumbnail generation warning:', thumbErr);
    }

    return sendSuccess(
      res,
      {
        fileAsset: fileRecord,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
      'Poster uploaded successfully'
    );
  } catch (error: any) {
    console.error('uploadPoster error:', error);
    return sendError(res, error.message || 'Failed to upload poster', 500);
  }
};

export const uploadPhotoHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, 'No photo file uploaded', 400);
    }

    const saved = await storageService.saveFile(file, 'photos');

    // Ephemeral record for public user photo
    const fileRecord = await prisma.fileAsset.create({
      data: {
        customerId: req.user ? req.user.id : null,
        type: 'USER_PHOTO',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: saved.storageKey,
        url: saved.url,
      },
    });

    return sendSuccess(res, {
      fileAsset: fileRecord,
      url: saved.url,
      storageKey: saved.storageKey,
    });
  } catch (error: any) {
    console.error('uploadPhoto error:', error);
    return sendError(res, error.message || 'Failed to upload photo', 500);
  }
};

export const uploadLogoHandler = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const file = req.file;
    if (!file) {
      return sendError(res, 'No logo file uploaded', 400);
    }

    const saved = await storageService.saveFile(file, 'logos');

    const fileRecord = await prisma.fileAsset.create({
      data: {
        customerId,
        type: 'LOGO',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: saved.storageKey,
        url: saved.url,
      },
    });

    return sendSuccess(res, {
      fileAsset: fileRecord,
      url: saved.url,
    });
  } catch (error: any) {
    console.error('uploadLogo error:', error);
    return sendError(res, error.message || 'Failed to upload logo', 500);
  }
};
