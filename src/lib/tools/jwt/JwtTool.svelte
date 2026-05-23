<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { getToolById } from '$lib/tools/registry';
	import { decodeJwt } from '$lib/tools/jwt/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('jwt')!;

	const sampleToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

	let input = $state(sampleToken);
	let activeTab = $state('decoded');

	const decoded = $derived(decodeJwt(input));

	const expirationBadge = $derived.by(() => {
		if (decoded.error || !input.trim()) return null;
		if (decoded.isExpired === null) return { label: 'No exp claim', variant: 'secondary' as const };
		return decoded.isExpired
			? { label: 'Expired', variant: 'destructive' as const }
			: { label: 'Valid', variant: 'default' as const };
	});

	function clearAll() {
		input = '';
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="space-y-2">
		<Label for="jwt-input">JWT token</Label>
		<Textarea
			id="jwt-input"
			bind:value={input}
			class="min-h-28 font-mono text-sm"
			placeholder="Paste a JWT token (header.payload.signature)..."
		/>
	</div>

	{#if decoded.error}
		<div class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
			{decoded.error}
		</div>
	{/if}

	<Tabs.Root bind:value={activeTab} class="w-full">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Tabs.List>
				<Tabs.Trigger value="decoded">Decoded</Tabs.Trigger>
				<Tabs.Trigger value="raw">Raw JSON</Tabs.Trigger>
			</Tabs.List>

			{#if expirationBadge}
				<Badge variant={expirationBadge.variant}>{expirationBadge.label}</Badge>
			{/if}
		</div>

		<Tabs.Content value="decoded" class="space-y-4 pt-4">
			<div class="grid gap-4 xl:grid-cols-2">
				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div class="space-y-1">
							<Card.Title>Header</Card.Title>
							<Card.Description>Algorithm and token type</Card.Description>
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={!decoded.headerJson}
							onclick={() => copyToClipboard(decoded.headerJson, 'Header copied')}
						>
							<CopyIcon class="size-4" />
							Copy
						</Button>
					</Card.Header>
					<Card.Content>
						<ScrollArea class="h-48">
							<pre class="font-mono text-sm whitespace-pre-wrap">{decoded.headerJson || '—'}</pre>
						</ScrollArea>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div class="space-y-1">
							<Card.Title>Payload</Card.Title>
							<Card.Description>Claims and metadata</Card.Description>
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={!decoded.payloadJson}
							onclick={() => copyToClipboard(decoded.payloadJson, 'Payload copied')}
						>
							<CopyIcon class="size-4" />
							Copy
						</Button>
					</Card.Header>
					<Card.Content>
						<ScrollArea class="h-48">
							<pre class="font-mono text-sm whitespace-pre-wrap">{decoded.payloadJson || '—'}</pre>
						</ScrollArea>
					</Card.Content>
				</Card.Root>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>Claims</Card.Title>
					<Card.Description>Decoded payload fields with human-readable timestamps</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if decoded.claims.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-[30%]">Claim</Table.Head>
									<Table.Head>Value</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each decoded.claims as claim (claim.key)}
									<Table.Row>
										<Table.Cell class="font-mono text-sm">{claim.key}</Table.Cell>
										<Table.Cell class="font-mono text-sm break-all">{claim.value}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<p class="text-sm text-muted-foreground">Enter a JWT to inspect its claims.</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<Card.Title>Signature</Card.Title>
						<Card.Description>Base64URL-encoded signature (not verified)</Card.Description>
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={!decoded.signature}
						onclick={() => copyToClipboard(decoded.signature, 'Signature copied')}
					>
						<CopyIcon class="size-4" />
						Copy
					</Button>
				</Card.Header>
				<Card.Content>
					<pre class="font-mono text-sm break-all">{decoded.signature || '—'}</pre>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="raw" class="space-y-4 pt-4">
			<div class="grid gap-4 xl:grid-cols-2">
				<div class="space-y-2">
					<Label>Header JSON</Label>
					<Textarea readonly value={decoded.headerJson} class="min-h-72 font-mono text-sm" />
				</div>
				<div class="space-y-2">
					<Label>Payload JSON</Label>
					<Textarea readonly value={decoded.payloadJson} class="min-h-72 font-mono text-sm" />
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</ToolShell>
