<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { getToolById } from '$lib/tools/registry';
	import {
		buildQueryString,
		decodeComponent,
		encodeComponent,
		inspectUrl,
		parseQueryString,
		type QueryParam
	} from '$lib/tools/url/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('url')!;

	let activeTab = $state('encode');
	let input = $state('hello world?foo=bar&baz=qux');
	let queryParams = $state<QueryParam[]>([{ key: '', value: '' }]);

	const encodeState = $derived(encodeComponent(input));
	const decodeState = $derived(decodeComponent(input));
	const parsedQuery = $derived(parseQueryString(input));
	const rebuiltQuery = $derived(buildQueryString(queryParams));
	const inspection = $derived(inspectUrl(input));

	const output = $derived(
		activeTab === 'encode' ? encodeState.result : activeTab === 'decode' ? decodeState.result : ''
	);

	const error = $derived(
		activeTab === 'encode'
			? (encodeState.error ?? '')
			: activeTab === 'decode'
				? (decodeState.error ?? '')
				: activeTab === 'query'
					? (parsedQuery.error ?? rebuiltQuery.error ?? '')
					: (inspection.error ?? '')
	);

	function syncQueryParamsFromInput(value: string) {
		const parsed = parseQueryString(value);
		queryParams =
			parsed.params.length > 0
				? parsed.params.map((param) => ({ ...param }))
				: [{ key: '', value: '' }];
	}

	function handleTabChange(value: string) {
		activeTab = value;
		if (value === 'query') {
			syncQueryParamsFromInput(input);
		}
	}

	function handleQueryInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
		input = event.currentTarget.value;
		syncQueryParamsFromInput(event.currentTarget.value);
	}

	function clearAll() {
		input = '';
		queryParams = [{ key: '', value: '' }];
	}

	function addQueryParam() {
		queryParams = [...queryParams, { key: '', value: '' }];
	}

	function removeQueryParam(index: number) {
		queryParams = queryParams.filter((_, currentIndex) => currentIndex !== index);
		if (queryParams.length === 0) {
			queryParams = [{ key: '', value: '' }];
		}
	}

	function updateQueryParam(index: number, field: keyof QueryParam, value: string) {
		queryParams = queryParams.map((param, currentIndex) =>
			currentIndex === index ? { ...param, [field]: value } : param
		);
	}

	const inspectorFields = $derived([
		{ label: 'Protocol', value: inspection.protocol },
		{ label: 'Username', value: inspection.username },
		{ label: 'Password', value: inspection.password },
		{ label: 'Hostname', value: inspection.hostname },
		{ label: 'Port', value: inspection.port },
		{ label: 'Pathname', value: inspection.pathname },
		{ label: 'Search', value: inspection.search },
		{ label: 'Hash', value: inspection.hash }
	]);
</script>

<ToolShell {tool} onClear={clearAll}>
	<Tabs.Root value={activeTab} onValueChange={handleTabChange} class="w-full">
		<Tabs.List class="flex h-auto flex-wrap">
			<Tabs.Trigger value="encode">Encode</Tabs.Trigger>
			<Tabs.Trigger value="decode">Decode</Tabs.Trigger>
			<Tabs.Trigger value="query">Query parser</Tabs.Trigger>
			<Tabs.Trigger value="inspect">Inspector</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	{#if activeTab === 'encode' || activeTab === 'decode'}
		<div class="grid gap-4 xl:grid-cols-2">
			<div class="space-y-2">
				<Label for="url-input">Input</Label>
				<Textarea
					id="url-input"
					bind:value={input}
					class="min-h-[420px] font-mono text-sm"
					placeholder={activeTab === 'encode'
						? 'Paste text to encode with encodeURIComponent...'
						: 'Paste encoded text to decode...'}
				/>
			</div>

			<Card.Root class="h-full">
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-2">
						<Card.Title>Output</Card.Title>
						<Card.Description>
							{activeTab === 'encode' ? 'encodeURIComponent result' : 'decodeURIComponent result'}
						</Card.Description>
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={!output}
						onclick={() => copyToClipboard(output, 'Output copied')}
					>
						<CopyIcon class="size-4" />
						Copy
					</Button>
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
	{:else if activeTab === 'query'}
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="query-input">URL or query string</Label>
				<Textarea
					id="query-input"
					value={input}
					oninput={handleQueryInput}
					class="min-h-28 font-mono text-sm"
					placeholder="https://example.com/search?q=hello&page=2 or ?foo=bar&baz=qux"
				/>
			</div>

			{#if error}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{error}
				</div>
			{/if}

			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-2">
						<Card.Title>Query parameters</Card.Title>
						<Card.Description>Edit keys and values, then rebuild the query string</Card.Description>
					</div>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onclick={addQueryParam}>
							<PlusIcon class="size-4" />
							Add row
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!rebuiltQuery.result}
							onclick={() => copyToClipboard(rebuiltQuery.result, 'Query string copied')}
						>
							<CopyIcon class="size-4" />
							Rebuild URL
						</Button>
					</div>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[40%]">Key</Table.Head>
								<Table.Head>Value</Table.Head>
								<Table.Head class="w-16 text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each queryParams as param, index (index)}
								<Table.Row>
									<Table.Cell>
										<Input
											value={param.key}
											class="font-mono text-sm"
											placeholder="key"
											oninput={(event) => updateQueryParam(index, 'key', event.currentTarget.value)}
										/>
									</Table.Cell>
									<Table.Cell>
										<Input
											value={param.value}
											class="font-mono text-sm"
											placeholder="value"
											oninput={(event) =>
												updateQueryParam(index, 'value', event.currentTarget.value)}
										/>
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button
											variant="ghost"
											size="icon-sm"
											onclick={() => removeQueryParam(index)}
											aria-label="Remove parameter"
										>
											<Trash2Icon class="size-4" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>

					{#if rebuiltQuery.result}
						<div class="mt-4 space-y-2">
							<Label for="rebuilt-query">Rebuilt query string</Label>
							<Input
								id="rebuilt-query"
								readonly
								value={rebuiltQuery.result}
								class="font-mono text-sm"
							/>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="inspect-input">URL</Label>
				<Input
					id="inspect-input"
					bind:value={input}
					class="font-mono text-sm"
					placeholder="https://user:pass@example.com:8080/path?foo=bar#section"
				/>
			</div>

			{#if error}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{error}
				</div>
			{/if}

			<div class="grid gap-4 xl:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>URL components</Card.Title>
						<Card.Description>Parsed fields from the URL API</Card.Description>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Body>
								{#each inspectorFields as field (field.label)}
									<Table.Row>
										<Table.Cell class="w-32 font-medium text-muted-foreground">
											{field.label}
										</Table.Cell>
										<Table.Cell class="font-mono text-sm break-all">
											{field.value || '—'}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div class="space-y-2">
							<Card.Title>Query parameters</Card.Title>
							<Card.Description>
								{#if inspection.params.length > 0}
									<Badge variant="secondary">{inspection.params.length} params</Badge>
								{:else}
									No query parameters
								{/if}
							</Card.Description>
						</div>
					</Card.Header>
					<Card.Content>
						{#if inspection.params.length > 0}
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Key</Table.Head>
										<Table.Head>Value</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each inspection.params as param, index (index)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">{param.key}</Table.Cell>
											<Table.Cell class="font-mono text-sm break-all">{param.value}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						{:else}
							<p class="text-sm text-muted-foreground">
								Enter a URL with query parameters to inspect them.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</ToolShell>
