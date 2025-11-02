# Installation Guide

## Prerequisites

- Node.js 18+ (tested with Node 20+)
- npm (comes with Node.js)
- Python 3.13+ (required for native dependencies)
  - Download at https://www.python.org/downloads/
- Git
- Cursor IDE (recommended)

### Windows-Specific Requirements

**Visual Studio Build Tools** (required for native modules like `better-sqlite3`):

- Install **Visual Studio Build Tools** or **Visual Studio** with the "Desktop development with C++" workload
- Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
- Or install via: `npm install -g windows-build-tools` (older approach)

**Alternative for Windows**: You can skip native module builds if you don't need `better-sqlite3` features. The installation will show warnings but other packages will install successfully.

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

Install dependencies for each submodule:

```bash
# Install Bluesky app dependencies with Yarn (managed by corepack)
cd bluesky-app
corepack yarn install
cd ..

# Install atproto dependencies with pnpm (managed by corepack)
# Note: Install from atproto root, not from packages/pds
cd atproto
corepack pnpm install
cd ..
```

**If you encounter `better-sqlite3` build errors on Windows**, you have options:

1. **Install Visual Studio Build Tools** (recommended - see "Known Issues" section below)
2. **Continue with partial install**: The installation may show errors for `better-sqlite3`, but other packages will install successfully. Some features may not work.
3. **Install with optional dependencies skipped** (not recommended, may break functionality):
   ```bash
   cd atproto
   corepack pnpm install --ignore-optional
   cd ..
   ```

```bash
# Install Pinata integration dependencies
cd pinata-integration
npm install
cd ..

# Install community-stream-lexicon dependencies (if needed)
cd community-stream-lexicon
npm install
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

## Known Issues

### Windows: Visual Studio Build Tools Required

On Windows, `better-sqlite3` requires Visual Studio C++ build tools to compile. If you see errors like:

```
gyp ERR! find VS You need to install Visual Studio including the "Desktop development with C++" workload.
```

**Solutions:**

1. **Install Visual Studio Build Tools** (Recommended):

   - Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Select "Desktop development with C++" workload during installation
   - Restart your terminal and try installing again

2. **Install Visual Studio Community** (Full IDE):

   - Download from: https://visualstudio.microsoft.com/downloads/
   - During installation, select "Desktop development with C++" workload

3. **Continue Without better-sqlite3** (Partial functionality):
   - The installation will show warnings for `better-sqlite3` but other packages will install
   - Some features may not work without `better-sqlite3`
   - You can try installing later after setting up build tools

### Python Required for Native Dependencies

- Python 3.6+ is required for building native dependencies
- If you encounter Python errors, install Python 3 from https://www.python.org/downloads/
- Ensure Python is in your PATH

## Configure Local Development

### 1. Set Up Local PDS

```bash
cd atproto/packages/pds

# Copy environment template
cp .env.example .env

# Edit .env with:
# PDS_HOSTNAME=localhost
# PDS_PORT=2583
# PDS_JWT_SECRET=your-secret-key

# Initialize database (from atproto root)
cd ../..
corepack pnpm --filter @atproto/pds db:migrate

# Start PDS (from atproto root)
corepack pnpm --filter @atproto/pds dev
```

Or you can use npm scripts directly in the pds package:

```bash
cd atproto/packages/pds
# After installing from atproto root with pnpm, you can use npm here
npm run db:migrate
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
