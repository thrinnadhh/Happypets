/**
 * payment.spec.ts
 *
 * Note: The current app uses a mock API with no real payment integration.
 * These tests cover the cart and pricing functionality that underpins
 * a future payment flow (Razorpay). Tests verify:
 *   - Cart quantity accumulates correctly (maps to: order created with correct amount)
 *   - Discount price calculations are correct (maps to: valid amount submitted)
 *   - Invalid product IDs handled gracefully (maps to: invalid request handling)
 *   - Cart persists across page navigations (maps to: cart state before checkout)
 *   - Cart badge updates in real-time (maps to: stock/quantity tracking)
 */
import { test, expect, Page } from "@playwright/test";
import { loginAs, clearStorage, CART_STORAGE_KEY } from "./helpers";

async function addProductToCart(page: Page, productId: string, times = 1): Promise<void> {
  await page.goto(`/product/${productId}`);
  await page.waitForSelector("text=Add to Cart");
  for (let i = 0; i < times; i++) {
    await page.getByRole("button", { name: "Add to Cart" }).click();
    // Small wait to avoid click merging
    await page.waitForTimeout(100);
  }
}

test.describe("Cart & Pricing (Payment Foundation)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await clearStorage(page);
    await loginAs(page, "customer");
  });

  test("cart starts empty — no badge shown in navbar", async ({ page }) => {
    await page.goto("/customer/home");
    // Cart badge should not be rendered when count is 0
    const badge = page.locator("header span").filter({ hasText: /^\d+$/ });
    await expect(badge).toHaveCount(0);
  });

  test("adding one item creates cart with correct quantity (maps to: order amount)", async ({ page }) => {
    await addProductToCart(page, "dog-royal-canin", 1);

    // In-page indicator shows 1
    await expect(page.locator("text=In cart: 1")).toBeVisible();

    // Navbar badge shows 1
    await expect(page.locator("header").getByText("1")).toBeVisible();
  });

  test("adding quantity 1 three times accumulates to 3 (maps to: correct total)", async ({ page }) => {
    await addProductToCart(page, "dog-royal-canin", 3);

    await expect(page.locator("text=In cart: 3")).toBeVisible();
    await expect(page.locator("header").getByText("3")).toBeVisible();
  });

  test("using quantity selector before adding respects selected quantity", async ({ page }) => {
    await page.goto("/product/dog-drools");
    await page.waitForSelector("text=Add to Cart");

    // Increment to 2
    await page.getByRole("button", { name: "+" }).click();
    // Cart should say 2 before we add
    const qty = page.locator("span").filter({ hasText: "2" }).first();
    await expect(qty).toBeVisible();

    await page.getByRole("button", { name: "Add to Cart" }).click();

    // Should add 2 to cart
    await expect(page.locator("text=In cart: 2")).toBeVisible();
  });

  test("discounted price is calculated correctly for Royal Canin (10% off $82 = $73.80)", async ({ page }) => {
    await page.goto("/product/dog-royal-canin");
    await page.waitForSelector("h1");

    // Original: $82, 10% off → $73.80
    await expect(page.getByText("$73.80")).toBeVisible();
    await expect(page.getByText("$82.00")).toBeVisible(); // crossed-out original
    await expect(page.getByText("10% off")).toBeVisible();
  });

  test("discounted price is calculated correctly for Whiskas Cat (12% off $41 = $36.08)", async ({ page }) => {
    await page.goto("/product/cat-whiskas");
    await page.waitForSelector("h1");

    // $41 - 12% = $36.08
    await expect(page.getByText("$36.08")).toBeVisible();
    await expect(page.getByText("12% off")).toBeVisible();
  });

  test("product with no discount shows original price only", async ({ page }) => {
    // Tayo Aqua Gold has no discount
    await page.goto("/product/fish-tayo");
    await page.waitForSelector("h1");

    await expect(page.getByText("$24.00")).toBeVisible();
    // No discount badge should appear
    await expect(page.getByText("% off")).not.toBeVisible();
  });

  test("invalid product ID shows not found state (maps to: invalid order handling)", async ({ page }) => {
    await page.goto("/product/invalid-product-xyz");
    await expect(page.getByText("Product not found")).toBeVisible();
    // No Add to Cart button rendered
    await expect(page.getByRole("button", { name: "Add to Cart" })).not.toBeVisible();
  });

  test("cart persists when navigating between pages (maps to: cart state before checkout)", async ({ page }) => {
    await addProductToCart(page, "cat-mewa", 2);

    // Navigate away to home
    await page.goto("/customer/home");
    await page.waitForSelector("text=HappyPets");

    // Cart badge should still show 2 (persisted in localStorage)
    await expect(page.locator("header").getByText("2")).toBeVisible();
  });

  test("cart accumulates across different products (maps to: multi-item order)", async ({ page }) => {
    // Add 1 of Royal Canin
    await addProductToCart(page, "dog-royal-canin", 1);

    // Navigate to Drools and add 1
    await addProductToCart(page, "dog-drools", 1);

    // Total cart count = 2
    await expect(page.locator("header").getByText("2")).toBeVisible();
  });

  test("quantity selector minimum is 1 (maps to: no zero-quantity orders)", async ({ page }) => {
    await page.goto("/product/dog-royal-canin");
    await page.waitForSelector("text=Add to Cart");

    // Try to decrement below 1
    const decrementBtn = page.getByRole("button", { name: "-" });
    await decrementBtn.click();

    // Should stay at 1
    const qtyDisplay = page.locator(".min-w-\\[48px\\]");
    await expect(qtyDisplay).toHaveText("1");
  });

  test("product card in homepage shows discounted price when discount exists", async ({ page }) => {
    await page.goto("/customer/home");
    await page.waitForSelector("text=Royal Canin Maxi Adult");

    // Royal Canin has 10% OFF badge on product card
    await expect(page.getByText("10% OFF").first()).toBeVisible();
  });

  test("localStorage cart data is correctly structured after adding items", async ({ page }) => {
    await addProductToCart(page, "dog-royal-canin", 2);

    const cartData = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, CART_STORAGE_KEY);

    expect(cartData).not.toBeNull();
    expect(Array.isArray(cartData)).toBe(true);
    const item = (cartData as Array<{ productId: string; quantity: number }>).find(
      (i) => i.productId === "dog-royal-canin"
    );
    expect(item).toBeDefined();
    expect(item?.quantity).toBe(2);
  });
});
