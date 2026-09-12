import * as vscode from "vscode";
import * as crypto from "crypto";
import { ManageTemplatesUseCase } from "../../application/templates/manageTemplatesUseCase";
import { PreviewContextUseCase } from "../../application/context/previewContextUseCase";
import { WebviewToHostMessage, HostToWebviewMessage } from "./messages";
import { getWebviewHtml } from "./webviewHtml";
import { Logger } from "../../infrastructure/logging/logger";

export class TemplateManagerPanel {
	public static currentPanel: TemplateManagerPanel | undefined;
	private readonly panel: vscode.WebviewPanel;
	private readonly manageTemplatesUseCase: ManageTemplatesUseCase;
	private readonly previewContextUseCase: PreviewContextUseCase;
	private readonly logger = Logger.getInstance();
	private disposables: vscode.Disposable[] = [];

	private constructor(
		panel: vscode.WebviewPanel,
		manageTemplatesUseCase: ManageTemplatesUseCase,
		previewContextUseCase: PreviewContextUseCase,
	) {
		this.panel = panel;
		this.manageTemplatesUseCase = manageTemplatesUseCase;
		this.previewContextUseCase = previewContextUseCase;

		// Set webview HTML content with CSP nonce
		this.updateHtml();

		// Listen for messages from webview
		this.panel.webview.onDidReceiveMessage(
			(message: WebviewToHostMessage) => this.handleMessage(message),
			null,
			this.disposables,
		);

		// Clean up when webview is closed
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
	}

	public static render(
		extensionUri: vscode.Uri,
		manageTemplatesUseCase: ManageTemplatesUseCase,
		previewContextUseCase: PreviewContextUseCase,
	): void {
		if (TemplateManagerPanel.currentPanel) {
			TemplateManagerPanel.currentPanel.panel.reveal(
				vscode.ViewColumn.One,
			);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			"treeBuilder.templateManager",
			"Tree Builder: Manage Templates",
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [extensionUri],
			},
		);

		TemplateManagerPanel.currentPanel = new TemplateManagerPanel(
			panel,
			manageTemplatesUseCase,
			previewContextUseCase,
		);
	}

	private updateHtml(): void {
		const nonce = crypto.randomBytes(16).toString("base64");
		this.panel.webview.html = getWebviewHtml(nonce);
	}

	private async handleMessage(message: WebviewToHostMessage): Promise<void> {
		try {
			switch (message.type) {
				case "request-init": {
					const templates =
						this.manageTemplatesUseCase.getTemplates();
					const defaultTemplateId =
						this.manageTemplatesUseCase.getDefaultTemplateId();
					this.postMessage({
						type: "init-data",
						payload: { templates, defaultTemplateId },
					});
					break;
				}

				case "save-template": {
					const saveResult =
						await this.manageTemplatesUseCase.saveTemplate(
							message.payload,
						);
					if (saveResult.success) {
						const templates =
							this.manageTemplatesUseCase.getTemplates();
						this.postMessage({
							type: "template-saved",
							payload: { template: saveResult.value, templates },
						});
					} else {
						this.postMessage({
							type: "validation-error",
							payload: { errors: saveResult.error.errors },
						});
					}
					break;
				}

				case "delete-template": {
					const deleteResult =
						await this.manageTemplatesUseCase.deleteTemplate(
							message.payload.id,
						);
					if (deleteResult.success) {
						const templates =
							this.manageTemplatesUseCase.getTemplates();
						const defaultTemplateId =
							this.manageTemplatesUseCase.getDefaultTemplateId();
						this.postMessage({
							type: "template-deleted",
							payload: {
								id: message.payload.id,
								templates,
								defaultTemplateId,
							},
						});
					} else {
						this.postMessage({
							type: "notification",
							payload: {
								message: deleteResult.error,
								level: "error",
							},
						});
					}
					break;
				}

				case "duplicate-template": {
					const dupResult =
						await this.manageTemplatesUseCase.duplicateTemplate(
							message.payload.id,
						);
					if (dupResult.success) {
						const templates =
							this.manageTemplatesUseCase.getTemplates();
						this.postMessage({
							type: "template-saved",
							payload: { template: dupResult.value, templates },
						});
					} else {
						this.postMessage({
							type: "notification",
							payload: {
								message: dupResult.error,
								level: "error",
							},
						});
					}
					break;
				}

				case "set-default": {
					const defaultResult =
						await this.manageTemplatesUseCase.setDefaultTemplateId(
							message.payload.id,
						);
					if (defaultResult.success) {
						this.postMessage({
							type: "default-changed",
							payload: { defaultTemplateId: message.payload.id },
						});
					} else {
						this.postMessage({
							type: "notification",
							payload: {
								message: defaultResult.error,
								level: "error",
							},
						});
					}
					break;
				}

				case "request-preview": {
					const previewText = this.previewContextUseCase.preview(
						message.payload,
					);
					this.postMessage({
						type: "preview-result",
						payload: { previewText },
					});
					break;
				}
			}
		} catch (err: unknown) {
			this.logger.error("Error handling webview message:", err);
			this.postMessage({
				type: "notification",
				payload: {
					message: err instanceof Error ? err.message : String(err),
					level: "error",
				},
			});
		}
	}

	private postMessage(message: HostToWebviewMessage): void {
		this.panel.webview.postMessage(message);
	}

	public dispose(): void {
		TemplateManagerPanel.currentPanel = undefined;
		this.panel.dispose();
		while (this.disposables.length) {
			const d = this.disposables.pop();
			if (d) {
				d.dispose();
			}
		}
	}
}
