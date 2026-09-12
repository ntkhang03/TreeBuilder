import { FileEntry } from "../models/selection";
import { PatternMatcher } from "./patternMatcher";

export interface FilterOptions {
	include?: string[];
	exclude?: string[];
	caseSensitive?: boolean;
}

export class FileFilter {
	private readonly includeMatcher: PatternMatcher;
	private readonly excludeMatcher: PatternMatcher;

	constructor(options: FilterOptions) {
		const nocase = !(options.caseSensitive ?? false);
		this.includeMatcher = new PatternMatcher(options.include || [], {
			nocase,
		});
		this.excludeMatcher = new PatternMatcher(options.exclude || [], {
			nocase,
		});
	}

	/**
	 * Evaluates if a given path should be included according to filtering rules:
	 * 1. Exclude takes absolute precedence: if matched by any exclude pattern, returns false.
	 * 2. If include patterns are defined, path must match at least one include pattern.
	 * 3. If no include patterns are defined, path is accepted (returns true).
	 */
	public isIncluded(relativePath: string): boolean {
		if (this.excludeMatcher.matches(relativePath)) {
			return false;
		}

		if (this.includeMatcher.count > 0) {
			return this.includeMatcher.matches(relativePath);
		}

		return true;
	}

	/**
	 * Filters an array of FileEntry objects, returning only those that pass the filter.
	 */
	public filterFiles(files: FileEntry[]): FileEntry[] {
		return files.filter((file) => this.isIncluded(file.relativePath));
	}
}
