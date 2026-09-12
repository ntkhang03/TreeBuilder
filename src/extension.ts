import * as vscode from "vscode";
import { Logger } from "./infrastructure/logging/logger";
import { TemplateStorage } from "./infrastructure/storage/templateStorage";
import { GenerateContextUseCase } from "./application/context/generateContextUseCase";
import { PreviewContextUseCase } from "./application/context/previewContextUseCase";
import { ManageTemplatesUseCase } from "./application/templates/manageTemplatesUseCase";
import { SelectionResolver } from "./infrastructure/vscode/selectionResolver";
import { TemplateManagerPanel } from "./ui/templateManager/templateManagerPanel";
import { Template } from "./domain/models/template";

export function activate(context: vscode.ExtensionContext): void {
	// 1. Initialize Logger
	const outputChannel = vscode.window.createOutputChannel("Tree Builder");
	const logger = Logger.getInstance();
	const config = vscode.workspace.getConfiguration("treeBuilder");
	const configuredLogLevel = config.get<"debug" | "info" | "warn" | "error">(
		"logLevel",
		"info",
	);
	logger.initialize(outputChannel, configuredLogLevel);
	logger.info("Tree Builder extension activated.");

	// 2. Initialize Infrastructure & Use Cases
	const templateStorage = new TemplateStorage(context.globalState, logger);
	const generateContextUseCase = new GenerateContextUseCase();
	const previewContextUseCase = new PreviewContextUseCase();
	const manageTemplatesUseCase = new ManageTemplatesUseCase(templateStorage);

	// 3. Helper: Pick template
	async function selectTemplate(
		prompt: string,
	): Promise<Template | undefined> {
		const templates = manageTemplatesUseCase.getTemplates();
		const defaultId = manageTemplatesUseCase.getDefaultTemplateId();

		const items = templates.map((t) => ({
			label:
				t.name +
				(t.id === defaultId ? " (Default)" : "") +
				(t.isBuiltIn ? " [Built-in]" : ""),
			description: t.description,
			detail: `Output: ${t.outputType} | Content: ${t.renderContent ? "Yes" : "No"} | Common path: ${t.removeCommonPath ? "Stripped" : "Kept"}`,
			template: t,
		}));

		const picked = await vscode.window.showQuickPick(items, {
			placeHolder: prompt,
			matchOnDescription: true,
			matchOnDetail: true,
		});

		return picked?.template;
	}

	// 4. Helper: Run Generation with Progress & Cancellation
	async function runGeneration(
		targetUri?: vscode.Uri,
		selectedUris?: vscode.Uri[],
		forcePromptTemplate = false,
	): Promise<void> {
		try {
			// Resolve selection
			const { selections, workspaceRoot } =
				await SelectionResolver.resolve(targetUri, selectedUris);
			if (selections.length === 0) {
				return;
			}

			// Determine template to use
			const shouldPrompt =
				forcePromptTemplate ||
				vscode.workspace
					.getConfiguration("treeBuilder")
					.get<boolean>("promptForTemplate", false);
			let template: Template | undefined;

			if (shouldPrompt) {
				template = await selectTemplate(
					"Choose a Tree Builder template",
				);
				if (!template) {
					return; // User dismissed QuickPick
				}
			} else {
				const defaultId = manageTemplatesUseCase.getDefaultTemplateId();
				template = manageTemplatesUseCase.getTemplate(defaultId);
				if (!template) {
					template = await selectTemplate(
						"Default template not found. Choose a template:",
					);
					if (!template) {
						return;
					}
				}
			}

			// Max file size
			const maxFileSize = vscode.workspace
				.getConfiguration("treeBuilder")
				.get<number>("maxFileSize", 1048576);

			// Execute with progress and cancellation
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: `Tree Builder: Generating context using "${template.name}"...`,
					cancellable: true,
				},
				async (_progress, token) => {
					await generateContextUseCase.execute({
						selections,
						workspaceRoot,
						template,
						maxFileSize,
						cancellationToken: token,
					});
				},
			);
		} catch (err: unknown) {
			logger.error("Unexpected error during context generation:", err);
			vscode.window.showErrorMessage(
				`Tree Builder: Error generating context: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	// 5. Register Commands
	const generateCommand = vscode.commands.registerCommand(
		"treeBuilder.generateContext",
		async (targetUri?: vscode.Uri, selectedUris?: vscode.Uri[]) => {
			await runGeneration(targetUri, selectedUris, false);
		},
	);

	const generateWithTemplateCommand = vscode.commands.registerCommand(
		"treeBuilder.generateContextWithTemplate",
		async (targetUri?: vscode.Uri, selectedUris?: vscode.Uri[]) => {
			await runGeneration(targetUri, selectedUris, true);
		},
	);

	const manageTemplatesCommand = vscode.commands.registerCommand(
		"treeBuilder.manageTemplates",
		() => {
			TemplateManagerPanel.render(
				context.extensionUri,
				manageTemplatesUseCase,
				previewContextUseCase,
			);
		},
	);

	context.subscriptions.push(
		outputChannel,
		generateCommand,
		generateWithTemplateCommand,
		manageTemplatesCommand,
	);
}

export function deactivate(): void {
	// Clean up if needed
}
