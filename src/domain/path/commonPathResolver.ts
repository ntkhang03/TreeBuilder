import { PathNormalizer } from "./pathNormalizer";

export interface CommonPathResult {
	/**
	 * The shared directory prefix identified (e.g. "src/components" or "").
	 */
	commonPrefix: string;

	/**
	 * Map of original path -> stripped path.
	 */
	strippedPaths: Map<string, string>;
}

export class CommonPathResolver {
	/**
	 * Calculates the longest common directory path segment across all given relative paths,
	 * and returns paths with that common parent stripped.
	 *
	 * @param paths List of normalized paths (e.g. ["src/components/Button.tsx", "src/components/Input.tsx"])
	 * @returns CommonPathResult containing common prefix and mapped paths.
	 */
	public static resolve(paths: string[]): CommonPathResult {
		const strippedPaths = new Map<string, string>();

		if (!paths || paths.length === 0) {
			return { commonPrefix: "", strippedPaths };
		}

		const normalizedPaths = paths.map((p) => PathNormalizer.normalize(p));

		if (normalizedPaths.length === 1) {
			const singlePath = normalizedPaths[0];
			const dir = PathNormalizer.dirname(singlePath);
			const commonPrefix = dir === "." || dir === "/" ? "" : dir;
			const stripped = commonPrefix
				? singlePath.slice(commonPrefix.length + 1)
				: singlePath;
			strippedPaths.set(paths[0], stripped);
			return { commonPrefix, strippedPaths };
		}

		// Split each path into directory segments (excluding the file name itself)
		const segmentMatrix: string[][] = normalizedPaths.map((p) => {
			const dir = PathNormalizer.dirname(p);
			if (dir === "." || dir === "/" || !dir) {
				return [];
			}
			return dir.split("/").filter(Boolean);
		});

		// Find common segments from the left
		const minSegments = Math.min(...segmentMatrix.map((s) => s.length));
		const commonSegments: string[] = [];

		for (let i = 0; i < minSegments; i++) {
			const currentSegment = segmentMatrix[0][i];
			// Check case-insensitive equality across all paths
			const allMatch = segmentMatrix.every(
				(segments) =>
					segments[i].toLowerCase() === currentSegment.toLowerCase(),
			);

			if (allMatch) {
				commonSegments.push(currentSegment);
			} else {
				break;
			}
		}

		const commonPrefix = commonSegments.join("/");

		// Strip prefix for each path
		for (let i = 0; i < paths.length; i++) {
			const original = paths[i];
			const norm = normalizedPaths[i];

			if (
				commonPrefix &&
				norm.toLowerCase().startsWith(commonPrefix.toLowerCase() + "/")
			) {
				const stripped = norm.slice(commonPrefix.length + 1);
				strippedPaths.set(original, stripped);
			} else if (
				commonPrefix &&
				norm.toLowerCase() === commonPrefix.toLowerCase()
			) {
				strippedPaths.set(original, PathNormalizer.basename(norm));
			} else {
				strippedPaths.set(original, norm);
			}
		}

		return { commonPrefix, strippedPaths };
	}
}
