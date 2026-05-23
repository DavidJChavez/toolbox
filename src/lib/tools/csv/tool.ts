import Papa from 'papaparse';

export type CsvDelimiter = ',' | ';' | '\t' | '|';

export interface CsvToJsonOptions {
	delimiter: CsvDelimiter;
	header: boolean;
	dynamicTyping: boolean;
}

export interface CsvToJsonResult {
	rows: unknown[];
	headers: string[];
	errors: string[];
	error?: string;
}

export interface JsonToCsvOptions {
	delimiter: CsvDelimiter;
	header: boolean;
}

export interface JsonToCsvResult {
	csv: string;
	error?: string;
}

export const csvDelimiters: Array<{ value: CsvDelimiter; label: string }> = [
	{ value: ',', label: 'Comma (,)' },
	{ value: ';', label: 'Semicolon (;)' },
	{ value: '\t', label: 'Tab (\\t)' },
	{ value: '|', label: 'Pipe (|)' }
];

export function csvToJson(csv: string, options: CsvToJsonOptions): CsvToJsonResult {
	const trimmed = csv.trim();
	if (!trimmed) {
		return { rows: [], headers: [], errors: [] };
	}

	try {
		const parsed = Papa.parse<Record<string, unknown>>(trimmed, {
			delimiter: options.delimiter,
			header: options.header,
			dynamicTyping: options.dynamicTyping,
			skipEmptyLines: true
		});

		const errors = parsed.errors.map((error) => {
			const row = error.row !== undefined ? ` (row ${error.row + 1})` : '';
			return `${error.message}${row}`;
		});

		const headers = options.header
			? (parsed.meta.fields ?? [])
			: parsed.data.length > 0 && Array.isArray(parsed.data[0])
				? parsed.data[0].map((_, index) => `column_${index + 1}`)
				: Object.keys((parsed.data[0] as Record<string, unknown>) ?? {});

		return {
			rows: parsed.data,
			headers,
			errors
		};
	} catch (error) {
		return {
			rows: [],
			headers: [],
			errors: [],
			error: error instanceof Error ? error.message : 'Unable to parse CSV'
		};
	}
}

export function jsonToCsv(value: string, options: JsonToCsvOptions): JsonToCsvResult {
	const trimmed = value.trim();
	if (!trimmed) {
		return { csv: '' };
	}

	try {
		const parsed = JSON.parse(trimmed) as unknown;
		const data = Array.isArray(parsed) ? parsed : [parsed];

		if (data.length === 0) {
			return { csv: '' };
		}

		const csv = Papa.unparse(data, {
			delimiter: options.delimiter,
			header: options.header
		});

		return { csv };
	} catch (error) {
		return {
			csv: '',
			error: error instanceof Error ? error.message : 'Unable to convert JSON to CSV'
		};
	}
}

export function formatCsvJsonOutput(rows: unknown[]): string {
	if (rows.length === 0) return '';
	return JSON.stringify(rows, null, 2);
}
