import * as fs from "fs";
import { BinaryDetector } from "./binaryDetector";
import { Logger } from "../logging/logger";

export interface FileReadOptions {
	maxFileSize?: number; // In bytes
}

export interface FileReadResult {
	content: string;
	isBinary: boolean;
	isTruncated: boolean;
	formattedSize: string;
}

export class FileContentReader {
	private readonly defaultMaxFileSize = 1048576; // 1 MB
	private readonly logger = Logger.getInstance();

	/**
	 * Reads file content safely with size limits, binary detection, and error recovery.
	 */
	public async readFile(
		filePath: string,
		fileSize: number,
		options: FileReadOptions = {},
	): Promise<FileReadResult> {
		const maxFileSize = options.maxFileSize ?? this.defaultMaxFileSize;
		const formattedSize = this.formatSize(fileSize);

		// 1. Check if file exceeds maximum allowed size
		if (fileSize > maxFileSize) {
			this.logger.warn(
				`File "${filePath}" exceeds max size (${formattedSize} > ${this.formatSize(maxFileSize)}).`,
			);
			return {
				content: `[File omitted: exceeds maximum size of ${this.formatSize(maxFileSize)}]`,
				isBinary: false,
				isTruncated: true,
				formattedSize,
			};
		}

		// 2. Check if binary file
		const isBinary = await BinaryDetector.isBinaryFile(filePath);
		if (isBinary) {
			return {
				content: "[Binary file omitted]",
				isBinary: true,
				isTruncated: false,
				formattedSize,
			};
		}

		// 3. Read content as UTF-8 text
		try {
			const content = await fs.promises.readFile(filePath, "utf-8");
			return {
				content,
				isBinary: false,
				isTruncated: false,
				formattedSize,
			};
		} catch (err: unknown) {
			const errMsg = err instanceof Error ? err.message : String(err);
			this.logger.error(`Error reading file "${filePath}":`, err);
			return {
				content: `[Error reading file: ${errMsg}]`,
				isBinary: false,
				isTruncated: false,
				formattedSize,
			};
		}
	}

	/**
	 * Formats raw bytes into human readable string (e.g. "1.2 MB", "45.0 KB", "350 B").
	 */
	public formatSize(bytes: number): string {
		if (bytes < 0) {
			return "0 B";
		}
		if (bytes < 1024) {
			return `${bytes} B`;
		}
		const kb = bytes / 1024;
		if (kb < 1024) {
			return `${kb.toFixed(1)} KB`;
		}
		const mb = kb / 1024;
		return `${mb.toFixed(2)} MB`;
	}
}
