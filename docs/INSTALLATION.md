# Installation Guide

## Prerequisites

- Node.js 18+ (tested with Node 20+)
- npm (comes with Node.js)
- Git
- Cursor IDE (recommended)

**Note:** Python is NOT required if you use `--ignore-scripts` (recommended approach). See "Native Module Build Tools" below if you need to compile native modules.

### Native Module Build Tools (Optional)

**Only needed if you remove `--ignore-scripts` flag.**

Native modules like `better-sqlite3` require build tools to compile:

**Windows:**

- Python 3.11 or earlier (3.12+ breaks `node-gyp`)
- Visual Studio Build Tools with "Desktop development with C++" workload
- Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

**macOS:**

- Python 3.11 or earlier
- Xcode Command Line Tools: `xcode-select --install`

**Linux:**

- Python 3.11 or earlier
- Build essentials: `sudo apt-get install build-essential` (Ubuntu/Debian)

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed build tool setup and Python configuration.

**Note:** This project uses **corepack** to automatically manage package managers:

- **Bluesky app**: Uses Yarn (managed by corepack)
- **atproto**: Uses pnpm (managed by corepack)
- **Other packages**: Use npm

## Clone with All Submodules

```bash
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile
```

If you already cloned without `--recursive`:

```bash
git submodule update --init --recursive
```

## Install Dependencies

Each submodule uses its own package manager. Install dependencies manually for each component.

### Enable Corepack (one-time setup)

```bash
corepack enable
```

### Install All Dependencies

Install dependencies for each submodule using `--ignore-scripts` to skip native module builds:

```bash
# Install Bluesky app dependencies with Yarn (managed by corepack)
cd bluesky-app
corepack yarn install --ignore-scripts
cd ..

# Install atproto dependencies with pnpm (managed by corepack)
# Note: Install from atproto root, not from packages/pds
cd atproto
corepack pnpm install --ignore-scripts
cd ..
```

**Why `--ignore-scripts`?** This skips compilation of native modules like `better-sqlite3`, avoiding build tool requirements on Windows/macOS. Most features work without these native modules.

**Need native modules?** If you specifically need `better-sqlite3` or other native modules, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for build tool installation.

```bash
# Install Pinata integration dependencies
cd pinata-integration
npm install --ignore-scripts
cd ..

# Install community-stream-lexicon dependencies (if needed)
cd community-stream-lexicon
npm install --ignore-scripts
cd ..
```

### Build All Packages

Build each package manually:

```bash
# Build Bluesky app
cd bluesky-app
corepack yarn build
cd ..

# Build atproto packages (includes PDS)
cd atproto
corepack pnpm build
cd ..

# Build Pinata integration (if needed)
cd pinata-integration
npm run build
cd ..

# Build lexicon (if needed)
cd community-stream-lexicon
npm run build
cd ..
```

## Common Issues

Using `--ignore-scripts` should avoid most build errors.

If you still encounter issues, see **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for detailed solutions:

- **Workspace protocol errors**
- **Permission issues**
- **Git submodule problems**
- **Installing native modules** (if you need them)
- And more...

## Configure Local Development

### 1. Set Up Local PDS

```bash
cd atproto/packages/pds

# Copy environment template
cp example.env .env

# Edit .env with:
# PDS_HOSTNAME=localhost
# PDS_PORT=2583
# PDS_JWT_SECRET=your-secret-key

# Initialize database (from atproto root)
cd ../..
# Start PDS (from atproto root)
corepack pnpm --filter @atproto/pds dev
```

Or you can use npm scripts directly in the pds package:

```bash
cd atproto/packages/pds
npm run dev
```

### 2. Configure Bluesky App

```bash
cd bluesky-app

# Point to local PDS
echo "EXPO_PUBLIC_PDS_URL=http://localhost:2583" > .env.local

# Start app
yarn web
```

### 3. Start Pinata Integration Service

```bash
cd pinata-integration

# Configure environment
cp env.example .env
# Edit .env with your Pinata credentials

# Start service
npm run dev
```

## Create Test Accounts

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.local",
    "handle": "user1.test",
    "password": "password123"
  }'
```
