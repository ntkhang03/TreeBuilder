export type ResourceType = "file" | "directory";

/**
 * Represents an item selected by the user, either from the explorer context menu,
 * active editor, or workspace picker.
 */
export interface RawSelection {
	/**
	 * Filesystem absolute path or URI fsPath.
	 */
	fsPath: string;
	/**
	 * Explicitly known type or inferred later.
	 */
	type?: ResourceType;
}

/**
 * Normalized file entry discovered and processed by Tree Builder.
 */
export interface FileEntry {
	/**
	 * Absolute path on the host filesystem.
	 */
	absolutePath: string;
	/**
	 * Relative path relative to the workspace root or common root.
	 */
	relativePath: string;
	/**
	 * Display path formatted with forward slashes for output.
	 */
	displayPath: string;
	/**
	 * Base name of the file (e.g. "engine.ts").
	 */
	name: string;
	/**
	 * File extension without leading dot (e.g. "ts").
	 */
	extension: string;
	/**
	 * File size in bytes.
	 */
	size: number;
	/**
	 * Whether this entry is a directory.
	 */
	isDirectory: boolean;
}
