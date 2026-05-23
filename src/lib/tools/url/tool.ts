export interface UrlOperationResult {
	result: string;
	error?: string;
}

export interface QueryParam {
	key: string;
	value: string;
}

export interface ParsedQueryResult {
	params: QueryParam[];
	error?: string;
}

export interface UrlInspection {
	protocol: string;
	username: string;
	password: string;
	hostname: string;
	port: string;
	pathname: string;
	hash: string;
	search: string;
	params: QueryParam[];
	error?: string;
}

function formatUrlError(error: unknown, fallback = 'Invalid URL'): string {
	return error instanceof Error ? error.message : fallback;
}

function normalizeQueryInput(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return '';

	if (trimmed.startsWith('?')) {
		return trimmed.slice(1);
	}

	try {
		const url = new URL(trimmed);
		return url.search.startsWith('?') ? url.search.slice(1) : url.search;
	} catch {
		return trimmed;
	}
}

export function encodeComponent(text: string): UrlOperationResult {
	if (!text) return { result: '' };

	try {
		return { result: encodeURIComponent(text) };
	} catch (error) {
		return { result: '', error: formatUrlError(error, 'Unable to encode input') };
	}
}

export function decodeComponent(text: string): UrlOperationResult {
	if (!text) return { result: '' };

	try {
		return { result: decodeURIComponent(text) };
	} catch (error) {
		return { result: '', error: formatUrlError(error, 'Unable to decode input') };
	}
}

export function parseQueryString(input: string): ParsedQueryResult {
	const normalized = normalizeQueryInput(input);
	if (!normalized) return { params: [] };

	try {
		const params = [...new URLSearchParams(normalized).entries()].map(([key, value]) => ({
			key,
			value
		}));

		return { params };
	} catch (error) {
		return { params: [], error: formatUrlError(error, 'Invalid query string') };
	}
}

export function buildQueryString(params: QueryParam[]): UrlOperationResult {
	const entries = params.filter((param) => param.key.trim().length > 0);

	if (entries.length === 0) {
		return { result: '' };
	}

	try {
		const searchParams = new URLSearchParams();
		for (const param of entries) {
			searchParams.append(param.key, param.value);
		}

		return { result: `?${searchParams.toString()}` };
	} catch (error) {
		return { result: '', error: formatUrlError(error, 'Unable to build query string') };
	}
}

export function inspectUrl(rawUrl: string): UrlInspection {
	const trimmed = rawUrl.trim();

	if (!trimmed) {
		return {
			protocol: '',
			username: '',
			password: '',
			hostname: '',
			port: '',
			pathname: '',
			hash: '',
			search: '',
			params: []
		};
	}

	try {
		const url = new URL(trimmed);
		const params = [...url.searchParams.entries()].map(([key, value]) => ({ key, value }));

		return {
			protocol: url.protocol,
			username: url.username,
			password: url.password,
			hostname: url.hostname,
			port: url.port,
			pathname: url.pathname,
			hash: url.hash,
			search: url.search,
			params
		};
	} catch (error) {
		return {
			protocol: '',
			username: '',
			password: '',
			hostname: '',
			port: '',
			pathname: '',
			hash: '',
			search: '',
			params: [],
			error: formatUrlError(error)
		};
	}
}
