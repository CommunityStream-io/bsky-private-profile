# Troubleshooting Guide

Common issues and solutions for the Bluesky Private Profile Integration project.

## Quick Reference - Most Common Issues

| Error                                                           | Quick Fix                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **"Could not locate the bindings file"**                        | You're on Node 24+. Switch to Node 20: `nvm use 20` then reinstall                       |
| **"Must configure either S3 or disk blobstore"**                | Add to `.env`: `PDS_BLOBSTORE_DISK_LOCATION="blobs"`                                     |
| **"Must configure plc rotation key"**                           | Generate keys (see below) and add to `.env`                                              |
| **"Cannot open database because the directory does not exist"** | Create directories: `mkdir -p data blobs`                                                |
| **"Resource URL must use the https scheme"**                    | Add to `.env`: `PDS_DEV_MODE="true"`                                                     |
| **Visual Studio Build Tools errors**                            | Install "Desktop development with C++" workload OR use `--ignore-scripts`                |
| **Metro watching parent node_modules**                          | Create empty: `mkdir node_modules` in project root                                       |
| **Missing locale/locales/XX/messages**                          | Run: `yarn intl:compile` in bluesky-app                                                  |
| **Windows: mkdir did:plc:xxx (colons in paths)**                | ⚠️ ATProto PDS won't work on Windows. Use Docker PDS instead                             |
| **Docker: Port 2583 already in use**                            | Stop other PDS: `taskkill //PID [PID] //F`                                               |
| **Docker: Cannot open database**                                | Create dirs: `mkdir -p data/data data/blobs` then restart                                |
| **Docker: Must configure plc rotation key**                     | Keys should be in `compose.local.yaml` - regenerate if missing                           |
| **"Invalid handle" or "Unable to resolve handle"**              | First: Check if account exists. Then: Ensure `PDS_DEV_MODE="true"` is set                |
| **"Handle TLD is invalid or disallowed"**                       | Use `.test` handles (e.g., `user.test`), NOT `.localhost` - only `.test` works           |
| **"Handle already taken"**                                      | Account exists! This means handle resolution should work. Try logging in.                |
| **CORS error: `ip.bsky.app/config`**                            | Safe to ignore! App falls back to defaults. See "Bluesky App Warnings" below.            |
| **"Invalid handle" in UI (but API works)**                      | You're logged into wrong service! Use "Custom" service at login: `http://localhost:2583` |

