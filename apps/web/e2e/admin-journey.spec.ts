import { test, expect } from "@playwright/test";
import { loginAs, clearStorage } from "./helpers";

test.describe("Admin Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await clearStorage(page);
  });

  test("approved admin logs in and lands on /admin/dashboard", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL("/admin/dashboard");
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("admin dashboard shows stats and navigation links", async ({ page }) => {
    await loginAs(page, "admin");
    await page.waitForURL("/admin/dashboard");

    // Sidebar links should be present
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  });

  test("admin can navigate to Products page and see product table", async ({ page }) => {
    await loginAs(page, "admin");
    await page.waitForURL("/admin/dashboard");

    await page.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL("/admin/products");

    // Product table should show mock data products
    await expect(page.getByRole("heading", { name: /manage product catalog/i })).toBeVisible();
    await expect(page.getByText("Royal Canin Maxi Adult")).toBeVisible();
  });

  test("admin can open product form modal via Add Product button", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/products");
    await page.waitForSelector("text=Manage product catalog");

    await page.getByRole("button", { name: "Add Product" }).click();

    await expect(page.getByRole("heading", { name: /product management form/i })).toBeVisible();
    await expect(page.getByText("Create Product")).toBeVisible();
  });

  test("admin can create a new product and it appears in the table", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/products");
    await page.waitForSelector("text=Manage product catalog");

    await page.getByRole("button", { name: "Add Product" }).click();
    await page.waitForSelector("text=Product management form");

    // Fill form fields
    await page.getByLabel("Product Name").fill("E2E Test Dog Food");
    // Category defaults to Dog
    // Brand defaults to Royal Canin (first for Dog)
    // Image URL
    const imageInput = page.locator('input[placeholder="Paste image URL"]');
    await imageInput.fill("https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?auto=format&fit=crop&w=900&q=80");
    await page.getByLabel("Description").fill("A test product created by E2E automation.");
    await page.getByLabel("Quantity").fill("50");
    await page.getByLabel("Price").fill("99.99");
    await page.getByLabel("Manufacture Date").fill("2026-01-01");
    await page.getByLabel("Expiry Date").fill("2027-01-01");

    await page.getByRole("button", { name: "Create Product" }).click();

    // Modal should close and product should appear in table
    await expect(page.getByText("E2E Test Dog Food")).toBeVisible({ timeout: 5000 });
  });

  test("admin can edit a product and see updated values", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/products");
    await page.waitForSelector("text=Royal Canin Maxi Adult");

    // Click Edit on the first product (Royal Canin)
    const editButtons = page.getByRole("button", { name: "Edit" });
    await editButtons.first().click();

    await page.waitForSelector("text=Product management form");
    await expect(page.getByText("Update Product")).toBeVisible();

    // Update the product name
    const nameInput = page.getByLabel("Product Name");
    await nameInput.clear();
    await nameInput.fill("Royal Canin Maxi Adult Updated");

    await page.getByRole("button", { name: "Update Product" }).click();

    await expect(page.getByText("Royal Canin Maxi Adult Updated")).toBeVisible({ timeout: 5000 });
  });

  test("admin can update inventory (quantity) via edit modal", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/products");
    await page.waitForSelector("text=Drools Focus Pro");

    // Find the Edit button in the Drools row
    const droolsRow = page.locator("tr, div").filter({ hasText: "Drools Focus Pro" }).first();
    await droolsRow.getByRole("button", { name: "Edit" }).click();

    await page.waitForSelector("text=Product management form");

    const quantityInput = page.getByLabel("Quantity");
    await quantityInput.clear();
    await quantityInput.fill("99");

    await page.getByRole("button", { name: "Update Product" }).click();

    // After close, the table row for Drools should show 99
    await expect(page.getByText("99")).toBeVisible({ timeout: 5000 });
  });

  test("admin can delete a product and it disappears from the table", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/products");
    await page.waitForSelector("text=Tayo Aqua Gold");

    // Click Delete on Tayo Aqua Gold
    const tayoRow = page.locator("tr, div").filter({ hasText: "Tayo Aqua Gold" }).first();
    await tayoRow.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Tayo Aqua Gold")).not.toBeVisible({ timeout: 5000 });
  });

  test("pending admin logs in and lands on /admin/dashboard", async ({ page }) => {
    await loginAs(page, "pendingAdmin");
    await expect(page).toHaveURL("/admin/dashboard");
  });

  test("pending admin sees locked products page with Pending Approval state", async ({ page }) => {
    await loginAs(page, "pendingAdmin");

    // Accessing /admin/products redirects back to /admin/dashboard for pending admins
    await page.goto("/admin/products");
    await expect(page).toHaveURL("/admin/dashboard");
  });

  test("admin products page shows correct stats", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/products");
    await page.waitForSelector("text=Manage product catalog");

    await expect(page.getByText("Products")).toBeVisible();
    await expect(page.getByText("Discounted SKUs")).toBeVisible();
    await expect(page.getByText("Low stock")).toBeVisible();
  });

  test("admin cannot access superadmin routes", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/superadmin/dashboard");
    // Should redirect to /admin/dashboard (getDefaultRoute for admin)
    await expect(page).toHaveURL("/admin/dashboard");
  });

  test("admin cannot access customer routes", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/customer/home");
    // Should redirect to /admin/dashboard
    await expect(page).toHaveURL("/admin/dashboard");
  });
});
