# SpecKit

This folder is created/managed by the SpecKit CLI.

## First-time setup

Bootstrapped via SpecKit v0.10.2 (pinned); see [[ADR-011]] in
`agent-os/product/decisions.md`.

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.10.2
specify init --here --integration claude --script ps
```

That populates this folder with templates, scripts (PowerShell), and installs
the Claude Code skills under `.claude/skills/`.

## Workflow per feature

In v0.10.x these are Claude Code skills (hyphenated), not dot-namespaced:

```text
/speckit-specify   → write the spec (what & why)
/speckit-clarify   → resolve ambiguities (optional)
/speckit-plan      → produce technical plan
/speckit-tasks     → break into ordered tasks
/speckit-implement → execute
```

Specs land in `agent-os/specs/` — enforced by a one-line patch to
`create-new-feature.ps1` (`$specsDir`), per [[ADR-011]]. Re-apply that patch
after any `specify` CLI upgrade.