**⚠️ Windows Users:** The ATProto monorepo PDS cannot create accounts on Windows due to filesystem limitations (colons in DIDs). Use the [Official Docker PDS](https://github.com/CommunityStream-io/pds) (`official-pds/compose.local.yaml`) instead - it's Linux-based and just works!

## Environment Variables Reference

### Required Variables (PDS will not start without these)

| Variable                                    | Description              | Example                             |
| ------------------------------------------- | ------------------------ | ----------------------------------- |
| `PDS_HOSTNAME`                              | Server hostname          | `"localhost"`                       |
| `PDS_PORT`                                  | Server port              | `"2583"`                            |
| `PDS_DATA_DIRECTORY`                        | SQLite database location | `"data"` (use absolute path)        |
| `PDS_BLOBSTORE_DISK_LOCATION`               | Blob storage location    | `"blobs"` (use absolute path)       |
| `PDS_ACTOR_STORE_DIRECTORY`                 | Actor repository storage | `"data/actors"` (use absolute path) |
| `PDS_JWT_SECRET`                            | JWT signing secret       | `"your-secret-key"`                 |
| `PDS_ADMIN_PASSWORD`                        | Admin password           | `"admin"`                           |
| `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` | 64-char hex key          | Generate with crypto                |
| `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX` | 64-char hex key          | Generate with crypto                |
| `PDS_DID_PLC_URL`                           | PLC directory URL        | `"https://plc.directory"`           |
| `PDS_BSKY_APP_VIEW_URL`                     | Bluesky app view API     | `"https://api.bsky.app"`            |
| `PDS_BSKY_APP_VIEW_DID`                     | App view DID             | `"did:web:api.bsky.app"`            |

### Development Mode Variables (Required for localhost)

| Variable                       | Description                   | Value                 |
| ------------------------------ | ----------------------------- | --------------------- |
| `PDS_DEV_MODE`                 | Enable dev mode (allows HTTP) | `"true"`              |
| `PDS_SERVICE_HANDLE_DOMAINS`   | Test handle domains           | `".test"`             |
| `PDS_DISABLE_SSRF_PROTECTION`  | Disable SSRF checks           | `"1"`                 |
| `PDS_INVITE_REQUIRED`          | Require invite codes          | `"0"`                 |
| `LOG_ENABLED`                  | Enable logging                | `"1"`                 |
| `LOG_LEVEL`                    | Log verbosity                 | `"info"` or `"debug"` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Skip TLS verification         | `"0"`                 |

### Complete .env Template for Local Development

Copy this complete template to `atproto/packages/pds/.env`:

```bash
# Server Configuration
PDS_HOSTNAME="localhost"
PDS_PORT="2583"

# Data Storage
PDS_DATA_DIRECTORY="C:/Users/yourname/path/to/atproto/packages/pds/data"
PDS_BLOBSTORE_DISK_LOCATION="C:/Users/yourname/path/to/atproto/packages/pds/blobs"
PDS_ACTOR_STORE_DIRECTORY="C:/Users/yourname/path/to/atproto/packages/pds/data/actors"

# Security Secrets
PDS_JWT_SECRET="development-secret-change-in-production"
PDS_ADMIN_PASSWORD="admin"

# Cryptographic Keys (GENERATE THESE - see Installation Guide)
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="[run: node -e console.log crypto.randomBytes 32 .toString hex]"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="[run: node -e console.log crypto.randomBytes 32 .toString hex]"

# Development Mode (REQUIRED for localhost)
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"
PDS_DISABLE_SSRF_PROTECTION="1"
PDS_INVITE_REQUIRED="0"

# Logging
LOG_ENABLED="1"
LOG_LEVEL="info"

# AT Protocol Services
PDS_DID_PLC_URL="https://plc.directory"
PDS_BSKY_APP_VIEW_URL="https://api.bsky.app"
PDS_BSKY_APP_VIEW_DID="did:web:api.bsky.app"
PDS_CRAWLERS="https://bsky.network"

# OAuth Provider
PDS_OAUTH_PROVIDER_NAME="Local Development PDS"
PDS_OAUTH_PROVIDER_PRIMARY_COLOR="#7507e3"

# Node.js
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

## Windows: Visual Studio Build Tools Required

On Windows, `better-sqlite3` requires Visual Studio C++ build tools to compile.

### Quick Workaround (Recommended)

Skip native module builds entirely:

```bash
cd atproto
corepack pnpm install --ignore-scripts
cd ..

# For Bluesky app
cd bluesky-app
corepack yarn install --ignore-scripts
cd ..
```

This bypasses the compilation step. Most features will work without `better-sqlite3`.

### Symptoms (if not using --ignore-scripts)

```
gyp ERR! find VS You need to install Visual Studio including the "Desktop development with C++" workload.
```

Or:

```
error MSB8020: The build tools for v142 (Platform Toolset = 'v142') cannot be found.
```

### Solutions (if you need better-sqlite3)

#### 1. Install Visual Studio Build Tools

1. Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. **During installation, select "Desktop development with C++" workload**
3. **Also ensure these individual components are checked:**
   - MSVC v143 - VS 2022 C++ x64/x86 build tools (Latest)
   - Windows 11 SDK (or Windows 10 SDK)
   - C++ CMake tools for Windows
4. Restart your terminal and try installing again

#### 2. Modify Existing Installation

If you already installed Build Tools but getting MSB8020 error:

1. Open "Visual Studio Installer" (search in Start menu)
2. Click "Modify" on "Build Tools 2022"
3. Ensure "Desktop development with C++" is checked
4. In the right panel, verify these are selected:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 11 SDK (or Windows 10 SDK)
5. Click "Modify" to complete the installation
6. Restart your terminal

#### 3. Install Visual Studio Community (Full IDE)

Alternative if you want the full IDE:

1. Download from: https://visualstudio.microsoft.com/downloads/
2. During installation, select "Desktop development with C++" workload
3. Restart your terminal

#### 4. Continue Without better-sqlite3 (Partial Functionality)

If you can't install build tools:

- The installation will show warnings for `better-sqlite3` but other packages will install
- Some features may not work without `better-sqlite3`
- You can install build tools later and retry

## Python Version Compatibility Issues

### Symptoms

```
ModuleNotFoundError: No module named 'distutils'
```

Python 3.12+ removed the `distutils` module, which `node-gyp` requires.

### Solutions

#### 1. Use Python 3.11 or Earlier (Recommended)

1. Download Python 3.11: https://www.python.org/downloads/release/python-3119/
2. Install and ensure it's in your PATH
3. Configure npm to use it:
   ```bash
   npm config set python "C:\Python311\python.exe"
   ```
4. Verify:
   ```bash
   python --version  # Should show 3.11.x
   npm config get python
   ```

#### 2. Install setuptools for Python 3.12+

If you want to keep Python 3.12+:

```bash
pip install setuptools
```

This provides the missing `distutils` module.

#### 3. Configure Multiple Python Versions

If you have multiple Python versions:

```bash
# Set npm to use specific Python
npm config set python "C:\Path\To\Python311\python.exe"

# Verify
npm config get python
```

## Node Version Issues

### Node 24+ and better-sqlite3 Compatibility (IMPORTANT)

**This is the most common issue!** Node 24+ has breaking changes that cause `better-sqlite3` to fail.

**Symptoms:**

```
Error: Could not locate the bindings file. Tried:
 → C:\...\better-sqlite3\build\better_sqlite3.node
```

Or compilation errors about missing Visual Studio components even when installed.

**Solution: Use Node 20 LTS (Required)**

This project **requires Node 20 LTS** and includes a `.nvmrc` file for easy version management:

```bash
# Navigate to project root
cd ~/bsky-private-profile

# If you have nvm installed:
nvm use

# Or install Node 20 first:
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

**After switching Node versions, you MUST reinstall dependencies:**

```bash
# Clean up
cd atproto
rm -rf node_modules
rm -rf packages/pds/node_modules

# Reinstall (better-sqlite3 will compile automatically)
corepack pnpm install

# Build
corepack pnpm --filter @atproto/pds build
```

**Don't have nvm?**

- **Windows**: https://github.com/coreybutler/nvm-windows/releases
- **macOS/Linux**: https://github.com/nvm-sh/nvm

**Why Node 20?** Node 24 is too new and many native modules (like `better-sqlite3`) don't have prebuilt binaries or updated build configurations for it yet.

### better-sqlite3 Says "Done" But Still Fails

Sometimes you'll see `better-sqlite3: Running install script, done in 1s` but still get binding errors.

**Symptoms:**

```
better-sqlite3: Running install script, done in 1s
# But later:
Error: Could not locate the bindings file
```

**This means the script ran but didn't actually compile.** Common causes:

**Solution 1: Check Visual Studio Build Tools**

Verify you have BOTH:

1. ✅ Visual Studio Build Tools installed
2. ✅ "Desktop development with C++" workload selected

```bash
# List installed Visual Studio components
# Should show MSVC v143 and Windows SDK
```

**Solution 2: Force Rebuild**

```bash
cd atproto
corepack pnpm rebuild better-sqlite3

# Check if binary was created
ls node_modules/.pnpm/better-sqlite3@10.0.0/node_modules/better-sqlite3/build/
# Should show Release/ directory with .node file
```

**Solution 3: Download Prebuilt Binary (Node 20 only)**

```bash
cd atproto
# Try to download prebuilt binary
cd node_modules/.pnpm/better-sqlite3@10.0.0/node_modules/better-sqlite3
npx prebuild-install

# Check if it worked
ls build/Release/
# Should show better_sqlite3.node
```

**Solution 4: Use Official Docker PDS**

If all else fails, the Docker version doesn't need any native compilation:

```bash
cd ~/bsky-private-profile/official-pds
# Follow Docker setup - no compilation needed!
```

## Workspace Protocol Errors

### Symptoms

```
npm error Unsupported URL Type "workspace:": workspace:^
```

### Solution

You're trying to use npm in a pnpm workspace. Install from the correct directory:

```bash
# For atproto packages, always install from atproto root with pnpm
cd atproto
corepack pnpm install

# NOT from individual packages like atproto/packages/pds
```

## Prebuilt Binary Not Found

### Symptoms

```
prebuild-install warn install No prebuilt binaries found (target=24.5.0 runtime=node arch=x64 libc= platform=win32)
```

This is **not an error**, just a warning. It means `better-sqlite3` will compile from source instead of using a prebuilt binary.

**What happens next:**

- If you have Visual Studio Build Tools installed correctly, compilation will succeed
- If build tools are missing, you'll see the MSB8020 error (see above)

## Installation Hangs or Times Out

### Solutions

1. **Clear npm/pnpm cache:**

   ```bash
   npm cache clean --force
   corepack pnpm store prune
   ```

2. **Delete node_modules and try again:**

   ```bash
   # In each submodule
   rm -rf node_modules
   ```

3. **Check internet connection** - some packages are large

## Permission Errors

### Windows

Run terminal as Administrator if you see permission errors.

### Solution

```bash
# Try installation with --force flag
corepack pnpm install --force
```

## Corepack Not Found

### Symptoms

```
'corepack' is not recognized as an internal or external command
```

### Solution

```bash
# Enable corepack (comes with Node.js 16+)
corepack enable
```

If still not working:

```bash
# Install corepack globally
npm install -g corepack
corepack enable
```

## Git Submodule Issues

### Submodules Not Initialized

```bash
# Initialize all submodules
git submodule update --init --recursive
```

### Submodule Update Conflicts

```bash
# Reset submodules
git submodule foreach --recursive git reset --hard
git submodule update --init --recursive
```

## PDS Configuration and Startup Issues

### Error: "Must configure either S3 or disk blobstore"

This error occurs when the PDS `.env` file is missing or not being loaded properly.

**Symptoms:**

```
❌ Failed to start PDS server: Error: Must configure either S3 or disk blobstore
    at envToCfg (C:\Users\...\atproto\packages\pds\dist\config\config.js:79:15)
```

**Solutions:**

#### 1. Ensure .env File Exists

```bash
cd atproto/packages/pds
cp example.env .env
```

#### 2. Configure Required Variables

Edit `.env` with minimal local development configuration:

```bash
PDS_HOSTNAME="localhost"
PDS_PORT="2583"
PDS_DATA_DIRECTORY="data"
PDS_BLOBSTORE_DISK_LOCATION="blobs"
PDS_JWT_SECRET="development-secret-change-in-production"
PDS_ADMIN_PASSWORD="admin"
PDS_INVITE_REQUIRED="0"
PDS_DISABLE_SSRF_PROTECTION="1"
LOG_ENABLED="1"
LOG_LEVEL="info"
PDS_DID_PLC_URL="https://plc.directory"
PDS_BSKY_APP_VIEW_URL="https://api.bsky.app"
PDS_BSKY_APP_VIEW_DID="did:web:api.bsky.app"
PDS_CRAWLERS="https://bsky.network"
```

#### 3. Verify start-dev.js Loads .env

The `start-dev.js` script must load the `.env` file. Ensure it contains:

```javascript
// Load environment variables from .env file
require("dotenv").config();
```

This should be at the top of the file before requiring the PDS modules.

### Error: "Must configure plc rotation key"

This error occurs when cryptographic keys are missing from the configuration.

**Symptoms:**

```
❌ Failed to start PDS server: Error: Must configure plc rotation key
    at envToSecrets (C:\Users\...\atproto\packages\pds\dist\config\secrets.js:22:15)
```

**Solution:**

Generate and add required cryptographic keys to your `.env` file:

```bash
# From atproto/packages/pds directory
# Generate PLC rotation key (256-bit hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate repo signing key (256-bit hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add both keys to your `.env` file:

```bash
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="[generated-key-1]"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="[generated-key-2]"
```

**Important:** Keep these keys secure and never commit them to version control!

### PDS Won't Start - General Checklist

If the PDS fails to start, verify:

1. **All dependencies are installed:**

   ```bash
   cd atproto
   corepack pnpm install --ignore-scripts
   ```

2. **PDS is built:**

   ```bash
   corepack pnpm --filter @atproto/pds build
   ```

3. **`.env` file exists and is in the correct location:**

   ```bash
   cd packages/pds
   ls -la .env  # Should exist
   ```

4. **`dotenv` package is available:**

   ```bash
   # It should be in the atproto root package.json devDependencies
   cat ../../package.json | grep dotenv
   ```

5. **Start the server:**
   ```bash
   cd ../..  # Back to atproto root
   corepack pnpm --filter @atproto/pds start
   ```

### Error: Running from Wrong Directory

**Symptoms:**

```
bash: [200~node: command not found
# or
./start-dev.js: No such file or directory
```

**Solution:**

Make sure you're in the correct directory:

```bash
# Check where you are
pwd

# Should be one of:
# /c/Users/.../bsky-private-profile/atproto/packages/pds (for direct run)
# /c/Users/.../bsky-private-profile/atproto (for pnpm filter command)

# Navigate to correct directory
cd ~/bsky-private-profile/atproto/packages/pds
```

**Commands by directory:**

From `atproto/packages/pds`:

```bash
npm run start
# or
node ./start-dev.js
```

From `atproto` (root):

```bash
corepack pnpm --filter @atproto/pds start
```

### Error: "Cannot open database because the directory does not exist"

This error occurs when the data directories haven't been created.

**Symptoms:**

```
❌ Failed to start PDS server: TypeError: Cannot open database because the directory does not exist
    at new Database (...better-sqlite3/lib/database.js:65:9)
```

**Solution:**

Create the required directories:

```bash
cd atproto/packages/pds
mkdir -p data blobs data/actors
```

These directories are specified in your `.env`:

- `PDS_DATA_DIRECTORY` - SQLite databases
- `PDS_BLOBSTORE_DISK_LOCATION` - Uploaded media files
- `PDS_ACTOR_STORE_DIRECTORY` - User actor repositories (defaults to `data/actors`)

**Important:** Use **absolute paths** in `.env` if running via `corepack pnpm --filter`:

```bash
# Windows - use forward slashes
PDS_DATA_DIRECTORY="C:/Users/yourname/path/to/atproto/packages/pds/data"
PDS_BLOBSTORE_DISK_LOCATION="C:/Users/yourname/path/to/atproto/packages/pds/blobs"

# Or Unix-style (Git Bash on Windows accepts this)
PDS_DATA_DIRECTORY="/c/Users/yourname/path/to/atproto/packages/pds/data"
```

Relative paths only work if you run `node ./start-dev.js` directly from the `packages/pds` directory.

### Windows: Colon Characters in Directory Names (CRITICAL)

**This is a fundamental Windows limitation that prevents ATProto monorepo PDS from creating accounts on Windows!**

**Symptoms:**

```
ENOENT: no such file or directory, mkdir 'C:\\...\\data\\actors\\e7\\did:plc:xxx'
```

Even though the PDS starts successfully, account creation fails.

**Root Cause:**

The PDS creates directories named after DIDs (Decentralized Identifiers):

- Example DID: `did:plc:akd5jgvfewof5t4u5eqapvy3`
- Windows doesn't allow colons (`:`) in file or directory names
- Linux/macOS allow colons, so this works there

**Solutions:**

**Option 1: Use Official Docker PDS (Recommended)**

The Docker PDS runs Linux in a container where this isn't an issue:

```bash
cd ~/bsky-private-profile/official-pds
mkdir -p data
docker compose -f compose.local.yaml up -d
```

See detailed setup in [INSTALLATION.md](./INSTALLATION.md#option-a-official-docker-pds-recommended)

**Option 2: Use WSL2 (Windows Subsystem for Linux)**

Run the ATProto monorepo PDS in WSL2:

```bash
# Open WSL2 Ubuntu terminal
wsl

# Navigate to project (Windows drive mounted at /mnt/c)
cd /mnt/c/Users/yourname/bsky-private-profile/atproto

# Run in Linux environment where colons are allowed
corepack pnpm --filter @atproto/pds start
```

**Option 3: Modify PDS Source Code (Not Recommended)**

You would need to patch the actor store to:

1. Sanitize DIDs by replacing `:` with another character
2. Map sanitized names back to DIDs
3. Maintain this custom patch

This is complex and creates maintenance burden.

**Why this happens:**

- The ATProto PDS was designed for Linux servers
- Production PDS instances run on Linux
- Using DIDs as directory names is simple and efficient on Linux
- This design choice doesn't consider Windows filesystem restrictions

**Conclusion for Windows users:** Use the Official Docker PDS (`official-pds/`) for local development.

### Error: "Resource URL must use the https scheme"

This error occurs when trying to run the PDS on localhost without development mode.

**Symptoms:**

```
❌ Failed to start PDS server: Error: Resource URL must use the https scheme
    at Object.createRouter (...atproto/packages/pds/dist/auth-routes.js:18:15)
```

**Solution:**

Add development mode to your `.env`:

```bash
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"
```

Development mode allows:

- ✅ HTTP on localhost (no HTTPS required)
- ✅ Simplified OAuth flows
- ✅ Relaxed security for testing

**Important:** Never use `PDS_DEV_MODE="true"` in production!

### Expected Successful Output

When properly configured, you should see:

```
🚀 Starting PDS server...
✅ PDS Server started successfully!
🌐 Server URL: http://localhost:2583
📍 Hostname: localhost
🔌 Port: 2583
Press Ctrl+C to stop the server
```

Test the server:

```bash
curl http://localhost:2583/xrpc/_health
# Should return: {"version":"0.4.191"}
```

## Complete PDS Setup Checklist

Use this checklist to verify all requirements are met:

### Before Starting

- [ ] **Node 20 LTS installed and active**

  ```bash
  node --version  # Must show v20.x.x
  ```

- [ ] **Dependencies installed**

  ```bash
  cd atproto
  corepack pnpm install  # Without --ignore-scripts
  ```

- [ ] **better-sqlite3 compiled successfully**
  - Look for: `better-sqlite3: Running install script, done in 1s`
  - No "Could not locate bindings file" error

### Configuration Files

- [ ] **`.env` file exists**

  ```bash
  cd atproto/packages/pds
  ls -la .env  # File should exist
  ```

- [ ] **`.env` has ALL required variables:**

  - [ ] `PDS_HOSTNAME`
  - [ ] `PDS_PORT`
  - [ ] `PDS_DATA_DIRECTORY`
  - [ ] `PDS_BLOBSTORE_DISK_LOCATION`
  - [ ] `PDS_JWT_SECRET`
  - [ ] `PDS_ADMIN_PASSWORD`
  - [ ] `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` (64 char hex)
  - [ ] `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX` (64 char hex)
  - [ ] `PDS_DEV_MODE="true"`
  - [ ] `PDS_SERVICE_HANDLE_DOMAINS`
  - [ ] `PDS_DID_PLC_URL`
  - [ ] `PDS_BSKY_APP_VIEW_URL`
  - [ ] `PDS_BSKY_APP_VIEW_DID`

- [ ] **start-dev.js loads .env**
  ```bash
  grep "dotenv" start-dev.js  # Should show: require('dotenv').config()
  ```

### Directories

- [ ] **Data directories exist**
  ```bash
  cd atproto/packages/pds
  ls -ld data blobs  # Both should exist
  ```

### Build

- [ ] **PDS is built**
  ```bash
  cd atproto
  corepack pnpm --filter @atproto/pds build
  # Should succeed without TypeScript errors
  ```

### Start

- [ ] **Start the PDS from correct directory**

  ```bash
  # From atproto root:
  corepack pnpm --filter @atproto/pds start

  # OR from atproto/packages/pds:
  npm run start
  ```

### Verification

- [ ] **Server starts successfully**

  - Look for: `✅ PDS Server started successfully!`
  - Look for: `🌐 Server URL: http://localhost:2583`

- [ ] **Health check responds**
  ```bash
  curl http://localhost:2583/xrpc/_health
  # Should return: {"version":"0.4.191"}
  ```

## Docker PDS Issues

### Error: "Ports are not available" (Port 2583 Already in Use)

**Symptoms:**

```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:2583
bind: Only one usage of each socket address is normally permitted.
```

**Cause:** Another PDS is already running on port 2583 (likely the ATProto monorepo PDS).

**Solution:**

Find and stop the process using port 2583:

```bash
# Find the process
netstat -ano | findstr :2583

# Stop it (replace PID with the number from above)
taskkill //PID [PID] //F

# Then start Docker PDS
cd official-pds
docker compose -f compose.local.yaml up -d
```

### Docker PDS: "Must configure plc rotation key"

**Symptoms:**

```
Error: Must configure plc rotation key
    at envToSecrets (.../@atproto/pds/src/config/secrets.ts:18:11)
```

**Cause:** The `compose.local.yaml` is missing cryptographic keys.

**Solution:**

The `compose.local.yaml` should already include generated keys. If you created a custom compose file, generate keys and add them:

```bash
# Generate keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `compose.local.yaml` under `environment`:

```yaml
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX: "[first-key]"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX: "[second-key]"
```

Then restart:

```bash
docker compose -f compose.local.yaml down
docker compose -f compose.local.yaml up -d
```

### Docker PDS: "Cannot open database because the directory does not exist"

**Symptoms:**

Container starts but immediately crashes with:

```
TypeError: Cannot open database because the directory does not exist
    at new Database (...better-sqlite3/lib/database.js:65:9)
```

**Cause:** The volume mount point exists, but the subdirectories don't.

**Solution:**

Create the required directory structure:

```bash
cd official-pds
mkdir -p data/data data/blobs

# Restart the container
docker compose -f compose.local.yaml restart
```

The container expects:

- `./data/data` - Database files
- `./data/blobs` - Blob storage

These map to `/pds/data` and `/pds/blobs` inside the container.

### Docker Desktop Not Running

**Symptoms:**

```
error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solution:**

Start Docker Desktop:

1. Press Windows key
2. Search for "Docker Desktop"
3. Launch it
4. Wait for it to show "Docker Desktop is running" in system tray

### Verifying Docker PDS is Working

**Check container status:**

```bash
docker ps
# Should show pds-local container running
```

**Check health endpoint:**

```bash
curl http://localhost:2583/xrpc/_health
# Should return: {"version":"0.4.188"}
```

**Check logs:**

```bash
cd official-pds
docker compose -f compose.local.yaml logs -f pds
# Should show: "pds has started"
```

**Test account creation:**

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.local",
    "handle":"test.test",
    "password":"password123"
  }'
# Should return account details with DID and JWT tokens
```

### Docker PDS Management Commands

```bash
cd official-pds

# Start
docker compose -f compose.local.yaml up -d

# Stop
docker compose -f compose.local.yaml down

# Restart
docker compose -f compose.local.yaml restart

# View logs
docker compose -f compose.local.yaml logs -f pds

# Access container shell
docker exec -it pds-local sh

# Check container status
docker ps | grep pds-local

# Remove everything and start fresh
docker compose -f compose.local.yaml down -v
rm -rf data
mkdir -p data/data data/blobs
docker compose -f compose.local.yaml up -d
```

### Docker PDS: "Invalid handle" or "Unable to resolve handle"

**Symptoms:**

In the Bluesky UI, handles show as "invalid handle". When trying to resolve a handle via API:

```json
{
  "error": "InvalidRequest",
  "message": "Unable to resolve handle"
}
```

Or when trying to resolve:

```bash
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=user2.test"
# Returns: {"error":"InvalidRequest","message":"Unable to resolve handle"}
```

**Root Cause:**

This typically happens when:

1. **The account doesn't exist yet** ⚠️ (Most common!)
2. `PDS_DEV_MODE` is not set to `"true"`
3. `PDS_SERVICE_HANDLE_DOMAINS` is not configured
4. The PDS wasn't restarted after configuration changes

**⚠️ Important:** "Unable to resolve handle" usually just means **the account hasn't been created yet**, not a configuration problem!

**Solution:**

### Step 0: Check If Account Exists (Do This First!)

Before troubleshooting configuration, verify the account exists:

```bash
# Try to create the account
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.local",
    "handle": "user.test",
    "password": "password123"
  }'
