#!/bin/bash

# Remove all Header imports
find src/pages -name "*.tsx" -type f -exec sed -i '/import.*Header/d' {} \;

# Remove all Header component usages
find src/pages -name "*.tsx" -type f -exec sed -i '/<Header/d' {} \;

# Add Layout import if not present
for file in src/pages/*.tsx; do
  if ! grep -q "import Layout" "$file"; then
    sed -i '1i\
import Layout from "../components/Layout";
' "$file"
  fi

  # Wrap return content with Layout if not already wrapped
  if ! grep -q "<Layout>" "$file"; then
    sed -i '/^ *return (\s*$/{N;s/^ *return (\s*\(.*\)\s*);/  return (\n    <Layout>\n      \1\n    <\/Layout>\n  );/}' "$file"
  fi
done
