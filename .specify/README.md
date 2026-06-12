# SpecKit

This folder is created/managed by the SpecKit CLI.

## First-time setup

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here --ai claude
```

That will populate this folder with templates, scripts, and slash-command
definitions for Claude Code.

## Workflow per feature

```text
/speckit.specify  → write the spec (what & why)
/speckit.clarify  → resolve ambiguities
/speckit.plan     → produce technical plan
/speckit.tasks    → break into ordered tasks
/speckit.implement → execute
```

Specs land in `.agent-os/specs/`.
