# Setting Up Local AppView for Complete Local Development

If you need the Bluesky UI to work properly with your local PDS, you need to run a local AppView service.

## Why You Need This

**The Problem:**
- Your local PDS at `localhost:2583` works fine
- But the Bluesky UI uses AppView endpoints like `app.bsky.actor.getProfile`
- These get proxied to the public AppView at `api.bsky.app`
- Public AppView can't reach your local PDS → `handle.invalid`

**The Solution:**
- Run a local AppView at `localhost:2584`
- Configure it to index your local PDS
- Configure the Bluesky app to use your local AppView
- Now everything works locally! ✅

## Prerequisites

- PostgreSQL database (AppView requires it)
- Node 20
- Your local PDS already running at `localhost:2583`

## Quick Start

### Step 1: Install PostgreSQL

**Windows:**
Download from: https://www.postgresql.org/download/windows/

Or using Docker:
```bash
docker run --name postgres-appview -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bsky -p 5432:5432 -d postgres:14
```

### Step 2: Configure AppView

Create `.env` file in `atproto/packages/bsky`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bsky

# Server
BSKY_HOSTNAME=localhost
BSKY_PORT=2584

# Your local PDS
PDS_HOST_URL=http://localhost:2583

# Development
DEV_MODE=true
LOG_ENABLED=true
LOG_LEVEL=info

# Required services (use public for now)
DID_PLC_URL=https://plc.directory
LABELER_DID=did:plc:ar7c4by46qjdydhdevvrndac
LABELER_KEYWORDS=[]
```

### Step 3: Build and Run AppView

```bash
cd atproto
corepack pnpm --filter @atproto/bsky build
corepack pnpm --filter @atproto/bsky start
```

### Step 4: Configure Bluesky App to Use Local AppView

Edit `bluesky-app/src/lib/constants.ts`:

```typescript
// Add this constant (around line 15):
export const DEV_ENV_APPVIEW = 'http://localhost:2584'

// Update this (around line 13):
export const DEFAULT_SERVICE = LOCAL_DEV_SERVICE

// Then configure the app to use local AppView
// (This might require finding where AppView is configured - search for BSKY_APP_VIEW)
```

### Step 5: Test

```bash
# AppView health check
curl http://localhost:2584/xrpc/_health

# Test profile through local AppView
curl "http://localhost:2584/xrpc/app.bsky.actor.getProfile?actor=stephen.test"
```

## Expected Results

With local AppView running:
- ✅ Handles resolve correctly (no more handle.invalid)
- ✅ Profiles load with correct stats
- ✅ Feeds work (from your local data)
- ✅ Complete local development environment

## Challenges

**AppView is complex:**
- Requires PostgreSQL
- Needs to subscribe to your PDS's event stream
- Must index all data
- Resource intensive

**Estimated setup time:** 2-4 hours

## Alternative: Accept UI Limitations

**For building private profile features, you might not need the UI to work perfectly!**

You can develop using:
- ✅ Bruno API for all testing
- ✅ Direct PDS endpoints
- ✅ Backend logic implementation
- ✅ API-level testing

Then test UI integration later when you deploy to a public server.

## Which Approach?

**Choose based on your immediate needs:**

**Need UI now?**
→ Set up local AppView (complex but complete)

**Building backend features?**
→ Skip UI, use Bruno API (simpler, faster to start)

**Want to test with public AppView?**
→ Deploy PDS to a public server (production-like)

---

**What would you like to do?** I can help with any of these approaches!

