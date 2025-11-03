# ATProto Monorepo PDS Setup

Build and run the PDS from the ATProto monorepo source code. This is an **advanced option** for developers who want direct access to the PDS source code.

## ⚠️ Important Limitations

### Windows Users

**The ATProto monorepo PDS CANNOT create accounts on Windows!**

**Problem**: The PDS uses DIDs (like `did:plc:xxx`) as directory names. Colons are illegal characters in Windows file paths, causing account creation to fail.

**Error you'll see:**

```
ENOENT: no such file or directory, mkdir 'C:\...\did:plc:xxx'
```

**Solutions:**

1. **Use Docker PDS instead** (recommended) → [Docker Setup](docker-setup.md)
2. **Use WSL2** (Windows Subsystem for Linux) to run this PDS
3. **Use this PDS only for reading/studying** the source code, not for running

### Recommended For

- ✅ Linux/macOS users
- ✅ Developers working on PDS source code
- ✅ Advanced users who need source-level debugging
- ✅ Learning the PDS codebase

## Prerequisites

- **Node.js 20 LTS** (mandatory, Node 24+ breaks native modules)
- **Build tools** for native module compilation:
  - **Windows**: Visual Studio Build Tools with C++ workload + Python 3.11
  - **macOS**: Xcode Command Line Tools + Python 3.11
  - **Linux**: build-essential + Python 3.11
- **pnpm** (via corepack)
- **Git**

See [Prerequisites Guide](../getting-started/prerequisites.md) for installation details.

## Setup Steps

### Step 1: Navigate to atproto Directory

```bash
cd atproto
```

### Step 2: Install Dependencies

```bash
# Install all workspace dependencies
# Do NOT use --ignore-scripts for the PDS (native modules needed)
corepack pnpm install
```

This will compile native modules like `better-sqlite3` which are required for the PDS.

### Step 3: Build All Packages

The PDS depends on other atproto packages, so build everything:

```bash
# Build all packages in the monorepo
corepack pnpm -r build
```

This may take several minutes on the first run.

### Step 4: Create Environment Configuration

```bash
cd packages/pds

# Copy the example environment file
cp example.env .env
```

### Step 5: Configure Environment Variables

Edit `.env` with your configuration. See [Configuration Guide](configuration.md) for detailed options.

**Minimum required configuration:**

```bash
# Server Configuration
PDS_HOSTNAME="localhost"
PDS_PORT="2583"

# Data Storage (REQUIRED - use ABSOLUTE PATHS)
PDS_DATA_DIRECTORY="/absolute/path/to/atproto/packages/pds/data"
PDS_BLOBSTORE_DISK_LOCATION="/absolute/path/to/atproto/packages/pds/blobs"
PDS_ACTOR_STORE_DIRECTORY="/absolute/path/to/atproto/packages/pds/data/actors"

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

# Node.js Settings
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

**Important:** Replace `/absolute/path/to/...` with your actual absolute paths.

**Windows example:**

```bash
PDS_DATA_DIRECTORY="C:/Users/yourname/bsky-private-profile/atproto/packages/pds/data"
```

**macOS/Linux example:**

```bash
PDS_DATA_DIRECTORY="/home/yourname/bsky-private-profile/atproto/packages/pds/data"
```

### Step 6: Generate Cryptographic Keys

The PDS requires two 256-bit cryptographic keys for security:

```bash
# Generate PLC rotation key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate repo signing key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated hex strings into your `.env` file:

```bash
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="735344574b2290ce11be4eaaa90ac25d401123e5d239144e4c2ed2ee78f40482"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="8e2f9dad5dca5796c0b8193e6e085035d1e2d9792655c26d211c821ebb02fe99"
```

**⚠️ Security Warning:**

- Never commit these keys to version control
- Generate unique keys for each environment
- Keep keys secret and secure

### Step 7: Create Required Directories

```bash
# From atproto/packages/pds directory
mkdir -p data blobs data/actors
```

### Step 8: Start the PDS

```bash
# Option 1: From packages/pds directory
npm run start

# Option 2: From atproto root directory
cd ../..
corepack pnpm --filter @atproto/pds start
```

**Expected output:**

