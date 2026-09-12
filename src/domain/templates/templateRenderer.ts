import { Template } from "../models/template";

export interface FileRenderItem {
	path: string;
	relativePath?: string;
	fileName: string;
	extension: string;
	sizeFormatted: string;
	content: string;
}

export interface RenderContext {
	tree: string;
	workspaceName?: string;
	date?: string;
	files: FileRenderItem[];
}

export class TemplateRenderer {
	/**
	 * Renders the complete context document given a template and rendering context.
	 */
	public render(template: Template, context: RenderContext): string {
		// 1. Render individual file blocks if renderContent is enabled and fileTemplate exists
		let renderedFiles = "";

		if (
			template.renderContent &&
			template.fileTemplate &&
			context.files.length > 0
		) {
			const fileBlocks = context.files.map((file) =>
				this.renderFile(template.fileTemplate, file),
			);
			renderedFiles = fileBlocks.join("\n\n");
		}

		// 2. Prepare variables map for the wrapper template
		const currentDate =
			context.date ||
			new Date().toISOString().replace("T", " ").slice(0, 19);
		const workspace = context.workspaceName || "Workspace";

		const wrapperVariables: Record<string, string> = {
			tree: context.tree,
			files: renderedFiles,
			workspaceName: workspace,
			date: currentDate,
			fileCount: context.files.length.toString(),
		};

		// 3. Render wrapper template
		return this.replaceVariables(
			template.wrapperTemplate,
			wrapperVariables,
		);
	}

	/**
	 * Renders an individual file template with file-specific variables.
	 */
	public renderFile(fileTemplate: string, file: FileRenderItem): string {
		const fileVariables: Record<string, string> = {
			path: file.path,
			relativePath: file.relativePath || file.path,
			fileName: file.fileName,
			extension: file.extension,
			size: file.sizeFormatted,
			content: file.content,
		};

		return this.replaceVariables(fileTemplate, fileVariables);
	}

	/**
	 * Safely replaces {{variable}} patterns in a template string.
	 * Uses callback function to completely avoid JavaScript special replacement patterns ($1, $&, $$).
	 */
	public replaceVariables(
		templateStr: string,
		variables: Record<string, string>,
	): string {
		if (!templateStr) {
			return "";
		}

		return templateStr.replace(
			/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g,
			(match, varName) => {
				if (Object.prototype.hasOwnProperty.call(variables, varName)) {
					// Return string safely via callback without $-expansion
					return variables[varName];
				}
				// If unknown variable, preserve original match untouched
				return match;
			},
		);
	}
}
