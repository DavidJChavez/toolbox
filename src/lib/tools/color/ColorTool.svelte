<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { getToolById } from '$lib/tools/registry';
	import { applyAlpha, parseColor } from '$lib/tools/color/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('color')!;

	let input = $state('#3b82f6');
	let alpha = $state(100);

	const baseResult = $derived(parseColor(input));
	const result = $derived(
		baseResult.formats && alpha < 100 ? applyAlpha(input, alpha / 100) : baseResult
	);

	const formatRows = $derived(
		result.formats
			? [
					{ label: 'HEX', value: result.formats.hex },
					{ label: 'RGB', value: result.formats.rgb },
					{ label: 'HSL', value: result.formats.hsl },
					{ label: 'OKLCH', value: result.formats.oklch },
					{ label: 'OKLab', value: result.formats.oklab },
					{ label: 'Alpha', value: String(result.formats.alpha) }
				]
			: []
	);

	const previewColor = $derived(result.formats?.hex || input);

	function clearAll() {
		input = '';
		alpha = 100;
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 xl:grid-cols-[320px_1fr]">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="color-input">Color input</Label>
				<div class="flex gap-3">
					<div
						class="size-12 shrink-0 border"
						style={`background-color: ${previewColor}`}
						aria-hidden="true"
					></div>
					<Input
						id="color-input"
						bind:value={input}
						class="font-mono text-sm"
						placeholder="#3b82f6, rgb(59,130,246), oklch(0.62 0.19 255)"
					/>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>Alpha</Label>
					<span class="text-sm text-muted-foreground">{alpha}%</span>
				</div>
				<Slider type="single" bind:value={alpha} min={0} max={100} step={1} />
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
				<Card.Header>
					<Card.Title>Converted formats</Card.Title>
					<Card.Description>HEX, RGB, HSL, OKLCH and OKLab representations</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if formatRows.length > 0}
						<Table.Root>
							<Table.Body>
								{#each formatRows as row (row.label)}
									<Table.Row>
										<Table.Cell class="w-24 font-medium text-muted-foreground">
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
						<p class="text-sm text-muted-foreground">Enter a color to see converted formats.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</ToolShell>
