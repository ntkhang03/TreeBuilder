import { Template, ValidationResult } from "../../domain/models/template";
import { TemplateValidator } from "../../domain/templates/templateValidator";
import { TemplateStorage } from "../../infrastructure/storage/templateStorage";
import { Result } from "../../shared/result";

export class ManageTemplatesUseCase {
	constructor(private readonly storage: TemplateStorage) {}

	public getTemplates(): Template[] {
		return this.storage.getAllTemplates();
	}

	public getTemplate(id: string): Template | undefined {
		return this.storage.getTemplateById(id);
	}

	public getDefaultTemplateId(): string {
		return this.storage.getDefaultTemplateId();
	}

	public async setDefaultTemplateId(
		id: string,
	): Promise<Result<void, string>> {
		try {
			await this.storage.setDefaultTemplateId(id);
			return Result.ok(undefined);
		} catch (err: unknown) {
			return Result.err(err instanceof Error ? err.message : String(err));
		}
	}

	public async saveTemplate(
		template: Template,
	): Promise<Result<Template, ValidationResult>> {
		const existing = this.storage.getAllTemplates();
		const validation = TemplateValidator.validate(template, existing);

		if (!validation.isValid) {
			return Result.err(validation);
		}

		try {
			await this.storage.saveTemplate(template);
			return Result.ok(template);
		} catch (err: unknown) {
			return Result.err({
				isValid: false,
				errors: [
					{
						field: "general",
						message:
							err instanceof Error ? err.message : String(err),
					},
				],
			});
		}
	}

	public async duplicateTemplate(
		sourceId: string,
	): Promise<Result<Template, string>> {
		const source = this.storage.getTemplateById(sourceId);
		if (!source) {
			return Result.err(`Template with ID "${sourceId}" not found.`);
		}

		const uniqueId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
		const duplicate: Template = {
			...source,
			id: uniqueId,
			name: `${source.name} (Copy)`,
			isBuiltIn: false,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		try {
			await this.storage.saveTemplate(duplicate);
			return Result.ok(duplicate);
		} catch (err: unknown) {
			return Result.err(err instanceof Error ? err.message : String(err));
		}
	}

	public async deleteTemplate(id: string): Promise<Result<void, string>> {
		try {
			const deleted = await this.storage.deleteTemplate(id);
			if (!deleted) {
				return Result.err(`Template with ID "${id}" was not found.`);
			}
			return Result.ok(undefined);
		} catch (err: unknown) {
			return Result.err(err instanceof Error ? err.message : String(err));
		}
	}
}
