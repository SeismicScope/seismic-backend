import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
 moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/$1",
  "^prisma/(.*)$": "<rootDir>/../prisma/$1",
},
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/main.ts",
    "!**/instrument.ts",
    "!**/app.module.ts",
    "!**/*.module.ts",
    "!**/*.dto.ts",
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};

export default config;