```

**Possible responses:**

✅ **Account created successfully** - You'll get a JSON response with `did`, `accessJwt`, and `refreshJwt`. Handle resolution will now work!

❌ **"Handle already taken"** - Account exists, proceed to configuration troubleshooting below.

❌ **"Handle TLD is invalid or disallowed"** - Configuration issue, proceed to Step 1.

### Step 1: Verify PDS Configuration

Ensure `compose.local.yaml` has development mode enabled:

```yaml
environment:
  PDS_HOSTNAME: localhost
  PDS_DEV_MODE: "true"
  PDS_SERVICE_HANDLE_DOMAINS: ".test" # ✅ Correct for local dev
```

**Important:** `.test` is the standard TLD for local development with AT Protocol.

### Step 2: Restart PDS (Not Just Restart!)

Configuration changes require stopping and starting the container:

```bash
cd official-pds

# Stop the PDS (restart won't reload env vars)
docker compose -f compose.local.yaml down

# Start it again with new configuration
docker compose -f compose.local.yaml up -d

# Verify it's running
curl http://localhost:2583/xrpc/_health
# Should return: {"version":"0.4.x"}
```

**Why restart isn't enough:** `docker compose restart` doesn't reload environment variables. You must use `down` then `up`.

### Step 3: Create Accounts with `.test` Handles

**Option A: Using cURL**

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.local",
    "handle": "user1.test",
    "password": "password123"
  }'
```

