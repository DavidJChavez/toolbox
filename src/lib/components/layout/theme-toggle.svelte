<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';

	let resolvedMode = $derived(mode.current);
</script>

<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle theme">
	{#if resolvedMode === 'dark'}
		<SunIcon class="size-4" />
	{:else}
		<MoonIcon class="size-4" />
	{/if}
</Button>
