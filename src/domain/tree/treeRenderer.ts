import { TreeNode, TreeRenderOptions } from "../models/tree";

export class TreeRenderer {
	private readonly style: "unicode" | "ascii";
	private readonly directoriesFirst: boolean;

	constructor(options: TreeRenderOptions = {}) {
		this.style = options.style ?? "unicode";
		this.directoriesFirst = options.directoriesFirst ?? true;
	}

	/**
	 * Renders the TreeNode hierarchy to a formatted string.
	 */
	public render(root: TreeNode): string {
		const lines: string[] = [];
		const children = this.getSortedChildren(root);

		for (let i = 0; i < children.length; i++) {
			const isLast = i === children.length - 1;
			this.renderNode(children[i], "", isLast, lines);
		}

		return lines.join("\n");
	}

	private renderNode(
		node: TreeNode,
		prefix: string,
		isLast: boolean,
		lines: string[],
	): void {
		const branch = this.getBranchChar(isLast);
		const displayName = node.isDirectory ? `${node.name}/` : node.name;
		lines.push(`${prefix}${branch}${displayName}`);

		if (node.isDirectory && node.children.size > 0) {
			const nextPrefix = `${prefix}${this.getIndentChar(isLast)}`;
			const children = this.getSortedChildren(node);
			for (let i = 0; i < children.length; i++) {
				const childIsLast = i === children.length - 1;
				this.renderNode(children[i], nextPrefix, childIsLast, lines);
			}
		}
	}

	private getSortedChildren(node: TreeNode): TreeNode[] {
		const children = Array.from(node.children.values());

		return children.sort((a, b) => {
			if (this.directoriesFirst && a.isDirectory !== b.isDirectory) {
				return a.isDirectory ? -1 : 1;
			}
			// Alphabetical comparison (case-insensitive with tie-breaker)
			const lowerComp = a.name
				.toLowerCase()
				.localeCompare(b.name.toLowerCase());
			if (lowerComp !== 0) {
				return lowerComp;
			}
			return a.name.localeCompare(b.name);
		});
	}

	private getBranchChar(isLast: boolean): string {
		if (this.style === "ascii") {
			return isLast ? "\\-- " : "|-- ";
		}
		return isLast ? "└── " : "├── ";
	}

	private getIndentChar(isLast: boolean): string {
		if (this.style === "ascii") {
			return isLast ? "    " : "|   ";
		}
		return isLast ? "    " : "│   ";
	}
}
