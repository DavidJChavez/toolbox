<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import { getToolById } from '$lib/tools/registry';
	import {
		buildPayload,
		generateQr,
		qrErrorCorrectionLevels,
		qrTypes,
		type QrErrorCorrectionLevel,
		type QrFields,
		type QrType
	} from '$lib/tools/qr/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard, downloadText } from '$lib/utils/clipboard';

	const tool = getToolById('qr')!;

	let qrType = $state<QrType>('text');
	let fields = $state<QrFields>({
		text: 'Hello from Toolbox',
		url: 'https://example.com',
		email: 'hello@example.com',
		subject: 'Hello',
		body: 'Generated with Toolbox',
		phone: '+1234567890',
		message: 'Hello!',
		ssid: 'MyNetwork',
		password: 'secret',
		wifiSecurity: 'WPA',
		hidden: false,
		firstName: 'John',
		lastName: 'Doe',
		organization: 'Acme Inc',
		title: 'Engineer',
		phoneNumber: '+1234567890',
		emailAddress: 'john@example.com',
		website: 'https://example.com',
		latitude: '40.7128',
		longitude: '-74.0060',
		eventTitle: 'Team meeting',
		eventLocation: 'Office',
		eventStart: new Date().toISOString(),
		eventEnd: new Date(Date.now() + 3600000).toISOString(),
		eventDescription: 'Weekly sync'
	});
	let errorCorrectionLevel = $state<QrErrorCorrectionLevel>('M');
	let margin = $state(2);
	let width = $state(256);
	let colorDark = $state('#000000');
	let colorLight = $state('#ffffff');

	const payload = $derived(buildPayload(qrType, fields));

	let dataUrl = $state('');
	let svg = $state('');
	let qrError = $state('');

	$effect(() => {
		let cancelled = false;

		void generateQr(payload, {
			errorCorrectionLevel,
			margin,
			width,
			colorDark,
			colorLight
		}).then((result) => {
			if (!cancelled) {
				dataUrl = result.dataUrl;
				svg = result.svg;
				qrError = result.error ?? '';
			}
		});

		return () => {
			cancelled = true;
		};
	});

	function clearAll() {
		qrType = 'text';
		fields = { text: '' };
		errorCorrectionLevel = 'M';
		margin = 2;
		width = 256;
		colorDark = '#000000';
		colorLight = '#ffffff';
	}

	function downloadSvg() {
		if (!svg) return;
		downloadText(svg, 'qrcode.svg', 'image/svg+xml');
	}

	function downloadPng() {
		if (!dataUrl) return;
		const anchor = document.createElement('a');
		anchor.href = dataUrl;
		anchor.download = 'qrcode.png';
		anchor.click();
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 xl:grid-cols-[1fr_360px]">
		<div class="space-y-4">
			<Tabs.Root bind:value={qrType}>
				<Tabs.List class="flex h-auto flex-wrap">
					{#each qrTypes as type (type.id)}
						<Tabs.Trigger value={type.id}>{type.label}</Tabs.Trigger>
					{/each}
				</Tabs.List>
			</Tabs.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Payload fields</Card.Title>
					<Card.Description>Configure the content encoded in the QR code</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4 md:grid-cols-2">
					{#if qrType === 'text'}
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-text">Text</Label>
							<Textarea id="qr-text" bind:value={fields.text} class="min-h-28 font-mono text-sm" />
						</div>
					{:else if qrType === 'url'}
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-url">URL</Label>
							<Input id="qr-url" bind:value={fields.url} placeholder="https://example.com" />
						</div>
					{:else if qrType === 'email'}
						<div class="space-y-2">
							<Label for="qr-email">Email</Label>
							<Input id="qr-email" bind:value={fields.email} />
						</div>
						<div class="space-y-2">
							<Label for="qr-subject">Subject</Label>
							<Input id="qr-subject" bind:value={fields.subject} />
						</div>
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-body">Body</Label>
							<Textarea id="qr-body" bind:value={fields.body} class="min-h-24" />
						</div>
					{:else if qrType === 'phone'}
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-phone">Phone number</Label>
							<Input id="qr-phone" bind:value={fields.phone} placeholder="+1234567890" />
						</div>
					{:else if qrType === 'sms'}
						<div class="space-y-2">
							<Label for="qr-sms-phone">Phone number</Label>
							<Input id="qr-sms-phone" bind:value={fields.phone} />
						</div>
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-message">Message</Label>
							<Textarea id="qr-message" bind:value={fields.message} class="min-h-24" />
						</div>
					{:else if qrType === 'wifi'}
						<div class="space-y-2">
							<Label for="qr-ssid">SSID</Label>
							<Input id="qr-ssid" bind:value={fields.ssid} />
						</div>
						<div class="space-y-2">
							<Label for="qr-password">Password</Label>
							<Input id="qr-password" bind:value={fields.password} type="password" />
						</div>
						<div class="space-y-2">
							<Label>Security</Label>
							<Select.Root type="single" bind:value={fields.wifiSecurity}>
								<Select.Trigger class="w-full">{fields.wifiSecurity ?? 'WPA'}</Select.Trigger>
								<Select.Content>
									<Select.Item value="WPA">WPA</Select.Item>
									<Select.Item value="WEP">WEP</Select.Item>
									<Select.Item value="nopass">No password</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					{:else if qrType === 'vcard'}
						<div class="space-y-2">
							<Label for="qr-first-name">First name</Label>
							<Input id="qr-first-name" bind:value={fields.firstName} />
						</div>
						<div class="space-y-2">
							<Label for="qr-last-name">Last name</Label>
							<Input id="qr-last-name" bind:value={fields.lastName} />
						</div>
						<div class="space-y-2">
							<Label for="qr-organization">Organization</Label>
							<Input id="qr-organization" bind:value={fields.organization} />
						</div>
						<div class="space-y-2">
							<Label for="qr-title">Title</Label>
							<Input id="qr-title" bind:value={fields.title} />
						</div>
						<div class="space-y-2">
							<Label for="qr-vcard-phone">Phone</Label>
							<Input id="qr-vcard-phone" bind:value={fields.phoneNumber} />
						</div>
						<div class="space-y-2">
							<Label for="qr-vcard-email">Email</Label>
							<Input id="qr-vcard-email" bind:value={fields.emailAddress} />
						</div>
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-website">Website</Label>
							<Input id="qr-website" bind:value={fields.website} />
						</div>
					{:else if qrType === 'geo'}
						<div class="space-y-2">
							<Label for="qr-latitude">Latitude</Label>
							<Input id="qr-latitude" bind:value={fields.latitude} />
						</div>
						<div class="space-y-2">
							<Label for="qr-longitude">Longitude</Label>
							<Input id="qr-longitude" bind:value={fields.longitude} />
						</div>
					{:else if qrType === 'calendar'}
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-event-title">Event title</Label>
							<Input id="qr-event-title" bind:value={fields.eventTitle} />
						</div>
						<div class="space-y-2">
							<Label for="qr-event-start">Start</Label>
							<Input id="qr-event-start" bind:value={fields.eventStart} type="datetime-local" />
						</div>
						<div class="space-y-2">
							<Label for="qr-event-end">End</Label>
							<Input id="qr-event-end" bind:value={fields.eventEnd} type="datetime-local" />
						</div>
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-event-location">Location</Label>
							<Input id="qr-event-location" bind:value={fields.eventLocation} />
						</div>
						<div class="space-y-2 md:col-span-2">
							<Label for="qr-event-description">Description</Label>
							<Textarea id="qr-event-description" bind:value={fields.eventDescription} />
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<div class="space-y-2">
				<Label>Encoded payload</Label>
				<Textarea readonly value={payload} class="min-h-24 font-mono text-sm" />
			</div>
		</div>

		<div class="space-y-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Options</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<Label>Error correction</Label>
						<Select.Root type="single" bind:value={errorCorrectionLevel}>
							<Select.Trigger class="w-full">{errorCorrectionLevel}</Select.Trigger>
							<Select.Content>
								{#each qrErrorCorrectionLevels as level (level)}
									<Select.Item value={level}>{level}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>Size</Label>
							<span class="text-sm text-muted-foreground">{width}px</span>
						</div>
						<Slider type="single" bind:value={width} min={128} max={512} step={8} />
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>Margin</Label>
							<span class="text-sm text-muted-foreground">{margin}</span>
						</div>
						<Slider type="single" bind:value={margin} min={0} max={8} step={1} />
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="qr-dark">Dark color</Label>
							<Input id="qr-dark" bind:value={colorDark} type="color" />
						</div>
						<div class="space-y-2">
							<Label for="qr-light">Light color</Label>
							<Input id="qr-light" bind:value={colorLight} type="color" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-start justify-between gap-4">
					<div>
						<Card.Title>Preview</Card.Title>
						<Card.Description>Generated QR code</Card.Description>
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!dataUrl}
							onclick={() => copyToClipboard(dataUrl, 'Data URL copied')}
						>
							<CopyIcon class="size-4" />
							Copy
						</Button>
						<Button variant="outline" size="sm" disabled={!svg} onclick={downloadSvg}>
							<DownloadIcon class="size-4" />
							SVG
						</Button>
						<Button variant="outline" size="sm" disabled={!dataUrl} onclick={downloadPng}>
							<DownloadIcon class="size-4" />
							PNG
						</Button>
					</div>
				</Card.Header>
				<Card.Content>
					{#if qrError}
						<div class="mb-4 text-sm text-destructive">{qrError}</div>
					{/if}

					{#if dataUrl}
						<div class="flex justify-center border bg-muted/20 p-6">
							<img src={dataUrl} alt="QR code preview" class="max-w-full" />
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">Fill in the payload to generate a QR code.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</ToolShell>
