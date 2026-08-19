import { Router } from 'express';
import { generatePoster, getGenerationById } from '../controllers/generateController';
import { uploadPhoto } from '../middleware/uploadMiddleware';

const router = Router();

// Allow generation either via json or multipart form-data with photo file
router.post('/', uploadPhoto, generatePoster);
router.get('/:id', getGenerationById);

export default router;
