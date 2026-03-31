import { test, expect } from "@playwright/test";
import { loginAs, clearStorage } from "./helpers";

test.describe("SuperAdmin Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await clearStorage(page);
  });

  test("superadmin logs in and lands on /superadmin/dashboard", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await expect(page).toHaveURL("/superadmin/dashboard");
    await expect(page.getByText("Super Admin")).toBeVisible();
  });

  test("superadmin dashboard shows platform stats and navigation", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.waitForURL("/superadmin/dashboard");

    // Sidebar links
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Management" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Analytics" })).toBeVisible();
  });

  test("superadmin can navigate to Admin Management page", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.waitForURL("/superadmin/dashboard");

    await page.getByRole("link", { name: "Admin Management" }).click();
    await expect(page).toHaveURL("/superadmin/admins");
    await expect(page.getByRole("heading", { name: /approve or revoke admin access/i })).toBeVisible();
  });

  test("admin management page lists existing admins", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/admins");
    await page.waitForSelector("text=Approve or revoke admin access");

    // Mock data has 3 admins: Aarav Sharma (Approved), Nisha Kapoor (Pending), Ritika Menon (Active)
    await expect(page.getByText("Aarav Sharma")).toBeVisible();
    await expect(page.getByText("Nisha Kapoor")).toBeVisible();
    await expect(page.getByText("Ritika Menon")).toBeVisible();
  });

  test("admin list shows Approve and Revoke buttons for each admin", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/admins");
    await page.waitForSelector("text=Aarav Sharma");

    const approveButtons = page.getByRole("button", { name: "Approve" });
    const revokeButtons = page.getByRole("button", { name: "Revoke" });

    await expect(approveButtons.first()).toBeVisible();
    await expect(revokeButtons.first()).toBeVisible();
  });

  test("approving a pending admin changes their status to Approved", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/admins");
    await page.waitForSelector("text=Nisha Kapoor");

    // Nisha Kapoor is Pending — find her row and click Approve
    const nishaRow = page.locator("tr, div").filter({ hasText: "Nisha Kapoor" }).first();
    await nishaRow.getByRole("button", { name: "Approve" }).click();

    // Status badge should update to "Approved"
    await expect(nishaRow.getByText("Approved")).toBeVisible({ timeout: 3000 });
  });

  test("revoking an approved admin changes their status to Pending", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/admins");
    await page.waitForSelector("text=Aarav Sharma");

    // Aarav Sharma is Approved — revoke them
    const aaravRow = page.locator("tr, div").filter({ hasText: "Aarav Sharma" }).first();
    await aaravRow.getByRole("button", { name: "Revoke" }).click();

    // Status should now be Pending
    await expect(aaravRow.getByText("Pending")).toBeVisible({ timeout: 3000 });
  });

  test("superadmin can approve then revoke an admin in sequence", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/admins");
    await page.waitForSelector("text=Nisha Kapoor");

    const nishaRow = page.locator("tr, div").filter({ hasText: "Nisha Kapoor" }).first();

    // Approve
    await nishaRow.getByRole("button", { name: "Approve" }).click();
    await expect(nishaRow.getByText("Approved")).toBeVisible({ timeout: 3000 });

    // Revoke (now the same row should have Pending status)
    await nishaRow.getByRole("button", { name: "Revoke" }).click();
    await expect(nishaRow.getByText("Pending")).toBeVisible({ timeout: 3000 });
  });

  test("superadmin can navigate to Analytics page", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/dashboard");

    await page.getByRole("link", { name: "Analytics" }).click();
    await expect(page).toHaveURL("/superadmin/analytics");
  });

  test("superadmin cannot access customer routes", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/customer/home");
    // Should redirect to /superadmin/dashboard
    await expect(page).toHaveURL("/superadmin/dashboard");
  });

  test("superadmin cannot access admin routes", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/admin/dashboard");
    // Should redirect to /superadmin/dashboard
    await expect(page).toHaveURL("/superadmin/dashboard");
  });

  test("admin management shows leave days for each admin", async ({ page }) => {
    await loginAs(page, "superAdmin");
    await page.goto("/superadmin/admins");
    await page.waitForSelector("text=Leave Days");

    await expect(page.getByText("Leave Days")).toBeVisible();
    await expect(page.getByText("1 days")).toBeVisible(); // Aarav: 1 day
    await expect(page.getByText("6 days")).toBeVisible(); // Nisha: 6 days
  });
});
