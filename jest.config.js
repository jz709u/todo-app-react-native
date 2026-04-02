module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        babelConfig: false,
        tsconfig: {
          jsx: "react-jsxdev",
          jsxImportSource: "react",
          moduleResolution: "node",
          esModuleInterop: true,
          skipLibCheck: true,
          allowJs: true,
        },
        isolatedModules: true,
      },
    ],
  },
  testMatch: [
    "**/__tests__/**/*.test.{ts,tsx}",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "store/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};

