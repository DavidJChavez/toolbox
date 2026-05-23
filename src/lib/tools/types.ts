import type { Component } from 'svelte';

export type ToolCategory = 'encoding' | 'json' | 'text' | 'crypto' | 'web' | 'time' | 'design';

export type NodeDataType = 'text' | 'json' | 'binary' | 'image';

export interface NodeSpec {
	inputs: Array<{ id: string; label: string; type: NodeDataType }>;
	outputs: Array<{ id: string; label: string; type: NodeDataType }>;
}

export interface ToolDefinition<TIn = unknown, TOut = unknown> {
	id: string;
	name: string;
	description: string;
	category: ToolCategory;
	icon: Component;
	href: string;
	keywords?: string[];
	run?: (input: TIn) => TOut | Promise<TOut>;
	node?: NodeSpec;
}

export const categoryLabels: Record<ToolCategory, string> = {
	encoding: 'Encoding',
	json: 'JSON',
	text: 'Text',
	crypto: 'Crypto',
	web: 'Web',
	time: 'Time',
	design: 'Design'
};

export const categoryOrder: ToolCategory[] = [
	'encoding',
	'json',
	'text',
	'crypto',
	'web',
	'time',
	'design'
];
