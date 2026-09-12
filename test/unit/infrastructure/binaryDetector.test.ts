import { describe, it } from "node:test";
import assert from "node:assert";
import { BinaryDetector } from "../../../src/infrastructure/filesystem/binaryDetector";

describe("BinaryDetector", () => {
	it("detects binary extensions correctly", () => {
		assert.strictEqual(BinaryDetector.isBinaryExtension("image.png"), true);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("archive.zip"),
			true,
		);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("program.exe"),
			true,
		);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("document.pdf"),
			true,
		);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("font.woff2"),
			true,
		);

		assert.strictEqual(BinaryDetector.isBinaryExtension("index.ts"), false);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("styles.css"),
			false,
		);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("package.json"),
			false,
		);
		assert.strictEqual(
			BinaryDetector.isBinaryExtension("README.md"),
			false,
		);
	});

	it("detects null byte in binary buffer", () => {
		const binaryBuf = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x00, 0x6f]); // "Hell\0o"
		assert.strictEqual(BinaryDetector.isBinaryBuffer(binaryBuf), true);

		const textBuf = Buffer.from("Hello, World! 12345");
		assert.strictEqual(BinaryDetector.isBinaryBuffer(textBuf), false);

		const emptyBuf = Buffer.alloc(0);
		assert.strictEqual(BinaryDetector.isBinaryBuffer(emptyBuf), false);
	});
});
