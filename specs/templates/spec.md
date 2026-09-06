# Spec: <FEATURE NAME>

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| ID       | `<NNNN-feature-slug>`                                     |
| Status   | Draft <!-- Draft → Approved → In progress → Shipped -->    |
| Owner    | <name>                                                    |
| Apps     | <SandboxApi / SandboxSpaApp / SandboxPrototypeWeb>         |
| Created  | <YYYY-MM-DD>                                              |
| Updated  | <YYYY-MM-DD>                                              |

## 1. Problem

What is wrong or missing today, and for whom. Two or three sentences. No
solution talk here.

## 2. Outcome

What is true once this ships, stated so anyone can check it.

## 3. Users and scenarios

For each scenario, describe observable behaviour — not implementation.

### Scenario 1: <short name>

- **Given** <starting state>
- **When** <the user does this>
- **Then** <this is what they see>

### Scenario 2: <short name>

- **Given** …
- **When** …
- **Then** …

## 4. Requirements

Every requirement gets a stable ID. Tasks and tests reference these IDs, so
never renumber one — retire it instead.

| ID     | Requirement                            | Priority |
| ------ | -------------------------------------- | -------- |
| REQ-1  | The system MUST …                       | Must     |
| REQ-2  | The system MUST …                       | Must     |
| REQ-3  | The system SHOULD …                     | Should   |

## 5. Acceptance criteria

The checks that decide "done". Each one names the requirement it proves and,
where it makes sense, the e2e test that will assert it.

| ID    | Proves | Check                                                    |
| ----- | ------ | -------------------------------------------------------- |
| AC-1  | REQ-1  | <observable, testable statement>                          |
| AC-2  | REQ-2  | <observable, testable statement>                          |

## 6. Out of scope

Bullet the things a reader might reasonably assume are included but are not.

## 7. Open questions

| Question         | Owner  | Needed by       | Answer |
| ---------------- | ------ | --------------- | ------ |
| <what is unclear> | <name> | <plan / build>  |        |

Anything still open here that is needed by `plan` blocks approval. Resolve it
or move it to _Out of scope_ before moving on.

## 8. Data and contracts

Sketch the shape of the data and the interfaces this feature touches: Strapi
content types and fields, REST paths, GraphQL queries and mutations, SPA routes.
Shapes only — the plan decides how they get built.