```
🚀 Starting PDS server...
✅ PDS Server started successfully!
🌐 Server URL: http://localhost:2583
📍 Hostname: localhost
🔌 Port: 2583
```

### Step 9: Verify It's Running

```bash
curl http://localhost:2583/xrpc/_health
```

**Expected response:**

```json
{ "version": "0.4.x" }
```

## Development Commands

### Start PDS in Development Mode

```bash
cd atproto/packages/pds
npm run start
```

### Watch for Changes (Templates Only)

```bash
npm run dev
```

Note: The `dev` command only watches template files, not the entire codebase.

### Rebuild PDS

```bash
# From atproto root
corepack pnpm --filter @atproto/pds build
```

### Rebuild Everything

```bash
# From atproto root
corepack pnpm -r build
```

### Clean Build

```bash
cd atproto
rm -rf packages/pds/dist
rm -rf packages/*/dist
corepack pnpm install
corepack pnpm -r build
```

## Creating Accounts

### Via API

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

**Remember:** This will fail on Windows due to filesystem limitations!

## Troubleshooting

### Build Errors

**Problem**: Native module compilation fails

**Solution**: Ensure you have build tools installed

```bash
# Clean and rebuild
cd atproto
rm -rf node_modules packages/*/dist
corepack pnpm install
corepack pnpm -r build
```

### "Cannot find module" Errors

**Problem**: Dependencies not installed or built

**Solution**: Reinstall and rebuild

```bash
cd atproto
corepack pnpm install
corepack pnpm -r build
```

### "better-sqlite3" Binding Errors

**Problem**: Wrong Node version or missing build tools

**Solutions:**

```bash
# 1. Check Node version (must be 20)
node --version

# 2. Switch to Node 20
nvm use 20

# 3. Rebuild native modules
cd atproto
rm -rf node_modules
corepack pnpm install
```

### Environment Variables Not Loading

**Problem**: `.env` file not being read

**Solution**: Ensure `.env` is in `atproto/packages/pds/` directory and properly formatted

### Database Errors

**Problem**: Database files corrupted or missing

**Solution**: Clean data and start fresh

```bash
cd atproto/packages/pds
rm -rf data blobs
mkdir -p data blobs data/actors
npm run start
```

### Absolute Path Issues

**Problem**: PDS can't find data directories

**Solution**: Use absolute paths in `.env`, not relative paths

```bash
# ❌ Wrong (relative)
PDS_DATA_DIRECTORY="data"

# ✅ Correct (absolute)
PDS_DATA_DIRECTORY="/home/user/bsky-private-profile/atproto/packages/pds/data"
```

## Source Code Structure

Understanding the PDS codebase:

```
atproto/packages/pds/
├── src/
│   ├── api/              # XRPC endpoints
│   ├── auth/             # Authentication logic
│   ├── db/               # Database layer
│   ├── repo/             # Repository management
│   ├── services/         # Business logic
│   └── index.ts          # Entry point
├── dist/                 # Compiled JavaScript
├── tests/                # Test suite
└── package.json
```

### Key Files

- `src/index.ts` - Server initialization
- `src/api/` - All XRPC method implementations
- `src/db/schema/` - Database schema
- `src/services/account/` - Account management
- `src/services/repo/` - Repository operations

## Comparison: Monorepo vs Docker PDS

| Feature                      | Monorepo PDS  | Docker PDS     |
| ---------------------------- | ------------- | -------------- |
| **Windows Account Creation** | ❌ Fails      | ✅ Works       |
| **Setup Time**               | ~30 minutes   | ~5 minutes     |
| **Build Tools Required**     | ✅ Yes        | ❌ No          |
| **Source Code Access**       | ✅ Full       | ❌ Limited     |
| **Direct Debugging**         | ✅ Yes        | Container only |
| **Hot Reload**               | Template only | N/A            |
| **Production-like**          | Partial       | ✅ Yes         |
| **Best For**                 | Development   | Running        |

## Next Steps

- [Configuration Guide](configuration.md) - Detailed configuration options
- [First Steps](../getting-started/first-steps.md) - Create accounts and test
- [Troubleshooting](troubleshooting.md) - Solve common issues

---

**Note:** If you're on Windows and want to actually run the PDS (not just study the code), use the [Docker PDS](docker-setup.md) instead.
