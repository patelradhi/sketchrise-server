import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';

export class HttpError extends Error {
	status: number;
	code: string;
	constructor(status: number, code: string, message: string) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof HttpError) {
		res.status(err.status).json({ code: err.code, message: err.message });
		return;
	}
	logger.error({ err }, '[http] unexpected error');
	res.status(500).json({ code: 'internal_error', message: 'Something went wrong' });
};
