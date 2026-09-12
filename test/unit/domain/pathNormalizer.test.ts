import { describe, it } from "node:test";
import assert from "node:assert";
import { PathNormalizer } from "../../../src/domain/path/pathNormalizer";

describe("PathNormalizer", () => {
	it("converts Windows backslashes to forward slashes", () => {
		const input = "src\\core\\engine.ts";
		const result = PathNormalizer.normalize(input);
		assert.strictEqual(result, "src/core/engine.ts");
	});

	it("removes leading ./", () => {
		const input = "./src/index.ts";
		const result = PathNormalizer.normalize(input);
		assert.strictEqual(result, "src/index.ts");
	});

	it("collapses redundant slashes", () => {
		const input = "src//core///engine.ts";
		const result = PathNormalizer.normalize(input);
		assert.strictEqual(result, "src/core/engine.ts");
	});

	it("strips trailing slashes from directories", () => {
		const input = "src/components/";
		const result = PathNormalizer.normalize(input);
		assert.strictEqual(result, "src/components");
	});

	it("handles empty or whitespace strings", () => {
		assert.strictEqual(PathNormalizer.normalize(""), "");
		assert.strictEqual(PathNormalizer.normalize("   "), "");
	});

	it("computes relative path correctly", () => {
		const base = "c:/project/root";
		const target = "c:/project/root/src/index.ts";
		const relative = PathNormalizer.relative(base, target);
		assert.strictEqual(relative, "src/index.ts");
	});

	it("extracts basename correctly", () => {
		assert.strictEqual(
			PathNormalizer.basename("src/core/engine.ts"),
			"engine.ts",
		);
		assert.strictEqual(PathNormalizer.basename("README.md"), "README.md");
	});

	it("extracts extension correctly without dot", () => {
		assert.strictEqual(
			PathNormalizer.extension("src/core/engine.ts"),
			"ts",
		);
		assert.strictEqual(PathNormalizer.extension("archive.tar.gz"), "gz");
		assert.strictEqual(PathNormalizer.extension("LICENSE"), "");
		assert.strictEqual(PathNormalizer.extension(".gitignore"), "");
	});

	it("computes dirname correctly", () => {
		assert.strictEqual(
			PathNormalizer.dirname("src/core/engine.ts"),
			"src/core",
		);
		assert.strictEqual(PathNormalizer.dirname("index.ts"), ".");
	});
});
