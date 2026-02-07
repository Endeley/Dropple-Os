import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import droppleArchitecture from "./tools/eslint/dropple-architecture.js";
import noNodeviewProjection from "./eslint-rules/no-nodeview-projection.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "dropple-architecture": droppleArchitecture,
      architecture: {
        rules: {
          "no-nodeview-projection": noNodeviewProjection,
        },
      },
    },
    rules: {
      "dropple-architecture/no-ui-truth-dispatch": "error",
      "architecture/no-nodeview-projection": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "convex/_generated/**",
  ]),
]);

export default eslintConfig;
