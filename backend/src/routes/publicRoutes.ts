import { Router } from 'express';
import { getPublicCampaign } from '../controllers/publicController';

const router = Router();

router.get('/campaigns/:slug', getPublicCampaign);

export default router;
