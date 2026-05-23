<script lang="ts">
	import { page } from '$app/state';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import { getToolById } from '$lib/tools/registry';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ThemeToggle from './theme-toggle.svelte';

	let {
		onSearchClick
	}: {
		onSearchClick?: () => void;
	} = $props();

	const segments = $derived(page.url.pathname.split('/').filter(Boolean));

	const breadcrumbs = $derived.by(() => {
		if (segments.length === 0) {
			return [{ label: 'Home', href: '/' }];
		}

		const items: Array<{ label: string; href: string }> = [{ label: 'Home', href: '/' }];

		if (segments[0] === 'tools' && segments[1]) {
			const tool = getToolById(segments[1]);
			items.push({ label: 'Tools', href: '/' });
			items.push({ label: tool?.name ?? segments[1], href: page.url.pathname });
			return items;
		}

		if (segments[0] === 'dataflow') {
			items.push({ label: 'Dataflow', href: '/dataflow' });
			return items;
		}

		for (let index = 0; index < segments.length; index++) {
			const href = `/${segments.slice(0, index + 1).join('/')}`;
			items.push({
				label: segments[index]!.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
				href
			});
		}

		return items;
	});
</script>

<header
	class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<Sidebar.Trigger />
	<Separator orientation="vertical" class="mr-2 h-4!" />

	<Breadcrumb.Root class="hidden min-w-0 sm:block">
		<Breadcrumb.List>
			{#each breadcrumbs as item, index (item.href + index)}
				<Breadcrumb.Item>
					{#if index < breadcrumbs.length - 1}
						<Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
					{:else}
						<Breadcrumb.Page>{item.label}</Breadcrumb.Page>
					{/if}
				</Breadcrumb.Item>
				{#if index < breadcrumbs.length - 1}
					<Breadcrumb.Separator />
				{/if}
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="ml-auto flex items-center gap-2">
		<button
			type="button"
			class="relative hidden w-56 lg:block"
			onclick={() => onSearchClick?.()}
			aria-label="Open command palette"
		>
			<SearchIcon
				class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input readonly placeholder="Search tools..." class="cursor-pointer pl-8" />
			<kbd
				class="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block"
			>
				⌘K
			</kbd>
		</button>

		<Button variant="ghost" size="icon" class="lg:hidden" onclick={() => onSearchClick?.()}>
			<SearchIcon class="size-4" />
		</Button>

		<ThemeToggle />

		<Button variant="ghost" size="icon" href="https://github.com" target="_blank" rel="noreferrer">
			<ExternalLinkIcon class="size-4" />
			<span class="sr-only">GitHub</span>
		</Button>

		<div class="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
			<WrenchIcon class="size-4" />
			<span>Dev Toolbox</span>
		</div>
	</div>
</header>
