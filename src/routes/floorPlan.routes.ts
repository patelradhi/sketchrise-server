import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/requireAuth.js';
import { createJob, getJob, listMyJobs } from '../controllers/floorPlan.controller.js';

const router = Router();

const createLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => req.userId ?? req.ip ?? 'anon',
});

router.use(requireAuth);

router.post('/', createLimiter, createJob);
router.get('/me', listMyJobs);
router.get('/:id', getJob);

export default router;
