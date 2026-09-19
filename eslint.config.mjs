import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
