# Troubleshooting Guide

Common issues and solutions for the Bluesky Private Profile Integration project.

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
require('dotenv').config()
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
