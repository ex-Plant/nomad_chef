import { defineConfig } from "@playwright/test";

// Load .env into the test runner + workers so fixtures can read P24_CRC (sign
// computation), DB creds, etc. Node 24 ships process.loadEnvFile.
try {
  process.loadEnvFile(".env");
} catch {
  // .env optional in CI where vars are injected another way.
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  // Serial: every db-cli call boots Payload and writes to the shared dev DB;
  // parallel order creation would race generateOrderNumber's unique counter.
  workers: 1,
  // Default run excludes only the manual Layer C paywall smoke (needs a prod
  // build behind ngrok + a human to complete payment). Run it with E2E_ALL=1.
  grepInvert: process.env.E2E_ALL ? undefined : /@manual/,
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
