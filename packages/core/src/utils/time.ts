export const parseDuration = (duration: string): number => {
	const match = duration.match(/^(\d+)([smhd])$/);
	const isValid = isValidDuration(duration);
	if (!match || !isValid) {
		throw new Error(`Invalid duration format: ${duration}. Expected format is <number><unit> where unit is one of 's', 'm', 'h', or 'd'.`);
	}
	const value = parseInt(match[1], 10);
	const unit = match[2];

	switch (unit) {
		case 's': return value * 1000; // seconds to milliseconds
		case 'm': return value * 60 * 1000; // minutes to milliseconds
		case 'h': return value * 60 * 60 * 1000; // hours to milliseconds
		case 'd': return value * 24 * 60 * 60 * 1000; // days to milliseconds
		default: throw new Error(`Unknown time unit: ${unit}`);
	}
};

export const formatDuration = (ms: number): string => {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d`;
	if (hours > 0) return `${hours}h`;
	if (minutes > 0) return `${minutes}m`;
	return `${seconds}s`;
};

export const isValidDuration = (duration: string): boolean => {
	return /^(\d+)([smhd])$/.test(duration);
};


export const now = new Date();