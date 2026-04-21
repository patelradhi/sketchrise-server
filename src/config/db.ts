import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
	mongoose.connection.on('connected', () => logger.info('[mongo] connected'));
	mongoose.connection.on('error', (err) => logger.error({ err }, '[mongo] error'));
	mongoose.connection.on('disconnected', () => logger.warn('[mongo] disconnected'));

	await mongoose.connect(env.MONGODB_URI);
}
