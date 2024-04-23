import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { ignores: ["/coverage/"] },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        node: "readonly",
        jest: "readonly"
      }
    },
    rules: {
      "no-undef": "off"
    }
  }
];
