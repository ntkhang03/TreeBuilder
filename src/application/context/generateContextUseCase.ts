import * as vscode from "vscode";
import { RawSelection } from "../../domain/models/selection";
import { Template } from "../../domain/models/template";
import { FileFilter } from "../../domain/filtering/fileFilter";
import { CommonPathResolver } from "../../domain/path/commonPathResolver";
import { TreeBuilder } from "../../domain/tree/treeBuilder";
import { TreeRenderer } from "../../domain/tree/treeRenderer";
import {
	FileRenderItem,
	TemplateRenderer,
} from "../../domain/templates/templateRenderer";
import { FileDiscoveryService } from "../../infrastructure/filesystem/fileDiscoveryService";
import { FileContentReader } from "../../infrastructure/filesystem/fileContentReader";
import { ClipboardOutputHandler } from "../../infrastructure/output/clipboardOutputHandler";
import { EditorOutputHandler } from "../../infrastructure/output/editorOutputHandler";
import { IOutputHandler } from "../../infrastructure/output/outputHandler";
import { Logger } from "../../infrastructure/logging/logger";
import { ICancellationToken } from "../../shared/cancellation";

export interface GenerateContextOptions {
	selections: RawSelection[];
	workspaceRoot: string;
	template: Template;
	maxFileSize?: number;
	cancellationToken?: ICancellationToken;
}

export class GenerateContextUseCase {
	private readonly fileDiscovery: FileDiscoveryService;
	private readonly contentReader: FileContentReader;
	private readonly templateRenderer: TemplateRenderer;
	private readonly clipboardOutput: ClipboardOutputHandler;
	private readonly editorOutput: EditorOutputHandler;
	private readonly logger = Logger.getInstance();

	constructor(
		fileDiscovery?: FileDiscoveryService,
		contentReader?: FileContentReader,
		templateRenderer?: TemplateRenderer,
	) {
		this.fileDiscovery = fileDiscovery || new FileDiscoveryService();
		this.contentReader = contentReader || new FileContentReader();
		this.templateRenderer = templateRenderer || new TemplateRenderer();
		this.clipboardOutput = new ClipboardOutputHandler();
		this.editorOutput = new EditorOutputHandler();
	}

	public async execute(
		options: GenerateContextOptions,
	): Promise<string | null> {
		const {
			selections,
			workspaceRoot,
			template,
			maxFileSize,
			cancellationToken,
		} = options;

		if (!selections || selections.length === 0) {
			vscode.window.showWarningMessage(
				"Tree Builder: No files or folders selected.",
			);
			return null;
		}

		this.logger.info(
			`Starting context generation with template "${template.name}"...`,
		);

		// Step 1: File Discovery
		console.log(
			`Discovering files in ${selections.length} selection(s) under workspace root "${workspaceRoot}"...`,
			selections,
		);
		const rawFiles = await this.fileDiscovery.discover(selections, {
			workspaceRoot,
			cancellationToken,
		});

		if (cancellationToken?.isCancellationRequested) {
			this.logger.info("Generation cancelled during discovery.");
			return null;
		}

		if (rawFiles.length === 0) {
			vscode.window.showWarningMessage(
				"Tree Builder: No files found in the selection.",
			);
			return null;
		}

		// Step 2: Filtering by include/exclude patterns
		const fileFilter = new FileFilter({
			include: template.include,
			exclude: template.exclude,
		});
		const filteredFiles = fileFilter.filterFiles(rawFiles);

		if (filteredFiles.length === 0) {
			vscode.window.showWarningMessage(
				`Tree Builder: All ${rawFiles.length} files were excluded by the current template filters.`,
			);
			return null;
		}

		this.logger.info(
			`Discovered ${rawFiles.length} files, ${filteredFiles.length} retained after filtering.`,
		);

		// Step 3: Handle Common Path Removal if enabled
		let displayPaths = filteredFiles.map((f) => f.relativePath);
		if (template.removeCommonPath && filteredFiles.length > 0) {
			const commonResult = CommonPathResolver.resolve(displayPaths);
			if (commonResult.commonPrefix) {
				this.logger.debug(
					`Common path prefix stripped: "${commonResult.commonPrefix}"`,
				);
				displayPaths = filteredFiles.map(
					(f) =>
						commonResult.strippedPaths.get(f.relativePath) ||
						f.relativePath,
				);
			}
		}

		// Step 4: Build & Render Tree
		const treeRoot = TreeBuilder.build(displayPaths);
		const treeRenderer = new TreeRenderer({
			style: "unicode",
			directoriesFirst: true,
		});
		const renderedTree = treeRenderer.render(treeRoot);

		// Step 5: Read file contents (if renderContent is true)
		const fileRenderItems: FileRenderItem[] = [];
		let totalBytes = 0;

		for (let i = 0; i < filteredFiles.length; i++) {
			if (cancellationToken?.isCancellationRequested) {
				this.logger.info(
					"Generation cancelled during content reading.",
				);
				return null;
			}

			const file = filteredFiles[i];
			const displayPath = displayPaths[i];
			totalBytes += file.size;

			let content = "";
			let formattedSize = this.contentReader.formatSize(file.size);

			if (template.renderContent) {
				const readResult = await this.contentReader.readFile(
					file.absolutePath,
					file.size,
					{
						maxFileSize,
					},
				);
				content = readResult.content;
				formattedSize = readResult.formattedSize;
			}

			fileRenderItems.push({
				path: displayPath,
				relativePath: file.relativePath,
				fileName: file.name,
				extension: file.extension,
				sizeFormatted: formattedSize,
				content,
			});
		}

		// Step 6: Render Template
		const workspaceName = workspaceRoot
			? workspaceRoot.split("/").filter(Boolean).pop()
			: "Workspace";
		const finalContent = this.templateRenderer.render(template, {
			tree: renderedTree,
			workspaceName,
			files: fileRenderItems,
		});

		// Step 7: Dispatch to Output Handler
		const outputHandler: IOutputHandler =
			template.outputType === "editor"
				? this.editorOutput
				: this.clipboardOutput;

		await outputHandler.handle(finalContent, {
			fileCount: filteredFiles.length,
			totalSize: totalBytes,
			templateName: template.name,
		});

		return finalContent;
	}
}
