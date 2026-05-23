<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { getToolById } from '$lib/tools/registry';
	import { diffTexts, unifiedDiff, type DiffMode } from '$lib/tools/diff/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('diff')!;

	let original = $state('Hello world\nThis is the original text.');
	let modified = $state('Hello there\nThis is the modified text.');
	let mode = $state<DiffMode>('lines');
	let view = $state<'inline' | 'unified'>('inline');

	const diffResult = $derived(diffTexts(original, modified, mode));
	const unified = $derived(unifiedDiff(original, modified));

	function clearAll() {
		original = '';
		modified = '';
		mode = 'lines';
		view = 'inline';
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="space-y-4">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<Tabs.Root bind:value={mode}>
				<Tabs.List>
					<Tabs.Trigger value="chars">Chars</Tabs.Trigger>
					<Tabs.Trigger value="words">Words</Tabs.Trigger>
					<Tabs.Trigger value="lines">Lines</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>

			<Tabs.Root bind:value={view}>
				<Tabs.List>
					<Tabs.Trigger value="inline">Inline</Tabs.Trigger>
					<Tabs.Trigger value="unified">Unified</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</div>

		<div class="grid gap-4 xl:grid-cols-2">
			<div class="space-y-2">
				<Label for="diff-original">Original</Label>
				<Textarea
					id="diff-original"
					bind:value={original}
					class="min-h-48 font-mono text-sm"
					placeholder="Original text..."
				/>
			</div>
			<div class="space-y-2">
				<Label for="diff-modified">Modified</Label>
				<Textarea
					id="diff-modified"
					bind:value={modified}
					class="min-h-48 font-mono text-sm"
					placeholder="Modified text..."
				/>
			</div>
		</div>

		<Card.Root>
			<Card.Header class="flex flex-row items-start justify-between gap-4">
				<div class="space-y-2">
					<Card.Title>Diff result</Card.Title>
					<Card.Description class="flex flex-wrap gap-2">
						<Badge variant="secondary">+{diffResult.stats.added}</Badge>
						<Badge variant="secondary">-{diffResult.stats.removed}</Badge>
					</Card.Description>
				</div>
				{#if view === 'unified'}
					<Button
						variant="outline"
						size="sm"
						disabled={!unified.patch}
						onclick={() => copyToClipboard(unified.patch, 'Unified diff copied')}
					>
						<CopyIcon class="size-4" />
						Copy patch
					</Button>
				{/if}
			</Card.Header>
			<Card.Content>
				{#if diffResult.error || unified.error}
					<div class="text-sm text-destructive">{diffResult.error ?? unified.error}</div>
				{:else if view === 'inline'}
					<div
						class="min-h-40 border bg-muted/20 p-4 font-mono text-sm break-words whitespace-pre-wrap"
					>
						{#each diffResult.parts as part, index (index)}
							{#if part.added}
								<span class="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
									>{part.value}</span
								>
							{:else if part.removed}
								<span class="bg-rose-500/20 text-rose-700 line-through dark:text-rose-300"
									>{part.value}</span
								>
							{:else}
								{part.value}
							{/if}
						{/each}
					</div>
				{:else}
					<Textarea readonly value={unified.patch} class="min-h-48 font-mono text-sm" />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</ToolShell>
