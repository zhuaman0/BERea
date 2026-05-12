/** @type {import("eslint").Linter.Config} */
export const berea = {
  rules: {
    "no-console":         ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars":     "off",
    "prefer-const":       "error",
    "no-var":             "error",
    "eqeqeq":            ["error", "always"],
  },
};

/** @type {import("eslint").Linter.Config} */
export const bereaTsRules = {
  rules: {
    "@typescript-eslint/no-explicit-any":          "error",
    "@typescript-eslint/no-unused-vars":           ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports":  ["error", { prefer: "type-imports" }],
    "@typescript-eslint/no-non-null-assertion":    "warn",
  },
};
