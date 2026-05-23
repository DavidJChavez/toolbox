<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { getToolById } from '$lib/tools/registry';
	import { regexFlags, testRegex } from '$lib/tools/regex/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('regex')!;

	let pattern = $state('\\w+');
	let input = $state('hello world 123');
	let replaceWith = $state('');
	let selectedFlags = $state<string[]>(['g']);

	const flags = $derived(selectedFlags.join(''));
	const result = $derived(testRegex(pattern, flags, input, replaceWith));

	function toggleFlag(flag: string, checked: boolean) {
		selectedFlags = checked
			? [...selectedFlags, flag]
			: selectedFlags.filter((value) => value !== flag);
	}

	function clearAll() {
		pattern = '';
		input = '';
		replaceWith = '';
		selectedFlags = ['g'];
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 xl:grid-cols-2">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="regex-pattern">Pattern</Label>
				<div class="flex gap-2">
					<span class="flex items-center text-sm text-muted-foreground">/</span>
					<Input
						id="regex-pattern"
						bind:value={pattern}
						class="font-mono text-sm"
						placeholder="\\d+"
					/>
					<span class="flex items-center text-sm text-muted-foreground">/{flags}</span>
				</div>
			</div>

			<div class="space-y-2">
				<Label>Flags</Label>
				<div class="flex flex-wrap gap-4">
					{#each regexFlags as flag (flag.id)}
						<label class="flex items-center gap-2 text-sm">
							<Checkbox
								checked={selectedFlags.includes(flag.id)}
								onCheckedChange={(checked) => toggleFlag(flag.id, checked === true)}
							/>
							{flag.label}
						</label>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="regex-input">Test string</Label>
				<Textarea
					id="regex-input"
					bind:value={input}
					class="min-h-40 font-mono text-sm"
					placeholder="Text to test against the pattern..."
				/>
			</div>

			<div class="space-y-2">
				<Label for="regex-replace">Replace with (optional)</Label>
				<Input
					id="regex-replace"
					bind:value={replaceWith}
					class="font-mono text-sm"
					placeholder="Replacement string..."
				/>
			</div>
		</div>

		<div class="space-y-4">
			{#if result.error}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{result.error}
				</div>
			{/if}

			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-2">
						<Card.Title>Matches</Card.Title>
						<Card.Description>
							<Badge variant="secondary">{result.matchCount} matches</Badge>
						</Card.Description>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div
						class="min-h-40 border bg-muted/20 p-4 font-mono text-sm break-words whitespace-pre-wrap"
					>
						{#each result.highlight as segment, index (index)}
							{#if segment.isMatch}
								<span class="bg-primary/20 text-primary">{segment.text}</span>
							{:else}
								{segment.text}
							{/if}
						{/each}
					</div>

					{#if result.matches.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Match</Table.Head>
									<Table.Head class="w-20">Index</Table.Head>
									<Table.Head>Groups</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each result.matches as match, index (index)}
									<Table.Row>
										<Table.Cell class="font-mono text-sm">{match.match}</Table.Cell>
										<Table.Cell class="font-mono text-sm">{match.index}</Table.Cell>
										<Table.Cell class="font-mono text-sm">
											{match.groups.length > 0 ? match.groups.join(', ') : '—'}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>

			{#if result.replaced !== undefined}
				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div class="space-y-1">
							<Card.Title>Replace preview</Card.Title>
							<Card.Description>Result after applying the replacement</Card.Description>
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={!result.replaced}
							onclick={() => copyToClipboard(result.replaced ?? '', 'Replacement copied')}
						>
							<CopyIcon class="size-4" />
							Copy
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea readonly value={result.replaced} class="min-h-28 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
</ToolShell>
