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

The official PDS uses Docker and is much simpler to set up. **This is the recommended option for Windows** because it avoids filesystem limitations (Windows doesn't allow colons in directory names, but DIDs like `did:plc:xxx` contain colons).

**Why Docker PDS?**

- ✅ Runs Linux in container (no Windows filesystem issues)
- ✅ No native module compilation needed
- ✅ Pre-built image ready to use
- ✅ Simple configuration
- ✅ Built-in admin tools (`pdsadmin`)

**Prerequisites:**

- **Docker Desktop for Windows**: https://docs.docker.com/desktop/install/windows-install/
- Ensure Docker Desktop is running (check system tray for Docker icon)

**Local Development Setup:**

```bash
cd official-pds

# Create data directory
mkdir -p data

# Start the PDS using local development compose file
docker compose -f compose.local.yaml up -d

# View logs (optional)
docker compose -f compose.local.yaml logs -f pds
```

**Verify it's running:**

```bash
curl http://localhost:2583/xrpc/_health
# Should return: {"version":"0.4.x"}
```

**Create a test account:**

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.local",
    "handle": "user1.test",
    "password": "password123"
  }'
```

**Managing the Docker PDS:**

```bash
# Stop
docker compose -f compose.local.yaml down

# Restart
docker compose -f compose.local.yaml restart

# Access container shell
docker exec -it pds-local sh
```

**Note:** The `compose.local.yaml` is simplified for local development (no Caddy/TLS, no auto-updates). For production deployment, see the [official documentation](https://github.com/bluesky-social/pds)

### Option B: ATProto Monorepo PDS (Advanced)

Build the PDS from the atproto monorepo source. This requires Node 20 and compiling native modules.

**⚠️ Windows Limitation:** The ATProto monorepo PDS **cannot create accounts on Windows** because it uses DIDs (like `did:plc:xxx`) as directory names, and colons are illegal in Windows file paths. This works on Linux/macOS but fails on Windows.

**Solutions for Windows users:**

- Use **Option A (Docker PDS)** - recommended ✅
- Use **WSL2** (Windows Subsystem for Linux) to run the monorepo PDS
- Use this option only for **reading/studying the code**, not for running

**Requirements:**

- Node 20 LTS
- Visual Studio Build Tools (Windows) or build-essential (Linux)
- All atproto packages built
- **Linux/macOS or WSL2** (for account creation to work)

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
# Server Configuration
PDS_HOSTNAME="localhost"
PDS_PORT="2583"

# Data Storage (REQUIRED - use ABSOLUTE PATHS)
PDS_DATA_DIRECTORY="C:/Users/trifo/bsky-private-profile/atproto/packages/pds/data"
PDS_BLOBSTORE_DISK_LOCATION="C:/Users/trifo/bsky-private-profile/atproto/packages/pds/blobs"
PDS_ACTOR_STORE_DIRECTORY="C:/Users/trifo/bsky-private-profile/atproto/packages/pds/data/actors"

# Security Secrets (REQUIRED)
PDS_JWT_SECRET="development-secret-change-in-production"
PDS_ADMIN_PASSWORD="admin"

# Cryptographic Keys (REQUIRED - generate these, see below)
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="[generate-me]"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="[generate-me]"

# Development Mode (REQUIRED for localhost HTTP)
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"

# Features
PDS_INVITE_REQUIRED="0"
PDS_DISABLE_SSRF_PROTECTION="1"
LOG_ENABLED="1"
LOG_LEVEL="info"

# AT Protocol Services (Public Endpoints)
PDS_DID_PLC_URL="https://plc.directory"
PDS_BSKY_APP_VIEW_URL="https://api.bsky.app"
PDS_BSKY_APP_VIEW_DID="did:web:api.bsky.app"
PDS_CRAWLERS="https://bsky.network"

# OAuth Provider Info
PDS_OAUTH_PROVIDER_NAME="Local Development PDS"
PDS_OAUTH_PROVIDER_PRIMARY_COLOR="#7507e3"

# Node.js Settings
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

**Generate Cryptographic Keys:**

The PDS requires two 256-bit cryptographic keys. Generate them:

```bash
# From atproto/packages/pds directory
# Generate PLC rotation key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output example: 735344574b2290ce11be4eaaa90ac25d401123e5d239144e4c2ed2ee78f40482

# Generate repo signing key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output example: 8e2f9dad5dca5796c0b8193e6e085035d1e2d9792655c26d211c821ebb02fe99
```

Copy these generated keys into your `.env` file:

- `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="[first-key]"`
- `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="[second-key]"`

**⚠️ Important:** Never commit these keys to version control!

**Create Required Directories:**

```bash
# From atproto/packages/pds directory
mkdir -p data blobs data/actors
```

**Important Notes:**

- The `example.env` includes many optional fields for production deployments
- The config above includes all REQUIRED fields for local development
- **Use absolute paths** for `PDS_DATA_DIRECTORY` and `PDS_BLOBSTORE_DISK_LOCATION`
  - Relative paths only work when running `node ./start-dev.js` directly from `packages/pds`
  - When using `corepack pnpm --filter`, the working directory is `atproto` root, not `packages/pds`
  - Replace `C:/Users/trifo/...` with your actual path

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

# Compile internationalization messages (required for first run)
yarn intl:compile

# Point to local PDS
echo "EXPO_PUBLIC_PDS_URL=http://localhost:2583" > .env.local

# Start app
yarn web
```

**Note:** The `intl:compile` command compiles translation files for all supported languages. This step is automatically run during `yarn install` on CI, but must be run manually for local development.

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
