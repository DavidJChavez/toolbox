<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { getToolById } from '$lib/tools/registry';
	import {
		dateToUnix,
		getDefaultTimezone,
		listTimezones,
		now,
		unixToDate
	} from '$lib/tools/timestamp/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('timestamp')!;

	const timezones = listTimezones();

	let mode = $state<'unix-to-date' | 'date-to-unix'>('unix-to-date');
	let unixInput = $state(String(now()));
	let dateInput = $state(new Date().toISOString());
	let timeZone = $state(getDefaultTimezone());

	const unixResult = $derived(unixToDate(unixInput, timeZone));
	const dateResult = $derived(dateToUnix(dateInput, timeZone));
	const activeResult = $derived(mode === 'unix-to-date' ? unixResult : dateResult);

	const formatRows = $derived(
		activeResult.formats
			? [
					{ label: 'Unix (seconds)', value: String(activeResult.formats.unixSeconds) },
					{ label: 'Unix (milliseconds)', value: String(activeResult.formats.unixMilliseconds) },
					{ label: 'ISO 8601', value: activeResult.formats.iso8601 },
					{ label: 'RFC 2822', value: activeResult.formats.rfc2822 },
					{ label: `Local (${timeZone})`, value: activeResult.formats.local },
					{ label: 'UTC', value: activeResult.formats.utc },
					{ label: 'Relative', value: activeResult.formats.relative }
				]
			: []
	);

	function setNow() {
		const current = now();
		unixInput = String(current);
		dateInput = new Date(current * 1000).toISOString();
	}

	function clearAll() {
		unixInput = '';
		dateInput = '';
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<Tabs.Root bind:value={mode}>
		<Tabs.List>
			<Tabs.Trigger value="unix-to-date">Unix → Date</Tabs.Trigger>
			<Tabs.Trigger value="date-to-unix">Date → Unix</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<div class="grid gap-4 md:grid-cols-[280px_1fr]">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label>Timezone</Label>
				<Select.Root type="single" bind:value={timeZone}>
					<Select.Trigger class="w-full">
						{timeZone}
					</Select.Trigger>
					<Select.Content class="max-h-72">
						{#each timezones as zone (zone)}
							<Select.Item value={zone}>{zone}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<Button variant="outline" class="w-full" onclick={setNow}>
				<RefreshCwIcon class="size-4" />
				Now
			</Button>
		</div>

		<div class="space-y-4">
			{#if mode === 'unix-to-date'}
				<div class="space-y-2">
					<Label for="unix-input">Unix timestamp</Label>
					<Input
						id="unix-input"
						bind:value={unixInput}
						class="font-mono text-sm"
						placeholder="1700000000 or 1700000000000"
					/>
				</div>
			{:else}
				<div class="space-y-2">
					<Label for="date-input">Date string</Label>
					<Input
						id="date-input"
						bind:value={dateInput}
						class="font-mono text-sm"
						placeholder="2024-01-01T00:00:00.000Z"
					/>
				</div>
			{/if}

			{#if activeResult.error}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{activeResult.error}
				</div>
			{/if}

			<Card.Root>
				<Card.Header>
					<Card.Title>Converted formats</Card.Title>
					<Card.Description>Common timestamp representations for debugging</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if formatRows.length > 0}
						<Table.Root>
							<Table.Body>
								{#each formatRows as row (row.label)}
									<Table.Row>
										<Table.Cell class="w-48 font-medium text-muted-foreground">
											{row.label}
										</Table.Cell>
										<Table.Cell class="font-mono text-sm break-all">{row.value}</Table.Cell>
										<Table.Cell class="w-16 text-right">
											<Button
												variant="ghost"
												size="icon-sm"
												onclick={() => copyToClipboard(row.value, `${row.label} copied`)}
												aria-label="Copy {row.label}"
											>
												<CopyIcon class="size-4" />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<p class="text-sm text-muted-foreground">Enter a timestamp to see converted formats.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</ToolShell>
