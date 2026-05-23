<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { categoryLabels, categoryOrder } from '$lib/tools/types';
	import { tools } from '$lib/tools/registry';
	import * as Command from '$lib/components/ui/command/index.js';

	let {
		open = $bindable(false)
	}: {
		open?: boolean;
	} = $props();

	const groupedTools = $derived(
		categoryOrder
			.map((category) => ({
				category,
				label: categoryLabels[category],
				tools: tools.filter((tool) => tool.category === category)
			}))
			.filter((group) => group.tools.length > 0)
	);

	function navigate(href: string) {
		open = false;
		goto(href);
	}

	$effect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				open = !open;
			}
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<Command.Dialog bind:open title="Command Palette" description="Search tools and pages">
	<Command.Input placeholder="Search tools..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>

		<Command.Group heading="Pages">
			<Command.Item
				value="home dashboard toolbox"
				onSelect={() => navigate('/')}
				data-current={page.url.pathname === '/'}
			>
				Home
			</Command.Item>
			<Command.Item
				value="dataflow workflow nodes pipeline"
				onSelect={() => navigate('/dataflow')}
				data-current={page.url.pathname === '/dataflow'}
			>
				Dataflow
			</Command.Item>
		</Command.Group>

		{#each groupedTools as group (group.category)}
			<Command.Group heading={group.label}>
				{#each group.tools as tool (tool.id)}
					<Command.Item
						value="{tool.name} {tool.description} {tool.keywords?.join(' ') ?? ''}"
						onSelect={() => navigate(tool.href)}
						data-current={page.url.pathname === tool.href}
					>
						<tool.icon />
						<div class="flex flex-col gap-0.5">
							<span>{tool.name}</span>
							<span class="text-xs text-muted-foreground">{tool.description}</span>
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
