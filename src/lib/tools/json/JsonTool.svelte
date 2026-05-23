<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import { getToolById } from '$lib/tools/registry';
	import {
		diffJson,
		escapeJsonString,
		jsonToTypeScript,
		jsonToYaml,
		minifyJson,
		prettifyJson,
		queryJsonPath,
		sortJsonKeys,
		unescapeJsonString,
		validateJson,
		yamlToJson,
		type JsonIndent,
		type JsonDiffLine
	} from '$lib/tools/json/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard, downloadText } from '$lib/utils/clipboard';

	const tool = getToolById('json')!;

	let activeTab = $state('prettify');
	let input = $state('{\n  "hello": "world",\n  "items": [1, 2, 3]\n}');
	let compareInput = $state('{\n  "hello": "world",\n  "items": [1, 2, 3, 4]\n}');
	let jsonPath = $state('$.items[*]');
	let indent = $state<JsonIndent>(2);

	const indentOptions = [
		{ value: '2', label: '2 spaces' },
		{ value: '4', label: '4 spaces' },
		{ value: 'tab', label: 'Tab' }
	];

	const operationState = $derived.by(() => {
		if (activeTab === 'diff') {
			const result = diffJson(input, compareInput);
			return {
				output: '',
				error: result.error ?? '',
				isValid: undefined as boolean | undefined,
				diffLines: result.lines
			};
		}

		let result;

		switch (activeTab) {
			case 'prettify':
				result = prettifyJson(input, indent);
				break;
			case 'minify':
				result = minifyJson(input);
				break;
			case 'validate':
				result = validateJson(input);
				break;
			case 'sort':
				result = sortJsonKeys(input, indent);
				break;
			case 'escape':
				result = escapeJsonString(input);
				break;
			case 'unescape':
				result = unescapeJsonString(input);
				break;
			case 'typescript':
				result = jsonToTypeScript(input);
				break;
			case 'to-yaml':
				result = jsonToYaml(input);
				break;
			case 'from-yaml':
				result = yamlToJson(input, indent);
				break;
			case 'jsonpath':
				result = queryJsonPath(input, jsonPath);
				break;
			default:
				return {
					output: '',
					error: '',
					isValid: undefined as boolean | undefined,
					diffLines: [] as JsonDiffLine[]
				};
		}

		return {
			output: result.result,
			error: result.error ?? '',
			isValid: result.valid,
			diffLines: [] as JsonDiffLine[]
		};
	});

	const output = $derived(operationState.output);
	const error = $derived(operationState.error);
	const isValid = $derived(operationState.isValid);
	const diffLines = $derived(operationState.diffLines);

	function clearAll() {
		input = '';
		compareInput = '';
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="flex flex-wrap items-end justify-between gap-4">
		<Tabs.Root bind:value={activeTab} class="w-full">
			<Tabs.List class="flex h-auto flex-wrap">
				<Tabs.Trigger value="prettify">Prettify</Tabs.Trigger>
				<Tabs.Trigger value="minify">Minify</Tabs.Trigger>
				<Tabs.Trigger value="validate">Validate</Tabs.Trigger>
				<Tabs.Trigger value="sort">Sort keys</Tabs.Trigger>
				<Tabs.Trigger value="escape">Escape</Tabs.Trigger>
				<Tabs.Trigger value="unescape">Unescape</Tabs.Trigger>
				<Tabs.Trigger value="typescript">JSON → TS</Tabs.Trigger>
				<Tabs.Trigger value="to-yaml">JSON → YAML</Tabs.Trigger>
				<Tabs.Trigger value="from-yaml">YAML → JSON</Tabs.Trigger>
				<Tabs.Trigger value="jsonpath">JSONPath</Tabs.Trigger>
				<Tabs.Trigger value="diff">Diff</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<div class="flex flex-wrap items-center gap-3">
			{#if ['prettify', 'sort', 'from-yaml'].includes(activeTab)}
				<div class="flex items-center gap-2">
					<Label for="indent">Indent</Label>
					<Select.Root
						type="single"
						value={String(indent)}
						onValueChange={(value) => {
							indent = value === 'tab' ? 'tab' : (Number(value) as JsonIndent);
						}}
					>
						<Select.Trigger id="indent" class="w-32">
							{indentOptions.find((option) => option.value === String(indent))?.label ?? '2 spaces'}
						</Select.Trigger>
						<Select.Content>
							{#each indentOptions as option (option.value)}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			{/if}

			{#if activeTab === 'jsonpath'}
				<div class="flex min-w-64 flex-1 items-center gap-2">
					<Label for="jsonpath">Path</Label>
					<Input id="jsonpath" bind:value={jsonPath} placeholder="$.items[*]" class="font-mono" />
				</div>
			{/if}
		</div>
	</div>

	{#if activeTab === 'diff'}
		<Resizable.PaneGroup direction="horizontal" class="min-h-[420px] rounded-none border">
			<Resizable.Pane defaultSize={50} minSize={25}>
				<div class="flex h-full flex-col gap-2 p-4">
					<Label for="json-left">Left JSON</Label>
					<Textarea
						id="json-left"
						bind:value={input}
						class="min-h-[360px] flex-1 font-mono text-sm"
					/>
				</div>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={50} minSize={25}>
				<div class="flex h-full flex-col gap-2 p-4">
					<Label for="json-right">Right JSON</Label>
					<Textarea
						id="json-right"
						bind:value={compareInput}
						class="min-h-[360px] flex-1 font-mono text-sm"
					/>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>

		<Card.Root>
			<Card.Header>
				<Card.Title>Diff result</Card.Title>
				<Card.Description>Added and removed lines between both JSON documents</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if error}
					<div
						class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
					>
						{error}
					</div>
				{:else}
					<pre class="overflow-auto border bg-muted/30 p-4 font-mono text-sm leading-6">
{#each diffLines as line, index (index)}
							<span
								class={line.type === 'added'
									? 'text-green-600 dark:text-green-400'
									: line.type === 'removed'
										? 'text-red-600 dark:text-red-400'
										: 'text-muted-foreground'}
								>{line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}{line.line}
</span>{/each}</pre>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4 xl:grid-cols-2">
			<div class="space-y-2">
				<Label for="json-input">Input</Label>
				<Textarea
					id="json-input"
					bind:value={input}
					class="min-h-[420px] font-mono text-sm"
					placeholder="Paste JSON or YAML here..."
				/>
			</div>

			<Card.Root class="h-full">
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-2">
						<Card.Title>Output</Card.Title>
						{#if isValid !== undefined}
							<Badge variant={isValid ? 'default' : 'destructive'}>
								{isValid ? 'Valid' : 'Invalid'}
							</Badge>
						{/if}
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!output}
							onclick={() => copyToClipboard(output, 'Output copied')}
						>
							<CopyIcon class="size-4" />
							Copy
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!output}
							onclick={() => downloadText(output, 'output.txt')}
						>
							<DownloadIcon class="size-4" />
							Download
						</Button>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#if error}
						<div
							class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
						>
							{error}
						</div>
					{/if}
					<Textarea
						readonly
						value={output}
						class="min-h-[360px] font-mono text-sm"
						placeholder="Result will appear here..."
					/>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</ToolShell>
