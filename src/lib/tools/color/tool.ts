import { converter, formatCss, formatHex, formatHsl, formatRgb, parse } from 'culori';

export interface ColorFormats {
	hex: string;
	rgb: string;
	hsl: string;
	oklch: string;
	oklab: string;
	alpha: number;
}

export interface ColorResult {
	formats: ColorFormats | null;
	error?: string;
}

const toOklch = converter('oklch');
const toOklab = converter('oklab');

export function parseColor(input: string): ColorResult {
	const trimmed = input.trim();
	if (!trimmed) {
		return { formats: null };
	}

	try {
		const parsed = parse(trimmed);
		if (!parsed) {
			return { formats: null, error: 'Invalid color value' };
		}

		const oklchColor = toOklch(parsed);
		const oklabColor = toOklab(parsed);

		return {
			formats: {
				hex: formatHex(parsed) ?? '',
				rgb: formatRgb(parsed) ?? '',
				hsl: formatHsl(parsed) ?? '',
				oklch: oklchColor ? (formatCss(oklchColor) ?? '') : '',
				oklab: oklabColor ? (formatCss(oklabColor) ?? '') : '',
				alpha: parsed.alpha ?? 1
			}
		};
	} catch (error) {
		return {
			formats: null,
			error: error instanceof Error ? error.message : 'Unable to parse color'
		};
	}
}

export function applyAlpha(input: string, alpha: number): ColorResult {
	const trimmed = input.trim();
	if (!trimmed) {
		return { formats: null };
	}

	const parsed = parse(trimmed);
	if (!parsed) {
		return { formats: null, error: 'Invalid color value' };
	}

	return parseColor(formatCss({ ...parsed, alpha }) ?? trimmed);
}
