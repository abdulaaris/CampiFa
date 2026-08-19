import { Router } from 'express';
import {
  getAdminOverview,
  getAdminCustomers,
  getAdminCustomerById,
  suspendCustomer,
  activateCustomer,
  deleteCustomer,
  getAdminCampaigns,
  adminPauseCampaign,
  adminResumeCampaign,
  adminDeleteCampaign,
} from '../controllers/adminController';
import { authenticate, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Protect all admin routes with Super Admin authorization
router.use(authenticate, requireSuperAdmin);

router.get('/overview', getAdminOverview);

// Customer management
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerById);
router.post('/customers/:id/suspend', suspendCustomer);
router.post('/customers/:id/activate', activateCustomer);
router.delete('/customers/:id', deleteCustomer);

// Campaign management
router.get('/campaigns', getAdminCampaigns);
router.post('/campaigns/:id/pause', adminPauseCampaign);
router.post('/campaigns/:id/resume', adminResumeCampaign);
router.delete('/campaigns/:id', adminDeleteCampaign);

export default router;
