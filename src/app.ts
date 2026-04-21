import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';

export function createApp() {
	const app = express();

	app.use(helmet());
	app.use(cors({ origin: env.APP_ORIGIN, credentials: true }));
	app.use(express.json({ limit: '1mb' }));
	app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

	app.get('/health', (_req, res) => {
		res.json({ ok: true, service: 'sketchrise-server', env: env.NODE_ENV });
	});

	return app;
}
