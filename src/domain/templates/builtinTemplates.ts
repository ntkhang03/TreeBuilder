import { Template } from "../models/template";

export const BUILTIN_TEMPLATES: Template[] = [
	{
		id: "ai-context",
		name: "AI Context",
		description:
			"Optimized package for LLM prompts, containing project tree and markdown code blocks.",
		isBuiltIn: true,
		wrapperTemplate: `# Project Structure
\`\`\`
{{tree}}
\`\`\`

# Files ({{fileCount}})

{{files}}`,
		fileTemplate: `---
## {{path}}
\`\`\`{{extension}}
{{content}}
\`\`\``,
		include: [],
		exclude: [
			"**/node_modules/**",
			"**/.git/**",
			"**/dist/**",
			"**/build/**",
			"**/.vscode/**",
			"**/*.lock",
			"**/package-lock.json",
		],
		renderContent: true,
		removeCommonPath: false,
		outputType: "clipboard",
	},
	{
		id: "code-review",
		name: "Code Review",
		description:
			"Formatted for reviewing code changes with file sizes and common path stripped.",
		isBuiltIn: true,
		wrapperTemplate: `# Code Review Context
Generated: {{date}} | Total Files: {{fileCount}}

## Structure
\`\`\`
{{tree}}
\`\`\`

## Code Inspection

{{files}}`,
		fileTemplate: `### File: \`{{path}}\` ({{size}})
\`\`\`{{extension}}
{{content}}
\`\`\``,
		include: [],
		exclude: [
			"**/node_modules/**",
			"**/.git/**",
			"**/dist/**",
			"**/build/**",
			"**/*.min.*",
			"**/*.map",
		],
		renderContent: true,
		removeCommonPath: true,
		outputType: "editor",
	},
	{
		id: "project-tree",
		name: "Project Tree Only",
		description:
			"Exports the file and directory hierarchy only without file contents.",
		isBuiltIn: true,
		wrapperTemplate: `Project Structure:

{{tree}}`,
		fileTemplate: "",
		include: [],
		exclude: [
			"**/node_modules/**",
			"**/.git/**",
			"**/dist/**",
			"**/build/**",
		],
		renderContent: false,
		removeCommonPath: false,
		outputType: "clipboard",
	},
	{
		id: "documentation",
		name: "Documentation",
		description:
			"Export source code formatted cleanly for technical documentation.",
		isBuiltIn: true,
		wrapperTemplate: `# Module Documentation

**Workspace:** {{workspaceName}}  
**Export Date:** {{date}}  
**Total Files:** {{fileCount}}  

## Architecture Overview
\`\`\`
{{tree}}
\`\`\`

## Module Sources

{{files}}`,
		fileTemplate: `### \`{{path}}\`

\`\`\`{{extension}}
{{content}}
\`\`\``,
		include: [],
		exclude: [
			"**/node_modules/**",
			"**/.git/**",
			"**/dist/**",
			"**/*.test.*",
			"**/*.spec.*",
		],
		renderContent: true,
		removeCommonPath: true,
		outputType: "editor",
	},
];
