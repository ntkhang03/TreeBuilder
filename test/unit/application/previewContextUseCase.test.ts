import { describe, it } from "node:test";
import assert from "node:assert";
import { PreviewContextUseCase } from "../../../src/application/context/previewContextUseCase";
import { BUILTIN_TEMPLATES } from "../../../src/domain/templates/builtinTemplates";

describe("PreviewContextUseCase", () => {
	const useCase = new PreviewContextUseCase();

	it("generates preview for built-in AI Context template", () => {
		const aiTemplate = BUILTIN_TEMPLATES.find((t) => t.id === "ai-context");
		assert.ok(aiTemplate);

		const preview = useCase.preview(aiTemplate);
		assert.ok(preview.includes("# Project Structure"));
		assert.ok(preview.includes("src/"));
		assert.ok(preview.includes("engine.ts"));
		assert.ok(preview.includes("export class Engine"));
	});

	it("generates preview for Project Tree Only template without file contents", () => {
		const treeTemplate = BUILTIN_TEMPLATES.find(
			(t) => t.id === "project-tree",
		);
		assert.ok(treeTemplate);

		const preview = useCase.preview(treeTemplate);
		assert.ok(preview.includes("Project Structure:"));
		assert.ok(preview.includes("src/"));
		assert.ok(!preview.includes("export class Engine"));
	});

	it("filters sample files when include pattern is defined", () => {
		const aiTemplate = BUILTIN_TEMPLATES.find((t) => t.id === "ai-context");
		assert.ok(aiTemplate);

		const custom = {
			...aiTemplate,
			include: ["**/*.json"],
		};

		const preview = useCase.preview(custom);
		assert.ok(preview.includes("package.json"));
		assert.ok(!preview.includes("engine.ts"));
	});
});
