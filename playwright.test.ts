import { test, expect } from "@playwright/test";

/**
 * E2E tests for AV Safeguard application
 * Tests critical user flows and application functionality
 */

test.describe("AV Safeguard Application", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("http://localhost:5173");
    // Wait for the app to load
    await page.waitForLoadState("networkidle");
  });

  test("should display the main page", async ({ page }) => {
    // Check for header
    await expect(page.getByText("AV SAFEGUARD")).toBeVisible();
    await expect(page.getByText("Acoustic Analysis System")).toBeVisible();

    // Check for tabs
    await expect(page.getByRole("tab", { name: /room/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /screen/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /seating/i })).toBeVisible();
  });

  test("should update room dimensions", async ({ page }) => {
    // Find and update room length
    const lengthInput = page.locator('input[id="room-length"]');
    await lengthInput.fill("25");
    await expect(lengthInput).toHaveValue("25");

    // Update room width
    const widthInput = page.locator('input[id="room-width"]');
    await widthInput.fill("16");
    await expect(widthInput).toHaveValue("16");

    // Update room height
    const heightInput = page.locator('input[id="room-height"]');
    await heightInput.fill("10");
    await expect(heightInput).toHaveValue("10");
  });

  test("should update screen configuration", async ({ page }) => {
    // Click on screen tab
    await page.getByRole("tab", { name: /screen/i }).click();
    await page.waitForTimeout(300);

    // Update screen size
    const screenSizeInput = page.locator('input[id="screen-size"]');
    await screenSizeInput.fill("150");
    await expect(screenSizeInput).toHaveValue("150");

    // Select different aspect ratio
    const aspectRatioTrigger = page.locator('button').filter({ has: page.getByText("16:9") }).first();
    await aspectRatioTrigger.click();
    const option = page.getByRole("option", { name: /2.35:1/i });
    if (await option.isVisible()) {
      await option.click();
    }
  });

  test("should add seating rows", async ({ page }) => {
    // Click on seating tab
    await page.getByRole("tab", { name: /seating/i }).click();
    await page.waitForTimeout(300);

    // Get initial row count
    const addButton = page.getByRole("button", { name: /add row/i });
    await expect(addButton).toBeVisible();

    // Add a new row
    await addButton.click();
    await page.waitForTimeout(300);

    // Verify new inputs appear
    const inputs = await page.locator("input[type='number']").count();
    expect(inputs).toBeGreaterThan(3); // Should have more than initial 3 inputs
  });

  test("should export PDF report", async ({ page }) => {
    // Listen for download event
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    const exportButton = page.getByRole("button", { name: /export/i });
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("av-safeguard-report.pdf");
  });

  test("should display analysis results", async ({ page }) => {
    // Wait for results to appear
    await page.waitForTimeout(500);

    // Check for certification badge
    const certBadge = page.locator("text=/Certification|Rating/");
    await expect(certBadge.first()).toBeVisible();

    // Check for results summary
    const resultsText = page.locator("text=Results Summary");
    await expect(resultsText).toBeVisible();

    // Check for recommendations
    const recommendationsText = page.locator("text=Recommendations");
    await expect(recommendationsText).toBeVisible();
  });

  test("should handle form validation", async ({ page }) => {
    // Try to set invalid values
    const lengthInput = page.locator('input[id="room-length"]');
    
    // Clear and set to 0
    await lengthInput.clear();
    await lengthInput.fill("0");
    
    // The app should handle this gracefully
    // Wait a moment for validation
    await page.waitForTimeout(500);
    
    // App should still be functional
    await expect(page.getByText("AV SAFEGUARD")).toBeVisible();
  });

  test("should persist state during interactions", async ({ page }) => {
    // Set a room dimension
    const lengthInput = page.locator('input[id="room-length"]');
    await lengthInput.fill("22");

    // Switch tabs
    await page.getByRole("tab", { name: /screen/i }).click();
    await page.waitForTimeout(300);

    // Switch back
    await page.getByRole("tab", { name: /room/i }).click();
    await page.waitForTimeout(300);

    // Value should still be there
    await expect(lengthInput).toHaveValue("22");
  });

  test("should be accessible", async ({ page }) => {
    // Check for proper labels
    const labels = await page.getByRole("label").count();
    expect(labels).toBeGreaterThan(0);

    // Check for buttons
    const buttons = await page.getByRole("button").count();
    expect(buttons).toBeGreaterThan(0);

    // Check for tabs
    const tabs = await page.getByRole("tab").count();
    expect(tabs).toBeGreaterThan(0);

    // Try keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
