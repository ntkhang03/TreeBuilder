import { describe, it } from "node:test";
import assert from "node:assert";
import { FileDiscoveryService } from "../../../src/infrastructure/filesystem/fileDiscoveryService";

describe("FileDiscoveryService - Overlap Pruning", () => {
	const service = new FileDiscoveryService();

	it("prunes nested folder when parent folder is also selected", () => {
		const input = [
			{ fsPath: "c:/project/src", isDirectory: true },
			{ fsPath: "c:/project/src/core", isDirectory: true },
		];

		const result = service.pruneOverlappingSelections(input);
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].fsPath, "c:/project/src");
	});

	it("prunes file when its containing folder is selected", () => {
		const input = [
			{ fsPath: "c:/project/src", isDirectory: true },
			{ fsPath: "c:/project/src/index.ts", isDirectory: false },
			{ fsPath: "c:/project/src/core/engine.ts", isDirectory: false },
		];

		const result = service.pruneOverlappingSelections(input);
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].fsPath, "c:/project/src");
	});

	it("preserves disjoint folders and files", () => {
		const input = [
			{ fsPath: "c:/project/src", isDirectory: true },
			{ fsPath: "c:/project/docs", isDirectory: true },
			{ fsPath: "c:/project/README.md", isDirectory: false },
		];

		const result = service.pruneOverlappingSelections(input);
		assert.strictEqual(result.length, 3);
	});
});
