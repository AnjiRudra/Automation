# Playwright + Cucumber BDD Framework

This project is a Playwright test automation framework using Cucumber BDD (Behavior-Driven Development).

## Project Structure

```
├── features/
│   ├── step_definitions/        # Step definitions (.steps.ts files)
│   ├── support/                 # World and support files
│   ├── hooks/                   # Before/After hooks
│   ├── *.feature                # Feature files (Gherkin syntax)
├── cucumber.js                  # Cucumber configuration
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install ts-node for TypeScript support:
```bash
npm install -D ts-node
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headless mode
```bash
npm run test:headless
```

### Run tests with report
```bash
npm run test:report
```

### Run tests with specific tags
```bash
npm run test:tags "@smoke"
```

## Feature Files

Feature files are written in Gherkin language and located in the `features/` directory:

- **demo-web-shop.feature** - Tests for Demo Web Shop navigation and search
- **lta-vehicle-replacement.feature** - Tests for LTA vehicle replacement eligibility

## Step Definitions

Step definitions implement the Gherkin steps and are located in `features/step_definitions/`:

- **demo-web-shop.steps.ts** - Steps for Demo Web Shop feature
- **lta-vehicle-replacement.steps.ts** - Steps for LTA vehicle replacement feature

## World Support

The `PlaywrightWorld` class in `features/support/world.ts` provides:
- Browser and page lifecycle management
- Navigation helper methods
- Common setup/teardown operations

## Hooks

The `features/hooks/hooks.ts` file contains:
- `BeforeAll` - Runs before all tests
- `Before` - Runs before each scenario
- `After` - Runs after each scenario
- `AfterAll` - Runs after all tests

## Writing New Tests

### 1. Create a Feature File

Create a new `.feature` file in the `features/` directory:

```gherkin
Feature: My New Feature
  As a user
  I want to do something
  So that I can achieve a goal

  Scenario: First scenario
    Given I navigate to the application
    When I perform an action
    Then I should see a result
```

### 2. Implement Step Definitions

Create a `.steps.ts` file in `features/step_definitions/`:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

Given('I navigate to the application', async function(this: PlaywrightWorld) {
  await this.navigateTo('https://example.com');
});

When('I perform an action', async function(this: PlaywrightWorld) {
  // Your action code here
});

Then('I should see a result', async function(this: PlaywrightWorld) {
  // Your assertion code here
});
```

## Reports

### HTML Report
View the HTML report after running tests:
```bash
# Report will be generated at: cucumber-report.html
open cucumber-report.html
```

### JSON Report
For CI/CD integration, a JSON report is generated at:
```bash
reports/cucumber-report.json
```

## Environment Variables

- `HEADLESS` - Set to 'false' to run in headed mode (default: true)
- `CI` - Set during CI/CD pipeline execution

## Best Practices

1. **One scenario per user workflow** - Each scenario should test a complete user journey
2. **Descriptive step names** - Use clear, business-readable step descriptions
3. **DRY principle** - Reuse step definitions across scenarios
4. **Page objects** - Consider creating page object models for complex pages
5. **Data-driven tests** - Use scenario outlines for testing multiple data sets

## Debugging

### Run in headed mode
```bash
HEADLESS=false npm test
```

### Use Playwright Inspector
```bash
PWDEBUG=1 npm test
```

## Troubleshooting

### TypeScript errors
Ensure `ts-node` is installed:
```bash
npm install -D ts-node
```

### Module not found errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Timeout errors
Increase timeout in cucumber.js configuration or use `setDefaultTimeout()` in world.ts

## Additional Resources

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Playwright Documentation](https://playwright.dev)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
