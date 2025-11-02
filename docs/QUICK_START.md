# Quick Start Guide

Get the Bluesky Private Profile Integration project running in minutes.

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js 20 LTS** ([nvm-windows](https://github.com/coreybutler/nvm-windows) recommended)
- ✅ **Git** with submodules initialized
- ✅ **Docker Desktop** (for Official PDS option)
- ✅ **Corepack** enabled: `corepack enable`

## Option A: Quick Start with Docker PDS (Recommended)

The easiest way to get started is using the official Docker-based PDS.

### 1. Switch to Node 20

```bash
# Run the helper script
./scripts/use-node-version.bat

# Or manually
nvm install 20
nvm use 20
```

### 2. Install Dependencies

```bash
# Bluesky app
cd bluesky-app
corepack yarn install --ignore-scripts
cd ..

# Pinata integration
cd pinata-integration
npm install
cd ..
```

### 3. Start Services

**Option 1: Using VS Code Tasks**
- Press `Ctrl+Shift+P` → "Tasks: Run Task"
- Select "🚀 Start All Services (with Official PDS)"

**Option 2: Manual Start**

Terminal 1 - Official PDS:
```bash
cd official-pds
docker compose up
```

Terminal 2 - Bluesky App:
```bash
cd bluesky-app
yarn web
```

Terminal 3 - Pinata Integration:
```bash
cd pinata-integration
npm run dev
```

### 4. Access the Apps

- 🎨 **Bluesky Web App**: http://localhost:19006
- 🔧 **PDS API**: http://localhost:2583
- 🌐 **Pinata Service**: http://localhost:3000

## Option B: Build from ATProto Source (Advanced)

For developers who want to work with the ATProto monorepo source code.

### Prerequisites

- Node 20 LTS (required)
- Visual Studio Build Tools (Windows) with C++ workload
- Or build-essential (Linux)

### 1. Switch to Node 20

```bash
./scripts/use-node-version.bat
```

### 2. Install ATProto Dependencies

```bash
cd atproto

# Install dependencies (better-sqlite3 will compile)
corepack pnpm install

# Build all packages
corepack pnpm -r build
```

### 3. Configure PDS Environment

```bash
cd packages/pds
cp example.env .env

# Edit .env with minimal config (see INSTALLATION.md)
```

### 4. Generate Cryptographic Keys

```bash
# Generate PLC rotation key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate repo signing key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add both to .env:
# PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="[key1]"
# PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="[key2]"
```

### 5. Start ATProto PDS

```bash
cd ../..  # Back to atproto root
corepack pnpm --filter @atproto/pds start
```

## Common Issues

### "Could not locate the bindings file" (better-sqlite3)

**Solution:** You're on Node 24+. Switch to Node 20:
```bash
nvm use 20
cd atproto
rm -rf node_modules
corepack pnpm install
```

### "Must configure either S3 or disk blobstore"

**Solution:** The .env file isn't being loaded. Ensure `start-dev.js` has:
```javascript
require('dotenv').config()
```

### Bluesky App Port 19006 Already in Use

**Solution:** Kill existing process:
```bash
# Windows
netstat -ano | findstr :19006
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:19006 | xargs kill -9
```

### Docker Compose Not Found

**Solution:** Install Docker Desktop:
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Mac: https://docs.docker.com/desktop/install/mac-install/

## VS Code Integration

This project includes pre-configured:

### Terminal Profiles
- **Bluesky App** - Opens in bluesky-app directory
- **ATProto PDS** - Opens in atproto directory
- **Official PDS** - Opens in official-pds directory
- **Pinata Integration** - Opens in pinata-integration directory

Access via Terminal dropdown → Profile selector

### Tasks
- **🚀 Start All Services** - Starts Bluesky App + ATProto PDS + Pinata
- **🚀 Start All Services (with Official PDS)** - Starts Bluesky App + Docker PDS + Pinata
- **Start Bluesky App** - Individual service
- **Start PDS** - Individual service (ATProto)
- **Start Official PDS (Docker)** - Individual service
- **Start Pinata** - Individual service

Access via `Ctrl+Shift+P` → "Tasks: Run Task"

## Next Steps

1. **Create a test account** - See [INSTALLATION.md](./INSTALLATION.md#creating-an-account)
2. **Configure private profiles** - See [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Set up Pinata** - See [pinata-integration/README.md](../pinata-integration/README.md)

## Getting Help

- 📖 **Full Documentation**: [INSTALLATION.md](./INSTALLATION.md)
- 🐛 **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- 💬 **Issues**: [GitHub Issues](https://github.com/CommunityStream-io/bsky-private-profile/issues)

## What's Running?

After starting all services, you should see:

```
✅ Official PDS (Docker)       http://localhost:2583
✅ Bluesky Web App             http://localhost:19006  
✅ Pinata Integration Service  http://localhost:3000
```

Test the PDS health:
```bash
curl http://localhost:2583/xrpc/_health
# Should return: {"version":"..."}
```

Happy coding! 🎉

