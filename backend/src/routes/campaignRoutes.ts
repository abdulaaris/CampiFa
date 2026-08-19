import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  publishCampaign,
  pauseCampaign,
  resumeCampaign,
  duplicateCampaign,
  deleteCampaign,
} from '../controllers/campaignController';
import {
  getTemplate,
  updateTemplate,
  validateTemplate,
} from '../controllers/templateController';
import { authenticate, requireCustomer } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, requireCustomer);

// Campaign CRUD
router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

// Campaign Actions
router.post('/:id/publish', publishCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/resume', resumeCampaign);
router.post('/:id/duplicate', duplicateCampaign);

// Template Management within Campaign scope
router.get('/:campaignId/template', getTemplate);
router.put('/:campaignId/template', updateTemplate);
router.post('/:campaignId/template/validate', validateTemplate);

export default router;
