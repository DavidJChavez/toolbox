import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
import { formatRelative } from '$lib/tools/timestamp/tool';

export interface CronParseOptions {
	count: number;
	timezone: string;
}

export interface CronExecution {
	date: Date;
	iso: string;
	relative: string;
}

export interface CronParseResult {
	description: string;
	nextExecutions: CronExecution[];
	error?: string;
}

export const cronExamples = [
	{ expression: '0 0 * * *', label: 'Daily at midnight' },
	{ expression: '0 */6 * * *', label: 'Every 6 hours' },
	{ expression: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
	{ expression: '*/15 * * * *', label: 'Every 15 minutes' },
	{ expression: '0 0 1 * *', label: 'First day of month' }
] as const;

export function parseCron(expression: string, options: CronParseOptions): CronParseResult {
	const trimmed = expression.trim();
	if (!trimmed) {
		return { description: '', nextExecutions: [] };
	}

	try {
		const description = cronstrue.toString(trimmed, { use24HourTimeFormat: true });

		const interval = CronExpressionParser.parse(trimmed, {
			currentDate: new Date(),
			tz: options.timezone
		});

		const nextExecutions: CronExecution[] = [];
		const count = Math.max(1, Math.min(options.count, 50));

		for (let index = 0; index < count; index++) {
			const date = interval.next().toDate();
			nextExecutions.push({
				date,
				iso: date.toISOString(),
				relative: formatRelative(date)
			});
		}

		return { description, nextExecutions };
	} catch (error) {
		return {
			description: '',
			nextExecutions: [],
			error: error instanceof Error ? error.message : 'Invalid cron expression'
		};
	}
}
