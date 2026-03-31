import { Page } from "@playwright/test";

// Auth credentials — email pattern determines role in the mock API
export const CREDENTIALS = {
  customer: { email: "customer@happypets.com", password: "password123" },
  admin: { email: "admin@happypets.com", password: "password123" },
  pendingAdmin: { email: "pending.admin@happypets.com", password: "password123" },
  superAdmin: { email: "superadmin@happypets.com", password: "password123" },
};

// Auth state stored in localStorage key
export const AUTH_STORAGE_KEY = "happypets-auth";
export const CART_STORAGE_KEY = "happypets-cart";

export async function loginAs(page: Page, role: keyof typeof CREDENTIALS): Promise<void> {
  const { email, password } = CREDENTIALS[role];
  await page.goto("/login");
  await page.waitForSelector('input[type="email"]');

  // Clear and fill email (the input has a default value set in state)
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation away from /login
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 5000 });
}

export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate((keys) => {
    keys.forEach((key) => localStorage.removeItem(key));
  }, [AUTH_STORAGE_KEY, CART_STORAGE_KEY]);
}

export async function getCartCount(page: Page): Promise<number> {
  const badge = page.locator(
    '.absolute.-right-1.-top-1.rounded-full.bg-\\[\\#2F4F6F\\]'
  );
  if (await badge.isVisible()) {
    const text = await badge.textContent();
    return parseInt(text ?? "0", 10);
  }
  return 0;
}
