#!/bin/sh

# Safer shell execution
# -e If a command fails, set -e will make the whole script exit, instead of just
#    resuming on the next line
# -u Treat unset variables as an error, and immediately exit
# -f Disable filename expansion (globbing) upon seeing *, ?, etc
# -x Print each command before executing it (arguments will be expanded)
set -eufx

# Do our stuff
npm run migratedb
npm run migratedbtest

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
