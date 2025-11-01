import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Temporarily disable any type checking, allow using any type
      "@typescript-eslint/no-explicit-any": "off",
      // Downgrade React Hooks dependency warnings to warnings instead of errors
      "react-hooks/exhaustive-deps": "warn",
      // Temporarily disable unused variable errors, change to warnings
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
