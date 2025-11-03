# Documentation Updates - PDS Setup

Summary of all documentation updates based on setup experiences.

## Files Updated

### 1. INSTALLATION.md
**Added:**
- ✅ Node 20 LTS requirement in prerequisites
- ✅ `.nvmrc` setup instructions for Windows and Unix
- ✅ Official Docker PDS option (Option A - Recommended)
- ✅ ATProto monorepo PDS option (Option B - Advanced)
- ✅ Complete `.env` configuration with ALL required variables
- ✅ Cryptographic key generation instructions
- ✅ Data directory creation steps (`mkdir -p data blobs`)
- ✅ `PDS_DEV_MODE` requirement for localhost
- ✅ Expected startup output
- ✅ Custom `start-dev.js` script documentation

**Clarified:**
- Build requires all atproto packages: `corepack pnpm -r build`
- `dev` command only watches templates, not a server
- `start` command actually runs the server

### 2. TROUBLESHOOTING.md
**Added Quick Reference Table:**
- Most common errors with one-line fixes
- Links to Official Docker PDS as alternative

**Added New Sections:**
- Environment Variables Reference (required vs development)
- Complete `.env` template for copy-paste
- "Cannot open database because directory does not exist"
- "Resource URL must use the https scheme"
- "Running from wrong directory"
- "better-sqlite3 says 'done' but still fails"
- Complete PDS Setup Checklist (step-by-step verification)

**Enhanced Sections:**
- Node 24+ compatibility issues (expanded)
- better-sqlite3 troubleshooting (multiple solutions)
- Visual Studio Build Tools verification

### 3. QUICK_START.md (NEW)
**Created comprehensive quick start with:**
- Prerequisites checklist
- Option A: Docker PDS (recommended)
- Option B: Source build (advanced)
- Common issues with solutions
- VS Code integration guide
- Next steps and resources

### 4. README.md
**Added:**
- Node 20 switch to quick start
- Link to new Quick Start Guide
- Organized documentation by category
- Official PDS in project structure
- Explanation of two PDS options

### 5. workspace.code-workspace
**Added:**
- Official PDS workspace folder
- Official PDS terminal profile
- "Start Official PDS (Docker)" task
- "🚀 Start All Services (with Official PDS)" task

**Fixed:**
- PDS start command from `dev` to `start`

### 6. Project Files Created
**New Files:**
- `.nvmrc` - Specifies Node 20
- `scripts/use-node-version.bat` - Helper for nvm-windows
- `atproto/packages/pds/start-dev.js` - Development server starter
- `official-pds/` - Submodule of official Docker PDS

**Modified:**
- `atproto/packages/pds/package.json` - Added `"start"` script

## Key Learnings Documented

### Node Version
- **Node 24+** breaks better-sqlite3
- **Node 20 LTS** is required
- Must reinstall dependencies after switching versions

### Environment Configuration
The PDS requires THREE types of configuration:

1. **Storage** (blobstore, data directory)
2. **Security** (JWT, admin password, crypto keys)  
3. **Development Mode** (for localhost HTTP, OAuth)

### Critical Environment Variables
Most commonly missed:
- `PDS_DEV_MODE="true"` - Required for localhost
- `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` - Must generate
- `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX` - Must generate
- `PDS_BLOBSTORE_DISK_LOCATION` - Must exist

### Setup Order Matters
1. Switch to Node 20 FIRST
2. Install dependencies (without --ignore-scripts for PDS)
3. Build all packages
4. Configure .env
5. Generate keys
6. Create directories
7. Start server

### Common Gotchas
- `dev` command ≠ `start` command
- .env must be loaded by start-dev.js (dotenv)
- Directories must exist before first run
- Must run from correct directory
- better-sqlite3 compilation can succeed but still not work

## Alternative: Official Docker PDS

For users who don't want to deal with:
- Node version issues
- Native module compilation
- Complex environment setup
- OAuth/HTTPS configuration

The `official-pds/` Docker version:
- ✅ Works out of the box
- ✅ No build tools required
- ✅ Production-ready
- ✅ What Bluesky officially recommends

## Documentation Structure

```
docs/
├── QUICK_START.md          ← Start here (NEW)
├── INSTALLATION.md         ← Detailed setup (UPDATED)
├── TROUBLESHOOTING.md      ← All errors we hit (UPDATED)
├── DEVELOPMENT.md          ← Development workflow
├── ARCHITECTURE.md         ← System design
├── CONTRIBUTING.md         ← How to contribute
├── TESTING.md              ← Running tests
├── PHASES.md               ← Implementation roadmap
├── SECURITY.md             ← Security considerations
└── CHANGELOG_DOCS.md       ← This file
```

## For Future Contributors

When encountering setup issues:
1. Document the error in TROUBLESHOOTING.md
2. Add the solution to the Quick Reference table
3. Update INSTALLATION.md if a step was missing
4. Test the documented solution on a fresh setup
5. Update this changelog

---

**Last Updated:** November 2, 2025  
**Node Version Required:** 20 LTS  
**Major Issues Resolved:** 12+

