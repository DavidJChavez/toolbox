import { createTwoFilesPatch, diffChars, diffLines, diffWordsWithSpace } from 'diff';

export type DiffMode = 'chars' | 'words' | 'lines';

export interface DiffPart {
	value: string;
	added?: boolean;
	removed?: boolean;
}

export interface DiffStats {
	added: number;
	removed: number;
}

export interface DiffResult {
	parts: DiffPart[];
	stats: DiffStats;
	error?: string;
}

export interface UnifiedDiffResult {
	patch: string;
	error?: string;
}

function computeStats(parts: DiffPart[]): DiffStats {
	let added = 0;
	let removed = 0;

	for (const part of parts) {
		if (part.added) added += part.value.length;
		if (part.removed) removed += part.value.length;
	}

	return { added, removed };
}

export function diffTexts(a: string, b: string, mode: DiffMode): DiffResult {
	try {
		let parts: DiffPart[];

		switch (mode) {
			case 'chars':
				parts = diffChars(a, b);
				break;
			case 'words':
				parts = diffWordsWithSpace(a, b);
				break;
			case 'lines':
				parts = diffLines(a, b);
				break;
		}

		return {
			parts,
			stats: computeStats(parts)
		};
	} catch (error) {
		return {
			parts: [],
			stats: { added: 0, removed: 0 },
			error: error instanceof Error ? error.message : 'Unable to compute diff'
		};
	}
}

export function unifiedDiff(a: string, b: string): UnifiedDiffResult {
	try {
		const patch = createTwoFilesPatch('original', 'modified', a, b, undefined, undefined, {
			context: 3
		});

		return { patch };
	} catch (error) {
		return {
			patch: '',
			error: error instanceof Error ? error.message : 'Unable to create unified diff'
		};
	}
}
