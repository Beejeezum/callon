import { expect, test } from "@playwright/test";

test("requester can inspect an offer and reach private coordination", async ({
  page,
}) => {
  await page.goto("/asks/birthday-party/offers");
  await page
    .getByRole("link", { name: /Janet.*I can lend 2 folding tables/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /Janet can help/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Accept this offer/i }).click();
  await expect(
    page.getByRole("heading", { name: /Coordinate with Janet/i }),
  ).toBeVisible();
  await expect(page.getByText("123 Maple Dr")).toBeVisible();
});
