import { Template } from "../../domain/models/template";
import { FileFilter } from "../../domain/filtering/fileFilter";
import { CommonPathResolver } from "../../domain/path/commonPathResolver";
import { TreeBuilder } from "../../domain/tree/treeBuilder";
import { TreeRenderer } from "../../domain/tree/treeRenderer";
import {
	FileRenderItem,
	TemplateRenderer,
} from "../../domain/templates/templateRenderer";

interface MockPreviewFile {
	relativePath: string;
	name: string;
	extension: string;
	sizeFormatted: string;
	content: string;
}

export class PreviewContextUseCase {
	private readonly templateRenderer: TemplateRenderer;

	private readonly sampleFiles: MockPreviewFile[] = [
		{
			relativePath: "src/core/engine.ts",
			name: "engine.ts",
			extension: "ts",
			sizeFormatted: "1.4 KB",
			content: `export class Engine {\n  public start(): void {\n    console.log("Engine initialized.");\n  }\n}`,
		},
		{
			relativePath: "src/core/parser.ts",
			name: "parser.ts",
			extension: "ts",
			sizeFormatted: "850 B",
			content: `export function parse(input: string): string[] {\n  return input.trim().split(/\\s+/);\n}`,
		},
		{
			relativePath: "src/utils/helper.ts",
			name: "helper.ts",
			extension: "ts",
			sizeFormatted: "420 B",
			content: `export const formatName = (name: string) => name.toUpperCase();`,
		},
		{
			relativePath: "src/index.ts",
			name: "index.ts",
			extension: "ts",
			sizeFormatted: "210 B",
			content: `import { Engine } from "./core/engine";\nnew Engine().start();`,
		},
		{
			relativePath: "package.json",
			name: "package.json",
			extension: "json",
			sizeFormatted: "680 B",
			content: `{\n  "name": "sample-project",\n  "version": "1.0.0"\n}`,
		},
	];

	constructor(templateRenderer?: TemplateRenderer) {
		this.templateRenderer = templateRenderer || new TemplateRenderer();
	}

	/**
	 * Generates a preview string for the given template using sample data.
	 */
	public preview(template: Template): string {
		// 1. Filter sample files by template rules
		const filter = new FileFilter({
			include: template.include,
			exclude: template.exclude,
		});

		const activeFiles = this.sampleFiles.filter((f) =>
			filter.isIncluded(f.relativePath),
		);

		// 2. Handle Common Path Removal
		let displayPaths = activeFiles.map((f) => f.relativePath);
		if (template.removeCommonPath && activeFiles.length > 0) {
			const commonResult = CommonPathResolver.resolve(displayPaths);
			if (commonResult.commonPrefix) {
				displayPaths = activeFiles.map(
					(f) =>
						commonResult.strippedPaths.get(f.relativePath) ||
						f.relativePath,
				);
			}
		}

		// 3. Tree construction & rendering
		const treeRoot = TreeBuilder.build(displayPaths);
		const treeRenderer = new TreeRenderer({
			style: "unicode",
			directoriesFirst: true,
		});
		const renderedTree = treeRenderer.render(treeRoot);

		// 4. File items rendering
		const fileItems: FileRenderItem[] = activeFiles.map((f, idx) => ({
			path: displayPaths[idx],
			relativePath: f.relativePath,
			fileName: f.name,
			extension: f.extension,
			sizeFormatted: f.sizeFormatted,
			content: template.renderContent ? f.content : "",
		}));

		// 5. Template rendering
		return this.templateRenderer.render(template, {
			tree: renderedTree,
			workspaceName: "DemoProject",
			files: fileItems,
		});
	}
}
