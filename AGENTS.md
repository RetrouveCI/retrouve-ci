## Commit Message Guidelines

When generating commit messages, ensure they are concise, descriptive, and
follow the conventional commit format.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
  (example scopes: npm, webpack, vite)
- **ci**: Changes to CI configuration files and scripts (example scopes: GitHub
  Actions, CircleCI)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope should be the name of the app ou package followed by affected module,
or component (as perceived by the person reading the changelog).

Examples: `client/auth`, `admin/users`, `api/lost-items`, `ui/select`,
`root/core`, `api/deps`

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 72 characters

### Body

The body should include the motivation for the change and contrast this with
previous behavior.

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Wrap at 72 characters
- Can be multi-paragraph

### Footer

The footer should contain:

- **Breaking Changes**: Start with `BREAKING CHANGE:` followed by a description
- **Issue References**: Use `Closes #123` or `Fixes #123` format

### Examples

#### Simple commit

```
feat(auth): add JWT token refresh mechanism
```

#### Commit with scope and breaking change

```
feat(api): update user endpoint response format

Change the response structure to include metadata and pagination info

BREAKING CHANGE: The /api/users endpoint now returns data in a `data` field instead of root level
```

#### Bug fix with issue reference

```
fix(ui): resolve button alignment in mobile view

Fixes #456
```

#### Commit with detailed body

```
refactor(core): simplify error handling logic

Replace multiple try-catch blocks with a centralized error handler
to improve code maintainability and consistency across the application
```

### Best Practices

1. Keep commits atomic - one logical change per commit
2. Write clear, descriptive messages that explain the "why" not just the "what"
3. Reference issues and pull requests where relevant
4. Use breaking change footer when introducing incompatible API changes
5. Ensure the subject line is self-contained and meaningful

## Data validation

When implementing data validation in your application, follow these guidelines
to ensure data integrity and consistency:

- Use zod for schema definitions and validations.
- Use zod v4.x features and best practices.

## Testing convention

When writing tests, follow these conventions to ensure comprehensive coverage
and maintainability:

- Vitest is the testing framework of choice.
- Write comprehensive tests.
- Focus on behavior and public APIs and not on implementation details.
- Cover happy paths
- Cover error paths or error states
- Cover realistic edge cases.
- Test cases label should be behavior-driven.
- Test files should be named as [filename].test.ts(s) and placed int the
  **tests** folder in the same directory as the source file.
- Regularly review and update tests as the codebase evolves.

# Pull Request Message Generation Rule

Whenever you are asked to generate a pull request message following these
guidelines:

- Act as an experienced developer and technical writer.
- The pull request description must be in English.
- Use a clear, concise, and conversational tone. Communicate with the reviewer
  as a person, not as a machine.
- Get diff information with the following command:
  `git --no-pager log --oneline -p main..HEAD`
- The pull request description should follow the template below, with each
  section clearly labeled:

## What?

- Explicitly explain the changes made. Be clear and specific about the net
  effect of the PR.
- Do not rely solely on ticket references (e.g., "See #JIRA-123"). Instead,
  describe what was changed and then reference the ticket if relevant.
- Avoid vague statements like "See the subject" or "Support for #JIRA-123".

## Why?

- Explain the business or engineering goal this change achieves.
- Provide context for why the change was necessary, not just what was changed.
- Use complete sentences and an active voice.

## How?

- Summarize how the change was implemented, especially any significant design
  decisions or trade-offs.
- If you used a particular approach or library, mention why.
- Draw attention to non-obvious or important aspects of the implementation.

## Testing?

- Describe how the changes were tested (e.g., unit tests, manual testing, CI
  results).
- If applicable, explain how a reviewer can test the changes locally.
- Note any edge cases that were not tested and why.

## Anything Else?

- Call out possible architecture changes, technical debt, challenges, or
  optimizations.
- Suggest future improvements or considerations if relevant.

---

**Note:**

- Keep the description concise and avoid unnecessary verbosity. If the PR is too
  complex to describe simply, consider breaking it down into smaller changes.
