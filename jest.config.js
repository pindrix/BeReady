module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/**/*.native.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.native.ts"],
};
