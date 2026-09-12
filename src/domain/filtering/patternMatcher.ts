import picomatch from "picomatch";
import { PathNormalizer } from "../path/pathNormalizer";

export class PatternMatcher {
	private readonly matchers: Array<(path: string) => boolean>;

	constructor(
		patterns: string[],
		options: { dot?: boolean; nocase?: boolean } = {},
	) {
		const validPatterns = patterns
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
			.map((p) => PathNormalizer.normalize(p));

		this.matchers = validPatterns.map((pattern) => {
			return picomatch(pattern, {
				dot: options.dot ?? true,
				nocase: options.nocase ?? process.platform === "win32",
				bash: true,
			});
		});
	}

	/**
	 * Returns true if the path matches any pattern in this matcher.
	 */
	public matches(filePath: string): boolean {
		if (this.matchers.length === 0) {
			return false;
		}
		const normalized = PathNormalizer.normalize(filePath);
		return this.matchers.some((matcher) => matcher(normalized));
	}

	/**
	 * Number of valid compiled patterns.
	 */
	public get count(): number {
		return this.matchers.length;
	}
}
