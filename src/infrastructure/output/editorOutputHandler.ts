import * as vscode from "vscode";
import { IOutputHandler, OutputMetadata } from "./outputHandler";
import { Logger } from "../logging/logger";

export class EditorOutputHandler implements IOutputHandler {
	private readonly logger = Logger.getInstance();

	public async handle(
		content: string,
		metadata?: OutputMetadata,
	): Promise<void> {
		try {
			const document = await vscode.workspace.openTextDocument({
				content,
				language: "markdown",
			});

			await vscode.window.showTextDocument(document, {
				preview: false,
				viewColumn: vscode.ViewColumn.Active,
			});

			const countText = metadata ? ` (${metadata.fileCount} files)` : "";
			this.logger.info(
				`Tree Builder: Context opened in new editor tab${countText}`,
			);
		} catch (err) {
			this.logger.error(
				"Failed to open generated context in editor tab:",
				err,
			);
			vscode.window.showErrorMessage(
				"Tree Builder: Failed to open generated context in editor.",
			);
		}
	}
}
