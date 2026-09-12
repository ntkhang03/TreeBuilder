import * as vscode from "vscode";
import { Template } from "../../domain/models/template";
import { BUILTIN_TEMPLATES } from "../../domain/templates/builtinTemplates";
import { TemplateValidator } from "../../domain/templates/templateValidator";
import { Logger } from "../logging/logger";

export class TemplateStorage {
	private static readonly STORAGE_KEY = "treebuilder.customTemplates";
	private static readonly DEFAULT_TEMPLATE_KEY =
		"treebuilder.defaultTemplateId";

	constructor(
		private readonly globalState: vscode.Memento,
		private readonly logger: Logger = Logger.getInstance(),
	) {}

	/**
	 * Retrieves all templates (built-in templates plus persisted custom templates).
	 */
	public getAllTemplates(): Template[] {
		const customTemplates = this.getCustomTemplates();
		return [...BUILTIN_TEMPLATES, ...customTemplates];
	}

	/**
	 * Finds a template by its ID.
	 */
	public getTemplateById(id: string): Template | undefined {
		return this.getAllTemplates().find((t) => t.id === id);
	}

	/**
	 * Retrieves only user-created custom templates.
	 */
	public getCustomTemplates(): Template[] {
		try {
			const stored = this.globalState.get<Template[]>(
				TemplateStorage.STORAGE_KEY,
				[],
			);
			if (!Array.isArray(stored)) {
				return [];
			}

			// Validate each custom template to guard against corrupted storage
			return stored.filter((t) => {
				const result = TemplateValidator.validate(t);
				if (!result.isValid) {
					this.logger.warn(
						`Skipping corrupted template in storage: "${t.name || t.id}"`,
						result.errors,
					);
					return false;
				}
				return true;
			});
		} catch (err) {
			this.logger.error(
				"Failed to read custom templates from globalState:",
				err,
			);
			return [];
		}
	}

	/**
	 * Saves or updates a custom template. Built-in templates cannot be directly overwritten.
	 */
	public async saveTemplate(template: Template): Promise<void> {
		if (template.isBuiltIn) {
			throw new Error("Cannot modify a built-in template.");
		}

		const currentTemplates = this.getCustomTemplates();
		const existingIndex = currentTemplates.findIndex(
			(t) => t.id === template.id,
		);

		const now = Date.now();
		const updatedTemplate: Template = {
			...template,
			isBuiltIn: false,
			updatedAt: now,
			createdAt: template.createdAt || now,
		};

		if (existingIndex >= 0) {
			currentTemplates[existingIndex] = updatedTemplate;
		} else {
			currentTemplates.push(updatedTemplate);
		}

		await this.globalState.update(
			TemplateStorage.STORAGE_KEY,
			currentTemplates,
		);
		this.logger.info(
			`Saved custom template "${template.name}" (${template.id}).`,
		);
	}

	/**
	 * Deletes a custom template by ID. Built-in templates cannot be deleted.
	 */
	public async deleteTemplate(id: string): Promise<boolean> {
		const isBuiltin = BUILTIN_TEMPLATES.some((b) => b.id === id);
		if (isBuiltin) {
			throw new Error("Cannot delete a built-in template.");
		}

		const currentTemplates = this.getCustomTemplates();
		const filtered = currentTemplates.filter((t) => t.id !== id);

		if (filtered.length === currentTemplates.length) {
			return false; // Not found
		}

		await this.globalState.update(TemplateStorage.STORAGE_KEY, filtered);
		this.logger.info(`Deleted custom template ID: ${id}`);
		return true;
	}

	/**
	 * Returns the ID of the default template.
	 */
	public getDefaultTemplateId(): string {
		// Check config first
		const config = vscode.workspace.getConfiguration("treeBuilder");
		const configDefault = config.get<string>("defaultTemplate");
		if (configDefault && this.getTemplateById(configDefault)) {
			return configDefault;
		}

		// Check state
		const stateDefault = this.globalState.get<string>(
			TemplateStorage.DEFAULT_TEMPLATE_KEY,
		);
		if (stateDefault && this.getTemplateById(stateDefault)) {
			return stateDefault;
		}

		// Fallback to first built-in
		return BUILTIN_TEMPLATES[0].id;
	}

	/**
	 * Sets the default template ID.
	 */
	public async setDefaultTemplateId(id: string): Promise<void> {
		const template = this.getTemplateById(id);
		if (!template) {
			throw new Error(`Template with ID "${id}" does not exist.`);
		}

		await this.globalState.update(TemplateStorage.DEFAULT_TEMPLATE_KEY, id);

		// Also sync with workspace configuration if possible
		try {
			const config = vscode.workspace.getConfiguration("treeBuilder");
			await config.update(
				"defaultTemplate",
				id,
				vscode.ConfigurationTarget.Global,
			);
		} catch {
			// Configuration update may fail if settings are read-only, which is non-fatal
		}
	}
}