**Option B: Using pdsadmin**

```bash
docker exec -it pds-local /pdsadmin/pdsadmin.sh account create
# When prompted, use format: user1.test
```

### Step 4: Test Handle Resolution

```bash
# Should now work!
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=user1.test"
```

Expected response:

```json
{
  "did": "did:plc:xxxxxxxxxxxxxxxxxxxxx"
}
```

### Step 5: Login in Bluesky UI

1. Open the Bluesky app at `http://localhost:19006`
2. Login with:
   - **Handle**: `user1.test`
   - **Password**: `password123`
3. Your handle should now display correctly! ✅

### Why `.test` Works in Dev Mode

With `PDS_DEV_MODE="true"` and `PDS_SERVICE_HANDLE_DOMAINS=".test"`:

1. **Account Creation**: The PDS accepts `.test` handles
2. **Handle Resolution**: In dev mode, the PDS bypasses external DNS/HTTP verification
3. **Result**: Both creation and resolution work locally without DNS configuration! ✨

### Common TLD Issues

❌ **What DOESN'T Work:**

- `user.localhost` - Rejected with "Handle TLD is invalid or disallowed"
- `user.local` - Also rejected
- Any custom TLD without proper dev mode configuration
- **Why these fail:** Listed in `DISALLOWED_TLDS` in `atproto/packages/syntax/src/handle.ts`

