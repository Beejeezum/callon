import { expect, test } from "@playwright/test";
import {
  expectNoSeriousAccessibilityViolations,
  joinWithEmailOtp,
  projectState,
  signInWithEmailOtp,
  submitOfferWithEmailOtp,
} from "./helpers";

test.describe.configure({ mode: "serial" });

let shareUrl = "";
let askUrl = "";
let commitmentUrl = "";
let loanUrl = "";
let memberAskUrl = "";

test("public welcome and guide explain the product without signup overload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ask before you buy." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "See how it works" }).click();
  await expect(page).toHaveURL("/guide");
  await expect(
    page.getByRole("heading", {
      name: "Borrow a thing. Meet a neighbor.",
    }),
  ).toBeVisible();
  await expect(page.locator(".guide-step-list > li")).toHaveCount(5);
  await expect(
    page.getByText(/No app download, address, or item list/),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("signed-out guard, requester creation, and safe shared Ask", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await page.goto("/activity");
  await expect(page).toHaveURL(/\/login\?next=/);

  await signInWithEmailOtp(page, state.requester.email);
  await expect(page.locator(".header-title")).toHaveText(state.circleName);
  await page
    .getByRole("main")
    .getByRole("link", { name: "Create an Ask" })
    .click();

  await page
    .getByLabel("Describe what you’re doing")
    .fill("I am putting up garage shelves next weekend.");
  await page.getByLabel("Ask title").fill("Putting up garage shelves");
  await page.getByLabel("Need description").fill("Cordless drill");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("General area").fill("North side of Maple Grove");
  await page
    .getByLabel("Anything neighbors should know?")
    .fill("A standard household drill should be enough.");
  await page.getByRole("button", { name: "Review Ask" }).click();
  await page.getByRole("button", { name: "Publish and share" }).click();
  await page.waitForURL(/\/share\/[^/]+$/);
  shareUrl = page.url();

  await expect(
    page.getByRole("heading", { name: "Putting up garage shelves" }),
  ).toBeVisible();
  await expect(page.getByText("North side of Maple Grove")).toBeVisible();
  await expect(page.getByText(/exact addresses/i)).toBeVisible();
  await expect(page.getByText("42 Secret Street")).toHaveCount(0);
  await expectNoSeriousAccessibilityViolations(page);
});

test("verified contributor submits an unlisted item without joining", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await page.context().clearCookies();
  await page.goto(shareUrl);
  await expect(page.getByText(/1 needed/)).toBeVisible();
  await submitOfferWithEmailOtp(
    page,
    state.lender.email,
    state.lender.displayName,
  );
  await expect(
    page.getByRole("heading", { name: "Your offer is in" }),
  ).toBeVisible();
  await expect(
    page.getByText(/contact information is not published/i),
  ).toBeVisible();
});

test("requester accepts privately, adds encrypted logistics, and checks out", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(page, state.requester.email);
  await page.getByRole("link", { name: /Putting up garage shelves/i }).click();
  await page.waitForURL(/\/asks\/[^/]+$/);
  askUrl = page.url();
  await page.getByRole("link", { name: /Review private offers/i }).click();
  await page.getByRole("link", { name: /Casey Contributor/i }).click();
  await expect(
    page.getByRole("heading", { name: /Casey Contributor can help/i }),
  ).toBeVisible();
  await expect(page.getByText("42 Secret Street")).toHaveCount(0);
  await page.getByRole("button", { name: "Accept this Offer" }).click();
  await page.waitForURL(/\/commitments\/[^/]+$/);
  commitmentUrl = page.url();
  await expect(
    page.getByRole("heading", { name: /Coordinate with Casey Contributor/i }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByRole("button", { name: /Add/ }).click();
  await page.getByLabel("Address").fill("42 Secret Street");
  await page.getByLabel("City").fill("Testville");
  await page.getByLabel("State").fill("FL");
  await page.getByLabel("Postal code").fill("33333");
  await page
    .getByLabel("Pickup notes")
    .fill("Use the side gate after confirming.");
  await page.getByRole("button", { name: "Save privately" }).click();
  await expect(page.getByText("42 Secret Street")).toBeVisible();
  await page
    .getByLabel(/Message Casey Contributor/)
    .fill("Saturday morning works for me.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Saturday morning works for me.")).toBeVisible();

  await page.getByRole("button", { name: "Confirm item picked up" }).click();
  await page.waitForURL(/\/loans\/[^/]+$/);
  loanUrl = page.url();
  await expect(page.getByText("Checked Out")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("borrower extension, lender decision, return, and progressive memory", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(
    page,
    state.requester.email,
    new URL(loanUrl).pathname,
  );
  await page.getByRole("button", { name: "Request an extension" }).click();
  const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  await page.getByLabel("Date").fill(future.toISOString().slice(0, 10));
  await page.getByLabel("Time").fill("18:00");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText(/Extension requested/)).toBeVisible();

  await signInWithEmailOtp(page, state.lender.email, new URL(loanUrl).pathname);
  await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();
  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page.getByText("Checked Out")).toBeVisible();

  await signInWithEmailOtp(
    page,
    state.requester.email,
    new URL(loanUrl).pathname,
  );
  await page.getByRole("button", { name: "Mark as returned" }).click();
  await expect(page.getByText(/Return marked/)).toBeVisible();

  await signInWithEmailOtp(page, state.lender.email, new URL(loanUrl).pathname);
  await page.getByRole("button", { name: "Confirm return" }).click();
  await expect(
    page.getByRole("heading", { name: "Loan closed" }),
  ).toBeVisible();
  await page.getByLabel("Item name").fill("Cordless drill");
  await page.getByRole("button", { name: "Save preference" }).click();
  await expect(page.getByText(/Saved privately/)).toBeVisible();
});

