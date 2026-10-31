# my-marketplace-web - Governing Principles

## 1. Development Methodology
- **Spec Driven Development (SDD):** All features must be explicitly defined in user stories and acceptance criteria before implementation begins.
- **Version Control:** Use Trunk-based development for Git branching.
- **Coding Practice:** Always follow red-green-refactor cycle. Write unit tests before implementing features. Ensure code passes linting and formatting checks before committing.

## 2. Technology Stack
- **Build Tool:** Vite (using the React JavaScript template).
- **Routing:** `react-router-dom`.
- **Styling:** Bootstrap v5.3 via CDN. No custom CSS unless strictly necessary.

## 3. Architecture & Project Structure
- **Project Structure:** Feature-based folder structure. Each feature folder must contain sub-folders categorized by file type (e.g., `component/`, `hooks/`, `context/`, `api/`).
- **Component Pattern:** View-Hook Pair pattern (separating UI components from their respective logical hooks).
- **Naming Convention:** Use `kebab-case` for all filenames.

## 4. State Management
- **Context API:** Use React Context for state management.
- **Scope:** Create multiple feature-specific Contexts rather than a single monolithic global state.

## 5. Web API Integration
- **Web API Call:** Use the native `fetch` API.
- **Architecture:** Create a custom fetch wrapper per feature.

## 6. Testing & Code Quality
- **Unit Testing:** Vitest.
- **Code Formatting & Linting:** Oxlint.