✅ **What WORKS:**

- `user.test` - Standard for local development
- Requires `PDS_DEV_MODE="true"` and `PDS_SERVICE_HANDLE_DOMAINS=".test"`
- **Why `.test` works:** Explicitly allowed in `atproto/packages/syntax/src/handle.ts` for "testing and development"

### Alternative: Custom Domain Setup (Advanced)

If you want to test with real domain verification (not recommended for local dev):

**Option 1: Local DNS Server**

- Run a DNS server (like `dnsmasq`)
- Configure `*.yourdomain.com` → `127.0.0.1`
- Set up a reverse proxy to handle `/.well-known/atproto-did` requests
- Update `PDS_HOSTNAME` and `PDS_SERVICE_HANDLE_DOMAINS` accordingly

**Option 2: Hosts File (Limited)**

- Add each handle to `/etc/hosts` (Windows: `C:\Windows\System32\drivers\etc\hosts`)
- Only works for exact matches, not wildcards
- Very tedious for multiple accounts
- Still needs `/.well-known/` endpoint configuration

**For 99% of local development, use `.test` with dev mode enabled.**

### Verification Checklist

- [ ] **Account actually exists** (most common issue!)
- [ ] PDS configuration has `PDS_DEV_MODE="true"`
- [ ] PDS configuration has `PDS_SERVICE_HANDLE_DOMAINS=".test"`
- [ ] PDS stopped and started (not just restarted)
- [ ] Handle resolution works via API
- [ ] Login works in Bluesky UI
- [ ] No "invalid handle" errors
- [ ] Profile displays correctly

