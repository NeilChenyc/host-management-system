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
      // 暂时禁用 any 类型检查，允许使用 any 类型
      "@typescript-eslint/no-explicit-any": "off",
      // 将 React Hooks 依赖警告降级为警告而不是错误
      "react-hooks/exhaustive-deps": "warn",
      // 暂时禁用未使用变量的错误，改为警告
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
