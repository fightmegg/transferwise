module.exports = {
  verbose: true,
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!**/node_modules/**"],
  cacheDirectory: ".jest/cache",
  coverageDirectory: ".jest/coverage",
  setupFilesAfterEnv: ["jest-extended"],
};
