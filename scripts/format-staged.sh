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
bunx ultracite fix "${fully[@]}"
git add "${fully[@]}"
