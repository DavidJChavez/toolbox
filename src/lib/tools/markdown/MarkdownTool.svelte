<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { getToolById } from '$lib/tools/registry';
	import { renderMarkdown } from '$lib/tools/markdown/tool';
	import ToolShell from '$lib/components/tool-shell/ToolShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const tool = getToolById('markdown')!;

	let input = $state(`# Markdown Preview

Write **markdown** here and see the rendered HTML on the right.

- Lists
- \`inline code\`
- [Links](https://example.com)

\`\`\`js
console.log('code block');
\`\`\`
`);

	const result = $derived(renderMarkdown(input));

	function clearAll() {
		input = '';
	}
</script>

<ToolShell {tool} onClear={clearAll}>
	<div class="grid gap-4 xl:grid-cols-2">
		<div class="space-y-2">
			<Label for="markdown-input">Markdown</Label>
			<Textarea
				id="markdown-input"
				bind:value={input}
				class="min-h-[480px] font-mono text-sm"
				placeholder="Write markdown..."
			/>
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between gap-2">
				<Label>Preview</Label>
				<Button
					variant="outline"
					size="sm"
					disabled={!result.html}
					onclick={() => copyToClipboard(result.html, 'HTML copied')}
				>
					<CopyIcon class="size-4" />
					Copy HTML
				</Button>
			</div>

			<Card.Root class="min-h-[480px]">
				<Card.Content class="pt-6">
					{#if result.error}
						<div class="mb-4 text-sm text-destructive">{result.error}</div>
					{/if}

					{#if result.html}
						<div
							class="markdown-preview space-y-4 text-sm leading-6 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc"
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via DOMPurify in tool.ts -->
							{@html result.html}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">Write markdown to see the preview.</p>
					{/if}
				</Card.Content>
				<Card.Footer class="text-xs text-muted-foreground">
					{result.wordCount} words · {result.characterCount} characters
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</ToolShell>
