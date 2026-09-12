# Tree Builder

<p align="center">
  <strong>Transform selected files and folders into structured, customizable context packages for AI prompts, code reviews, and documentation.</strong>
</p>

---

## Overview

**Tree Builder** is a fast, lightweight, and modern VS Code extension designed to assemble codebase context effortlessly. Instead of manually copying paths, drawing file trees, or pasting multiple snippets one by one, Tree Builder allows you to right-click any combination of files or directories and turn them into a clean, structured context package.

Whether you need to ask an LLM for advice on a refactoring task, prepare a code review snapshot, or generate module documentation, Tree Builder handles the entire pipeline in milliseconds.

---

## Core Workflow

```text
User Selection (Explorer / Active Editor / Workspace)
                    ↓
           Selection Resolver
                    ↓
      File Discovery & Deduplication
                    ↓
         Include / Exclude Filter
                    ↓
    Path Normalization & Common Path Removal
                    ↓
        Deterministic Tree Generator
                    ↓
      Template Rendering & Variable Engine
                    ↓
          Output (Clipboard / Editor)
```

---

## Key Features

- **Multi-Resource Selection**: Run directly from the Explorer context menu, active editor tab, or Command Palette. Supports single files, single folders, multi-selected files, and combined file/folder selections.
- **Smart Deduplication & Overlap Pruning**: If you select both `src/` and `src/core/parser.ts`, Tree Builder automatically prunes the nested selection and scans each file exactly once.
- **Deterministic Tree Generation**: Generates clean, consistent Unicode (`├── `, `└── `, `│   `) or ASCII tree structures sorted with directories first and alphabetical ordering.
- **Common Path Removal**: Automatically detects and strips common ancestor folder paths (e.g. turning `project/src/components/Button.tsx` and `project/src/components/Input.tsx` into `Button.tsx` and `Input.tsx`).
- **Flexible Template System**: Fully customizable templates with robust variable substitution.
- **Live Template Manager UI**: Built-in Webview panel featuring template search, creation, editing, duplication, deletion, default assignment, and real-time live preview.
- **Binary & Large File Protection**:
    - Automatically identifies binary files by extension and byte analysis, inserting `[Binary file omitted]`.
    - Enforces a configurable `maxFileSize` threshold (default: 1 MB), inserting `[File omitted: exceeds maximum size]` to prevent UI freezes.
- **Dual Output Modes**:
    - **Clipboard**: Copies the formatted context directly to your clipboard.
    - **Editor**: Opens a new untitled Markdown document in VS Code containing the result.
- **Privacy First & Local**: Runs 100% locally on your machine. Zero telemetry, zero external network requests.

---

## Quick Start

1. **Install Extension**: Install Tree Builder from the VS Code Marketplace (or package as `.vsix`).
2. **Select Files**: In the VS Code File Explorer, right-click any file, folder, or multi-selection.
3. **Build Tree Context**:
    - Click **Tree Builder: Build Tree Context** (uses your default template).
    - Or click **Tree Builder: Build Tree Context with Template...** to pick a template on the fly.
4. **Paste or Inspect**:
    - If output is set to **Clipboard**, paste `Ctrl+V` (or `Cmd+V`) directly into your AI chat or prompt.
    - If output is set to **Editor**, review the generated Markdown document in a new tab.

---

## Commands

| Command                                               | Identifier                                | Description                                                             |
| ----------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| **Tree Builder: Build Tree Context**                  | `treeBuilder.generateContext`             | Generates context for current selection using the default template.     |
| **Tree Builder: Build Tree Context with Template...** | `treeBuilder.generateContextWithTemplate` | Prompts for a template and generates context for the current selection. |
| **Tree Builder: Manage Templates**                    | `treeBuilder.manageTemplates`             | Opens the interactive Template Manager panel.                           |

---

## Built-in Templates

Tree Builder includes 4 ready-to-use built-in templates:

1. **AI Context** _(Default)_:
    - Optimized for LLMs with repository structure and formatted Markdown code blocks.
    - Output: `Clipboard`.
2. **Code Review**:
    - Formatted for code reviews with file sizes, common paths stripped, and inspection sections.
    - Output: `Editor`.
3. **Project Tree Only**:
    - Fast structural overview without file contents (`renderContent: false`).
    - Output: `Clipboard`.
4. **Documentation**:
    - Clean Markdown format with metadata headers (date, workspace, total files).
    - Output: `Editor`.

> **Note**: Built-in templates are read-only to prevent accidental corruption. To customize a built-in template, simply click **Duplicate** in the Template Manager.

---

## Template Variables

Tree Builder supports placeholder variables in both the wrapper template and individual file templates:

### Wrapper Template Variables

| Variable            | Description                                          | Example                         |
| ------------------- | ---------------------------------------------------- | ------------------------------- |
| `{{tree}}`          | The formatted directory hierarchy tree.              | `└── src/\n    └── index.ts`    |
| `{{files}}`         | The concatenated output of all rendered file blocks. | _(All file templates combined)_ |
| `{{fileCount}}`     | Total number of files included.                      | `4`                             |
| `{{workspaceName}}` | Name of the active workspace folder.                 | `Tree Builder`                  |
| `{{date}}`          | Current date and timestamp.                          | `2026-09-12 15:30:00`           |

### Per-File Template Variables

| Variable           | Description                                  | Example                       |
| ------------------ | -------------------------------------------- | ----------------------------- |
| `{{path}}`         | Display path (respects common path removal). | `core/engine.ts`              |
| `{{relativePath}}` | Full workspace-relative path.                | `src/core/engine.ts`          |
| `{{fileName}}`     | File name with extension.                    | `engine.ts`                   |
| `{{extension}}`    | Lowercase file extension without dot.        | `ts`                          |
| `{{size}}`         | Human-readable file size.                    | `1.4 KB`                      |
| `{{content}}`      | Text content of the file or omission notice. | `export class Engine { ... }` |

---

## Configuration Settings

You can customize Tree Builder via VS Code Settings (`Ctrl+,` or `Cmd+,` searching for `Tree Builder`):

```json
{
	// ID of the default template used by 'Build Tree Context'
	"treeBuilder.defaultTemplate": "ai-context",

	// Maximum file size in bytes to include (default 1MB)
	"treeBuilder.maxFileSize": 1048576,

	// Always prompt for template selection even if a default is set
	"treeBuilder.promptForTemplate": false,

	// Output channel logging verbosity: 'debug', 'info', 'warn', 'error'
	"treeBuilder.logLevel": "info"
}
```

---

## Development & Testing

### Prerequisites

- Node.js >= 20.0.0
- npm >= 9.0.0

### Setup

```bash
git clone <repo-url>
cd tree-builder
npm install
```

### Build

```bash
# Production bundle
npm run build

# Watch mode during development
npm run watch
```

### Run Unit Tests

```bash
# Compile and run test suite with Node's native test runner
npm run test:run
```

### Type Checking & Linting

```bash
npm run lint
```

---

## Packaging

To package Tree Builder into a standalone `.vsix` file:

```bash
npx @vscode/vsce package --no-dependencies
```

---

## License

MIT License. Copyright (c) Tree Builder Contributors.