- The goal is to make it easy for reviewers to understand, review, and approve
  your changes efficiently.

[Based on:
https://www.pullrequest.com/blog/writing-a-great-pull-request-description/]

## Database structure

Whenever you need more information about the database structure or when i ask
for information about it, refer to `packages/database/prisma/schema.prisma`
(single Prisma schema shared by the whole monorepo, package `@app/database`).

## Architecture skills

Structural decisions are governed by the project skills in `.claude/skills/` —
load the relevant one **before** creating or moving files:

- `backend-conventions` — where a file belongs in `apps/api/src` (NestJS DDD +
  Clean Architecture).
- `frontend-conventions` — where a file belongs in `apps/client/app` and
  `apps/admin/app` (React Router v7, feature-based).
- `unit-tests` — Vitest conventions (`__tests__/[name].test.ts`, behaviour over
  implementation).
- `dependency-management` — the pnpm catalog is the single source of truth for
  shared versions.
- `docker-conventions`, `code-quality-setup`, `code-quality-review`, `shadcn`.

The architecture realignment that produced this layout closed in August 2026,
and its `MIGRATION-PLAN*.md` files were retired with it — they are in the git
history if you need the reasoning behind a particular move. What was still open
when they went is listed under **Known debt** in
[CLAUDE.md](CLAUDE.md#known-debt); read it before proposing structural work.

## Contribution workflow

One change, one branch, one pull request:

1. Create a branch off `main`: `git switch -c <type>/<slug>`.
2. Do the work, then run the recipe in full:
   `pnpm format:check && pnpm typecheck && pnpm lint && pnpm build && pnpm test`.

   ⚠️ **Turbo's cache hides `lint` and `test`.** A run can print "7 successful"
   with `Cached: 7 cached`, meaning nothing executed. Read the `Cached:` line,
   and pass `--force` when the result has to be trusted.

3. **Ask for permission before committing.** Commits are GPG-signed by the
   maintainer — never run `git commit` unprompted unless the maintainer has
   waived this for the session.
4. Anything that changes behaviour is verified **against a running app**, not
   only in tests. Record the row counts before touching the development
   database, mark your own rows so they can be deleted by pattern, remove the
   sessions your sign-ins created, and re-check the counts afterwards.
5. Open the pull request. The title is a conventional commit; the description
   **must** follow the Pull Request Message Generation Rule above
   (`What? / Why? / How? / Testing? / Anything Else?`). Never use `--fill` — it
   only copies the commit message. Write the body to a file, then:

   ```bash
   gh pr create --repo RetrouveCI/retrouve-ci --base main \
     --head <branch> --title "<type>(<scope>): <subject>" \
     --body-file <file> --reviewer JowellDev \
     --assignee JowellDev --assignee JoelDigbeu --label Patch
   ```

   `--repo` is required: the git remote still carries the former
   `JowellDev/retrouve-ci` name, and without it `gh` reports
   `No commits between …`. The semver label (`major` / `minor` / `Patch`) is
   what `release.yml` reads to pick the next tag, so every PR needs one.

⚠️ **Never put `-f` in a branch name.** `.claude/hooks/guard-git.sh` blocks any
`git push` whose command string contains `-f`, `-fastify` and `fix-…` included.

⚠️ **Stacked pull requests: merge the child first.** GitHub only retargets a
child PR while it is still open; merging the parent first and then merging the
child into the stale parent branch succeeds into a dead branch and strands the
child's commits while reporting MERGED.

## Package naming

Every workspace package is scoped `@app/*`, applications included: `@app/api`,
`@app/client`, `@app/admin`, `@app/auth`, `@app/contracts`, `@app/database`,
`@app/ui`, `@app/web-kit`, `@app/eslint-config`, `@app/typescript-config`,
`@app/vitest-config`. Only the root package keeps a bare name (`retrouve-ci`).
Turborepo and pnpm filters use the scoped name: `pnpm --filter @app/api dev`.
