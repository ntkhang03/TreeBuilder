import * as fs from "fs";
import { PathNormalizer } from "../../domain/path/pathNormalizer";

export class BinaryDetector {
	private static readonly BINARY_EXTENSIONS = new Set([
		// Images
		"png",
		"jpg",
		"jpeg",
		"gif",
		"bmp",
		"webp",
		"ico",
		"tiff",
		"psd",
		"ai",
		"raw",
		// Audio & Video
		"mp3",
		"mp4",
		"wav",
		"ogg",
		"flac",
		"aac",
		"avi",
		"mov",
		"mkv",
		"webm",
		"wmv",
		// Archives & Packages
		"zip",
		"tar",
		"gz",
		"bz2",
		"7z",
		"rar",
		"tgz",
		"xz",
		"jar",
		"war",
		"ear",
		// Executables & Libraries
		"exe",
		"dll",
		"so",
		"dylib",
		"bin",
		"obj",
		"o",
		"a",
		"lib",
		"elf",
		// Fonts
		"woff",
		"woff2",
		"ttf",
		"eot",
		"otf",
		// Documents & Databases
		"pdf",
		"doc",
		"docx",
		"xls",
		"xlsx",
		"ppt",
		"pptx",
		"sqlite",
		"sqlite3",
		"db",
		// Bytecode & Artifacts
		"class",
		"pyc",
		"pyo",
		"wasm",
		"node",
	]);

	/**
	 * Fast check based on file extension.
	 */
	public static isBinaryExtension(filePath: string): boolean {
		const ext = PathNormalizer.extension(filePath).toLowerCase();
		return this.BINARY_EXTENSIONS.has(ext);
	}

	/**
	 * Reads the first sample bytes (up to 1024 bytes) of a file to detect binary content.
	 * If a null byte (0x00) is present, it is considered binary.
	 */
	public static async isBinaryFile(filePath: string): Promise<boolean> {
		if (this.isBinaryExtension(filePath)) {
			return true;
		}

		try {
			const buffer = Buffer.alloc(1024);
			const fd = await fs.promises.open(filePath, "r");
			try {
				const { bytesRead } = await fd.read(buffer, 0, 1024, 0);
				return this.isBinaryBuffer(buffer.subarray(0, bytesRead));
			} finally {
				await fd.close();
			}
		} catch {
			// If unable to open or read, don't flag as binary; let file reader handle the error
			return false;
		}
	}

	/**
	 * Checks whether a byte buffer contains binary data.
	 */
	public static isBinaryBuffer(buffer: Buffer): boolean {
		const length = buffer.length;
		if (length === 0) {
			return false;
		}

		// Inspect bytes for null characters (0x00)
		for (let i = 0; i < length; i++) {
			if (buffer[i] === 0) {
				return true;
			}
		}

		return false;
	}
}
