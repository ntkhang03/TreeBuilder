import * as fs from "fs";
import * as path from "path";
import { RawSelection, FileEntry } from "../../domain/models/selection";
import { PathNormalizer } from "../../domain/path/pathNormalizer";
import { ICancellationToken } from "../../shared/cancellation";
import { Logger } from "../logging/logger";

export interface FileDiscoveryOptions {
	workspaceRoot?: string;
	cancellationToken?: ICancellationToken;
	ignoredDirectoryNames?: string[];
}

export class FileDiscoveryService {
	private readonly defaultIgnoredDirs = new Set([".git", "node_modules"]);
	private readonly logger = Logger.getInstance();

	/**
	 * Discovers all files corresponding to user selections, handling overlapping
	 * folders, files within selected folders, and duplicate paths.
	 */
	public async discover(
		selections: RawSelection[],
		options: FileDiscoveryOptions = {},
	): Promise<FileEntry[]> {
		if (!selections || selections.length === 0) {
			return [];
		}

		const cancellationToken = options.cancellationToken;
		const workspaceRoot = options.workspaceRoot
			? PathNormalizer.normalize(options.workspaceRoot)
			: "";

		const ignoredDirs = new Set([
			...this.defaultIgnoredDirs,
			...(options.ignoredDirectoryNames || []),
		]);

		// 1. Deduplicate raw selections by canonical absolute path
		const resolvedSelections =
			await this.resolveAndDeduplicateSelections(selections);

		// 2. Filter out items whose parent directory is already included in another selection
		const prunedSelections =
			this.pruneOverlappingSelections(resolvedSelections);

		// 3. Traverse filesystem for all pruned selections
		const discoveredFilesMap = new Map<string, FileEntry>();

		for (const item of prunedSelections) {
			if (cancellationToken?.isCancellationRequested) {
				this.logger.info("File discovery cancelled by user.");
				break;
			}

			await this.traversePath(
				item.fsPath,
				item.isDirectory,
				workspaceRoot,
				discoveredFilesMap,
				ignoredDirs,
				cancellationToken,
			);
		}

		// Convert map values to sorted array
		const results = Array.from(discoveredFilesMap.values());
		return results.sort((a, b) =>
			a.relativePath.localeCompare(b.relativePath),
		);
	}

	/**
	 * Normalizes paths and determines directory vs file status.
	 */
	private async resolveAndDeduplicateSelections(
		selections: RawSelection[],
	): Promise<Array<{ fsPath: string; isDirectory: boolean }>> {
		const seen = new Set<string>();
		const resolved: Array<{ fsPath: string; isDirectory: boolean }> = [];

		for (const sel of selections) {
			if (!sel.fsPath) {
				continue;
			}

			const normalized = PathNormalizer.normalize(
				path.resolve(sel.fsPath),
			);
			const key =
				process.platform === "win32"
					? normalized.toLowerCase()
					: normalized;

			if (seen.has(key)) {
				continue;
			}
			seen.add(key);

			try {
				const stat = await fs.promises.stat(normalized);
				resolved.push({
					fsPath: normalized,
					isDirectory: stat.isDirectory(),
				});
			} catch (err) {
				this.logger.warn(`Could not access path "${normalized}":`, err);
			}
		}

		return resolved;
	}

	/**
	 * Prunes selections that are inside another selected directory.
	 * For example, if both "src" and "src/core" (or "src/index.ts") are selected,
	 * only "src" is retained.
	 */
	public pruneOverlappingSelections(
		items: Array<{ fsPath: string; isDirectory: boolean }>,
	): Array<{ fsPath: string; isDirectory: boolean }> {
		// Separate directories and files
		const directories = items
			.filter((i) => i.isDirectory)
			.map((d) => d.fsPath);

		const pruned: Array<{ fsPath: string; isDirectory: boolean }> = [];

		for (const item of items) {
			const itemPath = item.fsPath;
			const itemLower = itemPath.toLowerCase();

			// Check if this item is enclosed by ANY directory in the list (that is not itself)
			const isEnclosed = directories.some((dirPath) => {
				if (dirPath.toLowerCase() === itemLower) {
					return false; // Don't check against self
				}
				const dirPrefix = dirPath.endsWith("/")
					? dirPath.toLowerCase()
					: dirPath.toLowerCase() + "/";
				return itemLower.startsWith(dirPrefix);
			});

			if (!isEnclosed) {
				pruned.push(item);
			}
		}

		return pruned;
	}

	/**
	 * Traverses a single file or directory recursively.
	 */
	private async traversePath(
		targetPath: string,
		isDirectory: boolean,
		workspaceRoot: string,
		discovered: Map<string, FileEntry>,
		ignoredDirs: Set<string>,
		cancellationToken?: ICancellationToken,
	): Promise<void> {
		if (cancellationToken?.isCancellationRequested) {
			return;
		}

		if (!isDirectory) {
			try {
				const stat = await fs.promises.stat(targetPath);
				this.addFileEntry(
					targetPath,
					stat.size,
					workspaceRoot,
					discovered,
				);
			} catch (err) {
				this.logger.warn(`Failed to stat file "${targetPath}":`, err);
			}
			return;
		}

		// Directory traversal
		try {
			const entries = await fs.promises.readdir(targetPath, {
				withFileTypes: true,
			});

			for (const entry of entries) {
				if (cancellationToken?.isCancellationRequested) {
					break;
				}

				const fullPath = PathNormalizer.normalize(
					path.join(targetPath, entry.name),
				);

				if (entry.isDirectory()) {
					if (ignoredDirs.has(entry.name)) {
						continue;
					}
					await this.traversePath(
						fullPath,
						true,
						workspaceRoot,
						discovered,
						ignoredDirs,
						cancellationToken,
					);
				} else if (entry.isFile()) {
					try {
						const stat = await fs.promises.stat(fullPath);
						this.addFileEntry(
							fullPath,
							stat.size,
							workspaceRoot,
							discovered,
						);
					} catch (err) {
						this.logger.warn(
							`Failed to stat file "${fullPath}":`,
							err,
						);
					}
				}
			}
		} catch (err) {
			this.logger.warn(`Failed to read directory "${targetPath}":`, err);
		}
	}

	private addFileEntry(
		absolutePath: string,
		size: number,
		workspaceRoot: string,
		discovered: Map<string, FileEntry>,
	): void {
		const key =
			process.platform === "win32"
				? absolutePath.toLowerCase()
				: absolutePath;
		if (discovered.has(key)) {
			return;
		}

		const relativePath = workspaceRoot
			? PathNormalizer.relative(workspaceRoot, absolutePath)
			: PathNormalizer.basename(absolutePath);

		const name = PathNormalizer.basename(absolutePath);
		const extension = PathNormalizer.extension(absolutePath);

		discovered.set(key, {
			absolutePath,
			relativePath,
			displayPath: relativePath,
			name,
			extension,
			size,
			isDirectory: false,
		});
	}
}
