#!/bin/bash

# Update imports in all TypeScript files in the pages directory
find src/pages -name "*.tsx" -type f -exec sed -i 's/import Header from "..\/components\/Header";//g' {} \;
find src/pages -name "*.tsx" -type f -exec sed -i 's/import { Layout } from "..\/components\/Layout";/import Layout from "..\/components\/Layout";/g' {} \;
find src/pages -name "*.tsx" -type f -exec grep -l "<Header" {} \; | xargs -I {} sed -i 's/<Header \?\/>//g' {}

# Add Layout import if not present
find src/pages -name "*.tsx" -type f -exec grep -L "import Layout" {} \; | xargs -I {} sed -i '1i\
import Layout from "../components/Layout";
' {}

# Wrap content with Layout component
find src/pages -name "*.tsx" -type f -exec grep -L "<Layout>" {} \; | xargs -I {} sed -i 's/  return (/  return (\n    <Layout>\n      /g' {}

find src/pages -name "*.tsx" -type f -exec grep -l "<Layout>" {} \; | xargs -I {} sed -i 's/  );$/\n    <\/Layout>\n  );/g' {}
