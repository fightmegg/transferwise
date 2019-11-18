module.exports = {
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!**/node_modules/**"],
  coverageDirectory: ".jest",
  reporters: ["default", "jest-junit"],
  setupFilesAfterEnv: ["jest-extended"]
};