### Quick Test: Verify Your Accounts

List all DIDs in your PDS database:

```bash
# Check what accounts exist
docker exec pds-local sh -c "ls -la /pds/data/actors"
```

Or test handle resolution for known accounts:

```bash
# Test existing accounts
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=user2.test"
# ✅ Success: {"did":"did:plc:..."}
# ❌ Doesn't exist: {"error":"InvalidRequest","message":"Unable to resolve handle"}
```

### Common Accounts Created During Setup

If you followed the setup guides, you might have:

| Handle               | Purpose                  | Password      |
| -------------------- | ------------------------ | ------------- |
| `user2.test`         | Original test account    | `password123` |
| `alice2.test`        | Testing account creation | `password123` |
| `stephen.test`       | Personal test account    | `password123` |
| `mod-authority.test` | Moderation testing       | `password123` |

### Understanding Handle Resolution in Dev Mode

In production, the AT Protocol verifies handles via:

**Method 1: HTTP Well-Known Endpoint**

```
GET https://{handle}/.well-known/atproto-did
Response: did:plc:xxxxxxxxxxxxx
```

**Method 2: DNS TXT Record**

```
TXT _atproto.{handle} = did:plc:xxxxxxxxxxxxx
```

In development mode (`PDS_DEV_MODE="true"`):

