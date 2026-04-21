import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
	PORT: z.coerce.number().int().positive().default(5000),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	MONGODB_URI: z.string().min(1),

	CLOUDINARY_CLOUD_NAME: z.string().min(1),
	CLOUDINARY_API_KEY: z.string().min(1),
	CLOUDINARY_API_SECRET: z.string().min(1),
	CLOUDINARY_BASE_URL: z.string().url(),

	GEMINI_API_KEY: z.string().min(1),
	GEMINI_MODEL: z.string().default('gemini-3.1-flash-image-preview'),

	CLERK_SECRET_KEY: z.string().min(1),
	CLERK_PUBLISHABLE_KEY: z.string().min(1),

	APP_ORIGIN: z.string().default('http://localhost:8081'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
	console.error('[env] invalid environment configuration:');
	console.error(parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const env = parsed.data;
