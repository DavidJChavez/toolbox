<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { getToolById } from '$lib/tools/registry';
	import {
		hashAlgorithms,
		hashFile,
		hashText,
		hmac,
		hmacAlgorithms,
		type HashAlgorithm
	} from '$lib/tools/hash/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { toast } from 'svelte-sonner';

	const tool = getToolById('hash')!;

	let mode = $state<'hash' | 'hmac'>('hash');
	let input = $state('hello world');
	let hmacKey = $state('secret');
	let algorithm = $state<HashAlgorithm>('SHA-256');
	let fileName = $state('');
	let hashResult = $state('');
	let hashError = $state('');
	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	const activeAlgorithms = $derived(mode === 'hash' ? hashAlgorithms : hmacAlgorithms);

	$effect(() => {
		if (mode === 'hmac' && algorithm === 'MD5') {
			algorithm = 'SHA-256';
		}
	});

	$effect(() => {
		const currentInput = input;
		const currentAlgorithm = algorithm;
		const currentMode = mode;
		const currentKey = hmacKey;

		if (fileName) return;

		let cancelled = false;

		void (async () => {
			if (!currentInput.trim()) {
				hashResult = '';
				hashError = '';
				return;
			}

			const result =
				currentMode === 'hash'
					? await hashText(currentInput, currentAlgorithm)
					: await hmac(
							currentInput,
							currentKey,
							currentAlgorithm as Extract<HashAlgorithm, 'SHA-1' | 'SHA-256' | 'SHA-512'>
						);

			if (cancelled) return;

			hashResult = result.result;
			hashError = result.error ?? '';
		})();

		return () => {
			cancelled = true;
		};
	});

	async function handleFiles(files: FileList | File[] | null | undefined) {
		const file = files?.[0];
		if (!file) return;

		const result = await hashFile(file, algorithm);
		fileName = file.name;
		input = `[File: ${file.name}]`;
		hashResult = result.result;
		hashError = result.error ?? '';
		toast.success(`Hashed ${file.name}`);
	}

	function clearAll() {
		input = '';
		hmacKey = 'secret';
		fileName = '';
		hashResult = '';
		hashError = '';
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		void handleFiles(event.dataTransfer?.files);
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<Tabs.Root bind:value={mode}>
		<Tabs.List>
			<Tabs.Trigger value="hash">Hash</Tabs.Trigger>
			<Tabs.Trigger value="hmac">HMAC</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<div class="grid gap-4 md:grid-cols-[220px_1fr]">
		<div class="space-y-4">
			<div class="space-y-2">
				<Label>Algorithm</Label>
				<Select.Root type="single" bind:value={algorithm}>
					<Select.Trigger class="w-full">
						{algorithm}
					</Select.Trigger>
					<Select.Content>
						{#each activeAlgorithms as option (option)}
							<Select.Item value={option}>{option}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			{#if mode === 'hmac'}
				<div class="space-y-2">
					<Label for="hmac-key">Secret key</Label>
					<Input id="hmac-key" bind:value={hmacKey} class="font-mono text-sm" />
				</div>
			{/if}

			<div
				role="button"
				tabindex="0"
				class="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/20 p-4 text-center transition-colors hover:bg-muted/40 data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5"
				data-dragging={isDragging}
				onclick={() => fileInput?.click()}
				onkeydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') fileInput?.click();
				}}
				ondragover={(event) => {
					event.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => {
					isDragging = false;
				}}
				ondrop={onDrop}
			>
				<UploadIcon class="size-5 text-muted-foreground" />
				<p class="text-sm text-muted-foreground">Drop a file or click to hash</p>
				<input
					bind:this={fileInput}
					type="file"
					class="hidden"
					onchange={(event) => void handleFiles(event.currentTarget.files)}
				/>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="hash-input">Input</Label>
				<Textarea
					id="hash-input"
					bind:value={input}
					class="min-h-48 font-mono text-sm"
					placeholder="Text to hash..."
					oninput={() => {
						fileName = '';
					}}
				/>
			</div>

			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div class="space-y-1">
						<Card.Title>{mode === 'hash' ? 'Hash' : 'HMAC'} result</Card.Title>
						<Card.Description>{algorithm} digest in hexadecimal</Card.Description>
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={!hashResult}
						onclick={() => copyToClipboard(hashResult, 'Hash copied')}
					>
						<CopyIcon class="size-4" />
						Copy
					</Button>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#if hashError}
						<div
							class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
						>
							{hashError}
						</div>
					{/if}
					<Textarea
						readonly
						value={hashResult}
						class="min-h-24 font-mono text-sm break-all"
						placeholder="Result will appear here..."
					/>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</ToolShell>
