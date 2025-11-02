# Setup Status

**Date:** November 2, 2025  
**Node Version:** 20.11.0  
**Status:** ✅ All Core Services Running

## 🎉 Current Status

| Service                   | Status                   | URL                    | Notes                                                       |
| ------------------------- | ------------------------ | ---------------------- | ----------------------------------------------------------- |
| **Bluesky App**           | ✅ Running               | http://localhost:19006 | Web interface accessible                                    |
| **Docker PDS (Official)** | ✅ Running               | http://localhost:2583  | `{"version":"0.4.188"}` - Account creation working!         |
| **Pinata Integration**    | ✅ Running               | http://localhost:3000  | Service online                                              |
| **ATProto Monorepo PDS**  | ⚠️ Not Usable on Windows | N/A                    | Filesystem limitation (colons in DIDs) - Use Docker instead |

## ✅ Completed Steps

### 1. Environment Setup

- [x] Node 20 LTS installed via nvm
- [x] Created `.nvmrc` file for version management
- [x] Created `scripts/use-node-version.bat` helper for Windows
- [x] Enabled corepack
- [x] Created root `node_modules/` for Metro compatibility

### 2. Dependencies Installed

- [x] Bluesky app dependencies (Yarn with --ignore-scripts)
- [x] ATProto dependencies (pnpm WITHOUT --ignore-scripts)
- [x] Pinata integration dependencies (npm)
- [x] better-sqlite3 compiled successfully for Node 20

### 3. Bluesky App Configuration

- [x] Compiled internationalization messages (`yarn intl:compile`)
- [x] Created `.env.local` with PDS URL
- [x] Metro bundler running on port 19006
- [x] Web interface accessible

### 4. ATProto PDS Configuration

- [x] Built all atproto packages (`corepack pnpm -r build`)
- [x] Created `.env` with 25+ required variables
- [x] Generated cryptographic keys (PLC rotation, repo signing)
- [x] Created data directories (`data/`, `blobs/`)
- [x] Enabled development mode for localhost HTTP
- [x] Custom `start-dev.js` script created
- [x] Added `start` script to package.json
- [x] Server responding to health checks

### 5. Docker PDS (Official) - Final Solution

- [x] Added official-pds submodule
- [x] Created compose.local.yaml for local development
- [x] Generated cryptographic keys
- [x] Created data directory structure (data/data, data/blobs)
- [x] Docker container running successfully
- [x] Account creation working (no Windows filesystem issues!)
- [x] Health endpoint responding: `{"version":"0.4.188"}`

### 6. Pinata Integration

- [x] Dependencies installed
- [x] Environment configured
- [x] Service running on port 3000

### 7. Documentation

- [x] Comprehensive INSTALLATION.md updates
- [x] Complete TROUBLESHOOTING.md with 15+ common errors
- [x] New QUICK_START.md guide
- [x] Updated README.md
- [x] Created CHANGELOG_DOCS.md
- [x] Updated workspace.code-workspace
- [x] Added Official Docker PDS submodule

## 🔧 Issues Encountered and Resolved

### Critical Discovery: Windows Filesystem Limitation 🚨

**Problem:** ATProto monorepo PDS uses DIDs (e.g., `did:plc:xxx`) as directory names. Colons are illegal in Windows file paths!  
**Impact:** PDS starts successfully but cannot create accounts on Windows  
**Error:** `ENOENT: no such file or directory, mkdir 'C:\...\did:plc:xxx'`  
**Solution:** Switched to Official Docker PDS (runs Linux in container)  
**Result:** Account creation now works perfectly!  
**Documentation:** Added comprehensive Windows limitation section, Docker PDS setup guide

### Node Version Issues

**Problem:** Node 24.5.0 breaks better-sqlite3  
**Solution:** Switched to Node 20.11.0 LTS  
**Documentation:** Added to prerequisites, created .nvmrc

### better-sqlite3 Compilation

**Problem:** Native module wouldn't compile  
**Solution:** Used Node 20 + reinstalled without --ignore-scripts  
**Documentation:** Comprehensive troubleshooting section

### Metro Watching Parent Directory

**Problem:** Metro looking for non-existent parent node_modules  
**Solution:** Created empty node_modules/ at project root  
**Documentation:** Added to troubleshooting guide

### Missing Locale Files

**Problem:** Bluesky app missing compiled message catalogs  
**Solution:** Ran `yarn intl:compile`  
**Documentation:** Added to installation and troubleshooting

### PDS Environment Configuration

**Problems:**

1. Missing blobstore configuration
2. Missing cryptographic keys
3. Missing development mode
4. Directories didn't exist

**Solutions:**

1. Complete .env template with all 25+ variables
2. Key generation commands documented
3. PDS_DEV_MODE="true" added
4. mkdir -p data blobs

**Documentation:**

- Complete .env reference in INSTALLATION.md
- Environment variable tables in TROUBLESHOOTING.md
- Copy-paste ready templates

### PDS .env Not Loading

**Problem:** start-dev.js didn't load .env file  
**Solution:** Added `require('dotenv').config()`  
**Documentation:** Verified in checklist

## 🎯 Next Steps

Now that all services are running, you can:

### 1. Test PDS Functionality

```bash
# Create a test account
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.local",
    "handle": "user1.test",
    "password": "password123"
  }'
```

### 2. Access Bluesky Web App

Open http://localhost:19006 in your browser and try:

- Creating an account
- Logging in with test credentials
- Creating posts
- Uploading images

### 3. Configure Pinata Integration

- Set up Pinata credentials in `pinata-integration/.env`
- Test private gateway functionality
- Connect PDS to Pinata service

### 4. Development Workflow

See [DEVELOPMENT.md](./DEVELOPMENT.md) for:

- Hot reloading setup
- Debugging tips
- Testing procedures

## 📝 Lessons Learned

### Critical Requirements

1. **Node 20 LTS is mandatory** (not optional)
2. **better-sqlite3 requires compilation** for PDS
3. **Development mode is required** for localhost
4. **Locale files must be compiled** for Bluesky app
5. **All environment variables are required** (not just some)

### Setup Order Matters

1. Node version FIRST
2. Clean reinstall dependencies
3. Compile locale files (Bluesky app)
4. Build packages (ATProto)
5. Configure environments
6. Generate keys
7. Create directories
8. Start services

### Alternative: Official Docker PDS

The `official-pds/` Docker version is available as an alternative that avoids:

- Native module compilation
- Complex environment setup
- HTTPS/OAuth configuration issues

See: https://github.com/bluesky-social/pds

## 🏆 Success Metrics

- ✅ All 3 services responding
- ✅ No blocking errors
- ✅ Warnings are expected/ignorable
- ✅ Ready for development
- ✅ Comprehensive documentation complete

## 🙏 Acknowledgments

Issues encountered during setup have all been documented so future contributors can avoid these pitfalls!

---

**Ready to start developing!** 🚀
