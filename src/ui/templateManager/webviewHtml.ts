export function getWebviewHtml(nonce: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}' 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tree Builder - Template Manager</title>
  <style nonce="${nonce}">
    :root {
      --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      scrollbar-width: thin;
      scrollbar-color: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.35)) transparent;
    }
    /* Compact, sleek scrollbars */
    ::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.35));
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, rgba(100, 100, 100, 0.6));
    }
    ::-webkit-scrollbar-thumb:active {
      background: var(--vscode-scrollbarSlider-activeBackground, rgba(85, 85, 85, 0.8));
    }
    ::-webkit-scrollbar-corner {
      background: transparent;
    }
    body {
      font-family: var(--font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      display: flex;
      height: 100vh;
      overflow: hidden;
      font-size: 13px;
    }
    /* Layout */
    .sidebar {
      width: 280px;
      min-width: 240px;
      border-right: 1px solid var(--vscode-widget-border, #333);
      display: flex;
      flex-direction: column;
      background-color: var(--vscode-sideBar-background, #1e1e1e);
    }
    .sidebar-header {
      padding: 12px;
      border-bottom: 1px solid var(--vscode-widget-border, #333);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sidebar-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-sideBarTitle-foreground, #ccc);
    }
    .search-box {
      width: 100%;
      padding: 7px 10px;
      background: var(--vscode-input-background, #252526);
      color: var(--vscode-input-foreground, #ccc);
      border: 1px solid var(--vscode-input-border, #3c3c3c);
      border-radius: 6px;
      outline: none;
      font-size: 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .search-box:focus {
      border-color: var(--vscode-focusBorder, #007acc);
      box-shadow: 0 0 0 1px var(--vscode-focusBorder, #007acc);
    }
    .sidebar-actions {
      display: flex;
      gap: 6px;
    }
    .template-list {
      flex: 1;
      overflow-y: auto;
      list-style: none;
    }
    .template-item {
      padding: 10px 12px;
      cursor: pointer;
      border-left: 3px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-bottom: 1px solid var(--vscode-widget-border, #2a2a2a);
    }
    .template-item:hover {
      background-color: var(--vscode-list-hoverBackground, #2a2d2e);
    }
    .template-item.active {
      background-color: var(--vscode-list-activeSelectionBackground, #094771);
      color: var(--vscode-list-activeSelectionForeground, #fff);
      border-left-color: var(--vscode-focusBorder, #007acc);
    }
    .template-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .template-name {
      font-weight: 600;
      font-size: 13px;
    }
    .template-badge-group {
      display: flex;
      gap: 4px;
    }
    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .badge-builtin {
      background: var(--vscode-badge-background, #4d4d4d);
      color: var(--vscode-badge-foreground, #fff);
    }
    .badge-default {
      background: var(--vscode-statusBarItem-prominentBackground, #007acc);
      color: #fff;
    }
    .template-desc {
      font-size: 11px;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Main Content */
    .main-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .top-toolbar {
      padding: 10px 16px;
      border-bottom: 1px solid var(--vscode-widget-border, #333);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--vscode-editor-background);
    }
    .toolbar-title {
      font-size: 16px;
      font-weight: 600;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 5px;
      border: 1px solid transparent;
      outline: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background-color 0.15s ease, opacity 0.15s ease;
    }
    .btn-primary {
      background: var(--vscode-button-background, #007acc);
      color: var(--vscode-button-foreground, #fff);
    }
    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground, #0062a3);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #fff);
    }
    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground, #45494e);
    }
    .btn-danger {
      background: #c72e2e;
      color: #fff;
    }
    .btn-danger:hover {
      background: #a82424;
    }
    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    /* Content Columns: Editor & Preview */
    .columns-container {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .editor-column {
      flex: 1.1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-right: 1px solid var(--vscode-widget-border, #333);
    }
    .preview-column {
      flex: 0.9;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--vscode-editor-background);
    }
    .preview-header {
      padding: 10px 16px;
      border-bottom: 1px solid var(--vscode-widget-border, #333);
      font-weight: 600;
      font-size: 13px;
      background: var(--vscode-sideBar-background, #252526);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .preview-body {
      flex: 1;
      padding: 14px;
      overflow: auto;
      font-family: var(--vscode-editor-font-family, 'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace);
      font-size: 12px;
      line-height: 1.55;
      tab-size: 2;
      white-space: pre-wrap;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    /* Form elements */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .form-row .form-group {
      flex: 1;
    }
    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }
    .preset-select {
      padding: 3px 6px;
      font-size: 11px;
      background: var(--vscode-dropdown-background, #252526);
      color: var(--vscode-dropdown-foreground, #ccc);
      border: 1px solid var(--vscode-dropdown-border, #3c3c3c);
      border-radius: 4px;
      outline: none;
      cursor: pointer;
      max-width: 170px;
    }
    .preset-select:focus {
      border-color: var(--vscode-focusBorder, #007acc);
    }
    .preset-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    label {
      font-weight: 500;
      font-size: 12px;
      color: var(--vscode-foreground);
    }
    .help-text {
      font-size: 11px;
      opacity: 0.7;
    }
    input[type="text"], select, textarea {
      padding: 7px 10px;
      background: var(--vscode-input-background, #252526);
      color: var(--vscode-input-foreground, #ccc);
      border: 1px solid var(--vscode-input-border, #3c3c3c);
      border-radius: 6px;
      font-family: inherit;
      font-size: 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    textarea {
      font-family: var(--vscode-editor-font-family, 'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace);
      font-size: 12px;
      line-height: 1.55;
      tab-size: 2;
      resize: vertical;
      padding: 8px 10px;
    }
    textarea:disabled, input[type="text"]:disabled, select:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--vscode-focusBorder, #007acc);
      box-shadow: 0 0 0 1px var(--vscode-focusBorder, #007acc);
      outline: none;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .checkbox-row input[type="checkbox"] {
      cursor: pointer;
    }
    /* Notification / Error alert */
    .alert-banner {
      padding: 8px 12px;
      border-radius: 3px;
      margin-bottom: 12px;
      display: none;
      font-size: 12px;
    }
    .alert-banner.error {
      display: block;
      background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
      color: #fff;
    }
    .alert-banner.success {
      display: block;
      background: #1e4620;
      border: 1px solid #2e7d32;
      color: #a5d6a7;
    }
    .read-only-banner {
      padding: 8px 12px;
      background: var(--vscode-badge-background, #333);
      color: var(--vscode-badge-foreground, #fff);
      border-radius: 3px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

  <!-- Left Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">Templates</div>
      <input type="text" id="searchBox" class="search-box" placeholder="Search templates...">
      <div class="sidebar-actions">
        <button type="button" id="btnNewTemplate" class="btn btn-primary" style="width: 100%;">+ New Template</button>
      </div>
    </div>
    <ul id="templateList" class="template-list">
      <!-- Injected via JavaScript -->
    </ul>
  </aside>

  <!-- Main Content Area -->
  <main class="main-pane">
    <header class="top-toolbar">
      <div class="toolbar-title" id="activeTemplateTitle">Select a template</div>
      <div class="toolbar-actions">
        <button type="button" id="btnSetDefault" class="btn btn-secondary">Set as Default</button>
        <button type="button" id="btnDuplicate" class="btn btn-secondary">Duplicate</button>
        <button type="button" id="btnSave" class="btn btn-primary">Save Changes</button>
        <button type="button" id="btnDelete" class="btn btn-danger">Delete</button>
      </div>
    </header>

    <div class="columns-container">
      <!-- Editor Column -->
      <section class="editor-column">
        <div id="alertBanner" class="alert-banner"></div>
        <div id="readOnlyBanner" class="read-only-banner" style="display: none;">
          <span>This is a built-in template (read-only). Duplicate it to make custom changes.</span>
          <button type="button" id="btnDuplicateFromBanner" class="btn btn-secondary" style="padding: 2px 8px; font-size: 11px;">Duplicate</button>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label for="inputName">Template Name *</label>
            <input type="text" id="inputName" placeholder="e.g. AI Prompt Context">
          </div>
          <div class="form-group" style="flex: 1;">
            <label for="selectOutputType">Output Target</label>
            <select id="selectOutputType">
              <option value="clipboard">Clipboard</option>
              <option value="editor">Editor (New Tab)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="inputDescription">Description</label>
          <input type="text" id="inputDescription" placeholder="Brief note about the purpose of this template">
        </div>

        <div class="form-row">
          <div class="form-group">
            <div class="checkbox-row">
              <input type="checkbox" id="checkRenderContent">
              <label for="checkRenderContent">Render File Contents</label>
            </div>
            <span class="help-text">Include full content for each file. If disabled, only tree is generated.</span>
          </div>

          <div class="form-group">
            <div class="checkbox-row">
              <input type="checkbox" id="checkRemoveCommonPath">
              <label for="checkRemoveCommonPath">Remove Common Path</label>
            </div>
            <span class="help-text">Strips redundant common root directory from file paths.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="inputInclude">Include Patterns (glob, one per line)</label>
            <textarea id="inputInclude" rows="6" placeholder="**/*.ts&#10;**/*.tsx"></textarea>
            <span class="help-text">Leave empty to include all files (not excluded).</span>
          </div>
          <div class="form-group">
            <div class="" style="display: block;">
              <label for="inputExclude">Exclude Patterns (glob, one per line)</label>
              <select id="selectExcludePreset" class="preset-select" title="Quick add common exclude patterns" style="margin-top: 5px;">
                <option value="" disabled selected>+ Add Preset...</option>
                <option value="common">General / IDE (.git, .vscode...)</option>
                <option value="node">Node.js / JS / TS</option>
                <option value="python">Python</option>
                <option value="java">Java / Kotlin</option>
                <option value="dotnet">C# / .NET</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="cpp">C / C++</option>
                <option value="php">PHP</option>
              </select>
            </div>
            <textarea id="inputExclude" rows="6" placeholder="**/node_modules/**&#10;**/dist/**&#10;**/.git/**"></textarea>
          </div>
        </div>

        <div class="form-group">
          <label for="inputWrapperTemplate">Wrapper Template</label>
          <textarea id="inputWrapperTemplate" rows="7" placeholder="Project Structure:&#10;&#10;{{tree}}&#10;&#10;Files:&#10;&#10;{{files}}"></textarea>
          <span class="help-text">Available variables: <code>{{tree}}</code>, <code>{{files}}</code>, <code>{{workspaceName}}</code>, <code>{{date}}</code>, <code>{{fileCount}}</code></span>
        </div>

        <div class="form-group" id="fileTemplateGroup">
          <label for="inputFileTemplate">Per-File Template</label>
          <textarea id="inputFileTemplate" rows="5" placeholder="--- {{path}} ---&#10;{{content}}"></textarea>
          <span class="help-text">Available variables: <code>{{path}}</code>, <code>{{relativePath}}</code>, <code>{{fileName}}</code>, <code>{{extension}}</code>, <code>{{size}}</code>, <code>{{content}}</code></span>
        </div>
      </section>

      <!-- Live Preview Column -->
      <section class="preview-column">
        <div class="preview-header">
          <span>Real-time Preview</span>
          <span class="help-text">Simulated sample files</span>
        </div>
        <pre id="previewBody" class="preview-body">Loading preview...</pre>
      </section>
    </div>
  </main>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    // Preset patterns by language / ecosystem
    const EXCLUDE_PRESETS = {
      common: ['**/.git/**', '**/.vscode/**', '**/.idea/**', '**/.DS_Store', '**/Thumbs.db'],
      node: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/.nuxt/**', '**/coverage/**', '**/*.log'],
      python: ['**/__pycache__/**', '**/venv/**', '**/.venv/**', '**/env/**', '**/.env/**', '**/*.pyc', '**/*.pyo', '**/.pytest_cache/**'],
      java: ['**/target/**', '**/build/**', '**/*.class', '**/.gradle/**', '**/.settings/**', '**/.project/**', '**/*.jar', '**/*.war'],
      dotnet: ['**/bin/**', '**/obj/**', '**/.vs/**', '**/*.user', '**/*.suo'],
      go: ['**/bin/**', '**/vendor/**'],
      rust: ['**/target/**', '**/*.rs.bk'],
      cpp: ['**/build/**', '**/bin/**', '**/obj/**', '**/*.o', '**/*.obj', '**/*.exe', '**/*.so', '**/*.dylib'],
      php: ['**/vendor/**', '**/.phpunit.cache/**', '**/*.phar']
    };

    let allTemplates = [];
    let defaultTemplateId = '';
    let currentTemplate = null;
    let previewDebounceTimer = null;

    // Elements
    const searchBox = document.getElementById('searchBox');
    const templateList = document.getElementById('templateList');
    const btnNewTemplate = document.getElementById('btnNewTemplate');
    const activeTemplateTitle = document.getElementById('activeTemplateTitle');
    const btnSetDefault = document.getElementById('btnSetDefault');
    const btnDuplicate = document.getElementById('btnDuplicate');
    const btnDelete = document.getElementById('btnDelete');
    const btnSave = document.getElementById('btnSave');
    const btnDuplicateFromBanner = document.getElementById('btnDuplicateFromBanner');
    const readOnlyBanner = document.getElementById('readOnlyBanner');
    const alertBanner = document.getElementById('alertBanner');

    const inputName = document.getElementById('inputName');
    const selectOutputType = document.getElementById('selectOutputType');
    const inputDescription = document.getElementById('inputDescription');
    const checkRenderContent = document.getElementById('checkRenderContent');
    const checkRemoveCommonPath = document.getElementById('checkRemoveCommonPath');
    const inputInclude = document.getElementById('inputInclude');
    const inputExclude = document.getElementById('inputExclude');
    const selectExcludePreset = document.getElementById('selectExcludePreset');
    const inputWrapperTemplate = document.getElementById('inputWrapperTemplate');
    const inputFileTemplate = document.getElementById('inputFileTemplate');
    const fileTemplateGroup = document.getElementById('fileTemplateGroup');
    const previewBody = document.getElementById('previewBody');

    // Handle incoming messages from Extension Host
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'init-data':
          allTemplates = message.payload.templates;
          defaultTemplateId = message.payload.defaultTemplateId;
          renderSidebar();
          if (allTemplates.length > 0) {
            selectTemplate(allTemplates[0].id);
          }
          break;

        case 'template-saved':
          allTemplates = message.payload.templates;
          showAlert('Template saved successfully!', 'success');
          renderSidebar();
          selectTemplate(message.payload.template.id);
          break;

        case 'template-deleted':
          allTemplates = message.payload.templates;
          defaultTemplateId = message.payload.defaultTemplateId;
          showAlert('Template deleted.', 'info');
          renderSidebar();
          if (allTemplates.length > 0) {
            selectTemplate(allTemplates[0].id);
          }
          break;

        case 'default-changed':
          defaultTemplateId = message.payload.defaultTemplateId;
          showAlert('Default template updated.', 'success');
          renderSidebar();
          updateToolbarButtons();
          break;

        case 'preview-result':
          previewBody.textContent = message.payload.previewText;
          break;

        case 'validation-error':
          const errs = message.payload.errors.map(e => e.message).join('\\n');
          showAlert(errs, 'error');
          break;

        case 'notification':
          showAlert(message.payload.message, message.payload.level);
          break;
      }
    });

    function showAlert(text, level) {
      alertBanner.textContent = text;
      alertBanner.className = 'alert-banner ' + (level === 'error' ? 'error' : 'success');
      alertBanner.style.display = 'block';
      setTimeout(() => {
        alertBanner.style.display = 'none';
      }, 5000);
    }

    function renderSidebar() {
      const filter = searchBox.value.trim().toLowerCase();
      templateList.innerHTML = '';

      const filtered = allTemplates.filter(t => 
        t.name.toLowerCase().includes(filter) || 
        (t.description && t.description.toLowerCase().includes(filter))
      );

      filtered.forEach((t) => {
        const li = document.createElement('li');
        li.className = 'template-item' + (currentTemplate && currentTemplate.id === t.id ? ' active' : '');
        li.onclick = () => selectTemplate(t.id);

        const header = document.createElement('div');
        header.className = 'template-item-header';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'template-name';
        nameSpan.textContent = t.name;
        header.appendChild(nameSpan);

        const badgeGroup = document.createElement('div');
        badgeGroup.className = 'template-badge-group';

        if (t.id === defaultTemplateId) {
          const defBadge = document.createElement('span');
          defBadge.className = 'badge badge-default';
          defBadge.textContent = 'Default';
          badgeGroup.appendChild(defBadge);
        }

        if (t.isBuiltIn) {
          const builtBadge = document.createElement('span');
          builtBadge.className = 'badge badge-builtin';
          builtBadge.textContent = 'Built-in';
          badgeGroup.appendChild(builtBadge);
        }

        header.appendChild(badgeGroup);
        li.appendChild(header);

        if (t.description) {
          const descSpan = document.createElement('span');
          descSpan.className = 'template-desc';
          descSpan.textContent = t.description;
          li.appendChild(descSpan);
        }

        templateList.appendChild(li);
      });
    }

    function selectTemplate(id) {
      const template = allTemplates.find(t => t.id === id);
      if (!template) return;

      currentTemplate = JSON.parse(JSON.stringify(template)); // Deep copy
      renderSidebar();
      populateForm(currentTemplate);
      updateToolbarButtons();
      requestPreview();
    }

    function populateForm(template) {
      activeTemplateTitle.textContent = template.name;
      inputName.value = template.name || '';
      inputDescription.value = template.description || '';
      selectOutputType.value = template.outputType || 'clipboard';
      checkRenderContent.checked = !!template.renderContent;
      checkRemoveCommonPath.checked = !!template.removeCommonPath;
      inputInclude.value = (template.include || []).join('\\n');
      inputExclude.value = (template.exclude || []).join('\\n');
      inputWrapperTemplate.value = template.wrapperTemplate || '';
      inputFileTemplate.value = template.fileTemplate || '';

      const isReadOnly = !!template.isBuiltIn;
      readOnlyBanner.style.display = isReadOnly ? 'flex' : 'none';

      inputName.disabled = isReadOnly;
      inputDescription.disabled = isReadOnly;
      selectOutputType.disabled = isReadOnly;
      checkRenderContent.disabled = isReadOnly;
      checkRemoveCommonPath.disabled = isReadOnly;
      inputInclude.disabled = isReadOnly;
      inputExclude.disabled = isReadOnly;
      selectExcludePreset.disabled = isReadOnly;
      inputWrapperTemplate.disabled = isReadOnly;
      inputFileTemplate.disabled = isReadOnly;
      btnSave.disabled = isReadOnly;
      btnDelete.disabled = isReadOnly;

      fileTemplateGroup.style.display = checkRenderContent.checked ? 'flex' : 'none';
      selectExcludePreset.value = '';
    }

    function updateToolbarButtons() {
      if (!currentTemplate) return;
      const isDefault = currentTemplate.id === defaultTemplateId;
      btnSetDefault.disabled = isDefault;
      btnSetDefault.textContent = isDefault ? 'Default Template' : 'Set as Default';
    }

    function getFormTemplateData() {
      if (!currentTemplate) return null;
      return {
        ...currentTemplate,
        name: inputName.value.trim(),
        description: inputDescription.value.trim(),
        outputType: selectOutputType.value,
        renderContent: checkRenderContent.checked,
        removeCommonPath: checkRemoveCommonPath.checked,
        include: inputInclude.value.split('\\n').map(s => s.trim()).filter(Boolean),
        exclude: inputExclude.value.split('\\n').map(s => s.trim()).filter(Boolean),
        wrapperTemplate: inputWrapperTemplate.value,
        fileTemplate: inputFileTemplate.value,
      };
    }

    function requestPreview() {
      if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
      previewDebounceTimer = setTimeout(() => {
        const formData = getFormTemplateData();
        if (formData) {
          vscode.postMessage({ type: 'request-preview', payload: formData });
        }
      }, 150);
    }

    function applyExcludePreset(presetKey) {
      const patterns = EXCLUDE_PRESETS[presetKey];
      if (!patterns || patterns.length === 0) return;

      const currentLines = inputExclude.value
        .split('\\n')
        .map(s => s.trim())
        .filter(Boolean);

      const newLines = [...currentLines];
      for (const pattern of patterns) {
        if (!newLines.includes(pattern)) {
          newLines.push(pattern);
        }
      }

      inputExclude.value = newLines.join('\\n');
      requestPreview();
    }

    // Input listeners for live preview & UI toggles
    [inputName, inputDescription, selectOutputType, inputInclude, inputExclude, inputWrapperTemplate, inputFileTemplate].forEach(el => {
      el.addEventListener('input', requestPreview);
    });

    selectExcludePreset.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected) {
        applyExcludePreset(selected);
        e.target.value = ''; // Reset select back to placeholder
      }
    });

    checkRenderContent.addEventListener('change', () => {
      fileTemplateGroup.style.display = checkRenderContent.checked ? 'flex' : 'none';
      requestPreview();
    });

    checkRemoveCommonPath.addEventListener('change', requestPreview);
    searchBox.addEventListener('input', renderSidebar);

    // Button actions
    btnSave.addEventListener('click', () => {
      const data = getFormTemplateData();
      if (data) {
        vscode.postMessage({ type: 'save-template', payload: data });
      }
    });

    btnDuplicate.addEventListener('click', () => {
      if (currentTemplate) {
        vscode.postMessage({ type: 'duplicate-template', payload: { id: currentTemplate.id } });
      }
    });

    btnDuplicateFromBanner.addEventListener('click', () => {
      if (currentTemplate) {
        vscode.postMessage({ type: 'duplicate-template', payload: { id: currentTemplate.id } });
      }
    });

    btnDelete.addEventListener('click', () => {
      if (currentTemplate && !currentTemplate.isBuiltIn) {
        vscode.postMessage({ type: 'delete-template', payload: { id: currentTemplate.id } });
      }
    });

    btnSetDefault.addEventListener('click', () => {
      if (currentTemplate) {
        vscode.postMessage({ type: 'set-default', payload: { id: currentTemplate.id } });
      }
    });

    btnNewTemplate.addEventListener('click', () => {
      const newTemp = {
        id: 'custom-' + Date.now(),
        name: 'New Custom Template',
        description: 'Custom context template',
        isBuiltIn: false,
        outputType: 'clipboard',
        renderContent: true,
        removeCommonPath: false,
        include: [],
        exclude: ['**/node_modules/**', '**/.git/**'],
        wrapperTemplate: '# Context\\n\\n{{tree}}\\n\\n{{files}}',
        fileTemplate: '### {{path}}\\n\`\`\`{{extension}}\\n{{content}}\\n\`\`\`',
      };
      allTemplates.push(newTemp);
      renderSidebar();
      selectTemplate(newTemp.id);
    });

    // Request initial data from host
    vscode.postMessage({ type: 'request-init' });
  </script>
</body>
</html>`;
}
