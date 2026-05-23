import DOMPurify from 'dompurify';
import { marked } from 'marked';

export interface MarkdownResult {
	html: string;
	wordCount: number;
	characterCount: number;
	error?: string;
}

marked.setOptions({
	gfm: true,
	breaks: true
});

function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

export function renderMarkdown(markdown: string): MarkdownResult {
	const trimmed = markdown.trim();
	if (!trimmed) {
		return { html: '', wordCount: 0, characterCount: 0 };
	}

	try {
		const rawHtml = marked.parse(trimmed, { async: false }) as string;
		const html = DOMPurify.sanitize(rawHtml);

		return {
			html,
			wordCount: countWords(trimmed),
			characterCount: trimmed.length
		};
	} catch (error) {
		return {
			html: '',
			wordCount: countWords(trimmed),
			characterCount: trimmed.length,
			error: error instanceof Error ? error.message : 'Unable to render markdown'
		};
	}
}
