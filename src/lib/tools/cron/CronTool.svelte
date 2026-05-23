<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { getToolById } from '$lib/tools/registry';
	import { listTimezones } from '$lib/tools/timestamp/tool';
	import { cronExamples, parseCron } from '$lib/tools/cron/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('cron')!;

	const timezones = listTimezones();

	let expression = $state('0 9 * * 1-5');
	let timeZone = $state('UTC');
	let count = $state(10);

	const result = $derived(parseCron(expression, { count, timezone: timeZone }));

	function applyExample(example: string) {
		expression = example;
	}

	function clearAll() {
		expression = '';
		timeZone = 'UTC';
		count = 10;
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 md:grid-cols-[280px_1fr]">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label>Timezone</Label>
				<Select.Root type="single" bind:value={timeZone}>
					<Select.Trigger class="w-full">{timeZone}</Select.Trigger>
					<Select.Content class="max-h-72">
						{#each timezones as zone (zone)}
							<Select.Item value={zone}>{zone}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>Next executions</Label>
					<span class="text-sm text-muted-foreground">{count}</span>
				</div>
				<Slider type="single" bind:value={count} min={1} max={30} step={1} />
			</div>

			<div class="space-y-2">
				<Label>Examples</Label>
				<div class="flex flex-col gap-2">
					{#each cronExamples as example (example.expression)}
						<Button variant="outline" size="sm" onclick={() => applyExample(example.expression)}>
							{example.label}
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="cron-expression">Cron expression</Label>
				<Input
					id="cron-expression"
					bind:value={expression}
					class="font-mono text-sm"
					placeholder="0 9 * * 1-5"
				/>
			</div>

			{#if result.error}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{result.error}
				</div>
			{/if}

			<Card.Root>
				<Card.Header>
					<Card.Title>Human-readable</Card.Title>
					<Card.Description>
						{#if result.description}
							{result.description}
						{:else}
							Enter a cron expression to see its description.
						{/if}
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Upcoming runs</Card.Title>
					<Card.Description>
						<Badge variant="secondary">{result.nextExecutions.length} scheduled</Badge>
					</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if result.nextExecutions.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>#</Table.Head>
									<Table.Head>Timestamp</Table.Head>
									<Table.Head>Relative</Table.Head>
									<Table.Head class="w-16"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each result.nextExecutions as execution, index (execution.iso)}
									<Table.Row>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell class="font-mono text-sm">{execution.iso}</Table.Cell>
										<Table.Cell>{execution.relative}</Table.Cell>
										<Table.Cell class="text-right">
											<Button
												variant="ghost"
												size="icon-sm"
												onclick={() => copyToClipboard(execution.iso, 'Timestamp copied')}
												aria-label="Copy timestamp"
											>
												<CopyIcon class="size-4" />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<p class="text-sm text-muted-foreground">No upcoming executions to display.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</ToolShell>
