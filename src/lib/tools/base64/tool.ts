export type DecodedContentType = 'text' | 'image' | 'pdf' | 'binary';

export interface DecodeResult {
	contentType: DecodedContentType;
	mimeType: string;
	bytes: Uint8Array;
	text?: string;
	dataUrl: string;
	extension: string;
}

const MAGIC = [
	{
		mime: 'image/png',
		ext: 'png',
		match: (b: Uint8Array) =>
			b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
	},
	{
		mime: 'image/jpeg',
		ext: 'jpg',
		match: (b: Uint8Array) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
	},
	{
		mime: 'image/gif',
		ext: 'gif',
		match: (b: Uint8Array) =>
			b.length >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38
	},
	{
		mime: 'image/webp',
		ext: 'webp',
		match: (b: Uint8Array) =>
			b.length >= 12 &&
			b[0] === 0x52 &&
			b[1] === 0x49 &&
			b[2] === 0x46 &&
			b[3] === 0x46 &&
			b[8] === 0x57 &&
			b[9] === 0x45 &&
			b[10] === 0x42 &&
			b[11] === 0x50
	},
	{
		mime: 'application/pdf',
		ext: 'pdf',
		match: (b: Uint8Array) =>
			b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46
	}
] as const;

function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]!);
	}
	return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function mimeToExtension(mime: string): string {
	const map: Record<string, string> = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/gif': 'gif',
		'image/webp': 'webp',
		'application/pdf': 'pdf',
		'text/plain': 'txt'
	};
	return map[mime] ?? 'bin';
}

function detectMime(bytes: Uint8Array, hint?: string): { mime: string; ext: string } {
	if (hint) {
		return { mime: hint, ext: mimeToExtension(hint) };
	}

	for (const entry of MAGIC) {
		if (entry.match(bytes)) {
			return { mime: entry.mime, ext: entry.ext };
		}
	}

	return { mime: 'application/octet-stream', ext: 'bin' };
}

function isValidUtf8Text(bytes: Uint8Array): boolean {
	try {
		new TextDecoder('utf-8', { fatal: true }).decode(bytes);
		return true;
	} catch {
		return false;
	}
}

export function parseBase64Input(input: string): { base64: string; mimeType?: string } {
	const trimmed = input.trim();
	const dataUrlMatch = trimmed.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$/i);

	if (dataUrlMatch) {
		return {
			base64: dataUrlMatch[2]!.replace(/\s/g, ''),
			mimeType: dataUrlMatch[1]
		};
	}

	return { base64: trimmed.replace(/\s/g, '') };
}

export function encodeText(text: string): string {
	return bytesToBase64(new TextEncoder().encode(text));
}

export function encodeTextToDataUrl(text: string, mimeType = 'text/plain'): string {
	return `data:${mimeType};base64,${encodeText(text)}`;
}

export function encodeBytes(
	bytes: Uint8Array,
	mimeType = 'application/octet-stream'
): {
	base64: string;
	dataUrl: string;
} {
	const base64 = bytesToBase64(bytes);
	return {
		base64,
		dataUrl: `data:${mimeType};base64,${base64}`
	};
}

export async function encodeFile(file: File): Promise<{
	base64: string;
	dataUrl: string;
	mimeType: string;
	fileName: string;
}> {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	const { base64, dataUrl } = encodeBytes(bytes, file.type || 'application/octet-stream');

	return {
		base64,
		dataUrl,
		mimeType: file.type || 'application/octet-stream',
		fileName: file.name
	};
}

export function decodeBase64(input: string): DecodeResult {
	const { base64, mimeType: hintedMime } = parseBase64Input(input);

	if (!base64) {
		throw new Error('Empty Base64 input');
	}

	let bytes: Uint8Array;
	try {
		bytes = base64ToBytes(base64);
	} catch {
		throw new Error('Invalid Base64 string');
	}

	const { mime, ext } = detectMime(bytes, hintedMime);
	const dataUrl = `data:${mime};base64,${base64}`;

	if (mime.startsWith('image/')) {
		return { contentType: 'image', mimeType: mime, bytes, dataUrl, extension: ext };
	}

	if (mime === 'application/pdf') {
		return { contentType: 'pdf', mimeType: mime, bytes, dataUrl, extension: ext };
	}

	if (isValidUtf8Text(bytes)) {
		return {
			contentType: 'text',
			mimeType: mime === 'application/octet-stream' ? 'text/plain' : mime,
			bytes,
			text: new TextDecoder().decode(bytes),
			dataUrl,
			extension: ext === 'bin' ? 'txt' : ext
		};
	}

	return { contentType: 'binary', mimeType: mime, bytes, dataUrl, extension: ext };
}

export function downloadDecoded(result: DecodeResult, fileName = `decoded.${result.extension}`) {
	const blob = new Blob([result.bytes.slice()], { type: result.mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}
