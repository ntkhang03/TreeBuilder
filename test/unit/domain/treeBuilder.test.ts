import { describe, it } from "node:test";
import assert from "node:assert";
import { TreeBuilder } from "../../../src/domain/tree/treeBuilder";

describe("TreeBuilder", () => {
	it("builds empty root for empty input", () => {
		const root = TreeBuilder.build([]);
		assert.strictEqual(root.children.size, 0);
	});

	it("builds single file node", () => {
		const root = TreeBuilder.build(["index.ts"]);
		assert.strictEqual(root.children.size, 1);
		const node = root.children.get("index.ts");
		assert.ok(node);
		assert.strictEqual(node.name, "index.ts");
		assert.strictEqual(node.isDirectory, false);
	});

	it("builds nested folder and file hierarchy", () => {
		const paths = [
			"src/core/engine.ts",
			"src/core/parser.ts",
			"src/index.ts",
		];
		const root = TreeBuilder.build(paths);

		assert.strictEqual(root.children.size, 1);
		const srcNode = root.children.get("src");
		assert.ok(srcNode);
		assert.strictEqual(srcNode.isDirectory, true);
		assert.strictEqual(srcNode.children.size, 2); // core/ and index.ts

		const coreNode = srcNode.children.get("core");
		assert.ok(coreNode);
		assert.strictEqual(coreNode.isDirectory, true);
		assert.strictEqual(coreNode.children.size, 2); // engine.ts and parser.ts
	});
});
