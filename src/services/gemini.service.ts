import { ai } from '../config/gemini.js';
import { FLOOR_PLAN_PROMPT } from '../prompts/floorPlan.prompt.js';

export interface GeminiGenerationResult {
	imageBuffer: Buffer;
	imageMime: string;
	structure: unknown | null;
}

export async function generate3DFromImage(
	base64Image: string,
	mimeType: string,
): Promise<GeminiGenerationResult> {
	const result = await ai.models.generateContent({
		model: 'gemini-3.1-flash-image-preview',
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

	const parts = result.candidates?.[0]?.content?.parts;
	if (!parts) {
		throw new Error('AI returned no response. Please try again.');
	}

	const imagePart = parts.find((p) => p.inlineData);
	if (!imagePart?.inlineData?.data) {
		const textFeedback = parts.find((p) => p.text)?.text;
		throw new Error(textFeedback || 'AI returned no image. Please try a clearer floor plan.');
	}

	const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
	const imageMime = imagePart.inlineData.mimeType || 'image/png';

	let structure: unknown | null = null;
	const rawText = parts
		.filter((p) => p.text)
		.map((p) => p.text as string)
		.join('\n')
		.trim();
	if (rawText) {
		const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
		try {
			structure = JSON.parse(cleaned);
		} catch {
			structure = null;
		}
	}

	return { imageBuffer, imageMime, structure };
}
