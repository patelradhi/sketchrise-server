import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/requireAuth.js';
import { upload2D } from '../controllers/upload.controller.js';

const router = Router();

const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => req.userId ?? req.ip ?? 'anon',
});

router.use(requireAuth);
router.post('/2d', limiter, upload2D);

export default router;
