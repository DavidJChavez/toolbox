export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

export interface HashResult {
	result: string;
	error?: string;
}

function bufferToHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function mapWebCryptoAlgorithm(algorithm: HashAlgorithm): AlgorithmIdentifier {
	switch (algorithm) {
		case 'SHA-1':
			return 'SHA-1';
		case 'SHA-256':
			return 'SHA-256';
		case 'SHA-512':
			return 'SHA-512';
		default:
			throw new Error(`Unsupported Web Crypto algorithm: ${algorithm}`);
	}
}

function md5(input: string): string {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(input);

	const rotateLeft = (value: number, shift: number) => (value << shift) | (value >>> (32 - shift));

	const addUnsigned = (a: number, b: number) => {
		const result = (a + b) >>> 0;
		return result;
	};

	const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
	const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
	const H = (x: number, y: number, z: number) => x ^ y ^ z;
	const I = (x: number, y: number, z: number) => y ^ (x | ~z);

	const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
		addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
	const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
		addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
	const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
		addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
	const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
		addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);

	const wordArray: number[] = [];
	for (let index = 0; index < bytes.length; index += 4) {
		wordArray[index >> 2] =
			bytes[index] |
			((bytes[index + 1] ?? 0) << 8) |
			((bytes[index + 2] ?? 0) << 16) |
			((bytes[index + 3] ?? 0) << 24);
	}

	const bitLength = bytes.length * 8;
	wordArray[bitLength >> 5] |= 0x80 << (bitLength % 32);
	wordArray[(((bitLength + 64) >>> 9) << 4) + 14] = bitLength;

	let a = 0x67452301;
	let b = 0xefcdab89;
	let c = 0x98badcfe;
	let d = 0x10325476;

	for (let index = 0; index < wordArray.length; index += 16) {
		const oldA = a;
		const oldB = b;
		const oldC = c;
		const oldD = d;

		a = FF(a, b, c, d, wordArray[index] ?? 0, 7, 0xd76aa478);
		d = FF(d, a, b, c, wordArray[index + 1] ?? 0, 12, 0xe8c7b756);
		c = FF(c, d, a, b, wordArray[index + 2] ?? 0, 17, 0x242070db);
		b = FF(b, c, d, a, wordArray[index + 3] ?? 0, 22, 0xc1bdceee);
		a = FF(a, b, c, d, wordArray[index + 4] ?? 0, 7, 0xf57c0faf);
		d = FF(d, a, b, c, wordArray[index + 5] ?? 0, 12, 0x4787c62a);
		c = FF(c, d, a, b, wordArray[index + 6] ?? 0, 17, 0xa8304613);
		b = FF(b, c, d, a, wordArray[index + 7] ?? 0, 22, 0xfd469501);
		a = FF(a, b, c, d, wordArray[index + 8] ?? 0, 7, 0x698098d8);
		d = FF(d, a, b, c, wordArray[index + 9] ?? 0, 12, 0x8b44f7af);
		c = FF(c, d, a, b, wordArray[index + 10] ?? 0, 17, 0xffff5bb1);
		b = FF(b, c, d, a, wordArray[index + 11] ?? 0, 22, 0x895cd7be);
		a = FF(a, b, c, d, wordArray[index + 12] ?? 0, 7, 0x6b901122);
		d = FF(d, a, b, c, wordArray[index + 13] ?? 0, 12, 0xfd987193);
		c = FF(c, d, a, b, wordArray[index + 14] ?? 0, 17, 0xa679438e);
		b = FF(b, c, d, a, wordArray[index + 15] ?? 0, 22, 0x49b40821);

		a = GG(a, b, c, d, wordArray[index + 1] ?? 0, 5, 0xf61e2562);
		d = GG(d, a, b, c, wordArray[index + 6] ?? 0, 9, 0xc040b340);
		c = GG(c, d, a, b, wordArray[index + 11] ?? 0, 14, 0x265e5a51);
		b = GG(b, c, d, a, wordArray[index] ?? 0, 20, 0xe9b6c7aa);
		a = GG(a, b, c, d, wordArray[index + 5] ?? 0, 5, 0xd62f105d);
		d = GG(d, a, b, c, wordArray[index + 10] ?? 0, 9, 0x02441453);
		c = GG(c, d, a, b, wordArray[index + 15] ?? 0, 14, 0xd8a1e681);
		b = GG(b, c, d, a, wordArray[index + 4] ?? 0, 20, 0xe7d3fbc8);
		a = GG(a, b, c, d, wordArray[index + 9] ?? 0, 5, 0x21e1cde6);
		d = GG(d, a, b, c, wordArray[index + 14] ?? 0, 9, 0xc33707d6);
		c = GG(c, d, a, b, wordArray[index + 3] ?? 0, 14, 0xf4d50d87);
		b = GG(b, c, d, a, wordArray[index + 8] ?? 0, 20, 0x455a14ed);
		a = GG(a, b, c, d, wordArray[index + 13] ?? 0, 5, 0xa9e3e905);
		d = GG(d, a, b, c, wordArray[index + 2] ?? 0, 9, 0xfcefa3f8);
		c = GG(c, d, a, b, wordArray[index + 7] ?? 0, 14, 0x676f02d9);
		b = GG(b, c, d, a, wordArray[index + 12] ?? 0, 20, 0x8d2a4c8a);

		a = HH(a, b, c, d, wordArray[index + 5] ?? 0, 4, 0xfffa3942);
		d = HH(d, a, b, c, wordArray[index + 8] ?? 0, 11, 0x8771f681);
		c = HH(c, d, a, b, wordArray[index + 11] ?? 0, 16, 0x6d9d6122);
		b = HH(b, c, d, a, wordArray[index + 14] ?? 0, 23, 0xfde5380c);
		a = HH(a, b, c, d, wordArray[index + 1] ?? 0, 4, 0xa4beea44);
		d = HH(d, a, b, c, wordArray[index + 4] ?? 0, 11, 0x4bdecfa9);
		c = HH(c, d, a, b, wordArray[index + 7] ?? 0, 16, 0xf6bb4b60);
		b = HH(b, c, d, a, wordArray[index + 10] ?? 0, 23, 0xbebfbc70);
		a = HH(a, b, c, d, wordArray[index + 13] ?? 0, 4, 0x289b7ec6);
		d = HH(d, a, b, c, wordArray[index] ?? 0, 11, 0xeaa127fa);
		c = HH(c, d, a, b, wordArray[index + 3] ?? 0, 16, 0xd4ef3085);
		b = HH(b, c, d, a, wordArray[index + 6] ?? 0, 23, 0x04881d05);
		a = HH(a, b, c, d, wordArray[index + 9] ?? 0, 4, 0xd9d4d039);
		d = HH(d, a, b, c, wordArray[index + 12] ?? 0, 11, 0xe6db99e5);
		c = HH(c, d, a, b, wordArray[index + 15] ?? 0, 16, 0x1fa27cf8);
		b = HH(b, c, d, a, wordArray[index + 2] ?? 0, 23, 0xc4ac5665);

		a = II(a, b, c, d, wordArray[index] ?? 0, 6, 0xf4292244);
		d = II(d, a, b, c, wordArray[index + 7] ?? 0, 10, 0x432aff97);
		c = II(c, d, a, b, wordArray[index + 14] ?? 0, 15, 0xab9423a7);
		b = II(b, c, d, a, wordArray[index + 5] ?? 0, 21, 0xfc93a039);
		a = II(a, b, c, d, wordArray[index + 12] ?? 0, 6, 0x655b59c3);
		d = II(d, a, b, c, wordArray[index + 3] ?? 0, 10, 0x8f0ccc92);
		c = II(c, d, a, b, wordArray[index + 10] ?? 0, 15, 0xffeff47d);
		b = II(b, c, d, a, wordArray[index + 1] ?? 0, 21, 0x85845dd1);
		a = II(a, b, c, d, wordArray[index + 8] ?? 0, 6, 0x6fa87e4f);
		d = II(d, a, b, c, wordArray[index + 15] ?? 0, 10, 0xfe2ce6e0);
		c = II(c, d, a, b, wordArray[index + 6] ?? 0, 15, 0xa3014314);
		b = II(b, c, d, a, wordArray[index + 13] ?? 0, 21, 0x4e0811a1);
		a = II(a, b, c, d, wordArray[index + 4] ?? 0, 6, 0xf7537e82);
		d = II(d, a, b, c, wordArray[index + 11] ?? 0, 10, 0xbd3af235);
		c = II(c, d, a, b, wordArray[index + 2] ?? 0, 15, 0x2ad7d2bb);
		b = II(b, c, d, a, wordArray[index + 9] ?? 0, 21, 0xeb86d391);

		a = addUnsigned(a, oldA);
		b = addUnsigned(b, oldB);
		c = addUnsigned(c, oldC);
		d = addUnsigned(d, oldD);
	}

	const toHex = (value: number) => {
		let hex = '';
		for (let index = 0; index <= 3; index++) {
			const byte = (value >>> (index * 8)) & 255;
			hex += byte.toString(16).padStart(2, '0');
		}
		return hex;
	};

	return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<HashResult> {
	if (!text) return { result: '' };

	try {
		if (algorithm === 'MD5') {
			return { result: md5(text) };
		}

		const digest = await crypto.subtle.digest(
			mapWebCryptoAlgorithm(algorithm),
			new TextEncoder().encode(text)
		);
		return { result: bufferToHex(digest) };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Unable to hash text'
		};
	}
}

