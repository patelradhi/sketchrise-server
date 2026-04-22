import { FloorPlanJobModel } from '../models/FloorPlanJob.js';
import { fetchImageAsBase64 } from '../utils/fetchImageAsBase64.js';
import { generate3DFromImage } from './gemini.service.js';
import { uploadBufferToCloudinary } from './cloudinary.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function runJob(jobId: string): Promise<void> {
	const job = await FloorPlanJobModel.findById(jobId);
	if (!job) {
		logger.warn({ jobId }, '[job] not found');
		return;
	}

	try {
		job.status = 'processing';
		await job.save();
		logger.info({ jobId }, '[job] processing');

		if (env.MOCK_GEMINI) {
			logger.warn({ jobId }, '[job] MOCK_GEMINI is ON — skipping Gemini, reusing 2D image as 3D');
			job.generated3dUrl = job.source2dUrl;
			job.generated3dPublicId = job.source2dPublicId;
			job.structure = { mocked: true, note: 'MOCK_GEMINI is on — no real 3D render' };
			job.status = 'completed';
			job.completedAt = new Date();
			await job.save();
			logger.info({ jobId }, '[job] completed (mocked)');
			return;
		}

		logger.info({ jobId, url: job.source2dUrl }, '[job] fetching 2D from Cloudinary');
		const { base64, mimeType } = await fetchImageAsBase64(job.source2dUrl);
		logger.info(
			{ jobId, mimeType, base64Length: base64.length },
			'[job] 2D fetched, sending to Gemini',
		);

		const result = await generate3DFromImage(base64, mimeType);
		logger.info(
			{
				jobId,
				hasImage: !!result.imageBuffer,
				imageBytes: result.imageBuffer?.length ?? 0,
				hasStructure: !!result.structure,
			},
			'[job] Gemini responded',
		);

		if (!result.imageBuffer) {
			throw new Error('Gemini returned no image');
		}

		logger.info({ jobId }, '[job] uploading 3D to Cloudinary');
		const uploaded = await uploadBufferToCloudinary(result.imageBuffer, 'sketchrise/3d');
		logger.info({ jobId, url: uploaded.secure_url }, '[job] 3D uploaded');

		job.generated3dUrl = uploaded.secure_url;
		job.generated3dPublicId = uploaded.public_id;
		if (result.structure && typeof result.structure === 'object') {
			job.structure = result.structure;
		}
		job.status = 'completed';
		job.completedAt = new Date();
		await job.save();

		logger.info({ jobId }, '[job] completed');
	} catch (err) {
		logger.error({ jobId, err }, '[job] failed');
		job.status = 'failed';
		job.errorMessage = '3D generation failed, please try again';
		await job.save();
	}
}
