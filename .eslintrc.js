module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
  },
  ignorePatterns: ["node_modules/", "dist/", ".next/"],
};
