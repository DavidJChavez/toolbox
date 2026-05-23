import { toast } from 'svelte-sonner';

export async function copyToClipboard(value: string, successMessage = 'Copied to clipboard') {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(successMessage);
		return true;
	} catch {
		toast.error('Unable to copy to clipboard');
		return false;
	}
}

export function downloadText(value: string, fileName: string, mimeType = 'text/plain') {
	const blob = new Blob([value], { type: mimeType });
	downloadBlob(blob, fileName);
}

export function downloadBlob(blob: Blob, fileName: string) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	URL.revokeObjectURL(url);
	toast.success(`Downloaded ${fileName}`);
}
