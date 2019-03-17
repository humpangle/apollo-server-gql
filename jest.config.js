module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["json", "lcov", "text", "clover"]
};
