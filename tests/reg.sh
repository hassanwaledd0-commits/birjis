#!/bin/bash
# Older name of the full check (the original tests/reg.sh was lost with the old container): runs ./check.sh with the same arguments.
exec "$(dirname "$0")/../check.sh" "$@"
