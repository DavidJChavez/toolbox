<script lang="ts">
	import AppNavbar from '$lib/components/layout/app-navbar.svelte';
	import AppSidebar from '$lib/components/layout/app-sidebar.svelte';
	import CommandPalette from '$lib/components/layout/command-palette.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
	let commandOpen = $state(false);
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<AppNavbar onSearchClick={() => (commandOpen = true)} />
		<main class="flex flex-1 flex-col gap-4 p-4 md:p-6">
			{@render children()}
		</main>
	</Sidebar.Inset>
	<CommandPalette bind:open={commandOpen} />
</Sidebar.Provider>
