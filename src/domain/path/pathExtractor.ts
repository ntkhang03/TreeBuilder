import * as fs from "fs";
import * as path from "path";
import { PathNormalizer } from "./pathNormalizer";

export interface ExtractedPathsResult {
	paths: string[];
	workspaceRoot: string;
}

export class PathExtractor {
	/**
	 * Extracts and resolves file/folder paths from arbitrary selected text.
	 * Handles markdown backticks, quotes, bullet points, and multi-line path lists.
	 *
	 * @param text The highlighted text from the editor.
	 * @param baseDir Optional directory to resolve relative paths against (e.g. active document directory or workspace).
	 */
	public static extractPaths(
		text: string,
		baseDir?: string,
	): ExtractedPathsResult {
		if (!text || text.trim().length === 0) {
			return { paths: [], workspaceRoot: "" };
		}

		let cleaned = text.trim();

		// 1. Strip markdown code block fences if present
		if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
			cleaned = cleaned
				.replace(/^```[a-zA-Z0-9_-]*\r?\n?/, "")
				.replace(/\r?\n?```$/, "");
		}

		// 2. Strip surrounding single/double backticks wrapping the whole text block
		if (
			cleaned.startsWith("`") &&
			cleaned.endsWith("`") &&
			cleaned.length > 1
		) {
			cleaned = cleaned.slice(1, -1);
		}

		// 3. Extract individual candidate lines
		const lines = cleaned.split(/\r?\n/);
		const candidates: string[] = [];

		for (let line of lines) {
			line = line.trim();
			if (!line) {
				continue;
			}

			// Strip markdown list markers: "- ", "* ", "+ ", "1. ", "> "
			line = line
				.replace(/^(\s*[-*+]\s+|\s*\d+\.\s+|\s*>\s*)/, "")
				.trim();

			// Strip quotes or backticks surrounding the individual path
			line = line.replace(/^[`"']+|[`"',;]+$/g, "").trim();

			if (!line) {
				continue;
			}

			// Skip code comments or markdown headers that are not paths
			if (
				line.startsWith("//") ||
				(line.startsWith("#") &&
					!line.includes("/") &&
					!line.includes("\\"))
			) {
				continue;
			}

			candidates.push(line);
		}

		if (candidates.length === 0) {
			return { paths: [], workspaceRoot: "" };
		}

		// 4. Resolve each candidate to absolute normalized path
		const resolvedPaths: string[] = [];
		const seen = new Set<string>();

		for (const raw of candidates) {
			let candidateResolved: string | null = null;

			const isAbsolute =
				path.isAbsolute(raw) ||
				/^[a-zA-Z]:[\\/]/.test(raw) ||
				raw.startsWith("/") ||
				raw.startsWith("\\\\");

			if (isAbsolute) {
				const norm = PathNormalizer.normalize(raw);
				if (fs.existsSync(norm)) {
					candidateResolved = norm;
				} else if (norm.includes("/") || norm.includes("\\")) {
					// Even if not immediately stat-able, if it has path structure, keep it
					candidateResolved = norm;
				}
			} else {
				// Relative path: resolve against baseDir first
				if (baseDir) {
					const againstBase = PathNormalizer.normalize(
						path.resolve(baseDir, raw),
					);
					if (fs.existsSync(againstBase)) {
						candidateResolved = againstBase;
					}
				}

				// Try against current process working directory
				if (!candidateResolved) {
					const againstCwd = PathNormalizer.normalize(
						path.resolve(process.cwd(), raw),
					);
					if (fs.existsSync(againstCwd)) {
						candidateResolved = againstCwd;
					}
				}

				// If not found on disk, but has path separators or file extension, resolve against baseDir or cwd
				if (
					!candidateResolved &&
					(raw.includes("/") ||
						raw.includes("\\") ||
						/\.[a-zA-Z0-9]+$/.test(raw))
				) {
					const fallbackBase = baseDir || process.cwd();
					candidateResolved = PathNormalizer.normalize(
						path.resolve(fallbackBase, raw),
					);
				}
			}

			if (candidateResolved) {
				const key =
					process.platform === "win32"
						? candidateResolved.toLowerCase()
						: candidateResolved;
				if (!seen.has(key)) {
					seen.add(key);
					resolvedPaths.push(candidateResolved);
				}
			}
		}

		if (resolvedPaths.length === 0) {
			return { paths: [], workspaceRoot: "" };
		}

		// 5. Calculate appropriate workspaceRoot for the resolved paths
		const workspaceRoot = this.calculateWorkspaceRoot(resolvedPaths);

		return {
			paths: resolvedPaths,
			workspaceRoot,
		};
	}

	/**
	 * Computes the common root directory for a list of resolved paths.
	 */
	private static calculateWorkspaceRoot(paths: string[]): string {
		if (paths.length === 0) {
			return "";
		}

		if (paths.length === 1) {
			const p = paths[0];
			try {
				const stat = fs.statSync(p);
				return stat.isDirectory() ? p : PathNormalizer.dirname(p);
			} catch {
				return PathNormalizer.dirname(p);
			}
		}

		// Multiple paths: determine directory for each path
		const dirSegmentsList: string[][] = paths.map((p) => {
			let dir = p;
			try {
				const stat = fs.statSync(p);
				dir = stat.isDirectory() ? p : PathNormalizer.dirname(p);
			} catch {
				dir = PathNormalizer.dirname(p);
			}
			return PathNormalizer.normalize(dir).split("/").filter(Boolean);
		});

		const minLen = Math.min(...dirSegmentsList.map((s) => s.length));
		const commonSegments: string[] = [];

		for (let i = 0; i < minLen; i++) {
			const seg = dirSegmentsList[0][i];
			const allMatch = dirSegmentsList.every((segments) =>
				process.platform === "win32"
					? segments[i].toLowerCase() === seg.toLowerCase()
					: segments[i] === seg,
			);

			if (allMatch) {
				commonSegments.push(seg);
			} else {
				break;
			}
		}

		let commonRoot = commonSegments.join("/");
		if (paths[0].startsWith("/") && !commonRoot.startsWith("/")) {
			commonRoot = "/" + commonRoot;
		}

		return PathNormalizer.normalize(commonRoot);
	}
}
