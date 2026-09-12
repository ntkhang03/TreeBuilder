/**
 * In-memory node representing a file or directory in the context tree hierarchy.
 */
export interface TreeNode {
	/**
	 * Name of the file or directory segment (e.g. "engine.ts" or "core").
	 */
	name: string;

	/**
	 * Full normalized relative path from the root.
	 */
	path: string;

	/**
	 * True if this node represents a directory.
	 */
	isDirectory: boolean;

	/**
	 * Child nodes indexed by name.
	 */
	children: Map<string, TreeNode>;
}

export interface TreeRenderOptions {
	/**
	 * Character style for tree branches.
	 * 'unicode' uses ├──, └──, │
	 * 'ascii' uses |--, \--, |
	 */
	style?: "unicode" | "ascii";

	/**
	 * When true, directories are listed before files at each level.
	 * Default: true.
	 */
	directoriesFirst?: boolean;
}
