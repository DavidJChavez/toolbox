<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { getToolById } from '$lib/tools/registry';
	import { generateBatch, idTypeLabels, type GeneratedId, type IdType } from '$lib/tools/uuid/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('uuid')!;

	let idType = $state<IdType>('uuid');
	let count = $state(5);
	let nanoIdSize = $state(21);
	let ids = $state<GeneratedId[]>(generateBatch('uuid', 5));

	function regenerate() {
		ids = generateBatch(idType, Number(count) || 1, Number(nanoIdSize) || 21);
	}

	function clearAll() {
		idType = 'uuid';
		count = 5;
		nanoIdSize = 21;
		ids = generateBatch('uuid', 5);
	}

	const allValues = $derived(ids.map((entry) => entry.value).join('\n'));
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 md:grid-cols-[260px_1fr]">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label>ID type</Label>
				<Select.Root type="single" bind:value={idType}>
					<Select.Trigger class="w-full">
						{idTypeLabels[idType]}
					</Select.Trigger>
					<Select.Content>
						{#each Object.entries(idTypeLabels) as [value, label] (value)}
							<Select.Item {value}>{label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label for="count">Count</Label>
				<Input id="count" type="number" min="1" max="100" bind:value={count} />
			</div>

			{#if idType === 'nanoid'}
				<div class="space-y-2">
					<Label for="nanoid-size">NanoID size</Label>
					<Input id="nanoid-size" type="number" min="8" max="64" bind:value={nanoIdSize} />
				</div>
			{/if}

			<Button class="w-full" onclick={regenerate}>
				<RefreshCwIcon class="size-4" />
				Regenerate
			</Button>
		</div>

		<Card.Root>
			<Card.Header class="flex flex-row items-start justify-between gap-4">
				<div class="space-y-1">
					<Card.Title>Generated IDs</Card.Title>
					<Card.Description>{ids.length} {idTypeLabels[idType]} identifiers</Card.Description>
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={ids.length === 0}
					onclick={() => copyToClipboard(allValues, 'All IDs copied')}
				>
					<CopyIcon class="size-4" />
					Copy all
				</Button>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-16">#</Table.Head>
							<Table.Head>Value</Table.Head>
							<Table.Head class="w-16 text-right">Copy</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each ids as entry, index (index)}
							<Table.Row>
								<Table.Cell class="text-muted-foreground">{index + 1}</Table.Cell>
								<Table.Cell class="font-mono text-sm break-all">{entry.value}</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="icon-sm"
										onclick={() => copyToClipboard(entry.value, 'ID copied')}
										aria-label="Copy ID"
									>
										<CopyIcon class="size-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</ToolShell>
