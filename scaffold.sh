#!/usr/bin/env bash
# scaffold.sh — create the CRM repo structure in the current directory.
#
# Usage:
#   1. git clone git@github.com:hussain-ideator/crm.git
#   2. cd crm
#   3. bash scaffold.sh
#   4. review with `git status`, then commit
#
# Safe re-run: this script will NOT overwrite existing files. It only creates
# missing folders and missing files. Edit/delete things you don't want.

set -euo pipefail

say() { printf "\033[1;34m›\033[0m %s\n" "$*"; }
mk()  { mkdir -p "$1"; }
keep(){ [ -e "$1/.gitkeep" ] || touch "$1/.gitkeep"; }
new() {
  local path="$1"
  if [ -e "$path" ]; then
    printf "\033[1;33m·\033[0m skipped (exists): %s\n" "$path"
    return 0
  fi
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  printf "\033[1;32m+\033[0m %s\n" "$path"
}

say "Creating directory tree"
for d in \
  .agent-os/product .agent-os/standards .agent-os/specs \
  .specify \
  .claude/commands \
  backend/crm \
  backend/apps/accounts backend/apps/leads backend/apps/contacts \
  backend/apps/companies backend/apps/deals backend/apps/activities \
  backend/apps/core \
  frontend \
  docs/wireframes \
  .github/ISSUE_TEMPLATE .github/workflows
do
  mk "$d"
done

# Empty marker files
for d in .agent-os/specs .claude/commands backend/crm \
  backend/apps/accounts backend/apps/leads backend/apps/contacts \
  backend/apps/companies backend/apps/deals backend/apps/activities \
  backend/apps/core
do
  keep "$d"
done

say "This script seeds folders and .gitkeep markers only."
say "For the full set of starter files (READMEs, ERD, API contract, CI, etc.)"
say "extract the tarball provided alongside this script:"
say ""
say "    tar -xzvf crm-scaffold.tar.gz -C ."
say ""
say "Done. Run 'git status' to review."
