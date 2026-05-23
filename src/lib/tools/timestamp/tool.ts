export interface TimestampFormats {
	unixSeconds: number;
	unixMilliseconds: number;
	iso8601: string;
	rfc2822: string;
	local: string;
	utc: string;
	relative: string;
}

export interface TimestampResult {
	formats: TimestampFormats | null;
	error?: string;
}

const FALLBACK_TIMEZONES = [
	'UTC',
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'America/Mexico_City',
	'Europe/London',
	'Europe/Madrid',
	'Europe/Paris',
	'Asia/Tokyo',
	'Asia/Shanghai',
	'Australia/Sydney'
];

export function listTimezones(): string[] {
	try {
		return Intl.supportedValuesOf('timeZone');
	} catch {
		return FALLBACK_TIMEZONES;
	}
}

export function now(): number {
	return Math.floor(Date.now() / 1000);
}

export function normalizeUnixInput(value: number | string): number | null {
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) return null;
		return Math.abs(value) >= 1_000_000_000_000 ? Math.floor(value / 1000) : Math.floor(value);
	}

	const trimmed = value.trim();
	if (!trimmed) return null;

	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) return null;

	return Math.abs(parsed) >= 1_000_000_000_000 ? Math.floor(parsed / 1000) : Math.floor(parsed);
}

function formatInTimezone(
	date: Date,
	timeZone: string,
	options: Intl.DateTimeFormatOptions
): string {
	return new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(date);
}

export function formatRelative(date: Date, reference = new Date()): string {
	const diffMs = date.getTime() - reference.getTime();
	const diffSeconds = Math.round(diffMs / 1000);
	const absSeconds = Math.abs(diffSeconds);

	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

	if (absSeconds < 60) return rtf.format(diffSeconds, 'second');
	if (absSeconds < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
	if (absSeconds < 86400) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
	if (absSeconds < 2592000) return rtf.format(Math.round(diffSeconds / 86400), 'day');
	if (absSeconds < 31536000) return rtf.format(Math.round(diffSeconds / 2592000), 'month');
	return rtf.format(Math.round(diffSeconds / 31536000), 'year');
}

export function unixToDate(value: number | string, timeZone: string): TimestampResult {
	const unixSeconds = normalizeUnixInput(value);
	if (unixSeconds === null) {
		return { formats: null, error: 'Invalid Unix timestamp' };
	}

	try {
		const date = new Date(unixSeconds * 1000);

		return {
			formats: {
				unixSeconds,
				unixMilliseconds: unixSeconds * 1000,
				iso8601: date.toISOString(),
				rfc2822: date.toUTCString(),
				local: formatInTimezone(date, timeZone, {
					dateStyle: 'full',
					timeStyle: 'long'
				}),
				utc: formatInTimezone(date, 'UTC', {
					dateStyle: 'full',
					timeStyle: 'long'
				}),
				relative: formatRelative(date)
			}
		};
	} catch (error) {
		return {
			formats: null,
			error: error instanceof Error ? error.message : 'Unable to convert timestamp'
		};
	}
}

export function dateToUnix(iso: string, timeZone: string): TimestampResult {
	const trimmed = iso.trim();
	if (!trimmed) return { formats: null };

	try {
		const parsed = new Date(trimmed);
		if (Number.isNaN(parsed.getTime())) {
			return { formats: null, error: 'Invalid date string' };
		}

		return unixToDate(Math.floor(parsed.getTime() / 1000), timeZone);
	} catch (error) {
		return {
			formats: null,
			error: error instanceof Error ? error.message : 'Unable to parse date'
		};
	}
}

export function getDefaultTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return 'UTC';
	}
}
