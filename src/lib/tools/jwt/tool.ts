export interface JwtClaim {
	key: string;
	value: string;
}

export interface JwtDecodeResult {
	header: Record<string, unknown>;
	payload: Record<string, unknown>;
	signature: string;
	headerJson: string;
	payloadJson: string;
	isExpired: boolean | null;
	expiresAt: Date | null;
	issuedAt: Date | null;
	notBefore: Date | null;
	claims: JwtClaim[];
	error?: string;
}

const EMPTY_RESULT: JwtDecodeResult = {
	header: {},
	payload: {},
	signature: '',
	headerJson: '',
	payloadJson: '',
	isExpired: null,
	expiresAt: null,
	issuedAt: null,
	notBefore: null,
	claims: []
};

function base64UrlDecode(input: string): string {
	const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	return atob(padded);
}

function formatClaimValue(key: string, value: unknown): string {
	if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
		return `${value} (${new Date(value * 1000).toISOString()})`;
	}

	if (typeof value === 'object' && value !== null) {
		return JSON.stringify(value);
	}

	return String(value);
}

function timestampFromClaim(value: unknown): Date | null {
	return typeof value === 'number' ? new Date(value * 1000) : null;
}

export function decodeJwt(token: string): JwtDecodeResult {
	const trimmed = token.trim();
	if (!trimmed) return { ...EMPTY_RESULT };

	const parts = trimmed.split('.');
	if (parts.length !== 3) {
		return { ...EMPTY_RESULT, error: 'Invalid JWT: expected 3 parts separated by dots' };
	}

	try {
		const headerJson = base64UrlDecode(parts[0]);
		const payloadJson = base64UrlDecode(parts[1]);
		const header = JSON.parse(headerJson) as Record<string, unknown>;
		const payload = JSON.parse(payloadJson) as Record<string, unknown>;
		const signature = parts[2];

		const expiresAt = timestampFromClaim(payload.exp);
		const issuedAt = timestampFromClaim(payload.iat);
		const notBefore = timestampFromClaim(payload.nbf);
		const now = Date.now();

		let isExpired: boolean | null = null;
		if (expiresAt) {
			isExpired = now > expiresAt.getTime();
		}

		const claims = Object.entries(payload).map(([key, value]) => ({
			key,
			value: formatClaimValue(key, value)
		}));

		return {
			header,
			payload,
			signature,
			headerJson: JSON.stringify(header, null, 2),
			payloadJson: JSON.stringify(payload, null, 2),
			isExpired,
			expiresAt,
			issuedAt,
			notBefore,
			claims
		};
	} catch (error) {
		return {
			...EMPTY_RESULT,
			error: error instanceof Error ? error.message : 'Failed to decode JWT'
		};
	}
}
