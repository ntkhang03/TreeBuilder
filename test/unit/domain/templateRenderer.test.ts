import { describe, it } from "node:test";
import assert from "node:assert";
import {
	TemplateRenderer,
	RenderContext,
	FileRenderItem,
} from "../../../src/domain/templates/templateRenderer";
import { Template } from "../../../src/domain/models/template";

describe("TemplateRenderer", () => {
	const renderer = new TemplateRenderer();

	it("replaces all wrapper variables correctly", () => {
		const template: Template = {
			id: "test",
			name: "Test",
			wrapperTemplate:
				"Tree:\n{{tree}}\n\nFiles ({{fileCount}}):\n{{files}}\n\nWorkspace: {{workspaceName}} ({{date}})",
			fileTemplate: "File: {{path}}",
			include: [],
			exclude: [],
			renderContent: true,
			removeCommonPath: false,
			outputType: "clipboard",
		};

		const context: RenderContext = {
			tree: "└── src/\n    └── index.ts",
			workspaceName: "Tree Builder",
			date: "2026-09-12 12:00:00",
			files: [
				{
					path: "src/index.ts",
					fileName: "index.ts",
					extension: "ts",
					sizeFormatted: "100 B",
					content: 'console.log("hello");',
				},
			],
		};

		const result = renderer.render(template, context);

		assert.ok(result.includes("Tree:\n└── src/\n    └── index.ts"));
		assert.ok(result.includes("Files (1):\nFile: src/index.ts"));
		assert.ok(
			result.includes("Workspace: Tree Builder (2026-09-12 12:00:00)"),
		);
	});

	it("replaces multiple occurrences of the same variable", () => {
		const template: Template = {
			id: "test",
			name: "Test",
			wrapperTemplate:
				"Count: {{fileCount}} files. Total: {{fileCount}} files.\n{{files}}",
			fileTemplate: "Start: {{path}} | End: {{path}}",
			include: [],
			exclude: [],
			renderContent: true,
			removeCommonPath: false,
			outputType: "clipboard",
		};

		const context: RenderContext = {
			tree: "",
			files: [
				{
					path: "a.ts",
					fileName: "a.ts",
					extension: "ts",
					sizeFormatted: "10 B",
					content: "",
				},
			],
		};

		const result = renderer.render(template, context);
		assert.ok(result.includes("Count: 1 files. Total: 1 files."));
		assert.ok(result.includes("Start: a.ts | End: a.ts"));
	});

	it("does not corrupt contents containing dollar signs and regex tokens like $1, $&, $$", () => {
		const template: Template = {
			id: "test",
			name: "Test",
			wrapperTemplate: "{{files}}",
			fileTemplate: "CODE:\n{{content}}",
			include: [],
			exclude: [],
			renderContent: true,
			removeCommonPath: false,
			outputType: "clipboard",
		};

		const sensitiveContent =
			'const regex = /(\\w+)/; str.replace(regex, "$1 $& $$100 USD");';

		const context: RenderContext = {
			tree: "",
			files: [
				{
					path: "test.js",
					fileName: "test.js",
					extension: "js",
					sizeFormatted: "50 B",
					content: sensitiveContent,
				},
			],
		};

		const result = renderer.render(template, context);
		assert.ok(result.includes(sensitiveContent));
	});

	it("omits files when renderContent is false", () => {
		const template: Template = {
			id: "test",
			name: "Test",
			wrapperTemplate: "Tree:\n{{tree}}\nFiles:\n{{files}}",
			fileTemplate: "File: {{path}}\n{{content}}",
			include: [],
			exclude: [],
			renderContent: false,
			removeCommonPath: false,
			outputType: "clipboard",
		};

		const context: RenderContext = {
			tree: "└── index.ts",
			files: [
				{
					path: "index.ts",
					fileName: "index.ts",
					extension: "ts",
					sizeFormatted: "100 B",
					content: "SECRET",
				},
			],
		};

		const result = renderer.render(template, context);
		assert.ok(!result.includes("SECRET"));
		assert.ok(result.includes("Tree:\n└── index.ts\nFiles:\n"));
	});

	it("preserves unknown variables untouched", () => {
		const template: Template = {
			id: "test",
			name: "Test",
			wrapperTemplate: "Hello {{unknownVariable}}",
			fileTemplate: "",
			include: [],
			exclude: [],
			renderContent: false,
			removeCommonPath: false,
			outputType: "clipboard",
		};

		const result = renderer.render(template, { tree: "", files: [] });
		assert.strictEqual(result, "Hello {{unknownVariable}}");
	});
});
