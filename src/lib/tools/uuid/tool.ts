import { nanoid } from 'nanoid';
import { ulid } from 'ulid';

export type IdType = 'uuid' | 'nanoid' | 'ulid';

export interface GeneratedId {
	value: string;
	type: IdType;
}

export function generateUuid(): string {
	return crypto.randomUUID();
}

export function generateNanoId(size = 21): string {
	return nanoid(size);
}

export function generateUlid(): string {
	return ulid();
}

export function generateId(type: IdType, nanoIdSize = 21): string {
	switch (type) {
		case 'uuid':
			return generateUuid();
		case 'nanoid':
			return generateNanoId(nanoIdSize);
		case 'ulid':
			return generateUlid();
	}
}

export function generateBatch(type: IdType, count: number, nanoIdSize = 21): GeneratedId[] {
	const safeCount = Math.min(Math.max(count, 1), 100);

	return Array.from({ length: safeCount }, () => ({
		type,
		value: generateId(type, nanoIdSize)
	}));
}

export const idTypeLabels: Record<IdType, string> = {
	uuid: 'UUID v4',
	nanoid: 'NanoID',
	ulid: 'ULID'
};
