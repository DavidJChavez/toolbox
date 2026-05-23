<script lang="ts">
	import DownloadIcon from '@lucide/svelte/icons/download';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { getToolById } from '$lib/tools/registry';
	import {
		computeSizeReduction,
		convertImage,
		detectAvifSupport,
		formatFileSize,
		getFormatOption,
		imageFormats,
		readImageMeta,
		type ImageMeta,
		type ImageOutputFormat
	} from '$lib/tools/image/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { downloadBlob } from '$lib/utils/clipboard';
	import { toast } from 'svelte-sonner';

	const tool = getToolById('image')!;

	let file = $state<File | null>(null);
	let sourceMeta = $state<ImageMeta | null>(null);
	let sourcePreview = $state('');
	let outputFormat = $state<ImageOutputFormat>('webp');
	let quality = $state(85);
	let isDragging = $state(false);
	let isConverting = $state(false);
	let avifSupported = $state(true);
	let convertedBlob = $state<Blob | null>(null);
	let convertedPreview = $state('');
	let convertedMeta = $state<ImageMeta | null>(null);
	let convertError = $state('');
	let fileInput = $state<HTMLInputElement | null>(null);

	const availableFormats = $derived(
		imageFormats.filter((format) => format.id !== 'avif' || avifSupported)
	);
	const formatOption = $derived(getFormatOption(outputFormat));
	const sizeReduction = $derived(
		sourceMeta && convertedMeta ? computeSizeReduction(sourceMeta.size, convertedMeta.size) : null
	);

	$effect(() => {
		let cancelled = false;

		void detectAvifSupport().then((supported) => {
			if (!cancelled) {
				avifSupported = supported;
				if (!supported && outputFormat === 'avif') {
					outputFormat = 'webp';
				}
			}
		});

		return () => {
			cancelled = true;
		};
	});

	async function handleFiles(files: FileList | File[] | null | undefined) {
		const nextFile = files?.[0];
		if (!nextFile || !nextFile.type.startsWith('image/')) {
			toast.error('Please upload an image file');
			return;
		}

		try {
			file = nextFile;
			sourcePreview = URL.createObjectURL(nextFile);
			sourceMeta = await readImageMeta(nextFile);
			convertedBlob = null;
			convertedPreview = '';
			convertedMeta = null;
			convertError = '';
		} catch {
			toast.error('Unable to read image');
		}
	}

	async function runConvert() {
		if (!file) return;

		isConverting = true;
		convertError = '';

		try {
			const result = await convertImage(file, { format: outputFormat, quality });
			if (result.error || !result.blob) {
				convertError = result.error ?? 'Unable to convert image';
				return;
			}

			convertedBlob = result.blob;
			convertedPreview = result.dataUrl;
			convertedMeta = result.meta;
		} catch (error) {
			convertError = error instanceof Error ? error.message : 'Unable to convert image';
		} finally {
			isConverting = false;
		}
	}

	function downloadConverted() {
		if (!convertedBlob || !convertedMeta) return;
		const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
		const baseName = sourceMeta?.name.replace(/\.[^.]+$/, '') ?? 'converted';
		downloadBlob(convertedBlob, `${baseName}.${extension}`);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		void handleFiles(event.dataTransfer?.files);
	}

	function clearAll() {
		file = null;
		sourceMeta = null;
		sourcePreview = '';
		outputFormat = 'webp';
		quality = 85;
		convertedBlob = null;
		convertedPreview = '';
		convertedMeta = null;
		convertError = '';
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 xl:grid-cols-[320px_1fr]">
		<div class="space-y-4">
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
					<p class="text-sm font-medium">Drop an image here or click to upload</p>
					<p class="text-xs text-muted-foreground">PNG, JPEG, WebP, GIF and more</p>
				</div>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={(event) => void handleFiles(event.currentTarget.files)}
				/>
			</div>

			<div class="space-y-2">
				<Label>Output format</Label>
				<Select.Root type="single" bind:value={outputFormat}>
					<Select.Trigger class="w-full">
						{formatOption.label}
					</Select.Trigger>
					<Select.Content>
						{#each availableFormats as format (format.id)}
							<Select.Item value={format.id}>{format.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			{#if formatOption.lossy}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Quality</Label>
						<span class="text-sm text-muted-foreground">{quality}%</span>
					</div>
					<Slider type="single" bind:value={quality} min={1} max={100} step={1} />
				</div>
			{/if}

			<Button class="w-full" disabled={!file || isConverting} onclick={() => void runConvert()}>
				{isConverting ? 'Converting...' : 'Convert'}
			</Button>

			{#if !avifSupported}
				<p class="text-xs text-muted-foreground">AVIF output is not supported in this browser.</p>
			{/if}
		</div>

		<div class="space-y-4">
			{#if convertError}
				<div
					class="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{convertError}
				</div>
			{/if}

			<div class="grid gap-4 lg:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Original</Card.Title>
						{#if sourceMeta}
							<Card.Description class="flex flex-wrap gap-2">
								<Badge variant="outline">{sourceMeta.width}×{sourceMeta.height}</Badge>
								<Badge variant="secondary">{formatFileSize(sourceMeta.size)}</Badge>
								<Badge variant="secondary">{sourceMeta.type}</Badge>
							</Card.Description>
						{/if}
					</Card.Header>
					<Card.Content>
						{#if sourcePreview}
							<div class="border bg-muted/30 p-4">
								<img
									src={sourcePreview}
									alt="Original preview"
									class="mx-auto max-h-80 max-w-full object-contain"
								/>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Upload an image to preview it here.</p>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div class="space-y-2">
							<Card.Title>Converted</Card.Title>
							{#if convertedMeta}
								<Card.Description class="flex flex-wrap gap-2">
									<Badge variant="outline">{convertedMeta.width}×{convertedMeta.height}</Badge>
									<Badge variant="secondary">{formatFileSize(convertedMeta.size)}</Badge>
									{#if sizeReduction !== null}
										<Badge variant="secondary"
											>{sizeReduction > 0 ? '-' : '+'}{Math.abs(sizeReduction)}%</Badge
										>
									{/if}
								</Card.Description>
							{/if}
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={!convertedBlob}
							onclick={downloadConverted}
						>
							<DownloadIcon class="size-4" />
							Download
						</Button>
					</Card.Header>
					<Card.Content>
						{#if convertedPreview}
							<div class="border bg-muted/30 p-4">
								<img
									src={convertedPreview}
									alt="Converted preview"
									class="mx-auto max-h-80 max-w-full object-contain"
								/>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Converted output will appear here.</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</ToolShell>
