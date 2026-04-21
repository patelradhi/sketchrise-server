import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

async function main() {
	await connectDB();
	const app = createApp();
	app.listen(env.PORT, () => {
		logger.info(`[api] listening on http://localhost:${env.PORT}`);
	});
}

main().catch((err) => {
	logger.error({ err }, '[boot] fatal');
	process.exit(1);
});
