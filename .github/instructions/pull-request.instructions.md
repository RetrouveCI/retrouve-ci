---
applyTo: '**'
description: 'Generate a pull request message based on the provided template.'
---

# Pull Request Message Generation Rule

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

## Screenshots (optional)

- For UI or visual changes, include before/after screenshots or relevant output.
- For backend or CLI changes, consider including output or logs if helpful.

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
