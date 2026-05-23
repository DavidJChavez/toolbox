import { JSONPath } from 'jsonpath-plus';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type JsonIndent = 2 | 4 | 'tab';

export interface JsonOperationResult {
	result: string;
	error?: string;
	valid?: boolean;
}

export interface JsonDiffLine {
	type: 'added' | 'removed' | 'unchanged';
	line: string;
}

function formatJsonError(error: unknown, input: string): string {
	if (!(error instanceof SyntaxError)) {
		return error instanceof Error ? error.message : 'Invalid JSON';
	}

	const match = error.message.match(/position (\d+)/i);
	if (!match) return error.message;

	const position = Number(match[1]);
	const lines = input.slice(0, position).split('\n');
	const line = lines.length;
	const column = (lines.at(-1)?.length ?? 0) + 1;

	return `${error.message} (line ${line}, column ${column})`;
}

function parseJson(input: string): { value?: unknown; error?: string } {
	try {
		return { value: JSON.parse(input) };
	} catch (error) {
		return { error: formatJsonError(error, input) };
	}
}

function indentValue(indent: JsonIndent): string | number {
	return indent === 'tab' ? '\t' : indent;
}

export function prettifyJson(input: string, indent: JsonIndent = 2): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: '', error: parsed.error, valid: false };
	return {
		result: JSON.stringify(parsed.value, null, indentValue(indent)),
		valid: true
	};
}

export function minifyJson(input: string): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: '', error: parsed.error, valid: false };
	return { result: JSON.stringify(parsed.value), valid: true };
}

export function validateJson(input: string): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: parsed.error, error: parsed.error, valid: false };
	return { result: 'Valid JSON', valid: true };
}

function sortValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(sortValue);
	}

	if (value !== null && typeof value === 'object') {
		return Object.keys(value as Record<string, unknown>)
			.sort()
			.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = sortValue((value as Record<string, unknown>)[key]);
				return acc;
			}, {});
	}

	return value;
}

export function sortJsonKeys(input: string, indent: JsonIndent = 2): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: '', error: parsed.error, valid: false };
	return {
		result: JSON.stringify(sortValue(parsed.value), null, indentValue(indent)),
		valid: true
	};
}

export function escapeJsonString(input: string): JsonOperationResult {
	return { result: JSON.stringify(input) };
}

export function unescapeJsonString(input: string): JsonOperationResult {
	const trimmed = input.trim();
	try {
		const parsed = JSON.parse(trimmed.startsWith('"') ? trimmed : `"${trimmed}"`);
		if (typeof parsed !== 'string') {
			return { result: '', error: 'Input is not a JSON string literal' };
		}
		return { result: parsed };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Unable to unescape JSON string'
		};
	}
}

function typeFromValue(value: unknown, key: string): string {
	if (value === null) return 'null';

	switch (typeof value) {
		case 'string':
			return 'string';
		case 'number':
			return Number.isInteger(value) ? 'number' : 'number';
		case 'boolean':
			return 'boolean';
		case 'object':
			if (Array.isArray(value)) {
				if (value.length === 0) return 'unknown[]';
				const itemTypes = [...new Set(value.map((item) => typeFromValue(item, key)))];
				return itemTypes.length === 1 ? `${itemTypes[0]}[]` : `( ${itemTypes.join(' | ')} )[]`;
			}
			return toInterface(value as Record<string, unknown>, capitalize(key));
		default:
			return 'unknown';
	}
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1).replace(/[^a-zA-Z0-9]/g, '');
}

function toInterface(value: Record<string, unknown>, name: string): string {
	const lines = Object.entries(value).map(([key, entryValue]) => {
		const safeKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`;
		return `  ${safeKey}: ${typeFromValue(entryValue, key)};`;
	});

	return `interface ${name} {\n${lines.join('\n')}\n}`;
}

export function jsonToTypeScript(input: string, rootName = 'Root'): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: '', error: parsed.error, valid: false };

	if (parsed.value === null || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) {
		return { result: `type ${rootName} = ${typeFromValue(parsed.value, rootName)};`, valid: true };
	}

	return { result: toInterface(parsed.value as Record<string, unknown>, rootName), valid: true };
}

export function jsonToYaml(input: string): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: '', error: parsed.error, valid: false };
	return { result: stringifyYaml(parsed.value), valid: true };
}

export function yamlToJson(input: string, indent: JsonIndent = 2): JsonOperationResult {
	try {
		const value = parseYaml(input);
		return {
			result: JSON.stringify(value, null, indentValue(indent)),
			valid: true
		};
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Invalid YAML',
			valid: false
		};
	}
}

export function queryJsonPath(input: string, path: string): JsonOperationResult {
	const parsed = parseJson(input);
	if (parsed.error) return { result: '', error: parsed.error, valid: false };

	try {
		const matches = JSONPath({ path, json: parsed.value as object, wrap: false });
		const normalized = Array.isArray(matches) && matches.length === 1 ? matches[0] : matches;
		return {
			result: JSON.stringify(normalized, null, 2),
			valid: true
		};
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Invalid JSONPath expression',
			valid: false
		};
	}
}

export function diffJson(
	leftInput: string,
	rightInput: string
): { lines: JsonDiffLine[]; error?: string } {
	const left = parseJson(leftInput);
	const right = parseJson(rightInput);

	if (left.error) return { lines: [], error: `Left: ${left.error}` };
	if (right.error) return { lines: [], error: `Right: ${right.error}` };

	const leftLines = JSON.stringify(left.value, null, 2).split('\n');
	const rightLines = JSON.stringify(right.value, null, 2).split('\n');
	const max = Math.max(leftLines.length, rightLines.length);
	const lines: JsonDiffLine[] = [];

	for (let index = 0; index < max; index++) {
		const leftLine = leftLines[index];
		const rightLine = rightLines[index];

		if (leftLine === rightLine) {
			if (leftLine !== undefined) lines.push({ type: 'unchanged', line: leftLine });
			continue;
		}

		if (leftLine !== undefined) lines.push({ type: 'removed', line: leftLine });
		if (rightLine !== undefined) lines.push({ type: 'added', line: rightLine });
	}

	return { lines };
}
