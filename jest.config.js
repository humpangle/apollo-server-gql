module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/resolvers/interfaces.resolver.ts"
  ],
  coverageReporters: ["json", "lcov", "text", "clover"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/src/.+?db.test.ts"
  ]
};
