const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Allow ESM modules like jose to be transformed
  transformIgnorePatterns: [
    "/node_modules/(?!jose|@supabase|@tiptap|@heroicons|lucide-react|@ai-sdk|@testing-library|uuid|nanoid|date-fns|zod|lodash-es)/"
  ],
  // Explicitly use babel-jest for JS/TS/TSX files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  // Mock ESM-only modules for test runs
  moduleNameMapper: {
    "^jose$": "<rootDir>/__mocks__/jose.js",
    "^@supabase/auth-helpers-nextjs$": "<rootDir>/__mocks__/@supabase/auth-helpers-nextjs.js",
    "^@/(.*)$": "<rootDir>/$1",
    "^lib/(.*)$": "<rootDir>/lib/$1"
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