- ✅ External verification is bypassed
- ✅ Handles in `PDS_SERVICE_HANDLE_DOMAINS` are automatically trusted
- ✅ No DNS or web server configuration needed
- ⚠️ Only use dev mode for local testing, NEVER in production

## Bluesky App Issues

### "Invalid handle" in UI but API Works / Can't Fetch My Posts

**Symptoms:**

- Handle shows as "invalid handle" in the Bluesky UI
- Can't fetch your posts in the UI
- But API calls via Bruno work fine
- Handle resolution via curl works

**Root Cause:**

You're logged into the **wrong service**! The Bluesky app defaults to `https://bsky.social` (production), but your accounts are on your **local PDS** at `http://localhost:2583`.

When you login to `bsky.social`, it tries to look up `stephen.test` there, can't find it, and shows "invalid handle".

**Solution: Login to Your Local PDS**

#### Step 1: Logout

If currently logged in, logout first.

#### Step 2: Login with Custom Service

1. Click "Sign in"
2. **Look for "Hosting provider" or "Choose service provider"**
3. **Select "Custom" or "Other"** (not the default "Bluesky")
4. **Enter**: `http://localhost:2583`
5. **Handle**: `stephen.test`
6. **Password**: `password123`
7. Click "Sign In"

#### Step 3: Verify

After login:

