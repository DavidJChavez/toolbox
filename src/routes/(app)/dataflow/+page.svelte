<script lang="ts">
	import WorkflowIcon from '@lucide/svelte/icons/workflow';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>Dataflow — Toolbox</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col items-center gap-6 py-10 text-center">
	<div class="flex size-16 items-center justify-center bg-muted">
		<WorkflowIcon class="size-8" />
	</div>

	<div class="space-y-3">
		<div class="flex items-center justify-center gap-2">
			<h1 class="text-3xl font-medium tracking-tight">Dataflow</h1>
			<Badge variant="secondary">Coming soon</Badge>
		</div>
		<p class="text-sm leading-6 text-muted-foreground">
			Chain toolbox utilities together in a visual node editor. Connect outputs to inputs, run
			pipelines locally, and save reusable workflows — powered by
			<code class="bg-muted px-1.5 py-0.5 text-xs">@xyflow/svelte</code>.
		</p>
	</div>

	<Card.Root class="w-full text-left">
		<Card.Header>
			<Card.Title>Planned capabilities</Card.Title>
			<Card.Description>What this workspace will support in a future phase</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3 text-sm">
			<p>Drag-and-drop nodes generated from the toolbox registry.</p>
			<p>Typed connections between text, JSON, binary and image outputs.</p>
			<p>Topological execution with local persistence and export/import.</p>
		</Card.Content>
	</Card.Root>
</div>