test("admin invite, join acceptance, restriction, and restoration", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(page, state.requester.email, "/admin");
  await page
    .getByRole("button", { name: "Create 30-day Paseos invite" })
    .click();
  const inviteUrl = await page.getByLabel("Invitation link").inputValue();

  await joinWithEmailOtp(
    page,
    inviteUrl,
    state.joiner.email,
    state.joiner.displayName,
  );
  await expect(page.locator(".header-title")).toHaveText(state.circleName);

  await signInWithEmailOtp(page, state.requester.email, "/admin");
  let joinerRow = page.locator(".list-row", {
    hasText: state.joiner.displayName,
  });
  await expect(joinerRow).toContainText("active");
  await expectNoSeriousAccessibilityViolations(page);
  await joinerRow.getByRole("button", { name: "Restrict" }).click();
  await expect(joinerRow).toContainText("restricted");

  await signInWithEmailOtp(page, state.joiner.email);
  await expect(page.getByText(/New activity is paused/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an Ask" })).toHaveCount(
    0,
  );
  await page.goto("/asks/new");
  await expect(page).toHaveURL("/");

  await signInWithEmailOtp(page, state.requester.email, "/admin");
  joinerRow = page.locator(".list-row", {
    hasText: state.joiner.displayName,
  });
  await joinerRow.getByRole("button", { name: "Restore" }).click();
  await expect(joinerRow).toContainText("active");
});

test("member can add a browseable item and another member can discover it", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(page, state.requester.email, "/resources/new");
  await page.getByRole("button", { name: /Folding table/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Category").selectOption({ label: "Tables & chairs" });
  await page
    .getByLabel("Helpful detail")
    .fill("One six-foot table that folds flat.");
  await page.getByText("Show in the Paseos library", { exact: true }).click();
  await page
    .getByRole("button", { name: "Add to my sharing preferences" })
    .click();
  await page.waitForURL(/\/resources\/[^/]+\?created=1$/);
  await expect(
    page.getByRole("heading", { name: "Folding table" }),
  ).toBeVisible();

  await signInWithEmailOtp(page, state.joiner.email, "/library");
  await expect(page.getByText("Folding table", { exact: true })).toBeVisible();
  await page.getByText("Folding table", { exact: true }).click();
  await expect(
    page.getByText(state.requester.displayName, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create an Ask about this" }),
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("private surfaces remain scoped across role changes", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(page, state.joiner.email);
  await page.goto(commitmentUrl);
  await expect(page.getByText("42 Secret Street")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "That page is not available" }),
  ).toBeVisible();

  await page.goto(askUrl);
  await expect(
    page.getByRole("heading", { name: "Putting up garage shelves" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Review private offers/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "This Ask is covered" }),
  ).toBeVisible();
});

test("active Circle member can offer without a shared link", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(page, state.requester.email, "/asks/new");
  await page
    .getByLabel("Describe what you’re doing")
    .fill("I am moving garden soil into two raised beds.");
  await page.getByLabel("Ask title").fill("Moving garden soil");
  await page.getByLabel("Need description").fill("One wheelbarrow");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("General area").fill("Community garden");
  await page.getByRole("button", { name: "Review Ask" }).click();
  await page.getByRole("button", { name: "Publish and share" }).click();
  await page.waitForURL(/\/share\/[^/]+$/);

  await signInWithEmailOtp(page, state.requester.email);
  await page.getByRole("link", { name: /Moving garden soil/i }).click();
  await page.waitForURL(/\/asks\/[^/]+$/);
  memberAskUrl = page.url();

  await signInWithEmailOtp(
    page,
    state.joiner.email,
    new URL(memberAskUrl).pathname,
  );
  await expect(
    page.getByRole("link", { name: /Review private offers/i }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "I can help" }).click();
  await expectNoSeriousAccessibilityViolations(page);
  await page.getByLabel("What item is it?").fill("Garden wheelbarrow");
  await page
    .getByLabel("Tell the requester what you can contribute")
    .fill("I can lend my wheelbarrow on Saturday morning.");
  await page.getByRole("button", { name: "Submit privately" }).click();
  await expect(
    page.getByRole("heading", { name: "Your Offer is in" }),
  ).toBeVisible();

  await signInWithEmailOtp(
    page,
    state.requester.email,
    new URL(memberAskUrl).pathname,
  );
  await page.getByRole("link", { name: /Review private offers/i }).click();
  await expect(page.getByText(state.joiner.displayName)).toBeVisible();
});

test("suspended membership has no Circle activity or creation access", async ({
  page,
}, testInfo) => {
  const state = await projectState(testInfo);
  await signInWithEmailOtp(page, state.requester.email, "/admin");
  let joinerRow = page.locator(".list-row", {
    hasText: state.joiner.displayName,
  });
  await joinerRow.getByRole("button", { name: "Suspend" }).click();
  await expect(joinerRow).toContainText("suspended");

  await signInWithEmailOtp(page, state.joiner.email);
  await expect(
    page.getByRole("heading", {
      name: "Your membership is currently suspended",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an Ask" })).toHaveCount(
    0,
  );
  await page.goto("/asks/new");
  await expect(page).toHaveURL("/");

  await signInWithEmailOtp(page, state.requester.email, "/admin");
  joinerRow = page.locator(".list-row", {
    hasText: state.joiner.displayName,
  });
  await joinerRow.getByRole("button", { name: "Restore" }).click();
  await expect(joinerRow).toContainText("active");
});
