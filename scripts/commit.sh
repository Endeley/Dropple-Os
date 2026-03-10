#!/bin/bash

set -euo pipefail

echo "Commit type:"
select TYPE in feat fix refactor perf test docs chore arch determinism export; do
  if [ -n "${TYPE:-}" ]; then
    break
  fi
done

read -r -p "Scope: " SCOPE
read -r -p "Summary: " SUMMARY

if [ -z "${SCOPE}" ] || [ -z "${SUMMARY}" ]; then
  echo "Scope and summary are required."
  exit 1
fi

git commit -m "${TYPE}(${SCOPE}): ${SUMMARY}"
