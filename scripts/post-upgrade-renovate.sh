#!/bin/bash

set -e

# Post upgrade actions are executed after the renovate update, which uses its own configuration to pull
# private dependencies. If we want the format command (and its required install) to succeed, we need
# to redo the whole configuration manually.
#
# MAKE SURE `.npmrc` IS EXCLUDED FROM THE POST UPGRADE ACTION FILE FILTERS.
echo "@a-novel:registry=https://npm.pkg.github.com" > "$PWD/.npmrc"
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> "$PWD/.npmrc"

pnpm i --frozen-lockfile
pnpm format
