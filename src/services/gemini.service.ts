import { ai } from '../config/gemini.js';
import { FLOOR_PLAN_PROMPT } from '../prompts/floorPlan.prompt.js';

export interface GeminiGenerationResult {
	imageBuffer: Buffer;
	imageMime: string;
	structure: unknown | null;
}

export async function generate3DFromImage(base64Image: string, mimeType: string): Promise<GeminiGenerationResult> {
	const model = 'gemini-2.5-flash-image';
	const startedAt = Date.now();
	console.log(`[gemini] → request  model=${model}  inputMime=${mimeType}  inputBase64Length=${base64Image.length}`);

	const result = await ai.models.generateContent({
		model,
		contents: [
			{
				role: 'user',
				parts: [
					{ text: FLOOR_PLAN_PROMPT },
					{
						inlineData: {
							mimeType: mimeType || 'image/jpeg',
							data: base64Image,
						},
					},
				],
			},
		],
		config: { responseModalities: ['TEXT', 'IMAGE'] },
	});

	const ms = Date.now() - startedAt;
	console.log(`[gemini] ← response received  ${ms}ms`);

	const parts = result.candidates?.[0]?.content?.parts;
	if (!parts) {
		console.error('[gemini] no parts in response', JSON.stringify(result, null, 2));
		throw new Error('AI returned no response. Please try again.');
	}
	console.log(`[gemini] parts: ${parts.length} (image=${parts.filter((p) => p.inlineData).length}, text=${parts.filter((p) => p.text).length})`);

	const imagePart = parts.find((p) => p.inlineData);
	if (!imagePart?.inlineData?.data) {
		const textFeedback = parts.find((p) => p.text)?.text;
		console.error('[gemini] no image part returned. Text feedback:', textFeedback);
		throw new Error(textFeedback || 'AI returned no image. Please try a clearer floor plan.');
	}

	const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
	const imageMime = imagePart.inlineData.mimeType || 'image/png';
	console.log(`[gemini] image extracted  bytes=${imageBuffer.length}  mime=${imageMime}`);

	let structure: unknown | null = null;
	const rawText = parts
		.filter((p) => p.text)
		.map((p) => p.text as string)
		.join('\n')
		.trim();
	if (rawText) {
		console.log(`[gemini] raw text length=${rawText.length}`);
		const cleaned = rawText
			.replace(/^```(?:json)?\s*/i, '')
			.replace(/\s*```$/i, '')
			.trim();
		try {
			structure = JSON.parse(cleaned);
			console.log('[gemini] structure parsed:', JSON.stringify(structure));
		} catch (err) {
			console.error('[gemini] JSON parse FAILED. Raw cleaned text was:', cleaned);
			console.error('[gemini] parse error:', err);
			structure = null;
		}
	} else {
		console.warn('[gemini] no text part returned (structure will be null)');
	}

	return { imageBuffer, imageMime, structure };
}
