import { describe, it } from "node:test";
import assert from "node:assert";
import { CommonPathResolver } from "../../../src/domain/path/commonPathResolver";

describe("CommonPathResolver", () => {
	it("handles empty input", () => {
		const result = CommonPathResolver.resolve([]);
		assert.strictEqual(result.commonPrefix, "");
		assert.strictEqual(result.strippedPaths.size, 0);
	});

	it("handles single file by stripping its parent directory", () => {
		const paths = ["src/components/Button.tsx"];
		const result = CommonPathResolver.resolve(paths);
		assert.strictEqual(result.commonPrefix, "src/components");
		assert.strictEqual(
			result.strippedPaths.get("src/components/Button.tsx"),
			"Button.tsx",
		);
	});

	it("resolves sibling files in the same directory", () => {
		const paths = [
			"project/src/components/Button.tsx",
			"project/src/components/Input.tsx",
		];
		const result = CommonPathResolver.resolve(paths);
		assert.strictEqual(result.commonPrefix, "project/src/components");
		assert.strictEqual(
			result.strippedPaths.get("project/src/components/Button.tsx"),
			"Button.tsx",
		);
		assert.strictEqual(
			result.strippedPaths.get("project/src/components/Input.tsx"),
			"Input.tsx",
		);
	});

	it("resolves files across subdirectories sharing a common ancestor", () => {
		const paths = [
			"src/components/Button.tsx",
			"src/utils/helpers.ts",
			"src/core/engine.ts",
		];
		const result = CommonPathResolver.resolve(paths);
		assert.strictEqual(result.commonPrefix, "src");
		assert.strictEqual(
			result.strippedPaths.get("src/components/Button.tsx"),
			"components/Button.tsx",
		);
		assert.strictEqual(
			result.strippedPaths.get("src/utils/helpers.ts"),
			"utils/helpers.ts",
		);
		assert.strictEqual(
			result.strippedPaths.get("src/core/engine.ts"),
			"core/engine.ts",
		);
	});

	it("handles files with no common parent directory", () => {
		const paths = ["src/index.ts", "docs/readme.md", "tests/test.ts"];
		const result = CommonPathResolver.resolve(paths);
		assert.strictEqual(result.commonPrefix, "");
		assert.strictEqual(
			result.strippedPaths.get("src/index.ts"),
			"src/index.ts",
		);
		assert.strictEqual(
			result.strippedPaths.get("docs/readme.md"),
			"docs/readme.md",
		);
	});

	it("handles root-level files", () => {
		const paths = ["package.json", "tsconfig.json"];
		const result = CommonPathResolver.resolve(paths);
		assert.strictEqual(result.commonPrefix, "");
		assert.strictEqual(
			result.strippedPaths.get("package.json"),
			"package.json",
		);
	});
});
