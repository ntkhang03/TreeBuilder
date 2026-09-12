export interface OutputMetadata {
	fileCount: number;
	totalSize: number;
	templateName: string;
}

export interface IOutputHandler {
	handle(content: string, metadata?: OutputMetadata): Promise<void>;
}
