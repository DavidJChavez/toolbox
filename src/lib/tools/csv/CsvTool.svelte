<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import { getToolById } from '$lib/tools/registry';
	import {
		csvDelimiters,
		csvToJson,
		formatCsvJsonOutput,
		jsonToCsv,
		type CsvDelimiter
	} from '$lib/tools/csv/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard, downloadText } from '$lib/utils/clipboard';

	const tool = getToolById('csv')!;

	let mode = $state<'csv-to-json' | 'json-to-csv'>('csv-to-json');
	let csvInput = $state('name,email,role\nAlice,alice@example.com,admin\nBob,bob@example.com,user');
	let jsonInput = $state(
		'[\n  { "name": "Alice", "email": "alice@example.com", "role": "admin" },\n  { "name": "Bob", "email": "bob@example.com", "role": "user" }\n]'
	);
	let delimiter = $state<CsvDelimiter>(',');
	let header = $state(true);
	let dynamicTyping = $state(true);

	const csvResult = $derived(csvToJson(csvInput, { delimiter, header, dynamicTyping }));
	const jsonResult = $derived(jsonToCsv(jsonInput, { delimiter, header }));

	const output = $derived(
		mode === 'csv-to-json' ? formatCsvJsonOutput(csvResult.rows) : jsonResult.csv
	);
	const error = $derived(mode === 'csv-to-json' ? csvResult.error : jsonResult.error);

	function clearAll() {
		csvInput = '';
		jsonInput = '';
		delimiter = ',';
		header = true;
		dynamicTyping = true;
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<Tabs.Root bind:value={mode}>
		<Tabs.List>
			<Tabs.Trigger value="csv-to-json">CSV → JSON</Tabs.Trigger>
			<Tabs.Trigger value="json-to-csv">JSON → CSV</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<div class="grid gap-4 md:grid-cols-[220px_1fr]">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label>Delimiter</Label>
				<Select.Root type="single" bind:value={delimiter}>
					<Select.Trigger class="w-full">
						{csvDelimiters.find((item) => item.value === delimiter)?.label ?? delimiter}
					</Select.Trigger>
					<Select.Content>
						{#each csvDelimiters as item (item.value)}
							<Select.Item value={item.value}>{item.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<label class="flex items-center gap-2 text-sm">
				<Checkbox bind:checked={header} />
				Header row
			</label>

			{#if mode === 'csv-to-json'}
				<label class="flex items-center gap-2 text-sm">
					<Checkbox bind:checked={dynamicTyping} />
					Dynamic typing
				</label>
			{/if}
		</div>

		<div class="space-y-4">
			<div class="grid gap-4 xl:grid-cols-2">
				<div class="space-y-2">
					<Label>{mode === 'csv-to-json' ? 'CSV input' : 'JSON input'}</Label>
					{#if mode === 'csv-to-json'}
						<Textarea
							bind:value={csvInput}
							class="min-h-64 font-mono text-sm"
							placeholder="Paste CSV data..."
						/>
					{:else}
						<Textarea
							bind:value={jsonInput}
							class="min-h-64 font-mono text-sm"
							placeholder="Paste JSON array or object..."
						/>
					{/if}
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between gap-2">
						<Label>{mode === 'csv-to-json' ? 'JSON output' : 'CSV output'}</Label>
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
								onclick={() =>
									downloadText(
										output,
										mode === 'csv-to-json' ? 'output.json' : 'output.csv',
										mode === 'csv-to-json' ? 'application/json' : 'text/csv'
									)}
							>
								<DownloadIcon class="size-4" />
								Download
							</Button>
						</div>
					</div>
					<Textarea readonly value={output} class="min-h-64 font-mono text-sm" />
				</div>
			</div>

			{#if error}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{error}
				</div>
			{/if}

			{#if mode === 'csv-to-json' && csvResult.errors.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title>Parse warnings</Card.Title>
						<Card.Description>
							<Badge variant="secondary">{csvResult.errors.length} warnings</Badge>
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2 text-sm text-muted-foreground">
						{#each csvResult.errors as warning, index (index)}
							<p>{warning}</p>
						{/each}
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
</ToolShell>
