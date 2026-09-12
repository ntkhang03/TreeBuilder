import * as vscode from "vscode";
import { RawSelection } from "../../domain/models/selection";
import { PathNormalizer } from "../../domain/path/pathNormalizer";
import { PathExtractor } from "../../domain/path/pathExtractor";

export class SelectionResolver {
	/**
	 * Resolves raw selections from command arguments (Explorer context menu),
	 * active text editor selection, active document, or user prompt dialog.
	 */
	public static async resolve(
		targetUri?: vscode.Uri,
		selectedUris?: vscode.Uri[],
	): Promise<{ selections: RawSelection[]; workspaceRoot: string }> {
		// 1. If triggered from an active text editor with a text selection (highlighted text)
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && !activeEditor.selection.isEmpty) {
			const isEditorContext =
				(!selectedUris || selectedUris.length <= 1) &&
				(!targetUri ||
					targetUri.toString() ===
						activeEditor.document.uri.toString());

			if (isEditorContext) {
				const selectedText = activeEditor.document.getText(
					activeEditor.selection,
				);
				const docDir = PathNormalizer.dirname(
					activeEditor.document.uri.fsPath,
				);
				const extracted = PathExtractor.extractPaths(
					selectedText,
					docDir,
				);

				if (extracted.paths.length > 0) {
					let workspaceRoot = extracted.workspaceRoot;

					// Check if any active workspace folder contains this workspaceRoot
					if (vscode.workspace.workspaceFolders) {
						for (const wf of vscode.workspace.workspaceFolders) {
							const wfPath = PathNormalizer.normalize(
								wf.uri.fsPath,
							);
							if (
								workspaceRoot
									.toLowerCase()
									.startsWith(wfPath.toLowerCase())
							) {
								workspaceRoot = wfPath;
								break;
							}
						}
					}

					return {
						selections: extracted.paths.map((p) => ({ fsPath: p })),
						workspaceRoot,
					};
				}
			}
		}

		// 2. If multiple items were selected in the Explorer context menu
		if (selectedUris && selectedUris.length > 0) {
			const selections = selectedUris.map((u) => ({
				fsPath: PathNormalizer.normalize(u.fsPath),
			}));
			const workspaceRoot = this.getWorkspaceRoot(selectedUris[0]);
			return { selections, workspaceRoot };
		}

		// 3. If single item was right-clicked in Explorer (or editor with no text selected)
		if (targetUri) {
			const selections = [
				{ fsPath: PathNormalizer.normalize(targetUri.fsPath) },
			];
			const workspaceRoot = this.getWorkspaceRoot(targetUri);
			return { selections, workspaceRoot };
		}

		// 4. If command was run from Command Palette / Shortcut, check active editor
		if (activeEditor && !activeEditor.document.isUntitled) {
			const uri = activeEditor.document.uri;
			const selections = [
				{ fsPath: PathNormalizer.normalize(uri.fsPath) },
			];
			const workspaceRoot = this.getWorkspaceRoot(uri);
			return { selections, workspaceRoot };
		}

		// 4. If no active editor, check workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			if (workspaceFolders.length === 1) {
				const rootPath = PathNormalizer.normalize(
					workspaceFolders[0].uri.fsPath,
				);
				return {
					selections: [{ fsPath: rootPath }],
					workspaceRoot: rootPath,
				};
			}

			// Multiple workspace folders: prompt user to select one
			const items = workspaceFolders.map((wf) => ({
				label: wf.name,
				description: wf.uri.fsPath,
				uri: wf.uri,
			}));

			const picked = await vscode.window.showQuickPick(items, {
				placeHolder:
					"Select a workspace folder to generate context from",
			});

			if (picked) {
				const rootPath = PathNormalizer.normalize(picked.uri.fsPath);
				return {
					selections: [{ fsPath: rootPath }],
					workspaceRoot: rootPath,
				};
			}
		}

		// 5. Fallback: prompt user to pick files/folders via open dialog
		const pickedUris = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: true,
			canSelectMany: true,
			openLabel: "Select for Tree Builder",
		});

		if (pickedUris && pickedUris.length > 0) {
			const selections = pickedUris.map((u) => ({
				fsPath: PathNormalizer.normalize(u.fsPath),
			}));
			const workspaceRoot = this.getWorkspaceRoot(pickedUris[0]);
			return { selections, workspaceRoot };
		}

		return { selections: [], workspaceRoot: "" };
	}

	private static getWorkspaceRoot(uri: vscode.Uri): string {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
		if (workspaceFolder) {
			return PathNormalizer.normalize(workspaceFolder.uri.fsPath);
		}
		const firstWf = vscode.workspace.workspaceFolders?.[0];
		return firstWf
			? PathNormalizer.normalize(firstWf.uri.fsPath)
			: PathNormalizer.dirname(uri.fsPath);
	}
}
