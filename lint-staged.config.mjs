const quote = (files) => files.map((f) => `"${f}"`).join(" ");

export default {
  // ESLint's flat config lives in frontend/, so it has to run from that workspace.
  "frontend/**/*.{ts,tsx,js,jsx,mjs}": (files) => `npm exec --workspace=frontend -- eslint --fix ${quote(files)}`,
  "backend/**/*.py": (files) => `sh scripts/hooks/ruff-staged.sh ${quote(files)}`,
};