- Your handle should display correctly ✅
- Your profile should load
- You can create posts

**See detailed guide:** [LOGIN_TO_LOCAL_PDS.md](./LOGIN_TO_LOCAL_PDS.md)

#### Alternative: Change Default Service (Development Only)

Edit `bluesky-app/src/lib/constants.ts`:

```typescript
// Change from:
export const DEFAULT_SERVICE = BSKY_SERVICE;

// To:
export const DEFAULT_SERVICE = LOCAL_DEV_SERVICE;
```

Restart the dev server. Now it defaults to your local PDS.

**⚠️ Don't commit this change!** It's for local development only.

### "I don't see any feeds!" / "Where are my posts?"

**Quick Answer:** Your local posts appear on **your profile**, not in the Discover feed.

**Understanding feeds:**

Your setup uses two services:

- **Local PDS** (`localhost:2583`) - Stores your posts
- **Public AppView** (`api.bsky.app`) - Generates public feeds

**Where to see content:**

1. **Your posts** → Go to your profile in the UI
2. **Public Bluesky feeds** → Discover tab (shows public content)
3. **Create posts** → Use the "+" button or Bruno API

**See the complete guide:** [VIEWING_FEEDS.md](./VIEWING_FEEDS.md)

**Quick test:**

```bash
# In Bruno:
1. Run: Account/Create Session (Login)
2. Run: Posts/Create Test Post
3. Run: Posts/List Posts  # Verify it worked
4. Go to your profile in the UI to see it
```

### Error: "Can't resolve './locales/XX/messages'"

The Bluesky app shows multiple errors about missing locale message files.

**Symptoms:**

```
ERROR in ./src/locale/i18n.web.ts:136:18
Module not found: Can't resolve './locales/ro/messages'
ERROR in ./src/locale/i18n.web.ts:140:18
Module not found: Can't resolve './locales/ru/messages'
... (multiple locale errors)
```

**Solution:**

Compile the internationalization message catalogs:

```bash
cd bluesky-app
yarn intl:compile
```

This generates the compiled message files for all supported languages. The app should automatically reload and errors will disappear.

**Why this happens:**

- The `.po` translation files exist in `src/locale/locales/_build/`
- They need to be compiled into `.js` files for the app to use
- The `postinstall` script normally does this, but not when using `--ignore-scripts`
- You only need to run this once, or when translations change

### Metro Bundler ENOENT Error (Parent node_modules)

**Symptoms:**

```
Error: ENOENT: no such file or directory, watch 'C:\...\bsky-private-profile\node_modules'
```

**Solution:**

Metro expects a `node_modules` folder in the parent directory. Create an empty one:

```bash
cd ~/bsky-private-profile  # Project root
mkdir node_modules
```

This is already in `.gitignore` so it won't be tracked.

**Why this happens:** Metro follows Node.js module resolution which checks parent directories for `node_modules`.

### Bluesky App Warnings (Can Be Ignored)

These warnings are **normal** for web builds and won't affect functionality:

```
WARNING: requireNativeComponent was not found in 'react-native-web/dist/index'
```

**Explanation:** These are iOS/Android-specific native components that aren't available on web. The app handles this gracefully with fallbacks.

### CORS Error: `https://ip.bsky.app/config` (Can Be Ignored)

**Symptoms:**

```
Access to fetch at 'https://ip.bsky.app/config' from origin 'http://localhost:19006'
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value
'https://bsky.app' that is not equal to the supplied origin.
```

**What This Is:**

The Bluesky app tries to fetch geolocation configuration from `ip.bsky.app` to determine region-specific features (age restrictions, content policies, etc.). This service only allows requests from the production domain (`https://bsky.app`), not from local development (`http://localhost:19006`).

**Why It's Safe to Ignore:**

The app **already handles this gracefully**:

1. It tries to fetch geolocation config
2. If it fails (CORS error), it catches the error
3. It falls back to a default configuration (no restrictions)
4. The app continues working normally
5. It retries in the background but doesn't block anything

**Your app works fine without geolocation config in development!**

**Optional: Disable the Error Message**

If the console errors bother you, you can disable geolocation fetching:

1. Open `bluesky-app/src/state/geolocation/config.ts`
2. Find line 63: `// if (__DEV__) {`
3. Uncomment lines 63-68:

```typescript
if (__DEV__) {
  geolocationConfigResolution = new Promise((y) => y({ success: true }));
  device.set(["deviceGeolocation"], undefined); // clears GPS data
  device.set(["geolocation"], DEFAULT_GEOLOCATION_CONFIG); // clears bapp-config data
  return;
}
```

This completely bypasses the geolocation service in development mode.

**Note:** This is purely cosmetic - the error doesn't affect functionality either way!

## Still Having Issues?

1. Check [GitHub Issues](https://github.com/CommunityStream-io/bsky-private-profile/issues)
2. Search for your specific error message
3. Create a new issue with:
   - Your error message
   - Operating system and version
   - Node.js version (`node --version`)
   - Python version (`python --version`)
   - Visual Studio Build Tools version (if Windows)
   - Whether you used `--ignore-scripts` during installation
   - Contents of your `.env` file (with secrets redacted)
