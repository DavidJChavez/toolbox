import QRCode from 'qrcode';

export type QrType =
	| 'text'
	| 'url'
	| 'email'
	| 'phone'
	| 'sms'
	| 'wifi'
	| 'vcard'
	| 'geo'
	| 'calendar';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrGenerateOptions {
	errorCorrectionLevel: QrErrorCorrectionLevel;
	margin: number;
	width: number;
	colorDark: string;
	colorLight: string;
}

export interface QrGenerateResult {
	dataUrl: string;
	svg: string;
	error?: string;
}

export interface QrTypeDefinition {
	id: QrType;
	label: string;
}

export const qrTypes: QrTypeDefinition[] = [
	{ id: 'text', label: 'Text' },
	{ id: 'url', label: 'URL' },
	{ id: 'email', label: 'Email' },
	{ id: 'phone', label: 'Phone' },
	{ id: 'sms', label: 'SMS' },
	{ id: 'wifi', label: 'WiFi' },
	{ id: 'vcard', label: 'vCard' },
	{ id: 'geo', label: 'Geo' },
	{ id: 'calendar', label: 'Calendar' }
];

export const qrErrorCorrectionLevels: QrErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

export interface QrFields {
	text?: string;
	url?: string;
	email?: string;
	subject?: string;
	body?: string;
	phone?: string;
	message?: string;
	ssid?: string;
	password?: string;
	wifiSecurity?: 'WPA' | 'WEP' | 'nopass';
	hidden?: boolean;
	firstName?: string;
	lastName?: string;
	organization?: string;
	title?: string;
	phoneNumber?: string;
	emailAddress?: string;
	website?: string;
	latitude?: string;
	longitude?: string;
	eventTitle?: string;
	eventLocation?: string;
	eventStart?: string;
	eventEnd?: string;
	eventDescription?: string;
}

function escapeVcardValue(value: string): string {
	return value.replace(/([\\;,])/g, '\\$1');
}

export function buildPayload(type: QrType, fields: QrFields): string {
	switch (type) {
		case 'text':
			return fields.text?.trim() ?? '';

		case 'url': {
			const url = fields.url?.trim() ?? '';
			if (!url) return '';
			return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
		}

		case 'email': {
			const email = fields.email?.trim() ?? '';
			if (!email) return '';
			const params = new URLSearchParams();
			if (fields.subject?.trim()) params.set('subject', fields.subject.trim());
			if (fields.body?.trim()) params.set('body', fields.body.trim());
			const query = params.toString();
			return query ? `mailto:${email}?${query}` : `mailto:${email}`;
		}

		case 'phone':
			return fields.phone?.trim() ? `tel:${fields.phone.trim()}` : '';

		case 'sms': {
			const phone = fields.phone?.trim() ?? '';
			if (!phone) return '';
			const message = fields.message?.trim();
			return message ? `SMSTO:${phone}:${message}` : `SMSTO:${phone}`;
		}

		case 'wifi': {
			const ssid = fields.ssid?.trim() ?? '';
			if (!ssid) return '';
			const security = fields.wifiSecurity ?? 'WPA';
			const password = fields.password?.trim() ?? '';
			const hidden = fields.hidden ? 'true' : 'false';
			return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
		}

		case 'vcard': {
			const firstName = fields.firstName?.trim() ?? '';
			const lastName = fields.lastName?.trim() ?? '';
			if (!firstName && !lastName) return '';

			const lines = [
				'BEGIN:VCARD',
				'VERSION:3.0',
				`N:${escapeVcardValue(lastName)};${escapeVcardValue(firstName)};;;`,
				`FN:${escapeVcardValue(`${firstName} ${lastName}`.trim())}`
			];

			if (fields.organization?.trim()) {
				lines.push(`ORG:${escapeVcardValue(fields.organization.trim())}`);
			}
			if (fields.title?.trim()) {
				lines.push(`TITLE:${escapeVcardValue(fields.title.trim())}`);
			}
			if (fields.phoneNumber?.trim()) {
				lines.push(`TEL;TYPE=CELL:${escapeVcardValue(fields.phoneNumber.trim())}`);
			}
			if (fields.emailAddress?.trim()) {
				lines.push(`EMAIL:${escapeVcardValue(fields.emailAddress.trim())}`);
			}
			if (fields.website?.trim()) {
				lines.push(`URL:${escapeVcardValue(fields.website.trim())}`);
			}

			lines.push('END:VCARD');
			return lines.join('\n');
		}

		case 'geo': {
			const latitude = fields.latitude?.trim() ?? '';
			const longitude = fields.longitude?.trim() ?? '';
			if (!latitude || !longitude) return '';
			return `geo:${latitude},${longitude}`;
		}

		case 'calendar': {
			const title = fields.eventTitle?.trim() ?? '';
			const start = fields.eventStart?.trim() ?? '';
			if (!title || !start) return '';

			const formatDate = (value: string) =>
				new Date(value)
					.toISOString()
					.replace(/[-:]/g, '')
					.replace(/\.\d{3}Z$/, 'Z');

			const lines = [
				'BEGIN:VCALENDAR',
				'VERSION:2.0',
				'BEGIN:VEVENT',
				`SUMMARY:${escapeVcardValue(title)}`,
				`DTSTART:${formatDate(start)}`
			];

			if (fields.eventEnd?.trim()) {
				lines.push(`DTEND:${formatDate(fields.eventEnd.trim())}`);
			}
			if (fields.eventLocation?.trim()) {
				lines.push(`LOCATION:${escapeVcardValue(fields.eventLocation.trim())}`);
			}
			if (fields.eventDescription?.trim()) {
				lines.push(`DESCRIPTION:${escapeVcardValue(fields.eventDescription.trim())}`);
			}

			lines.push('END:VEVENT', 'END:VCALENDAR');
			return lines.join('\n');
		}

		default:
			return '';
	}
}

export async function generateQr(
	payload: string,
	options: QrGenerateOptions
): Promise<QrGenerateResult> {
	if (!payload.trim()) {
		return { dataUrl: '', svg: '' };
	}

	try {
		const qrOptions = {
			errorCorrectionLevel: options.errorCorrectionLevel,
			margin: options.margin,
			width: options.width,
			color: {
				dark: options.colorDark,
				light: options.colorLight
			}
		};

		const [dataUrl, svg] = await Promise.all([
			QRCode.toDataURL(payload, qrOptions),
			QRCode.toString(payload, { ...qrOptions, type: 'svg' })
		]);

		return { dataUrl, svg };
	} catch (error) {
		return {
			dataUrl: '',
			svg: '',
			error: error instanceof Error ? error.message : 'Unable to generate QR code'
		};
	}
}
