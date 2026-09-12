import { describe, it } from "node:test";
import assert from "node:assert";
import { FileContentReader } from "../../../src/infrastructure/filesystem/fileContentReader";

describe("FileContentReader", () => {
	const reader = new FileContentReader();

	it("formats byte sizes cleanly", () => {
		assert.strictEqual(reader.formatSize(500), "500 B");
		assert.strictEqual(reader.formatSize(1024), "1.0 KB");
		assert.strictEqual(reader.formatSize(2048), "2.0 KB");
		assert.strictEqual(reader.formatSize(1048576), "1.00 MB");
		assert.strictEqual(reader.formatSize(2621440), "2.50 MB");
	});

	it("omits file when size exceeds maxFileSize limit", async () => {
		const result = await reader.readFile(
			"c:/dummy/large.iso",
			10 * 1024 * 1024,
			{
				maxFileSize: 1024 * 1024, // 1MB limit
			},
		);

		assert.strictEqual(result.isTruncated, true);
		assert.ok(
			result.content.includes(
				"[File omitted: exceeds maximum size of 1.00 MB]",
			),
		);
	});

	it("returns safe error message when file does not exist without crashing", async () => {
		const result = await reader.readFile(
			"c:/non/existent/path/never_here.ts",
			100,
			{
				maxFileSize: 1048576,
			},
		);

		assert.strictEqual(result.isTruncated, false);
		assert.ok(result.content.includes("[Error reading file:"));
	});
});
