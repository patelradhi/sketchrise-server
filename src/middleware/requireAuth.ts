import type { RequestHandler } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { env } from '../config/env.js';
import { HttpError } from './errorHandler.js';

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			userId?: string;
			userName?: string;
			userAvatarUrl?: string;
		}
	}
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
	try {
		const header = req.header('authorization') ?? '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) throw new HttpError(401, 'unauthorized', 'Missing bearer token');

		const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
		const userId = payload.sub;
		if (!userId) throw new HttpError(401, 'unauthorized', 'Invalid token');

		const user = await clerk.users.getUser(userId);
		req.userId = userId;
		req.userName =
			[user.firstName, user.lastName].filter(Boolean).join(' ') ||
			user.username ||
			user.primaryEmailAddress?.emailAddress ||
			'Unknown';
		req.userAvatarUrl = user.imageUrl;

		next();
	} catch (err) {
		if (err instanceof HttpError) return next(err);
		next(new HttpError(401, 'unauthorized', 'Invalid or expired token'));
	}
};
