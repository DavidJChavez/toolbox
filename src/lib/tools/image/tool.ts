export type ImageOutputFormat = 'webp' | 'avif' | 'jpeg' | 'png';

export interface ImageFormatOption {
	id: ImageOutputFormat;
	label: string;
	mimeType: string;
	lossy: boolean;
}

export interface ImageMeta {
	name: string;
	width: number;
	height: number;
	size: number;
	type: string;
}

export interface ConvertImageOptions {
	format: ImageOutputFormat;
	quality: number;
}

export interface ConvertImageResult {
	blob: Blob | null;
	dataUrl: string;
	meta: ImageMeta | null;
	error?: string;
}

export const imageFormats: ImageFormatOption[] = [
	{ id: 'webp', label: 'WebP', mimeType: 'image/webp', lossy: true },
	{ id: 'avif', label: 'AVIF', mimeType: 'image/avif', lossy: true },
	{ id: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', lossy: true },
	{ id: 'png', label: 'PNG', mimeType: 'image/png', lossy: false }
];

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getFormatOption(format: ImageOutputFormat): ImageFormatOption {
	return imageFormats.find((item) => item.id === format) ?? imageFormats[0];
}

export async function readImageMeta(file: File): Promise<ImageMeta> {
	const bitmap = await createImageBitmap(file);
	const meta = {
		name: file.name,
		width: bitmap.width,
		height: bitmap.height,
		size: file.size,
		type: file.type || 'application/octet-stream'
	};
	bitmap.close();
	return meta;
}

async function canvasToBlob(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	mimeType: string,
	quality?: number
): Promise<Blob | null> {
	if ('convertToBlob' in canvas) {
		return canvas.convertToBlob({ type: mimeType, quality });
	}

	return new Promise((resolve) => {
		(canvas as HTMLCanvasElement).toBlob((blob) => resolve(blob), mimeType, quality);
	});
}

export async function convertImage(
	file: File,
	options: ConvertImageOptions
): Promise<ConvertImageResult> {
	try {
		const formatOption = getFormatOption(options.format);
		const bitmap = await createImageBitmap(file);

		const canvas =
			typeof OffscreenCanvas !== 'undefined'
				? new OffscreenCanvas(bitmap.width, bitmap.height)
				: Object.assign(document.createElement('canvas'), {
						width: bitmap.width,
						height: bitmap.height
					});

		const context = canvas.getContext('2d') as
			| CanvasRenderingContext2D
			| OffscreenCanvasRenderingContext2D
			| null;
		if (!context) {
			bitmap.close();
			return { blob: null, dataUrl: '', meta: null, error: 'Unable to create canvas context' };
		}

		context.drawImage(bitmap, 0, 0);
		bitmap.close();

		const quality = formatOption.lossy ? options.quality / 100 : undefined;
		const blob = await canvasToBlob(canvas, formatOption.mimeType, quality);

		if (!blob) {
			return { blob: null, dataUrl: '', meta: null, error: 'Unable to convert image' };
		}

		const dataUrl = await blobToDataUrl(blob);

		return {
			blob,
			dataUrl,
			meta: {
				name: file.name,
				width: canvas.width,
				height: canvas.height,
				size: blob.size,
				type: formatOption.mimeType
			}
		};
	} catch (error) {
		return {
			blob: null,
			dataUrl: '',
			meta: null,
			error: error instanceof Error ? error.message : 'Unable to convert image'
		};
	}
}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ''));
		reader.onerror = () => reject(new Error('Unable to read converted image'));
		reader.readAsDataURL(blob);
	});
}

export async function detectAvifSupport(): Promise<boolean> {
	try {
		const canvas =
			typeof OffscreenCanvas !== 'undefined'
				? new OffscreenCanvas(1, 1)
				: Object.assign(document.createElement('canvas'), { width: 1, height: 1 });

		const context = canvas.getContext('2d') as
			| CanvasRenderingContext2D
			| OffscreenCanvasRenderingContext2D
			| null;
		if (!context) return false;

		context.fillRect(0, 0, 1, 1);
		const blob = await canvasToBlob(canvas, 'image/avif', 0.5);
		return blob !== null && blob.size > 0;
	} catch {
		return false;
	}
}

export function computeSizeReduction(originalSize: number, convertedSize: number): number | null {
	if (originalSize <= 0 || convertedSize <= 0) return null;
	return Math.round(((originalSize - convertedSize) / originalSize) * 100);
}
