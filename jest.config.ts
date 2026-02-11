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
    "^@prisma/client$": "<rootDir>/__mocks__/@prisma/client.ts",
    "^@prisma/adapter-pg$": "<rootDir>/__mocks__/@prisma/adapter-pg.ts",
    "^pg$": "<rootDir>/__mocks__/pg.ts",
  },
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/main.ts",
    "!**/instrument.ts",
    "!**/app.module.ts",
    "!**/*.module.ts",
    "!**/*.dto.ts",
    "!**/__mocks__/**",
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};

export default config;
