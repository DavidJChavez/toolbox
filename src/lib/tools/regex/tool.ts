export interface RegexMatch {
	match: string;
	index: number;
	groups: string[];
}

export interface HighlightSegment {
	text: string;
	isMatch: boolean;
}

export interface RegexTestResult {
	isValid: boolean;
	error?: string;
	matches: RegexMatch[];
	matchCount: number;
	replaced?: string;
	highlight: HighlightSegment[];
}

function buildHighlight(input: string, matches: RegexMatch[]): HighlightSegment[] {
	if (!input || matches.length === 0) {
		return [{ text: input, isMatch: false }];
	}

	const sorted = [...matches].sort((a, b) => a.index - b.index);
	const segments: HighlightSegment[] = [];
	let cursor = 0;

	for (const match of sorted) {
		if (match.index < cursor) continue;

		if (match.index > cursor) {
			segments.push({ text: input.slice(cursor, match.index), isMatch: false });
		}

		segments.push({ text: match.match, isMatch: true });
		cursor = match.index + match.match.length;
	}

	if (cursor < input.length) {
		segments.push({ text: input.slice(cursor), isMatch: false });
	}

	return segments.length > 0 ? segments : [{ text: input, isMatch: false }];
}

export function testRegex(
	pattern: string,
	flags: string,
	input: string,
	replaceWith?: string
): RegexTestResult {
	if (!pattern) {
		return {
			isValid: true,
			matches: [],
			matchCount: 0,
			highlight: [{ text: input, isMatch: false }]
		};
	}

	try {
		const regex = new RegExp(pattern, flags);
		const matches: RegexMatch[] = [];

		if (flags.includes('g')) {
			let match: RegExpExecArray | null;
			while ((match = regex.exec(input)) !== null) {
				matches.push({
					match: match[0],
					index: match.index,
					groups: match.slice(1)
				});

				if (match[0].length === 0) {
					regex.lastIndex += 1;
				}
			}
		} else {
			const match = regex.exec(input);
			if (match) {
				matches.push({
					match: match[0],
					index: match.index,
					groups: match.slice(1)
				});
			}
		}

		let replaced: string | undefined;
		if (replaceWith !== undefined && replaceWith !== '') {
			const replaceFlags = flags.includes('g') ? flags : `${flags}g`;
			replaced = input.replace(new RegExp(pattern, replaceFlags), replaceWith);
		}

		return {
			isValid: true,
			matches,
			matchCount: matches.length,
			replaced,
			highlight: buildHighlight(input, matches)
		};
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Invalid regular expression',
			matches: [],
			matchCount: 0,
			highlight: [{ text: input, isMatch: false }]
		};
	}
}

export const regexFlags = [
	{ id: 'g', label: 'Global (g)' },
	{ id: 'i', label: 'Ignore case (i)' },
	{ id: 'm', label: 'Multiline (m)' },
	{ id: 's', label: 'Dotall (s)' }
] as const;
