# Quick Start Guide

The fastest way to get up and running with local AT Protocol + Bluesky app development.

## Prerequisites

Make sure you have:

- [x] **Node.js 20** (`nvm install 20 && nvm use 20`)
- [x] **Docker Desktop** installed and running
- [x] **Git Bash** (Windows users)
- [x] **Corepack enabled** (`corepack enable`)

See [Prerequisites](prerequisites.md) for detailed installation instructions.

## Two Setup Options

Choose your path based on your needs:

### Option A: Docker PDS + Bluesky App (Recommended) ⚡

**Best for:** Quick setup, Windows users, frontend development

**Time:** ~15 minutes

1. Start Docker PDS
2. Start Bluesky app
3. Create account

### Option B: Full Development Environment (Advanced) 🔧

**Best for:** Backend development, full-stack work, testing all services

**Time:** ~30-45 minutes

1. Build ATProto packages
2. Start dev environment (PDS + AppView + services)
3. Start Bluesky app
4. Create account

---

## Option A: Docker PDS + Bluesky App (Recommended)

### Step 1: Clone Repository

```bash
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile
```

If you already cloned without `--recursive`:

```bash
git submodule update --init --recursive
```

### Step 2: Start Docker PDS

```bash
cd official-pds

# Start the PDS
docker compose -f compose.local.yaml up -d

# View logs (optional)
docker compose -f compose.local.yaml logs -f pds
```

**Verify it's running:**

```bash
curl http://localhost:2583/xrpc/_health
# Should return: {"version":"0.4.x"}
```

### Step 3: Setup Bluesky App

```bash
cd ../bluesky-app

# Install dependencies
corepack yarn install --ignore-scripts

# Compile internationalization messages
corepack yarn intl:compile

# Start web app
corepack yarn web
```

**Access the app:** http://localhost:19006

### Step 4: Create Account

In the Bluesky app:

1. Click "Create new account"
2. Choose "Custom" server and enter: `http://localhost:2583`
3. Fill in your details with a `.test` handle (e.g., `alice.test`)
4. Create your account

Or via API:

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

### You're Done! ✅

Your local setup is running:

- **PDS**: http://localhost:2583
- **Bluesky App**: http://localhost:19006

---

## Option B: Full Development Environment (Advanced)

### Step 1: Clone Repository

```bash
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile
```

### Step 2: Setup ATProto Backend

```bash
cd atproto

# Install dependencies
make deps

# Build all packages (this takes a few minutes)
make build
```

### Step 3: Start Development Environment

**Terminal 1: Start all AT Protocol services**

```bash
cd atproto

# Start the dev environment with logging
make run-dev-env-logged
```

**Expected output:**

```
🔍 Dev-env introspection server http://localhost:2581
👤 DID Placeholder server http://localhost:2582
🌞 Main PDS http://localhost:2583
🗼 Ozone server http://localhost:2587
🌅 Bsky Appview http://localhost:2584
🌅 Bsky Appview DID did:web:localhost:2584
```

**Note the AppView DID!** You may need it for configuration.

### Step 4: Verify Services

**Terminal 2: Check services are running**

```bash
# PDS health check
curl http://localhost:2583/xrpc/_health

# AppView health check
curl http://localhost:2584/xrpc/_health

# Get AppView DID
curl http://localhost:2584/.well-known/did.json | jq .id
```

### Step 5: Setup Bluesky App

**Terminal 3: Start Bluesky app**

```bash
cd bluesky-app

# Install dependencies
corepack yarn install --ignore-scripts

# Compile internationalization messages
corepack yarn intl:compile

# Start web app
corepack yarn web
```

**Access the app:** http://localhost:19006

### Step 6: Create Test Accounts

The dev environment automatically creates mock users, or you can create your own:

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

### You're Done! ✅

Your full dev environment is running:

- **PDS**: http://localhost:2583
- **AppView**: http://localhost:2584
- **PLC Directory**: http://localhost:2582
- **Introspection**: http://localhost:2581
- **Ozone**: http://localhost:2587
- **Bluesky App**: http://localhost:19006

---

## What's Already Configured

The Bluesky app is **pre-configured** to use local services when `__DEV__` is true:

**Files already set up:**

- `bluesky-app/src/lib/constants.ts` - Local service URLs
- `bluesky-app/src/state/ageAssurance/useInitAgeAssurance.ts` - AppView DID

No additional configuration needed! Just start the services and the app.

## Common Issues & Solutions

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :2583
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:2583 | xargs kill -9
```

### Docker Not Running

```bash
# Check Docker status
docker ps

# If containers are stuck
cd official-pds
docker compose -f compose.local.yaml down
docker volume prune
```

### Build Errors in atproto

```bash
cd atproto
rm -rf node_modules packages/*/dist
pnpm install --frozen-lockfile
make build
```

### App Not Connecting

1. Verify services are running: `curl http://localhost:2583`
2. Check `__DEV__` is true in the app
3. Ensure you selected "Custom" server at login with `http://localhost:2583`

## Service URLs Reference

| Service         | URL                    | Purpose              |
| --------------- | ---------------------- | -------------------- |
| **PDS**         | http://localhost:2583  | Personal Data Server |
| **AppView**     | http://localhost:2584  | Bluesky app backend  |
| **PLC**         | http://localhost:2582  | DID directory        |
| **Introspect**  | http://localhost:2581  | Dev introspection    |
| **Ozone**       | http://localhost:2587  | Moderation service   |
| **Bluesky App** | http://localhost:19006 | Web interface        |

## Stopping Everything

**Option A (Docker PDS):**

```bash
cd official-pds
docker compose -f compose.local.yaml down
```

**Option B (Full Dev Environment):**

1. Press `Ctrl+C` in Terminal 1 (dev environment)
2. Press `Ctrl+C` in Terminal 3 (Bluesky app)
3. Docker containers will be automatically cleaned up

## Next Steps

Now that you're up and running:

1. **Create posts** in the Bluesky app
2. **Test API calls** using Bruno (`bruno-api/`)
3. **Explore the codebase** in each component
4. **Read the architecture docs** to understand the system
5. **Start developing features!**

## Detailed Documentation

Need more details? See:

- [Prerequisites Guide](prerequisites.md) - Tool installation details
- [First Steps](first-steps.md) - Detailed walkthrough
- [PDS Setup](../pds/docker-setup.md) - Detailed PDS configuration
- [Bluesky App Setup](../bluesky-app/setup.md) - App configuration
- [Troubleshooting](../reference/troubleshooting.md) - Common issues

---

**Happy coding!** 🎉

Questions? Check the [troubleshooting guide](../reference/troubleshooting.md) or open an issue.
