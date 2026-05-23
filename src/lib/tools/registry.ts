import BinaryIcon from '@lucide/svelte/icons/binary';
import BracesIcon from '@lucide/svelte/icons/braces';
import ClockIcon from '@lucide/svelte/icons/clock';
import FingerprintIcon from '@lucide/svelte/icons/fingerprint';
import KeyRoundIcon from '@lucide/svelte/icons/key-round';
import Link2Icon from '@lucide/svelte/icons/link-2';
import RegexIcon from '@lucide/svelte/icons/regex';
import ShuffleIcon from '@lucide/svelte/icons/shuffle';
import type { ToolCategory, ToolDefinition } from './types';

export const tools: ToolDefinition[] = [
	{
		id: 'base64',
		name: 'Base64',
		description: 'Encode and decode Base64 for text, files, images, PDFs and binary data.',
		category: 'encoding',
		icon: BinaryIcon,
		href: '/tools/base64',
		keywords: ['base64', 'encode', 'decode', 'data url', 'image', 'pdf'],
		node: {
			inputs: [{ id: 'input', label: 'Input', type: 'text' }],
			outputs: [{ id: 'output', label: 'Output', type: 'text' }]
		}
	},
	{
		id: 'json',
		name: 'JSON',
		description: 'Prettify, validate, minify, convert and inspect JSON payloads.',
		category: 'json',
		icon: BracesIcon,
		href: '/tools/json',
		keywords: ['json', 'prettify', 'validate', 'yaml', 'typescript', 'jsonpath', 'diff'],
		node: {
			inputs: [{ id: 'input', label: 'JSON', type: 'json' }],
			outputs: [{ id: 'output', label: 'Result', type: 'json' }]
		}
	},
	{
		id: 'url',
		name: 'URL',
		description: 'Encode, decode and inspect URLs and query strings.',
		category: 'encoding',
		icon: Link2Icon,
		href: '/tools/url',
		keywords: ['url', 'encode', 'decode', 'query', 'params', 'uri'],
		node: {
			inputs: [{ id: 'input', label: 'URL', type: 'text' }],
			outputs: [{ id: 'output', label: 'Result', type: 'text' }]
		}
	},
	{
		id: 'jwt',
		name: 'JWT',
		description: 'Decode JWT tokens and inspect header, payload, signature and expiration.',
		category: 'crypto',
		icon: KeyRoundIcon,
		href: '/tools/jwt',
		keywords: ['jwt', 'token', 'decode', 'exp', 'claims', 'payload'],
		node: {
			inputs: [{ id: 'input', label: 'JWT', type: 'text' }],
			outputs: [{ id: 'output', label: 'Payload', type: 'json' }]
		}
	},
	{
		id: 'hash',
		name: 'Hash',
		description: 'Compute MD5, SHA-1, SHA-256, SHA-512 hashes and HMAC digests.',
		category: 'crypto',
		icon: FingerprintIcon,
		href: '/tools/hash',
		keywords: ['hash', 'md5', 'sha256', 'sha512', 'hmac', 'checksum'],
		node: {
			inputs: [{ id: 'input', label: 'Input', type: 'text' }],
			outputs: [{ id: 'output', label: 'Digest', type: 'text' }]
		}
	},
	{
		id: 'timestamp',
		name: 'Timestamp',
		description: 'Convert Unix timestamps to human-readable dates and back.',
		category: 'time',
		icon: ClockIcon,
		href: '/tools/timestamp',
		keywords: ['timestamp', 'unix', 'epoch', 'date', 'timezone', 'iso8601'],
		node: {
			inputs: [{ id: 'input', label: 'Timestamp', type: 'text' }],
			outputs: [{ id: 'output', label: 'Date', type: 'text' }]
		}
	},
	{
		id: 'uuid',
		name: 'UUID',
		description: 'Generate UUID v4, NanoID and ULID identifiers in batches.',
		category: 'crypto',
		icon: ShuffleIcon,
		href: '/tools/uuid',
		keywords: ['uuid', 'nanoid', 'ulid', 'generate', 'id', 'unique'],
		node: {
			inputs: [],
			outputs: [{ id: 'output', label: 'ID', type: 'text' }]
		}
	},
	{
		id: 'regex',
		name: 'Regex',
		description: 'Test regular expressions with match highlighting and replace preview.',
		category: 'text',
		icon: RegexIcon,
		href: '/tools/regex',
		keywords: ['regex', 'regexp', 'pattern', 'match', 'replace', 'test'],
		node: {
			inputs: [
				{ id: 'pattern', label: 'Pattern', type: 'text' },
				{ id: 'input', label: 'Input', type: 'text' }
			],
			outputs: [{ id: 'output', label: 'Matches', type: 'text' }]
		}
	}
];

export function getToolById(id: string): ToolDefinition | undefined {
	return tools.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
	return tools.filter((tool) => tool.category === category);
}

export function getGroupedTools(): Array<{ category: ToolCategory; tools: ToolDefinition[] }> {
	const grouped = new Map<ToolCategory, ToolDefinition[]>();

	for (const tool of tools) {
		const existing = grouped.get(tool.category) ?? [];
		existing.push(tool);
		grouped.set(tool.category, existing);
	}

	return [...grouped.entries()].map(([category, categoryTools]) => ({
		category,
		tools: categoryTools
	}));
}
