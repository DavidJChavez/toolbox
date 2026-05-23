<script lang="ts">
	import { page } from '$app/state';
	import WorkflowIcon from '@lucide/svelte/icons/workflow';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import { categoryLabels, categoryOrder } from '$lib/tools/types';
	import { tools } from '$lib/tools/registry';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	const groupedTools = $derived(
		categoryOrder
			.map((category) => ({
				category,
				label: categoryLabels[category],
				tools: tools.filter((tool) => tool.category === category)
			}))
			.filter((group) => group.tools.length > 0)
	);
</script>

<Sidebar.Root collapsible="icon" variant="inset">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<WrenchIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">Toolbox</span>
								<span class="truncate text-xs">Developer utilities</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Tools</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				{#each groupedTools as group (group.category)}
					<Sidebar.Group>
						<Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								{#each group.tools as tool (tool.id)}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton isActive={page.url.pathname === tool.href}>
											{#snippet child({ props })}
												<a href={tool.href} {...props}>
													<tool.icon />
													<span>{tool.name}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								{/each}
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				{/each}
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Separator />

		<Sidebar.Group>
			<Sidebar.GroupLabel>Workflows</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={page.url.pathname === '/dataflow'}>
							{#snippet child({ props })}
								<a href="/dataflow" {...props}>
									<WorkflowIcon />
									<span>Dataflow</span>
									<Badge variant="secondary" class="ml-auto text-[10px]">Soon</Badge>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Rail />
</Sidebar.Root>
