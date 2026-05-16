import type { RequestHandler } from 'express';
import { z } from 'zod';
import { uploadImage } from '../services/cloudinary.service.js';
import { HttpError } from '../middleware/errorHandler.js';

const uploadBody = z.object({
	base64: z.string().min(1),
	mimeType: z.string().min(1),
});

export const upload2D: RequestHandler = async (req, res, next) => {
	console.log(`[ctrl:upload2D] hit  userId=${req.userId}  mime=${req.body?.mimeType}  base64Length=${req.body?.base64?.length ?? 0}`);
	try {
		const { base64, mimeType } = uploadBody.parse(req.body);
		const result = await uploadImage(base64, mimeType, '2d', req.userId!);
		console.log(`[ctrl:upload2D] uploaded ok  publicId=${result.public_id}`);
		res.json({ url: result.secure_url, publicId: result.public_id });
	} catch (err) {
		console.error('[ctrl:upload2D] failed', err);
		if (err instanceof z.ZodError) {
			return next(new HttpError(400, 'bad_request', err.issues[0]?.message ?? 'invalid body'));
		}
		next(err);
	}
};
