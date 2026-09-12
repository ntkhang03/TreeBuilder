import * as vscode from "vscode";
import { IOutputHandler, OutputMetadata } from "./outputHandler";
import { Logger } from "../logging/logger";

export class ClipboardOutputHandler implements IOutputHandler {
	private readonly logger = Logger.getInstance();

	public async handle(
		content: string,
		metadata?: OutputMetadata,
	): Promise<void> {
		await vscode.env.clipboard.writeText(content);

		const countText = metadata
			? ` (${metadata.fileCount} file${metadata.fileCount === 1 ? "" : "s"})`
			: "";
		const message = `Tree Builder: Context copied to clipboard!${countText}`;

		this.logger.info(message);
		vscode.window.showInformationMessage(message);
	}
}
