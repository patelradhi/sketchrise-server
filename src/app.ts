import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import floorPlanRoutes from './routes/floorPlan.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
	const app = express();

	app.use(helmet());
	app.use(cors({ origin: env.APP_ORIGIN, credentials: true }));
	// 70mb so base64-encoded 50MB images fit (base64 inflates ~33%)
	app.use(express.json({ limit: '70mb' }));
	app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

	app.get('/health', (_req, res) => {
		res.json({ ok: true, service: 'sketchrise-server', env: env.NODE_ENV });
	});

	app.use('/api/floor-plans', floorPlanRoutes);
	app.use('/api/uploads', uploadRoutes);

	app.use(errorHandler);

	return app;
}
