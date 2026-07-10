#!/usr/bin/env bash
# EAS build hook: let git clone the private swipeDaddy dependency over SSH.
#
# package.json pins @fontezbrooks/swipedaddy to a git+ssh URL; the EAS build
# worker has no GitHub credentials of its own. SWIPEDADDY_SSH_KEY is an EAS
# "file"-type secret variable — at build time the env var holds a PATH to the
# key file (a read-only deploy key on the swipeDaddy repo, "eas-build
# read-only"). Rotate by generating a new keypair, replacing the deploy key
# and the EAS variable; nothing in the repo changes.
set -euo pipefail

if [ -z "${SWIPEDADDY_SSH_KEY:-}" ]; then
  echo "SWIPEDADDY_SSH_KEY not set — skipping SSH setup (local install)"
  exit 0
fi

mkdir -p "$HOME/.ssh"
cp "$SWIPEDADDY_SSH_KEY" "$HOME/.ssh/id_ed25519"
chmod 600 "$HOME/.ssh/id_ed25519"
ssh-keyscan github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null
echo "swipeDaddy deploy key installed for git+ssh installs"
