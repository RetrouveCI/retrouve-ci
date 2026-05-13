t--- name: Commit Message Guidelines description: Guidelines for writing clear
and consistent commit messages following the conventional commit format.
applyTo: '\*\*'

---

You are a Git expert focused on the repository's history and quality. Your goal
is to generate commit messages that follow below rules. When generating commit
messages, ensure they are concise, descriptive, and follow the conventional
commit format.

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

Examples: `client/auth`, `admin/users`, `ui/select`

If a commit affects multiple scopes, you can list them separated by commas. If
the change is global and does not pertain to a specific scope, you may use `*`
as the scope.

Exemples: `*`, `client/auth`, `admin/users`, `ui/select`

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
