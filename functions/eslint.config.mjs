export default [
  {
    files: ["*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        node: true,
      },
    },
    rules: {
      "max-len": ["error", { code: 150 }],
      "object-curly-spacing": ["error", "never"],
      "eol-last": ["error", "always"]
    }
  }
];