import { describe, it } from "node:test";
import assert from "node:assert";
import { PathExtractor } from "../../../src/domain/path/pathExtractor";

describe("PathExtractor", () => {
	it("extracts multi-line absolute Windows paths", () => {
		const input = [
			"C:\\Users\\ntkhang03\\Documents\\Code\\CoinmasterToolTS\\API_ARCHITECTURE.md",
			"C:\\Users\\ntkhang03\\Documents\\Code\\CoinmasterToolTS\\Dockerfile",
		].join("\n");

		const result = PathExtractor.extractPaths(input);

		assert.strictEqual(result.paths.length, 2);
		assert.strictEqual(
			result.paths[0],
			"C:/Users/ntkhang03/Documents/Code/CoinmasterToolTS/API_ARCHITECTURE.md",
		);
		assert.strictEqual(
			result.paths[1],
			"C:/Users/ntkhang03/Documents/Code/CoinmasterToolTS/Dockerfile",
		);
		assert.strictEqual(
			result.workspaceRoot,
			"C:/Users/ntkhang03/Documents/Code/CoinmasterToolTS",
		);
	});

	it("handles markdown code backticks around paths", () => {
		const input =
			"`C:\\Users\\ntkhang03\\Documents\\Code\\CoinmasterToolTS\\API_ARCHITECTURE.md\nC:\\Users\\ntkhang03\\Documents\\Code\\CoinmasterToolTS\\Dockerfile`";

		const result = PathExtractor.extractPaths(input);

		assert.strictEqual(result.paths.length, 2);
		assert.strictEqual(
			result.paths[0],
			"C:/Users/ntkhang03/Documents/Code/CoinmasterToolTS/API_ARCHITECTURE.md",
		);
		assert.strictEqual(
			result.paths[1],
			"C:/Users/ntkhang03/Documents/Code/CoinmasterToolTS/Dockerfile",
		);
	});

	it("handles markdown bullet points and quotes", () => {
		const input = [
			'- "C:\\project\\file1.ts"',
			"* 'C:\\project\\file2.ts'",
			"1. `C:\\project\\file3.ts`",
		].join("\n");

		const result = PathExtractor.extractPaths(input);

		assert.strictEqual(result.paths.length, 3);
		assert.strictEqual(result.paths[0], "C:/project/file1.ts");
		assert.strictEqual(result.paths[1], "C:/project/file2.ts");
		assert.strictEqual(result.paths[2], "C:/project/file3.ts");
		assert.strictEqual(result.workspaceRoot, "C:/project");
	});

	it("extracts relative paths given a baseDir", () => {
		const input = "package.json\nREADME.md";
		const result = PathExtractor.extractPaths(input, process.cwd());

		assert.strictEqual(result.paths.length, 2);
		assert.ok(result.paths[0].endsWith("/package.json"));
		assert.ok(result.paths[1].endsWith("/README.md"));
	});

	it("returns empty result for empty or non-path plain text", () => {
		assert.strictEqual(PathExtractor.extractPaths("").paths.length, 0);
		assert.strictEqual(PathExtractor.extractPaths("   ").paths.length, 0);
	});
});
