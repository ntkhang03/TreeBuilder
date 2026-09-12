import { TreeNode } from "../models/tree";
import { PathNormalizer } from "../path/pathNormalizer";

export class TreeBuilder {
	/**
	 * Builds a tree hierarchy from a list of relative file paths.
	 *
	 * @param paths Flat list of relative file paths (e.g. ["src/core/engine.ts", "src/index.ts"])
	 * @returns Root TreeNode representing the top level
	 */
	public static build(paths: string[]): TreeNode {
		const root: TreeNode = {
			name: "",
			path: "",
			isDirectory: true,
			children: new Map(),
		};

		for (const rawPath of paths) {
			const normalized = PathNormalizer.normalize(rawPath);
			if (!normalized) {
				continue;
			}

			const segments = normalized.split("/").filter(Boolean);
			let currentNode = root;
			let currentPath = "";

			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				const isLastSegment = i === segments.length - 1;
				currentPath = currentPath
					? `${currentPath}/${segment}`
					: segment;

				let child = currentNode.children.get(segment);
				if (!child) {
					child = {
						name: segment,
						path: currentPath,
						isDirectory: !isLastSegment,
						children: new Map(),
					};
					currentNode.children.set(segment, child);
				} else if (!isLastSegment) {
					// If already existed as file (edge case), promote to directory
					child.isDirectory = true;
				}

				currentNode = child;
			}
		}

		return root;
	}
}
