export async function fetchImageAsBase64(
	url: string,
): Promise<{ base64: string; mimeType: string }> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
	const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
	const buf = Buffer.from(await res.arrayBuffer());
	return { base64: buf.toString('base64'), mimeType };
}
