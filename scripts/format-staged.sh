#!/usr/bin/env bash
# Pre-commit formatter (called by lefthook with the staged file list).
#
# `ultracite fix` formats the WORKING-TREE copy of a file. Re-staging that
# copy would also stage any hunks the developer deliberately left unstaged
# (partial `git add -p`), silently committing unfinished work. So: only
# format + restage files whose working tree matches the index; announce and
# skip partially-staged ones.
set -euo pipefail

fully=()
for f in "$@"; do
  if git diff --quiet -- "$f"; then
    fully+=("$f")
  else
    echo "lefthook: '$f' is partially staged — skipped (format it manually)"
  fi
done

((${#fully[@]})) || exit 0
# Formatter role only: apply what is fixable, stage it, and DO NOT block the
# commit on pre-existing unfixable lint errors (the H3+ burn-down pile owns
# those — see claudedocs/analytics/design.md). ultracite fix exits 1 when any
# unfixable diagnostic remains, so its status is deliberately ignored.
bunx ultracite fix "${fully[@]}" || true
git add "${fully[@]}"
