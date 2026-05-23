<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { getToolById } from '$lib/tools/registry';
	import {
		decodeBase64,
		downloadDecoded,
		encodeFile,
		encodeText,
		encodeTextToDataUrl,
		type DecodeResult
	} from '$lib/tools/base64/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard, downloadText } from '$lib/utils/clipboard';
	import { toast } from 'svelte-sonner';

	const tool = getToolById('base64')!;

	let mode = $state<'encode' | 'decode'>('decode');
	let encodeInput = $state('');
	let decodeInput = $state('');
	let includeDataUrl = $state(true);
	let manualEncode = $state({ base64: '', dataUrl: '' });
	let useManualEncode = $state(false);
	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	const derivedEncode = $derived.by(() => {
		if (useManualEncode || !encodeInput.trim() || encodeInput.startsWith('[File:')) {
			return { base64: '', dataUrl: '' };
		}

		try {
			return {
				base64: encodeText(encodeInput),
				dataUrl: encodeTextToDataUrl(encodeInput)
			};
		} catch {
			return { base64: '', dataUrl: '' };
		}
	});

	const encodeOutput = $derived(useManualEncode ? manualEncode.base64 : derivedEncode.base64);
	const encodeDataUrl = $derived(useManualEncode ? manualEncode.dataUrl : derivedEncode.dataUrl);

	const decodeState = $derived.by(() => {
		if (!decodeInput.trim()) {
			return { result: null as DecodeResult | null, error: '' };
		}

		try {
			return { result: decodeBase64(decodeInput), error: '' };
		} catch (error) {
			return {
				result: null,
				error: error instanceof Error ? error.message : 'Invalid Base64 input'
			};
		}
	});

	const decodeResult = $derived(decodeState.result);
	const decodeError = $derived(decodeState.error);

	async function handleFiles(files: FileList | File[] | null | undefined) {
		const file = files?.[0];
		if (!file) return;

		try {
			const result = await encodeFile(file);
			useManualEncode = true;
			manualEncode = { base64: result.base64, dataUrl: result.dataUrl };
			encodeInput = `[File: ${result.fileName}]`;
			mode = 'encode';
			toast.success(`Encoded ${result.fileName}`);
		} catch {
			toast.error('Unable to encode file');
		}
	}

	function clearAll() {
		encodeInput = '';
		decodeInput = '';
		manualEncode = { base64: '', dataUrl: '' };
		useManualEncode = false;
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
			<Tabs.Trigger value="decode">Decode</Tabs.Trigger>
			<Tabs.Trigger value="encode">Encode</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="encode" class="space-y-4 pt-4">
			<div
				role="button"
				tabindex="0"
				class="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/20 p-6 text-center transition-colors hover:bg-muted/40 data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5"
				data-dragging={isDragging}
				onclick={() => fileInput?.click()}
				onkeydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') fileInput?.click();
				}}
				ondragover={(event) => {
					event.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => (isDragging = false)}
				ondrop={onDrop}
			>
				<UploadIcon class="size-5 text-muted-foreground" />
				<div>
					<p class="text-sm font-medium">Drop a file here or click to upload</p>
					<p class="text-xs text-muted-foreground">Images, PDFs and binary files supported</p>
				</div>
				<input
					bind:this={fileInput}
					type="file"
					class="hidden"
					onchange={(event) => void handleFiles(event.currentTarget.files)}
				/>
			</div>

			<div class="space-y-2">
				<Label for="encode-text">Plain text</Label>
				<Textarea
					id="encode-text"
					bind:value={encodeInput}
					oninput={() => (useManualEncode = false)}
					placeholder="Enter text to encode..."
					class="min-h-40 font-mono text-sm"
				/>
			</div>

			<div class="flex items-center gap-3">
				<Switch id="data-url" bind:checked={includeDataUrl} />
				<Label for="data-url">Include data URL prefix</Label>
			</div>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between gap-4">
					<div>
						<Card.Title>Output</Card.Title>
						<Card.Description>Base64 representation of your input</Card.Description>
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!encodeOutput}
							onclick={() =>
								copyToClipboard(includeDataUrl ? encodeDataUrl : encodeOutput, 'Base64 copied')}
						>
							<CopyIcon class="size-4" />
							Copy
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!encodeOutput}
							onclick={() =>
								downloadText(
									includeDataUrl ? encodeDataUrl : encodeOutput,
									'encoded.txt',
									'text/plain'
								)}
						>
							<DownloadIcon class="size-4" />
							Download
						</Button>
					</div>
				</Card.Header>
				<Card.Content>
					<Textarea
						readonly
						value={includeDataUrl ? encodeDataUrl : encodeOutput}
						class="min-h-40 font-mono text-sm"
						placeholder="Encoded output will appear here..."
					/>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="decode" class="space-y-4 pt-4">
			<div class="space-y-2">
				<Label for="decode-input">Base64 input</Label>
				<Textarea
					id="decode-input"
					bind:value={decodeInput}
					placeholder="Paste Base64 or a data URL..."
					class="min-h-40 font-mono text-sm"
				/>
			</div>

			{#if decodeError}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{decodeError}
				</div>
			{/if}

			{#if decodeResult}
				<Card.Root>
					<Card.Header class="flex flex-row flex-wrap items-start justify-between gap-4">
						<div class="space-y-2">
							<Card.Title>Detected content</Card.Title>
							<div class="flex flex-wrap gap-2">
								<Badge variant="outline">{decodeResult.contentType}</Badge>
								<Badge variant="secondary">{decodeResult.mimeType}</Badge>
								<Badge variant="secondary">.{decodeResult.extension}</Badge>
							</div>
						</div>
						<div class="flex flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => copyToClipboard(decodeResult!.text ?? decodeResult!.dataUrl)}
							>
								<CopyIcon class="size-4" />
								Copy
							</Button>
							<Button variant="outline" size="sm" onclick={() => downloadDecoded(decodeResult!)}>
								<DownloadIcon class="size-4" />
								Download
							</Button>
						</div>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#if decodeResult.contentType === 'image'}
							<div class="border bg-muted/30 p-4">
								<img
									src={decodeResult.dataUrl}
									alt="Decoded preview"
									class="mx-auto max-h-96 max-w-full object-contain"
								/>
							</div>
						{:else if decodeResult.contentType === 'pdf'}
							<div class="border bg-muted/30">
								<object
									data={decodeResult.dataUrl}
									type="application/pdf"
									class="h-[480px] w-full"
									title="Decoded PDF preview"
								>
									<p class="p-4 text-sm text-muted-foreground">
										Your browser cannot preview PDFs inline. Use the download button instead.
									</p>
								</object>
							</div>
						{:else if decodeResult.contentType === 'text'}
							<Textarea readonly value={decodeResult.text} class="min-h-48 font-mono text-sm" />
						{:else}
							<div class="space-y-2 border bg-muted/30 p-4 text-sm">
								<p>Binary content detected.</p>
								<p class="text-muted-foreground">
									Size: {decodeResult.bytes.length.toLocaleString()} bytes
								</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</ToolShell>
