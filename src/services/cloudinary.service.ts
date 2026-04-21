import { cloudinary } from '../config/cloudinary.js';

export async function uploadBufferToCloudinary(
	buffer: Buffer,
	folder: string,
): Promise<{ secure_url: string; public_id: string }> {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: 'image' },
			(err, result) => {
				if (err || !result) return reject(err ?? new Error('upload failed'));
				resolve({ secure_url: result.secure_url, public_id: result.public_id });
			},
		);
		stream.end(buffer);
	});
}
