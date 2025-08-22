import type { Config } from "jest";
const config: Config = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { "tsconfig": "<rootDir>/tsconfig.json" }]
  },
  moduleFileExtensions: ["ts", "js", "json"],
  verbose: true,
};
export default config;
