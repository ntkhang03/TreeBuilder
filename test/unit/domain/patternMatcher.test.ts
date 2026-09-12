import { describe, it } from "node:test";
import assert from "node:assert";
import { PatternMatcher } from "../../../src/domain/filtering/patternMatcher";
import { FileFilter } from "../../../src/domain/filtering/fileFilter";

describe("PatternMatcher & FileFilter", () => {
	describe("PatternMatcher", () => {
		it("matches simple glob pattern", () => {
			const matcher = new PatternMatcher(["**/*.ts"]);
			assert.strictEqual(matcher.matches("src/core/engine.ts"), true);
			assert.strictEqual(matcher.matches("src/index.js"), false);
		});

		it("matches directory wildcard", () => {
			const matcher = new PatternMatcher(["**/node_modules/**"]);
			assert.strictEqual(
				matcher.matches("node_modules/pkg/index.js"),
				true,
			);
			assert.strictEqual(
				matcher.matches("src/node_modules/file.ts"),
				true,
			);
			assert.strictEqual(matcher.matches("src/core/engine.ts"), false);
		});

		it("handles multiple patterns", () => {
			const matcher = new PatternMatcher(["**/*.ts", "**/*.tsx"]);
			assert.strictEqual(
				matcher.matches("src/components/Button.tsx"),
				true,
			);
			assert.strictEqual(matcher.matches("src/core/engine.ts"), true);
			assert.strictEqual(matcher.matches("src/style.css"), false);
		});

		it("returns false when patterns array is empty", () => {
			const matcher = new PatternMatcher([]);
			assert.strictEqual(matcher.matches("src/index.ts"), false);
		});
	});

	describe("FileFilter", () => {
		it("includes all files when include and exclude are empty", () => {
			const filter = new FileFilter({});
			assert.strictEqual(filter.isIncluded("src/index.ts"), true);
			assert.strictEqual(filter.isIncluded("README.md"), true);
		});

		it("filters by include patterns", () => {
			const filter = new FileFilter({
				include: ["**/*.ts", "**/*.tsx"],
			});
			assert.strictEqual(filter.isIncluded("src/index.ts"), true);
			assert.strictEqual(
				filter.isIncluded("src/components/App.tsx"),
				true,
			);
			assert.strictEqual(filter.isIncluded("src/styles.css"), false);
			assert.strictEqual(filter.isIncluded("package.json"), false);
		});

		it("filters by exclude patterns", () => {
			const filter = new FileFilter({
				exclude: ["**/node_modules/**", "**/dist/**"],
			});
			assert.strictEqual(filter.isIncluded("src/index.ts"), true);
			assert.strictEqual(
				filter.isIncluded("node_modules/lodash/index.js"),
				false,
			);
			assert.strictEqual(filter.isIncluded("dist/bundle.js"), false);
		});

		it("gives exclude precedence over include", () => {
			const filter = new FileFilter({
				include: ["**/*.ts"],
				exclude: ["**/*.test.ts"],
			});
			assert.strictEqual(filter.isIncluded("src/core/engine.ts"), true);
			assert.strictEqual(
				filter.isIncluded("src/core/engine.test.ts"),
				false,
			);
		});
	});
});
