# Documentation

Reference documentation for the RetrouveCI monorepo. Start with the overview;
each document is self-contained and links to the code it describes.

| Document                                              | Read it when                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [Overview](architecture/01-overview.md)               | You are new here, or you need to know which deployable owns a behaviour  |
| [Applications](architecture/02-applications.md)       | You are adding an endpoint, a route, a use-case or a form                |
| [Shared packages](architecture/03-shared-packages.md) | You are about to duplicate a schema, a type or a rule                    |
| [Business flows](architecture/04-business-flows.md)   | You need to follow a listing, a match, a sticker or a sign-in end to end |
| [Operations](architecture/05-operations.md)           | You are deploying, debugging production, or wiring an environment        |

## What lives where else

These documents describe the system as it is. Three other files answer different
questions and are **not** superseded by them:

- **[CLAUDE.md](../CLAUDE.md)** — the working agreement: conventions, commands,
  and the reasoning behind decisions that are easy to undo by accident. It is
  the normative document; if these docs and CLAUDE.md disagree, CLAUDE.md wins
  and this directory has a bug.
- **[AGENTS.md](../AGENTS.md)** — contribution workflow, PR template.
- **[CLAUDE.md's `Known debt`](../CLAUDE.md#known-debt)** — what is still owed,
  and why each item is open rather than forgotten. Read it before proposing
  structural work.

The architecture realignment that produced this layout ran from July to August
2026 and was tracked in five `MIGRATION-PLAN*.md` files, retired when it closed.
They are in the git history, and that is where to look when a shape described
here seems arbitrary: they record what was moved and what it cost.

## Conventions in this directory

- **English**, like `README.md` and `CLAUDE.md`. The product's UI is French; its
  documentation and identifiers are not.
- Every claim is meant to be checkable against the code. Paths are relative to
  the repository root and clickable.
- Diagrams are Mermaid, which GitHub renders inline.
