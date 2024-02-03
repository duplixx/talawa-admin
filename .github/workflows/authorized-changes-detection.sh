#!/bin/bash

echo "List of unauthorized files changed:"
# Add your list of sensitive files and directories here
SENSITIVE_FILES=(
  '.github/'
  'env.example'
  '.husky/'
  'scripts/'
  'package.json'
  'tsconfig.json'
  '.gitignore'
  '.eslintrc.json'
  '.eslintignore'
  'vite.config.ts'
  'docker-compose.yaml'
  'Dockerfile'
  'CODEOWNERS'
  'LICENSE'
  'setup.ts'
)

UNAUTHORIZED_CHANGES=false

for file in $(git diff --name-only ${{ github.event.before || "HEAD^" }}); do
  for sensitive_file in "${SENSITIVE_FILES[@]}"; do
    if [[ "$file" == "$sensitive_file"* ]]; then
      echo " - $file"
      UNAUTHORIZED_CHANGES=true
    fi
  done
done

if [ "$UNAUTHORIZED_CHANGES" == true ]; then
  echo "Unauthorized changes detected. Please review the list of modified files above."
  exit 1
fi
