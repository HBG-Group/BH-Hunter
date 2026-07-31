import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const baseURL = process.env.SECURITY_TEST_BASE_URL;
const supabaseUrl = process.env.SECURITY_TEST_SUPABASE_URL;
const serviceRoleKey = process.env.SECURITY_TEST_SUPABASE_SERVICE_ROLE_KEY;
const enabled =
  process.env.SECURITY_TEST_ENVIRONMENT === "staging" &&
  Boolean(baseURL && supabaseUrl && serviceRoleKey) &&
  !new URL(baseURL ?? "https://invalid.local").hostname.endsWith("meino.vercel.app");

interface TestUser {
  email: string;
  password: string;
  id: string;
}

const runId = `security-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const users = new Map<string, TestUser>();
let admin: SupabaseClient;
let ownerBListingId = "";

function requireStaging() {
  if (!enabled) {
    throw new Error(
      "Staging tests require SECURITY_TEST_ENVIRONMENT=staging, staging URL, and staging-only Supabase credentials.",
    );
  }
}

async function createUser(key: string, role: "STUDENT" | "OWNER" | "ADMIN"): Promise<TestUser> {
  const email = `${runId}-${key}@example.invalid`;
  const password = `Security-${runId}-A1!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("Could not create staging test user");

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    email,
    fullName: `Security ${role}`,
    role,
  });
  if (profileError) throw profileError;

  const user = { email, password, id: data.user.id };
  users.set(key, user);
  return user;
}

async function signIn(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("staging authorization boundaries", () => {
  test.skip(!enabled, "Set staging-only SECURITY_TEST_* variables to run this suite.");

  test.beforeAll(async () => {
    requireStaging();
    admin = createClient(supabaseUrl!, serviceRoleKey!, { auth: { persistSession: false } });
    await createUser("student", "STUDENT");
    await createUser("owner-a", "OWNER");
    const ownerB = await createUser("owner-b", "OWNER");
    await createUser("admin", "ADMIN");
    const { data, error } = await admin.from("boarding_houses").insert({
      ownerId: ownerB.id,
      slug: `${runId}-owner-b`,
      name: "Security fixture listing",
      addressLine: "Staging only",
      latitude: 11.78,
      longitude: 124.88,
      genderPolicy: "MIXED",
      priceMonthly: 1000,
      contactPhone: "09123456789",
    }).select("id").single();
    if (error || !data) throw error ?? new Error("Could not create listing fixture");
    ownerBListingId = data.id;
  });

  test.afterAll(async () => {
    if (!enabled) return;
    await admin.from("boarding_houses").delete().eq("id", ownerBListingId);
    await Promise.all([...users.values()].map((user) => admin.auth.admin.deleteUser(user.id)));
  });

  test("anonymous callers cannot reach protected owner or admin pages", async ({ page }) => {
    await page.goto("/owner");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/admin");
    await expect(page.getByText("Overview")).toHaveCount(0);
  });

  test("a student cannot reach owner or admin data", async ({ page }) => {
    await signIn(page, users.get("student")!);
    await page.goto("/owner");
    await expect(page).not.toHaveURL(/\/owner/);
    await page.goto("/admin");
    await expect(page.getByText("Overview")).toHaveCount(0);
  });

  test("an owner cannot read another account's listing through the owner route", async ({ page }) => {
    await signIn(page, users.get("owner-a")!);
    await page.goto(`/owner/listings/${ownerBListingId}/edit`);
    await expect(page.getByRole("heading", { name: /not found|couldn't load/i })).toBeVisible();
  });

  test("an administrator can reach the protected moderation area", async ({ page }) => {
    await signIn(page, users.get("admin")!);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });
});
