type Platform = 'blue' | 'cyan' | 'green' | 'magenta' | 'red' | 'yellow';;


export const colorize = (text: string, platform: Platform) => {
	switch (platform) {
		case 'red':
			return `\x1b[31m${text}\x1b[0m`; // Red color
		case 'green':
			return `\x1b[32m${text}\x1b[0m`; // Green color
		case 'magenta':
			return `\x1b[35m${text}\x1b[0m`; // Magenta color
		case 'cyan':
			return `\x1b[36m${text}\x1b[0m`; // Cyan color
		case 'yellow':
			return `\x1b[33m${text}\x1b[0m`; // Yellow color
		case 'blue':
			return `\x1b[34m${text}\x1b[0m`; // Blue color
		default:
			break;
	}

	return `\x1b[36m${text}\x1b[0m`;
}
