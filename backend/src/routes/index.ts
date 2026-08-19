import { Router } from 'express';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';
import campaignRoutes from './campaignRoutes';
import uploadRoutes from './uploadRoutes';
import publicRoutes from './publicRoutes';
import generateRoutes from './generateRoutes';
import analyticsRoutes from './analyticsRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/uploads', uploadRoutes);
router.use('/public', publicRoutes);
router.use('/generate', generateRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'CampiFa',
    brand: 'i-Fa Design',
    timestamp: new Date().toISOString(),
  });
});

export default router;
