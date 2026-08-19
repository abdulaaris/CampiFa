import { Router } from 'express';
import {
  uploadPosterHandler,
  uploadPhotoHandler,
  uploadLogoHandler,
} from '../controllers/uploadController';
import { uploadPoster, uploadPhoto, uploadLogo } from '../middleware/uploadMiddleware';
import { authenticate, requireCustomer } from '../middleware/authMiddleware';

const router = Router();

// Customer uploads
router.post('/poster', authenticate, requireCustomer, uploadPoster, uploadPosterHandler);
router.post('/logo', authenticate, requireCustomer, uploadLogo, uploadLogoHandler);

// Public / User uploads (e.g. photo upload before generation)
router.post('/photo', uploadPhoto, uploadPhotoHandler);

export default router;
