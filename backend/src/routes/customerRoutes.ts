import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/customerController';
import { authenticate, requireCustomer } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
