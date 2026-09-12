import * as vscode from "vscode";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ILogger {
	debug(message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string | Error, ...args: unknown[]): void;
}

export class Logger implements ILogger {
	private static instance: Logger | null = null;
	private outputChannel: vscode.OutputChannel | null = null;
	private currentLevel: LogLevel = "info";

	private readonly levelWeights: Record<LogLevel, number> = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	};

	private constructor() {}

	public static getInstance(): Logger {
		if (!this.instance) {
			this.instance = new Logger();
		}
		return this.instance;
	}

	public initialize(
		outputChannel: vscode.OutputChannel,
		level: LogLevel = "info",
	): void {
		this.outputChannel = outputChannel;
		this.currentLevel = level;
	}

	public setLogLevel(level: LogLevel): void {
		this.currentLevel = level;
	}

	public debug(message: string, ...args: unknown[]): void {
		this.log("debug", message, ...args);
	}

	public info(message: string, ...args: unknown[]): void {
		this.log("info", message, ...args);
	}

	public warn(message: string, ...args: unknown[]): void {
		this.log("warn", message, ...args);
	}

	public error(message: string | Error, ...args: unknown[]): void {
		const text =
			message instanceof Error
				? `${message.message}\n${message.stack || ""}`
				: message;
		this.log("error", text, ...args);
	}

	private log(level: LogLevel, message: string, ...args: unknown[]): void {
		if (this.levelWeights[level] < this.levelWeights[this.currentLevel]) {
			return;
		}

		const timestamp = new Date().toISOString().slice(11, 19);
		const extra =
			args.length > 0
				? " " +
					args
						.map((a) =>
							typeof a === "object"
								? JSON.stringify(a)
								: String(a),
						)
						.join(" ")
				: "";
		const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}${extra}`;

		if (this.outputChannel) {
			this.outputChannel.appendLine(formatted);
		} else {
			// Console fallback for testing
			if (level === "error") {
				console.error(formatted);
			} else if (level === "warn") {
				console.warn(formatted);
			} else {
				console.log(formatted);
			}
		}
	}
}
