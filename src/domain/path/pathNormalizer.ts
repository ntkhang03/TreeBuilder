/**
 * Pure cross-platform path normalization utility.
 * Guarantees consistent POSIX-style forward slashes across Windows, macOS, and Linux.
 */
export class PathNormalizer {
	/**
	 * Normalizes any file or directory path string to use POSIX forward slashes,
	 * collapsing redundant slashes and removing leading './'.
	 */
	public static normalize(pathStr: string): string {
		if (!pathStr || pathStr.trim().length === 0) {
			return "";
		}

		// Replace all Windows backslashes with forward slashes
		let normalized = pathStr.replace(/\\/g, "/");

		// Remove leading './'
		if (normalized.startsWith("./")) {
			normalized = normalized.slice(2);
		}

		// Collapse multiple consecutive slashes, preserving leading double slash if UNC
		const isUNC = normalized.startsWith("//");
		normalized = normalized.replace(/\/{2,}/g, "/");
		if (isUNC) {
			normalized = "/" + normalized;
		}

		// Remove trailing slash if length > 1
		if (normalized.length > 1 && normalized.endsWith("/")) {
			normalized = normalized.slice(0, -1);
		}

		return normalized;
	}

	/**
	 * Computes a normalized relative path from a base directory to a target path.
	 */
	public static relative(baseDir: string, targetPath: string): string {
		const normBase = this.normalize(baseDir).toLowerCase();
		const normTarget = this.normalize(targetPath);
		const normTargetLower = normTarget.toLowerCase();

		// If target starts with base, slice it off
		if (normTargetLower === normBase) {
			return "";
		}

		const prefixWithSlash = normBase.endsWith("/")
			? normBase
			: normBase + "/";
		if (normTargetLower.startsWith(prefixWithSlash)) {
			return normTarget.slice(prefixWithSlash.length);
		}

		// Fallback: tokenize and compute common prefix segments
		const baseSegments = this.normalize(baseDir).split("/").filter(Boolean);
		const targetSegments = normTarget.split("/").filter(Boolean);

		let commonIndex = 0;
		while (
			commonIndex < baseSegments.length &&
			commonIndex < targetSegments.length &&
			baseSegments[commonIndex].toLowerCase() ===
				targetSegments[commonIndex].toLowerCase()
		) {
			commonIndex++;
		}

		if (commonIndex === 0) {
			return normTarget;
		}

		const upSegments = new Array(baseSegments.length - commonIndex).fill(
			"..",
		);
		const remainingTargetSegments = targetSegments.slice(commonIndex);

		return [...upSegments, ...remainingTargetSegments].join("/");
	}

	/**
	 * Extracts the base filename with extension from a path.
	 */
	public static basename(pathStr: string): string {
		const norm = this.normalize(pathStr);
		const idx = norm.lastIndexOf("/");
		return idx === -1 ? norm : norm.slice(idx + 1);
	}

	/**
	 * Extracts the extension without the leading dot.
	 */
	public static extension(pathStr: string): string {
		const name = this.basename(pathStr);
		const idx = name.lastIndexOf(".");
		if (idx <= 0) {
			return "";
		}
		return name.slice(idx + 1).toLowerCase();
	}

	/**
	 * Returns directory path containing the file.
	 */
	public static dirname(pathStr: string): string {
		const norm = this.normalize(pathStr);
		const idx = norm.lastIndexOf("/");
		if (idx === -1) {
			return ".";
		}
		if (idx === 0) {
			return "/";
		}
		return norm.slice(0, idx);
	}
}
