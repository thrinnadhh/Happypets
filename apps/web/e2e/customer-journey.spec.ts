import { test, expect } from "@playwright/test";
import { loginAs, clearStorage } from "./helpers";

test.describe("Customer Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await clearStorage(page);
  });

  test("login page loads with role-based access panel", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: /role-based access/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("customer logs in and is redirected to /customer/home", async ({ page }) => {
    await loginAs(page, "customer");
    await expect(page).toHaveURL("/customer/home");
    await expect(page.getByText("HappyPets")).toBeVisible();
    await expect(page.getByText("Customer Workspace")).toBeVisible();
  });

  test("homepage shows recommended products for Dog category (default)", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    // Default category is "Dog" — product cards should appear
    await expect(page.getByRole("heading", { name: /popular picks/i })).toBeVisible();
    // Royal Canin Maxi Adult is the first Dog product in mock data
    await expect(page.getByText("Royal Canin Maxi Adult")).toBeVisible();
  });

  test("clicking Cat category shows cat products", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    await page.getByRole("button", { name: "Cat" }).click();

    // Cat products appear
    await expect(page.getByText("Whiskas Indoor Balance")).toBeVisible();
    await expect(page.getByText("Mewa Premium Cat Mix")).toBeVisible();
    // Dog product should not appear
    await expect(page.getByText("Royal Canin Maxi Adult")).not.toBeVisible();
  });

  test("clicking Fish category shows fish products", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    await page.getByRole("button", { name: "Fish" }).click();

    await expect(page.getByText("Tayo Aqua Gold")).toBeVisible();
  });

  test("clicking Dog category returns to dog products", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    // Switch to Cat first
    await page.getByRole("button", { name: "Cat" }).click();
    await expect(page.getByText("Whiskas Indoor Balance")).toBeVisible();

    // Switch back to Dog
    await page.getByRole("button", { name: "Dog" }).click();
    await expect(page.getByText("Royal Canin Maxi Adult")).toBeVisible();
  });

  test("clicking a product card navigates to product detail page", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    // Click the featured product "View Product" button
    await page.getByRole("button", { name: /view product/i }).first().click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByText("Add to Cart")).toBeVisible();
  });

  test("add to cart updates the cart count in navbar", async ({ page }) => {
    await loginAs(page, "customer");
    await page.goto("/product/dog-royal-canin");
    await page.waitForSelector("text=Add to Cart");

    // Cart count should not be visible initially
    const cartBadge = page.locator('span').filter({ hasText: /^\d+$/ }).nth(0);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    // Cart badge should now show 1
    await expect(page.locator('header').getByText("1")).toBeVisible({ timeout: 3000 });
  });

  test("add to cart increments quantity on repeated clicks", async ({ page }) => {
    await loginAs(page, "customer");
    await page.goto("/product/dog-drools");
    await page.waitForSelector("text=Add to Cart");

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.locator("text=In cart: 1")).toBeVisible();

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.locator("text=In cart: 2")).toBeVisible();
  });

  test("product detail page shows correct product information", async ({ page }) => {
    await loginAs(page, "customer");
    await page.goto("/product/cat-whiskas");
    await page.waitForSelector("h1");

    await expect(page.getByRole("heading", { name: "Whiskas Indoor Balance" })).toBeVisible();
    await expect(page.getByText("Whiskas")).toBeVisible();
    await expect(page.getByText("Cat")).toBeVisible();
    await expect(page.getByText("Add to Cart")).toBeVisible();
  });

  test("product detail shows discounted price when discount exists", async ({ page }) => {
    await loginAs(page, "customer");
    // Royal Canin has 10% discount: $82 → $73.80
    await page.goto("/product/dog-royal-canin");
    await page.waitForSelector("h1");

    await expect(page.getByText("10% off")).toBeVisible();
    await expect(page.getByText("$73.80")).toBeVisible();
  });

  test("product detail page has quantity selector", async ({ page }) => {
    await loginAs(page, "customer");
    await page.goto("/product/dog-royal-canin");
    await page.waitForSelector("text=Add to Cart");

    // Increment quantity
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("span").filter({ hasText: "2" }).first()).toBeVisible();
  });

  test("favorites link is accessible from navbar", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    await page.getByRole("link", { name: /favorites/i }).click();
    await expect(page).toHaveURL("/favorites");
  });

  test("logout redirects to login page", async ({ page }) => {
    await loginAs(page, "customer");
    await page.waitForURL("/customer/home");

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("unauthenticated access to /customer/home redirects to login", async ({ page }) => {
    await page.goto("/customer/home");
    await expect(page).toHaveURL("/login");
  });

  test("product not found shows empty state", async ({ page }) => {
    await loginAs(page, "customer");
    await page.goto("/product/nonexistent-product-id");
    await expect(page.getByText("Product not found")).toBeVisible();
    await expect(page.getByRole("button", { name: /go back home/i })).toBeVisible();
  });
});
