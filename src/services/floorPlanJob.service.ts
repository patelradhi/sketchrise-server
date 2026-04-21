import { FloorPlanJobModel } from '../models/FloorPlanJob.js';
import { fetchImageAsBase64 } from '../utils/fetchImageAsBase64.js';
import { generate3DFromImage } from './gemini.service.js';
import { uploadBufferToCloudinary } from './cloudinary.service.js';
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

		const { base64, mimeType } = await fetchImageAsBase64(job.source2dUrl);
		const result = await generate3DFromImage(base64, mimeType);

		if (!result.imageBuffer) {
			throw new Error('Gemini returned no image');
		}

		const uploaded = await uploadBufferToCloudinary(result.imageBuffer, 'sketchrise/3d');

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
