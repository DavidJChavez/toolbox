import BinaryIcon from '@lucide/svelte/icons/binary';
import BracesIcon from '@lucide/svelte/icons/braces';
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
