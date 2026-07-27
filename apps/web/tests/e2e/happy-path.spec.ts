import { expect, test } from "@playwright/test";

test("mock Ask-to-return journey remains navigable", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /What can your neighbors help/i }),
  ).toBeVisible();

  await page
    .getByRole("main")
    .getByRole("link", { name: /Create an Ask/i })
    .click();
  await expect(
    page.getByRole("heading", { name: "What do you need help with?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Review Ask" }).click();
  await page.getByRole("button", { name: "Publish and share" }).click();

  await expect(
    page.getByRole("heading", { name: /Hosting a birthday party/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: "I can help" }).click();
  await page
    .getByLabel("Phone or email for verification")
    .fill("emily@example.test");
  await page
    .getByRole("button", { name: /Verify and submit privately/i })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your offer is in" }),
  ).toBeVisible();
});

test("exact pickup address is absent from shared Ask", async ({ page }) => {
  await page.goto("/share/oakridge-birthday-demo");
  await expect(page.getByText("123 Maple Dr")).toHaveCount(0);
  await expect(page.getByText(/does not show.*exact addresses/i)).toBeVisible();
});
