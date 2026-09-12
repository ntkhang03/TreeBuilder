import {
	Template,
	TemplateValidationError,
	ValidationResult,
} from "../models/template";

export class TemplateValidator {
	public static readonly ALLOWED_WRAPPER_VARS = new Set([
		"tree",
		"files",
		"workspaceName",
		"date",
		"fileCount",
	]);

	public static readonly ALLOWED_FILE_VARS = new Set([
		"path",
		"fileName",
		"extension",
		"size",
		"content",
	]);

	/**
	 * Validates a template object.
	 *
	 * @param template Template to validate
	 * @param existingTemplates Optional array of current templates to check for duplicate names/IDs
	 */
	public static validate(
		template: Partial<Template>,
		existingTemplates: Template[] = [],
	): ValidationResult {
		const errors: TemplateValidationError[] = [];

		// 1. Validate ID
		if (!template.id || template.id.trim().length === 0) {
			errors.push({ field: "id", message: "Template ID is required." });
		}

		// 2. Validate Name
		if (!template.name || template.name.trim().length === 0) {
			errors.push({
				field: "name",
				message: "Template name is required.",
			});
		} else {
			const trimmedName = template.name.trim().toLowerCase();
			const duplicate = existingTemplates.find(
				(t) =>
					t.id !== template.id &&
					t.name.trim().toLowerCase() === trimmedName,
			);
			if (duplicate) {
				errors.push({
					field: "name",
					message: `A template with the name "${template.name.trim()}" already exists.`,
				});
			}
		}

		// 3. Validate OutputType
		if (
			!template.outputType ||
			(template.outputType !== "clipboard" &&
				template.outputType !== "editor")
		) {
			errors.push({
				field: "outputType",
				message: 'Output type must be either "clipboard" or "editor".',
			});
		}

		// 4. Validate Wrapper Template
		if (typeof template.wrapperTemplate !== "string") {
			errors.push({
				field: "wrapperTemplate",
				message: "Wrapper template must be a valid string.",
			});
		}

		// 5. Validate File Template
		if (typeof template.fileTemplate !== "string") {
			errors.push({
				field: "fileTemplate",
				message: "File template must be a valid string.",
			});
		}

		// 6. Validate Include/Exclude Arrays
		if (template.include && !Array.isArray(template.include)) {
			errors.push({
				field: "include",
				message: "Include patterns must be an array of glob strings.",
			});
		}

		if (template.exclude && !Array.isArray(template.exclude)) {
			errors.push({
				field: "exclude",
				message: "Exclude patterns must be an array of glob strings.",
			});
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}
