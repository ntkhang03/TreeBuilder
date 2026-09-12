import { describe, it } from "node:test";
import assert from "node:assert";
import { TemplateValidator } from "../../../src/domain/templates/templateValidator";
import { Template } from "../../../src/domain/models/template";

describe("TemplateValidator", () => {
	const validTemplate: Template = {
		id: "test-template",
		name: "Test Template",
		description: "A valid test template",
		wrapperTemplate: "{{tree}}\n{{files}}",
		fileTemplate: "{{path}}\n{{content}}",
		include: ["**/*.ts"],
		exclude: ["**/node_modules/**"],
		renderContent: true,
		removeCommonPath: false,
		outputType: "clipboard",
	};

	it("validates a valid template successfully", () => {
		const result = TemplateValidator.validate(validTemplate);
		assert.strictEqual(result.isValid, true);
		assert.strictEqual(result.errors.length, 0);
	});

	it("fails when ID is missing", () => {
		const result = TemplateValidator.validate({ ...validTemplate, id: "" });
		assert.strictEqual(result.isValid, false);
		assert.ok(result.errors.some((e) => e.field === "id"));
	});

	it("fails when name is missing or whitespace", () => {
		const result = TemplateValidator.validate({
			...validTemplate,
			name: "   ",
		});
		assert.strictEqual(result.isValid, false);
		assert.ok(result.errors.some((e) => e.field === "name"));
	});

	it("detects duplicate template name", () => {
		const existing: Template[] = [
			{ ...validTemplate, id: "other-id", name: "Duplicate Name" },
		];
		const result = TemplateValidator.validate(
			{ ...validTemplate, id: "new-id", name: "duplicate name" },
			existing,
		);
		assert.strictEqual(result.isValid, false);
		assert.ok(
			result.errors.some(
				(e) =>
					e.field === "name" && e.message.includes("already exists"),
			),
		);
	});

	it("fails on invalid outputType", () => {
		const result = TemplateValidator.validate({
			...validTemplate,
			outputType: "invalid" as unknown as "clipboard",
		});
		assert.strictEqual(result.isValid, false);
		assert.ok(result.errors.some((e) => e.field === "outputType"));
	});
});
