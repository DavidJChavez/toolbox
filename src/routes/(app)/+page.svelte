<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { tools } from '$lib/tools/registry';
	import { categoryLabels } from '$lib/tools/types';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>Toolbox — Developer utilities</title>
	<meta
		name="description"
		content="A growing collection of browser-based developer tools including Base64 and JSON utilities."
	/>
</svelte:head>

<div class="space-y-8">
	<section class="space-y-3">
		<h1 class="text-3xl font-medium tracking-tight">Toolbox</h1>
		<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
			A growing collection of developer utilities. Everything runs locally in your browser — no data
			leaves your machine.
		</p>
	</section>

	<section class="space-y-4">
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-lg font-medium">Available tools</h2>
			<Badge variant="secondary">{tools.length} tools</Badge>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each tools as tool (tool.id)}
				<Card.Root class="h-full transition-colors hover:bg-muted/40">
					<a href={tool.href} class="flex h-full flex-col">
						<Card.Header>
							<div class="flex items-start justify-between gap-3">
								<div class="flex size-10 items-center justify-center bg-muted">
									<tool.icon class="size-5" />
								</div>
								<Badge variant="outline">{categoryLabels[tool.category]}</Badge>
							</div>
							<Card.Title class="mt-4">{tool.name}</Card.Title>
							<Card.Description>{tool.description}</Card.Description>
						</Card.Header>
						<Card.Footer class="mt-auto flex items-center justify-between">
							<div class="flex flex-wrap gap-1">
								{#each tool.keywords?.slice(0, 3) ?? [] as keyword (keyword)}
									<Badge variant="secondary" class="text-[10px]">{keyword}</Badge>
								{/each}
							</div>
							<ArrowRightIcon class="size-4 text-muted-foreground" />
						</Card.Footer>
					</a>
				</Card.Root>
			{/each}
		</div>
	</section>
</div>
