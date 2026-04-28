import { cloudinary } from '../config/cloudinary.js';

export type CloudinaryFolder = '2d' | '3d';

export interface UploadResult {
	secure_url: string;
	public_id: string;
}

export async function uploadImage(
	base64: string,
	mimeType: string,
	folder: CloudinaryFolder,
	userId: string,
): Promise<UploadResult> {
	const dataUrl = base64.startsWith('data:') ? base64 : `data:${mimeType};base64,${base64}`;
	const result = await cloudinary.uploader.upload(dataUrl, {
		folder: `sketchrise/${folder}/${userId}`,
		resource_type: 'image',
	});
	return { secure_url: result.secure_url, public_id: result.public_id };
}
