
export interface NoOpLogger  {
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
	fatal: (message: string) => void;
	debug: (message: string) => void;
};

export interface ILogger {
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	fatal(message: string): void;
	debug(message: string): void;
}