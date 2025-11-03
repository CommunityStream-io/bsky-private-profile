# Testing Guide

Guide for running tests across all components of the private profile implementation.

## Quick Start

**Prerequisites:**
- Node 18 or 20 (required for native modules)
- Dependencies installed and built

```bash
# Ensure correct Node version
nvm use 20

# From project root
cd atproto
pnpm install
pnpm build

# Run PDS tests
cd packages/pds
npm run test:sqlite -- --testPathPattern="preferences.test.ts"
```

## PDS Backend Tests

### Running All Tests

```bash
cd atproto/packages/pds

# Run all tests
npm test

# Run with SQLite (faster, no external dependencies)
npm run test:sqlite
```

### Running Specific Tests

```bash
# Privacy preferences tests
npm run test:sqlite -- --testPathPattern="preferences.test.ts"

# Follow requests tests
npm run test:sqlite -- --testPathPattern="follow-requests.test.ts"

# Run single test by name
npm run test:sqlite -- --testNamePattern="creates private profile preference"
```

### Test Results

**Privacy Preferences (`preferences.test.ts`):**
- ✅ 17/17 tests passing
- All privacy profile preference functionality validated

**Follow Requests (`follow-requests.test.ts`):**
- ✅ 7/9 tests passing
- ⚠️ 2 backlink tests expected to fail (feature not fully implemented)

### Test Environment Setup

**Required:**
1. Node 18 or 20 (Node 22+ has `better-sqlite3` compatibility issues)
2. All packages built: `pnpm -r build`
3. Dev-env package compiled (included in build)

**Setup from scratch:**

```bash
# Switch to Node 20
nvm use 20

# Install pnpm for this Node version
npm install -g pnpm@8.15.9

# From atproto root
pnpm install
pnpm build

# Run tests
cd packages/pds
npm run test:sqlite
```

## Frontend Tests

### Bluesky App Tests

```bash
cd bluesky-app

# Unit tests
yarn test

# Component tests
yarn test:components

# Type checking
yarn typecheck
```

### E2E Tests

```bash
cd bluesky-app

# Run E2E test suite
yarn test:e2e

# Run specific E2E test
yarn test:e2e --testNamePattern="privacy settings"
```

## Lexicon Tests

Test custom lexicons and schemas:

```bash
cd community-stream-lexicon

# Run lexicon tests
npm test

# Validate lexicon schemas
npm run validate
```

## Common Test Commands

### Watch Mode

```bash
# PDS tests in watch mode
cd atproto/packages/pds
npm run test:sqlite -- --watch

# Frontend tests in watch mode
cd bluesky-app
yarn test --watch
```

### Coverage

```bash
# PDS test coverage
cd atproto/packages/pds
npm run test:sqlite -- --coverage

# Frontend coverage
cd bluesky-app
yarn test --coverage
```

### Debug Mode

```bash
# Run tests with Node debugger
cd atproto/packages/pds
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPattern="preferences.test.ts"

# Then open chrome://inspect in Chrome
```

## Troubleshooting

### Tests Won't Run

**Error:** `Could not locate the bindings file` (better-sqlite3)

**Solution:** Use Node 18 or 20
```bash
nvm use 20
cd atproto
pnpm install
pnpm build
```

**See:** [Testing Troubleshooting](troubleshooting.md#testing-issues)

### Tests Hang or Timeout

```bash
# Find resource leaks
npm run test:sqlite -- --detectOpenHandles

# Kill processes on test ports
lsof -ti:2583 | xargs kill -9

# Run single test to isolate
npm run test:sqlite -- --testPathPattern="specific-test.test.ts"
```

### Database Locked

```bash
# Kill Node processes
pkill -f node

# Clean test databases
cd atproto/packages/pds
rm -rf .test-dbs

# Run tests again
npm run test:sqlite
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Pre-commit hooks (if configured)

**Local pre-commit testing:**

```bash
# Run quick validation before commit
cd atproto/packages/pds
npm run test:sqlite -- --testPathPattern="(preferences|follow-requests).test.ts"
```

## Writing New Tests

### PDS Test Structure

```typescript
import { AtpAgent } from '@atproto/api'
import { TestNetworkNoAppView } from '@atproto/dev-env'

describe('feature name', () => {
  let network: TestNetworkNoAppView
  let agent: AtpAgent

  beforeAll(async () => {
    network = await TestNetworkNoAppView.create({
      dbPostgresSchema: 'test_schema',
    })
    agent = network.pds.getClient()
  })

  afterAll(async () => {
    await network.close()
  })

  it('test case', async () => {
    // Test implementation
  })
})
```

### Best Practices

1. **Use descriptive test names** - Explain what is being tested
2. **Clean up resources** - Always implement `afterAll` to close connections
3. **Test isolation** - Each test should be independent
4. **Use factories** - Create helper functions for common test data
5. **Assert specifics** - Test exact values, not just presence

## Integration Tests

Full stack tests across components:

```bash
# Run integration test suite
npm run test:integration

# Test specific integration
npm run test:integration -- --testPathPattern="privacy-workflow"
```

## Performance Tests

```bash
# Run performance benchmarks
cd atproto/packages/pds
npm run test:performance

# Profile memory usage
npm run test:sqlite -- --logHeapUsage
```

## Additional Resources

- [Troubleshooting Guide](troubleshooting.md#testing-issues) - Common test issues and solutions
- [PDS Documentation](../pds/README.md) - PDS-specific information
- [Contributing Guide](contributing.md) - How to contribute tests

---

**Having test issues?** Check the [Testing Troubleshooting Section](troubleshooting.md#testing-issues) for detailed solutions.
