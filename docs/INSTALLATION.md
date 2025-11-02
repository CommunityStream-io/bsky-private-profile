# Installation Guide

## Prerequisites

- **Node.js 20 LTS (Required)**
  - Node 24+ has compatibility issues with `better-sqlite3`
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows)
  - The project includes a `.nvmrc` file for automatic version switching
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

## Set Up Node Version

This project requires Node.js 20 LTS. Use nvm to switch to the correct version:

### Windows (nvm-windows)

```bash
# nvm-windows doesn't auto-read .nvmrc, so specify version explicitly
nvm install 20
nvm use 20

# OR use the helper script
./scripts/use-node-version.bat

# Verify you're on Node 20
node --version  # Should show v20.x.x
```

### macOS/Linux (nvm)

```bash
# Unix nvm reads .nvmrc automatically
nvm use

# Or manually
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

**Don't have nvm?**

- **macOS/Linux**: Install from https://github.com/nvm-sh/nvm
- **Windows**: Install from https://github.com/coreybutler/nvm-windows/releases

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

You have two options for running a local PDS:

**Option A: Official Docker PDS (Recommended for Development)**  
Simpler setup using Docker, no native module compilation needed.

**Option B: ATProto Monorepo PDS**  
Build from source, requires Node 20 and native module compilation.

### Option A: Official Docker PDS (Recommended)

The official PDS uses Docker and is much simpler to set up. See the [official PDS documentation](https://github.com/bluesky-social/pds) for detailed instructions.

**Quick Start:**

```bash
cd official-pds

# Follow the installer script (Ubuntu/Debian) or manual Docker setup
# See: https://github.com/bluesky-social/pds#readme
```

The official PDS includes:

- ✅ Docker Compose setup (no native compilation)
- ✅ Automatic TLS/HTTPS with Caddy
- ✅ Built-in admin tools (`pdsadmin`)
- ✅ Production-ready configuration

### Option B: ATProto Monorepo PDS (Advanced)

Build the PDS from the atproto monorepo source. This requires Node 20 and compiling native modules.

**Requirements:**

- Node 20 LTS
- Visual Studio Build Tools (Windows) or build-essential (Linux)
- All atproto packages built

The PDS needs to be built before it can be started. Since it depends on other atproto packages, build all packages:

```bash
# Build all atproto packages (from atproto root)
# This may take a few minutes
cd atproto
corepack pnpm -r build

# Set up environment configuration
cd packages/pds
cp example.env .env
```

Edit `.env` for local development (use `cursor .env` or any editor):

```bash
# Minimal local development config
PDS_HOSTNAME="localhost"
PDS_PORT="2583"
PDS_DATA_DIRECTORY="data"
PDS_BLOBSTORE_DISK_LOCATION="blobs"
PDS_JWT_SECRET="development-secret-change-in-production"
PDS_ADMIN_PASSWORD="admin"
PDS_INVITE_REQUIRED="0"
PDS_DID_PLC_URL="https://plc.directory"
PDS_BSKY_APP_VIEW_URL="https://api.bsky.app"
PDS_BSKY_APP_VIEW_DID="did:web:api.bsky.app"
```

**Note:** The `example.env` includes many optional fields for production deployments. The minimal config above is sufficient for local development. You can also generate private keys later if needed.

**Start the PDS server:**

```bash
# From atproto/packages/pds directory
npm run start

# Or from atproto root directory
cd ../..
corepack pnpm --filter @atproto/pds start
```

You should see output like:

```
🚀 Starting PDS server...
✅ PDS Server started successfully!
🌐 Server URL: http://localhost:2583
📍 Hostname: localhost
🔌 Port: 2583
```

**Note:** A custom `start-dev.js` script has been added to the PDS package to make it easier to run the server in development mode. The `dev` command only watches template files and doesn't start the actual server.

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
