# Local AT Protocol Development Environment Setup Guide

This guide will help you set up a local development environment for AT Protocol development, including running a local PDS (Personal Data Server) and AppView that your Bluesky app can connect to.

## Overview

The `@atproto/dev-env` package provides a local development environment with:

- **PDS** (Personal Data Server) on `http://localhost:2583`
- **AppView** (Bsky) on `http://localhost:2584`
- **PLC** (DID Placeholder server) on `http://localhost:2582`
- **Ozone** (Moderation service) on `http://localhost:2587`
- **Introspection server** on `http://localhost:2581`

## Prerequisites

### Required Software

1. **Node.js 18+**

   ```bash
   # Using nvm (recommended)
   nvm install 18
   nvm use 18
   ```

2. **pnpm**

   ```bash
   npm install --global pnpm
   ```

3. **Docker** (required for PostgreSQL and Redis)

   - Install Docker Desktop for Windows
   - Ensure Docker is running

4. **Git Bash** (you're already using this)

5. **jq** (JSON processor)
   - Download from https://jqlang.github.io/jq/download/
   - Add to your PATH

## Setup Steps

### 1. Navigate to the atproto directory

```bash
cd C:/Users/trifo/bsky-private-profile/atproto
```

### 2. Install dependencies

```bash
# Install all workspace dependencies
make deps
```

### 3. Build all packages

```bash
# Build all packages in the monorepo
make build
```

### 4. Start the development environment

You have two options:

#### Option A: Basic (no logging)

```bash
make run-dev-env
```

#### Option B: With detailed logging

```bash
make run-dev-env-logged
```

This will:

- Start Docker containers for PostgreSQL and Redis
- Launch the local PDS, AppView, PLC, Ozone, and other services
- Create mock users and data for testing

### 5. Get the AppView DID

Once the dev environment is running, you'll see output like:

```
🌅 Bsky Appview http://localhost:2584
🌅 Bsky Appview DID did:web:localhost:2584
```

**IMPORTANT**: You need to get the actual DID from the running server:

```bash
# In a new terminal window
curl http://localhost:2584/.well-known/did.json
```

Copy the `"id"` field from the response. It should look like: `did:web:localhost:2584`

### 6. Configure the Bluesky App

The Bluesky app is already partially configured for local dev! Look at the file:
`bluesky-app/src/state/ageAssurance/useInitAgeAssurance.ts` (lines 23-33)

The configuration is already set up to use:

- `DEV_ENV_APPVIEW = http://localhost:2584`
- `APPVIEW_DID = did:web:localhost:2584`

This configuration is **automatically active** when `__DEV__` is true in your app.

### 7. Update the DID if needed

If the DID from step 5 is different, update it in:
`bluesky-app/src/state/ageAssurance/useInitAgeAssurance.ts` line 32:

```typescript
APPVIEW_DID = `did:web:localhost:2584`; // Update this if needed
```

### 8. Configure the PDS connection (if needed)

Check `bluesky-app/src/lib/constants.ts` - it already has:

```typescript
export const LOCAL_DEV_SERVICE =
  Platform.OS === "android" ? "http://10.0.2.2:2583" : "http://localhost:2583";
```

This means:

- **iOS/Web**: Uses `http://localhost:2583`
- **Android**: Uses `http://10.0.2.2:2583` (Android emulator's localhost)

## Using the Development Environment

### Available Services

Once running, you can access:

- **PDS**: http://localhost:2583
- **AppView**: http://localhost:2584
- **PLC**: http://localhost:2582
- **Introspection**: http://localhost:2581
- **Ozone**: http://localhost:2587

### Creating Test Users

The dev environment automatically creates mock users with test data. You can:

1. Use the pre-created test accounts
2. Create new accounts through the PDS at `http://localhost:2583`

### Stopping the Environment

Press `Ctrl+C` in the terminal where the dev environment is running.

The Docker containers will be automatically stopped and removed.

## Troubleshooting

### Port Already in Use

If you see errors about ports being in use:

```bash
# Find and kill processes using the ports
netstat -ano | findstr :2583
netstat -ano | findstr :2584
# Kill the process using: taskkill /PID <PID> /F
```

### Docker Issues

If Docker containers fail to start:

```bash
# Check Docker is running
docker ps

# Clean up old containers
docker compose -f packages/dev-infra/docker-compose.yaml down
docker volume prune
```

### Build Errors

If you encounter build errors:

```bash
# Clean and rebuild
rm -rf node_modules
rm -rf packages/*/dist
pnpm install --frozen-lockfile
make build
```

### Database Issues

If you see database errors:

```bash
# The dev environment uses ephemeral databases that are cleaned up automatically
# Just restart the dev environment
```

## Environment Variables

The dev environment automatically sets these when running:

- `DB_POSTGRES_URL`: PostgreSQL connection string
- `REDIS_HOST`: Redis host (usually `localhost`)
- `NODE_ENV=development`: Development mode

No additional `.env` file is needed for basic usage.

## Next Steps

1. **Start the Bluesky app** in development mode
2. **Create an account** or sign in using the local PDS
3. **Test age assurance** and other features that require the AppView
4. **Monitor logs** to see requests flowing between services

## Additional Resources

- [AT Protocol Docs](https://atproto.com)
- [Dev Env README](./atproto/packages/dev-env/README.md)
- [Dev Infra README](./atproto/packages/dev-infra/README.md)
- [AT Protocol GitHub Discussions](https://github.com/bluesky-social/atproto/discussions)

## Quick Reference Commands

```bash
# Start dev environment
cd atproto && make run-dev-env

# Start with logging
cd atproto && make run-dev-env-logged

# Rebuild everything
cd atproto && make build

# Run tests
cd atproto && make test

# Check what's running
curl http://localhost:2584/.well-known/did.json
```