export async function hashFile(file: File, algorithm: HashAlgorithm): Promise<HashResult> {
	try {
		const buffer = await file.arrayBuffer();

		if (algorithm === 'MD5') {
			const bytes = new Uint8Array(buffer);
			let binary = '';
			for (const byte of bytes) {
				binary += String.fromCharCode(byte);
			}
			return { result: md5(binary) };
		}

		const digest = await crypto.subtle.digest(mapWebCryptoAlgorithm(algorithm), buffer);
		return { result: bufferToHex(digest) };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Unable to hash file'
		};
	}
}

export async function hmac(
	text: string,
	key: string,
	algorithm: Extract<HashAlgorithm, 'SHA-1' | 'SHA-256' | 'SHA-512'>
): Promise<HashResult> {
	if (!text || !key) return { result: '' };

	try {
		const cryptoKey = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(key),
			{ name: 'HMAC', hash: mapWebCryptoAlgorithm(algorithm) },
			false,
			['sign']
		);

		const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(text));

		return { result: bufferToHex(signature) };
	} catch (error) {
		return {
			result: '',
			error: error instanceof Error ? error.message : 'Unable to compute HMAC'
		};
	}
}

export const hashAlgorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

export const hmacAlgorithms: Extract<HashAlgorithm, 'SHA-1' | 'SHA-256' | 'SHA-512'>[] = [
	'SHA-1',
	'SHA-256',
	'SHA-512'
];
