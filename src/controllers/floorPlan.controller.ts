import type { RequestHandler } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { FloorPlanJobModel } from '../models/FloorPlanJob.js';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { runJob } from '../services/floorPlanJob.service.js';
import { logger } from '../utils/logger.js';

const createBody = z.object({
	source2dUrl: z.string().url(),
	source2dPublicId: z.string().min(1),
	title: z.string().min(1).max(120).optional(),
});

export const createJob: RequestHandler = async (req, res, next) => {
	try {
		const body = createBody.parse(req.body);
		if (!body.source2dUrl.startsWith(env.CLOUDINARY_BASE_URL)) {
			throw new HttpError(400, 'invalid_url', 'source2dUrl must be a Cloudinary URL from this account');
		}

		const job = await FloorPlanJobModel.create({
			userId: req.userId!,
			userName: req.userName!,
			userAvatarUrl: req.userAvatarUrl,
			title: body.title ?? 'Untitled Project',
			status: 'pending',
			source2dUrl: body.source2dUrl,
			source2dPublicId: body.source2dPublicId,
		});

		res.status(202).json({ jobId: job._id.toString(), status: job.status });

		runJob(job._id.toString()).catch((err) =>
			logger.error({ err, jobId: job._id.toString() }, '[job] unhandled'),
		);
	} catch (err) {
		if (err instanceof z.ZodError) return next(new HttpError(400, 'bad_request', err.issues[0]?.message ?? 'invalid body'));
		next(err);
	}
};

export const getJob: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'bad_request', 'invalid id');

		const job = await FloorPlanJobModel.findById(id);
		if (!job) throw new HttpError(404, 'not_found', 'job not found');
		if (job.userId !== req.userId) throw new HttpError(403, 'forbidden', 'not your job');

		res.json(serializeJob(job));
	} catch (err) {
		next(err);
	}
};

export const listMyJobs: RequestHandler = async (req, res, next) => {
	try {
		const limit = Math.min(Number(req.query.limit ?? 20), 50);
		const jobs = await FloorPlanJobModel.find({ userId: req.userId!, status: 'completed' })
			.sort({ createdAt: -1 })
			.limit(limit);
		res.json(jobs.map(serializeJob));
	} catch (err) {
		next(err);
	}
};

const updateBody = z.object({
	title: z.string().min(1).max(120),
});

export const renameJob: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'bad_request', 'invalid id');

		const { title } = updateBody.parse(req.body);

		const job = await FloorPlanJobModel.findById(id);
		if (!job) throw new HttpError(404, 'not_found', 'job not found');
		if (job.userId !== req.userId) throw new HttpError(403, 'forbidden', 'not your job');

		job.title = title;
		await job.save();
		res.json(serializeJob(job));
	} catch (err) {
		if (err instanceof z.ZodError) return next(new HttpError(400, 'bad_request', err.issues[0]?.message ?? 'invalid body'));
		next(err);
	}
};

export const deleteJob: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'bad_request', 'invalid id');

		const job = await FloorPlanJobModel.findById(id);
		if (!job) throw new HttpError(404, 'not_found', 'job not found');
		if (job.userId !== req.userId) throw new HttpError(403, 'forbidden', 'not your job');

		await job.deleteOne();
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
};

function serializeJob(j: InstanceType<typeof FloorPlanJobModel>) {
	return {
		id: j._id.toString(),
		status: j.status,
		title: j.title,
		source2dUrl: j.source2dUrl,
		generated3dUrl: j.generated3dUrl ?? null,
		structure: j.structure ?? null,
		errorMessage: j.errorMessage ?? null,
		userName: j.userName,
		userAvatarUrl: j.userAvatarUrl ?? null,
		createdAt: j.createdAt,
		completedAt: j.completedAt ?? null,
	};
}
