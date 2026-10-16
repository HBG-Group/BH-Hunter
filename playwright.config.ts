import { defineConfig } from "@playwright/test";

const baseURL = process.env.SECURITY_TEST_BASE_URL;

export default defineConfig({
  testDir: "./tests/staging",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
});
