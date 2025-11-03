# Testing Guide

## Unit Tests

Run unit tests for each component:

```bash
# Frontend tests
cd bluesky-app && yarn test

# Backend tests
cd atproto && npm test

# Lexicon tests
cd community-stream-lexicon && npm test
```

## Integration Tests

```bash
# Run full integration test suite
npm run test:integration
```

## E2E Tests

```bash
# Run E2E tests
cd bluesky-app && yarn test:e2e
```
