# Playwright Browser Installation Note

Due to network connectivity issues during automated setup, Playwright browser installation was not completed.

## Manual Installation Required

To run E2E tests, please manually install Playwright browsers:

```bash
npx playwright install chromium
```

Or install all browsers:

```bash
npx playwright install
```

## Test Verification

Once browsers are installed, run the E2E tests:

```bash
npm run test:e2e
```

This will:
- Start the Next.js dev server automatically
- Run all route tests
- Generate screenshots in `.sisyphus/evidence/`

## Test Coverage

The test suite verifies:
- Homepage loads with "Figure Painter" heading
- Extract page loads with "数据提取" heading
- Plot page loads with "科研绘图" heading
- Navigation links work correctly from homepage

All test files are configured and ready to run once browsers are installed.
