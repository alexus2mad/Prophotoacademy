## ADDED Requirements

### Requirement: Bind every agent to the workflow

Spec-driven development with OpenSpec SHALL be mandatory for every contributor and coding agent that changes the repository, including subagents, delegated tasks and unattended sessions. Every agent instruction entry point in the repository SHALL state the mandate and refer to the root `AGENTS.md` workflow. The repository check SHALL fail when an entry point omits it.

#### Scenario: A delegated agent receives a task

- **WHEN** an agent delegates repository edits to a subagent
- **THEN** it passes the OpenSpec change ID and the relevant scenarios, and a delegate without a change stops before editing and asks for one.

#### Scenario: An agent starts from a scoped folder

- **WHEN** an agent reads only the instruction file of a scoped folder, a nested video project or a project subagent definition
- **THEN** that file states that OpenSpec is mandatory and links the root workflow.

#### Scenario: A contributor adds an agent instruction file without the mandate

- **WHEN** the repository check runs on an `AGENTS.md`, `CLAUDE.md`, Copilot instruction file or project agent definition that does not state the mandate
- **THEN** the check fails and names the file.

#### Scenario: A request changes no repository file

- **WHEN** an agent answers a question, reviews, explores, or edits marketing pages only through the visual editor
- **THEN** no OpenSpec change is required, and any resulting repository edit requires one first.
