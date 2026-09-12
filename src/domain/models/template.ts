export type OutputType = "clipboard" | "editor";

/**
 * Defines a template for generating structured context.
 */
export interface Template {
	/**
	 * Unique identifier for the template (e.g. "ai-context" or UUID).
	 */
	id: string;

	/**
	 * Human-readable template display name.
	 */
	name: string;

	/**
	 * Brief description of the template's intended use case.
	 */
	description?: string;

	/**
	 * True if this is a factory-provided default template (read-only).
	 */
	isBuiltIn?: boolean;

	/**
	 * Top-level wrapper template.
	 * Supported variables: {{tree}}, {{files}}, {{workspaceName}}, {{date}}, {{fileCount}}.
	 */
	wrapperTemplate: string;

	/**
	 * Template applied to each included file.
	 * Supported variables: {{path}}, {{fileName}}, {{extension}}, {{size}}, {{content}}.
	 */
	fileTemplate: string;

	/**
	 * Glob patterns to include (e.g. ["**\/*.ts", "**\/*.tsx"]).
	 * If empty, all files (not excluded) are included.
	 */
	include: string[];

	/**
	 * Glob patterns to exclude (e.g. ["**\/node_modules/**", "**\/dist/**"]).
	 */
	exclude: string[];

	/**
	 * Whether to include file contents in the output.
	 * If false, file content reading is skipped for performance.
	 */
	renderContent: boolean;

	/**
	 * Whether to strip the common parent directory prefix from displayed paths.
	 */
	removeCommonPath: boolean;

	/**
	 * Default output target.
	 */
	outputType: OutputType;

	/**
	 * Timestamp of creation.
	 */
	createdAt?: number;

	/**
	 * Timestamp of last modification.
	 */
	updatedAt?: number;
}

export interface TemplateValidationError {
	field: keyof Template | "general";
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: TemplateValidationError[];
}
