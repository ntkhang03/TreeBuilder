import { describe, it } from "node:test";
import assert from "node:assert";
import { TreeBuilder } from "../../../src/domain/tree/treeBuilder";
import { TreeRenderer } from "../../../src/domain/tree/treeRenderer";

describe("TreeRenderer", () => {
	it("renders empty tree as empty string", () => {
		const root = TreeBuilder.build([]);
		const renderer = new TreeRenderer();
		assert.strictEqual(renderer.render(root), "");
	});

	it("renders deterministic unicode tree with directories first", () => {
		const paths = [
			"src/index.ts",
			"src/core/parser.ts",
			"src/core/engine.ts",
			"src/utils/helper.ts",
		];
		const root = TreeBuilder.build(paths);
		const renderer = new TreeRenderer({
			style: "unicode",
			directoriesFirst: true,
		});
		const output = renderer.render(root);

		const expected = [
			"└── src/",
			"    ├── core/",
			"    │   ├── engine.ts",
			"    │   └── parser.ts",
			"    ├── utils/",
			"    │   └── helper.ts",
			"    └── index.ts",
		].join("\n");

		assert.strictEqual(output, expected);
	});

	it("renders ASCII tree when style is ascii", () => {
		const paths = ["src/core/engine.ts", "src/index.ts"];
		const root = TreeBuilder.build(paths);
		const renderer = new TreeRenderer({
			style: "ascii",
			directoriesFirst: true,
		});
		const output = renderer.render(root);

		const expected = [
			"\\-- src/",
			"    |-- core/",
			"    |   \\-- engine.ts",
			"    \\-- index.ts",
		].join("\n");

		assert.strictEqual(output, expected);
	});
});
