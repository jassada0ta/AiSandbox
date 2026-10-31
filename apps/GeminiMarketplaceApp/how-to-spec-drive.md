# How to Spec-Drive Development with Gemini

The most effective way to use Gemini for spec-driven development is to abandon the "loose chat prompt" approach and instead treat Gemini as an artifact generator. By forcing the AI to generate structured Markdown documents (specs, plans, tasks) *before* writing any code, you prevent scope creep, resolve ambiguities early, and maintain a consistent architecture.

There are three primary ways to implement this workflow in the Gemini ecosystem: using the Gemini web app with Canvas, the Gemini CLI Conductor extension, or Gemini Code Assist in your IDE.

## The Core Spec-Driven Sequence

Regardless of the tool you use, your interaction with Gemini should follow this strict sequence. Do not allow the AI to write code until Step 6.

1. **Constitution:** Define the Foundation.
   Instruct Gemini to define the project's governing principles. This includes the tech stack, coding standards, UI/UX guidelines, and testing requirements.

* **Prompt:** "Create a constitution document for [Project]. The stack is [Tech]. Focus on strict typing, modular components, and test-driven development."


2. **Specify:** Product Scope.
   Provide your raw feature concept and ask Gemini to structure it into outcomes, user stories, and strict out-of-scope boundaries. Keep the focus entirely on the product logic, not the code.

* **Prompt:** "Write a product specification for [Feature]. Define the core user flows, edge cases, and what is explicitly out of scope."


3. **Clarify:** Resolve Ambiguity.
   Force the AI to find holes in your specification. Unresolved ambiguity here becomes implementation drift later.

* **Prompt:** "Act as a senior systems architect. Review the specification and ask me up to 5 critical questions about missing logic, edge cases, or data handling. Provide a recommendation for each."


4. **Plan:** Architecture & Design.
   Once the spec is clarified, ask Gemini to design the technical architecture. This should include database schemas, API contracts, and file structures.

* **Prompt:** "Based on the clarified spec, draft a technical plan. Map out the database properties, data flow, and the exact file-change map required."


5. **Tasks:** Work Breakdown.
   Have Gemini translate the technical plan into an itemized, checkable task list. Tasks must be small and actionable.

* **Prompt:** "Break the technical plan down into small, sequential implementation tasks. Prioritize the smallest safe implementation order."


6. **Implement:** One Task at a Time.
   Only now do you ask for code. Feed Gemini one task at a time, ensuring it references the earlier documents.

* **Prompt:** "Read the spec, plan, and tasks. Implement ONLY Task 1. Ensure it adheres to the constitution."


---

## Tool-Specific Implementations

### 1. Gemini Web App (Gems & Canvas)

For planning and architecture, you can create a custom **Gemini Gem** (e.g., "Spec Kit Architect") and set the default tool to **Canvas**.

* Upload markdown templates for your constitution, spec, plan, and tasks to the Gem's knowledge base.
* Instruct the Gem to edit documents side-by-side in the Canvas interface.
* You can advance through the workflow simply by typing keywords like "specify", "clarify", and "plan", watching the documents evolve in Canvas before exporting them to your local IDE.

### 2. Gemini CLI Conductor (Local Terminal)

If you prefer working in your terminal, the open-source **Conductor extension** for Gemini CLI brings this workflow directly into your repository. It stores the specs and plans as persistent Markdown files alongside your code.

* Run `/conductor:setup` to define your product, tech stack, and workflow preferences.
* Run `/conductor:newTrack` when starting a feature. Conductor will walk you through generating the Specs and Plan artifacts.
* Run `/conductor:implement` to have your coding agent work through the `plan.md` file, checking off tasks as it completes them locally.

### 3. Gemini Code Assist (VS Code)

If you are already in your IDE, you can use Gemini Code Assist's workspace context and integrations to bridge the gap between planning and coding.

* Write your specifications in a Google Doc.
* In the VS Code Gemini Chat module, use `@GoogleDocs` to find and extract the requirements directly from your document.
* Prompt Gemini to generate the project structure and initial code based strictly on the extracted requirements.