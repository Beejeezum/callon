import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import type { E2EProjectState, E2EState } from "./global-setup";

const statePath = path.resolve("test-results/e2e-state.json");

function parseEnv(source: string) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

async function testAdmin() {
  let local: Record<string, string> = {};
  try {
    local = parseEnv(await readFile(".env.local", "utf8"));
  } catch {
    // CI supplies environment variables directly.
  }
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? local.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? local.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing E2E Supabase environment.");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function projectState(
  testInfo: TestInfo,
): Promise<E2EProjectState> {
  const state = JSON.parse(await readFile(statePath, "utf8")) as E2EState;
  return state[testInfo.project.name as keyof E2EState];
}

export async function signInWithEmailOtp(
  page: Page,
  email: string,
  next = "/",
) {
  await page.context().clearCookies();
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByRole("button", { name: "Email" }).click();
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send one-time code" }).click();
  await page.getByLabel("Six-digit code").waitFor();

  const supabase = await testAdmin();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const otp = data.properties?.email_otp;
  if (error || !otp) throw error ?? new Error("Could not generate test OTP.");
  await page.getByLabel("Six-digit code").fill(otp);
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function submitOfferWithEmailOtp(
  page: Page,
  email: string,
  displayName: string,
) {
  await page.getByRole("button", { name: "I can help" }).click();
  await page.getByLabel("What item is it?").fill("18-volt cordless drill");
  await page
    .getByLabel("Tell the requester what you can contribute")
    .fill("I can lend a charged cordless drill with a spare battery.");
  await page.getByLabel("First name").fill(displayName);
  await page.getByRole("button", { name: "Email" }).click();
  await page.locator("#offer-contact").fill(email);
  await page.getByRole("button", { name: "Send verification code" }).click();
  await page.locator("#offer-otp").waitFor();

  const supabase = await testAdmin();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const otp = data.properties?.email_otp;
  if (error || !otp) throw error ?? new Error("Could not generate test OTP.");
  await page.locator("#offer-otp").fill(otp);
  await page.getByRole("button", { name: "Submit privately" }).click();
}

export async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(
    serious.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target),
    })),
    "Expected no serious or critical automated accessibility violations.",
  ).toEqual([]);
}
