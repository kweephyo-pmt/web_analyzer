```markdown
# TBS_web-analyzer Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and workflows used in the `TBS_web-analyzer` repository. The codebase is primarily JavaScript with no detected framework, and it spans both backend and frontend components. The repository supports adding new analytics features that require integration across backend services and frontend UI, following a clear step-by-step workflow.

## Coding Conventions

### File Naming

- Use **snake_case** for file names.

  **Example:**
  ```
  user_profile.js
  data_analyzer.js
  ```

### Import Style

- Use **relative imports** for modules.

  **Example:**
  ```javascript
  import { fetchData } from './utils/data_fetcher';
  ```

### Export Style

- Use **named exports**.

  **Example:**
  ```javascript
  // In data_analyzer.js
  export function analyzeData(data) { ... }
  ```

  ```javascript
  // In another file
  import { analyzeData } from './data_analyzer';
  ```

### Commit Messages

- Freeform style, typically short (average ~35 characters).
- No strict prefixing required.

## Workflows

### Add New Feature with Backend and Frontend Integration

**Trigger:** When adding a new analytics tool, report, or major feature that requires changes to both backend (API/service) and frontend (UI).

**Command:** `/new-feature`

**Step-by-step Instructions:**

1. **Backend:**
    - Create or update backend service(s) to handle new data or logic.
      - *Example:*
        ```python
        # backend/services/analytics_service.py
        def new_tool_logic(data):
            # Implement new analytics logic
            pass
        ```
    - Update or add backend API route(s) to expose new functionality.
      - *Example:*
        ```python
        # backend/api/routes.py
        @app.route('/api/new-tool', methods=['POST'])
        def new_tool_endpoint():
            # Call new_tool_logic and return response
            pass
        ```
    - Modify backend config or requirements if needed.
      - *Example:*
        ```python
        # backend/config.py
        NEW_TOOL_SETTING = True
        ```
        ```text
        # backend/requirements.txt
        new-dependency>=1.0.0
        ```

2. **Frontend:**
    - Add or update frontend page(s) for the new feature.
      - *Example:*
        ```javascript
        // frontend/src/pages/new_tool.jsx
        export function NewToolPage() { ... }
        ```
    - Update frontend components (e.g., summaries, tables, selectors) to display new data.
      - *Example:*
        ```javascript
        // frontend/src/components/summary/new_tool_summary.jsx
        export function NewToolSummary({ data }) { ... }
        ```
    - Update Sidebar or navigation to link to the new feature.
      - *Example:*
        ```javascript
        // frontend/src/components/layout/Sidebar.jsx
        <NavLink to="/new-tool">New Tool</NavLink>
        ```
    - Update `App.jsx` to register new routes/pages.
      - *Example:*
        ```javascript
        // frontend/src/App.jsx
        import { NewToolPage } from './pages/new_tool';
        // ...
        <Route path="/new-tool" element={<NewToolPage />} />
        ```

**Files Typically Involved:**
- `backend/api/routes.py`
- `backend/services/*.py`
- `backend/config.py`
- `backend/requirements.txt`
- `frontend/src/App.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/pages/*.jsx`
- `frontend/src/components/seo/*.jsx`
- `frontend/src/components/gsc/*.jsx`

**Frequency:** ~2-3 times per month

---

## Testing Patterns

- **Test Framework:** Unknown (not detected).
- **Test File Pattern:** Files named with `*.test.*` (e.g., `data_analyzer.test.js`).
- Place test files alongside the modules they test or in a dedicated test directory.

**Example:**
```
frontend/src/utils/data_fetcher.test.js
```

## Commands

| Command      | Purpose                                                                 |
|--------------|------------------------------------------------------------------------|
| /new-feature | Start the workflow to add a new analytics feature (backend + frontend)  |
```
