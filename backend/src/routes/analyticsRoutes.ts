import { Router } from 'express';
import {
  getCustomerAnalytics,
  getCampaignAnalytics,
  trackEvent,
} from '../controllers/analyticsController';
import { authenticate, requireCustomer } from '../middleware/authMiddleware';

const router = Router();

// Public event tracking (views, downloads, shares)
router.post('/event', trackEvent);

// Customer-scoped analytics queries
router.get('/', authenticate, requireCustomer, getCustomerAnalytics);
router.get('/campaign/:id', authenticate, requireCustomer, getCampaignAnalytics);

export default router;
