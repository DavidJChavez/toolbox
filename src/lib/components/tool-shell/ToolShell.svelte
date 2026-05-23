<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ToolDefinition } from '$lib/tools/types';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let {
		tool,
		children,
		onClear
	}: {
		tool: ToolDefinition;
		children: Snippet;
		onClear?: () => void;
	} = $props();
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-3">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="space-y-2">
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center bg-muted">
						<tool.icon class="size-5" />
					</div>
					<div>
						<h1 class="text-2xl font-medium tracking-tight">{tool.name}</h1>
						<p class="text-sm text-muted-foreground">{tool.description}</p>
					</div>
				</div>
				<div class="flex flex-wrap gap-2">
					<Badge variant="outline">{tool.category}</Badge>
					{#each tool.keywords?.slice(0, 4) ?? [] as keyword (keyword)}
						<Badge variant="secondary">{keyword}</Badge>
					{/each}
				</div>
			</div>

			{#if onClear}
				<Button variant="outline" size="sm" onclick={onClear}>Clear</Button>
			{/if}
		</div>
		<Separator />
	</div>

	{@render children()}
</div>
