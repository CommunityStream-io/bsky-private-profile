# Troubleshooting Guide

Quick reference for common issues across all components.

## Quick Reference

| Problem                  | Component   | Quick Fix                         | Details                                           |
| ------------------------ | ----------- | --------------------------------- | ------------------------------------------------- |
| **Port already in use**  | System      | Kill process using port           | [Ports](#port-conflicts)                          |
| **Node version issues**  | System      | Switch to Node 20                 | [Node](#node-version-issues)                      |
| **Build tools missing**  | System      | Install or use `--ignore-scripts` | [Build Tools](#build-tools)                       |
| **Docker not running**   | Docker      | Start Docker Desktop              | [Docker](#docker-issues)                          |
| **Handle shows invalid** | PDS         | Use `.test` handles               | [Handle Guide](../guides/handle-configuration.md) |
| **PDS won't start**      | PDS         | Check configuration               | [PDS Troubleshooting](../pds/troubleshooting.md)  |
| **App won't connect**    | Bluesky App | Check service URLs                | [Connection](#app-connection-issues)              |
| **Metro bundler errors** | Bluesky App | Create root node_modules          | [Metro](#metro-bundler-issues)                    |
| **Missing locale files** | Bluesky App | Run `yarn intl:compile`           | [Locales](#missing-locale-files)                  |
| **Tests won't run**      | Tests       | Use Node 18/20                    | [Testing](#testing-issues)                        |
| **better-sqlite3 error** | Tests       | Switch to Node 20                 | [Testing](#testing-issues)                        |

## Component-Specific Guides

For detailed troubleshooting of specific components:

- **[PDS Troubleshooting](../pds/troubleshooting.md)** - PDS-specific issues
- **[Handle Configuration](../guides/handle-configuration.md)** - Handle and DNS issues

## System-Wide Issues

### Node Version Issues

#### "Could not locate the bindings file"

**Problem:** Wrong Node version or native modules not compiled for current version

**Symptoms:**

```
Error: Could not locate the bindings file
Module: better-sqlite3
```

**Solution:** Use Node 20 with proper SDK headers (Mac)

```bash
# Check current version
node --version

# Should be v20.x.x
# If not:
nvm install 20
nvm use 20

# Set SDK headers for C++ compilation (Mac only)
export SDKROOT=$(xcrun --show-sdk-path)
export CXXFLAGS="-isysroot $SDKROOT -I$SDKROOT/usr/include/c++/v1"

# Reinstall dependencies
cd atproto
rm -rf node_modules
pnpm install
pnpm -r build
```

**Why Node 20 with SDK headers?**

- Node 24+ breaks `better-sqlite3` native module
- `better-sqlite3@10.0.0` may not have prebuilt binaries for all platforms
- SDK headers allow successful compilation from source on macOS
- Project is tested and configured for Node 20 LTS
- `.nvmrc` file specifies Node 20

#### Wrong Node Version Active

**Problem:** Have Node 20 installed but wrong version active

**Check:**

```bash
node --version
nvm list  # See installed versions
```

**Solution:**

```bash
nvm use 20
# Verify
node --version  # Should show v20.x.x
```

### Port Conflicts

#### Port Already in Use

**Problem:** Service can't start because port is taken

**Common ports:**

- 2583 - PDS
- 2584 - AppView
- 3000 - Pinata service
- 8081 - Metro bundler
- 19006 - Bluesky app web

**Find process:**

**Windows:**

```bash
netstat -ano | findstr :2583
# Note the PID (last column)
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -ti:2583
# Kill it
kill -9 <PID>

# Or one-liner
lsof -ti:2583 | xargs kill -9
```

### Build Tools

#### Visual Studio Build Tools Errors (Windows)

**Problem:** Can't compile native modules on Windows

**Symptoms:**

```
gyp ERR! find VS
error MSB8020: The build tools cannot be found
```

**Solution 1: Use --ignore-scripts (Recommended)**

Skip native module compilation:

```bash
cd atproto
pnpm install --ignore-scripts

cd ../bluesky-app
yarn install --ignore-scripts
```

**Solution 2: Install Build Tools**

If you specifically need native modules:

1. Download [Build Tools for Visual Studio 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. During installation, select "Desktop development with C++"
3. Also check:
   - MSVC v143 build tools
   - Windows 11 SDK
   - C++ CMake tools
4. Restart terminal
5. Reinstall dependencies

#### Python Version Issues

**Problem:** `node-gyp` requires Python 3.11 or earlier

**Error:**

```
gyp ERR! find Python
```

**Solution:**

**Windows:**

```bash
# Install Python 3.11
# Then configure npm
npm config set python "C:\Python311\python.exe"
```

**Mac:**

```bash
brew install python@3.11
```

**Or use --ignore-scripts** to avoid needing Python entirely.

### Docker Issues

#### Docker Desktop Not Running

**Problem:** Docker commands fail

**Error:**

```
Cannot connect to the Docker daemon
```

**Solution:**

1. Start Docker Desktop
2. Wait for whale icon in system tray (Windows/Mac)
3. Verify: `docker ps`

#### Docker Compose Not Found

**Problem:** `docker compose` command not recognized

**Solution:**

**Option 1:** Update Docker Desktop (includes `docker compose`)

**Option 2:** Use legacy command

```bash
docker-compose -f compose.local.yaml up -d
```

#### Container Keeps Restarting

**Problem:** Docker container crashes immediately

**Check logs:**

```bash
docker compose -f compose.local.yaml logs pds
```

**Common causes:**

- Configuration errors
- Missing environment variables
- Port already in use
- Permission issues

**Solution:** Fix the error shown in logs

### Git Submodule Issues

#### Submodules Not Initialized

**Problem:** Subdirectories are empty

**Solution:**

```bash
git submodule update --init --recursive
```

#### Submodule Update Fails

**Problem:** Can't pull submodule updates

**Solution:**

```bash
# Update all submodules
git submodule update --remote --merge

# Or specific submodule
cd bluesky-app
git pull origin main
cd ..
git add bluesky-app
git commit -m "Update submodule"
```

## App Connection Issues

### Bluesky App Can't Connect to PDS

**Problem:** App can't reach local PDS

**Symptoms:**

- Login fails
- "Network error" messages
- Timeout errors

**Check:**

1. **PDS is running:**

   ```bash
   curl http://localhost:2583/xrpc/_health
   ```

2. **Using correct server:**

   - At login, select "Custom" or "Other"
   - Enter: `http://localhost:2583`

3. **Dev mode is enabled:**

   - App should automatically use local services when `__DEV__` is true

4. **Android emulator:**
   ```bash
   # Use port forwarding
   adb reverse tcp:2583 tcp:2583
   # Or use 10.0.2.2 instead of localhost
   ```

### CORS Errors

**Problem:** Browser shows CORS errors

**Example:**

```
Access to fetch blocked by CORS policy
```

**Common cases:**

1. **`ip.bsky.app/config` CORS error:**

   - **Safe to ignore!**
   - App falls back to defaults
   - Doesn't affect functionality

2. **PDS CORS errors:**
   - Check PDS is configured for dev mode
   - Verify `PDS_DEV_MODE="true"`

## Metro Bundler Issues

### Metro Watching Parent node_modules

**Problem:** Metro bundler error about parent directory

**Error:**

```
Error: ENOENT: no such file or directory, scandir '../node_modules'
```

**Solution:**

Create empty `node_modules` in project root:

```bash
cd <project-root>
mkdir node_modules
cd bluesky-app
yarn web
```

### Metro Bundler Won't Start

**Problem:** Port 8081 already in use

**Solution:**

```bash
# Kill process on port 8081
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

### Hot Reload Not Working

**Problem:** Changes don't appear in app

**Solutions:**

1. **Reload manually:** Press `R` in Metro terminal
2. **Restart Metro:** `Ctrl+C` then `yarn web`
3. **Clear cache:**
   ```bash
   yarn start --reset-cache
   ```

## Missing Locale Files

### "Cannot find module './locale/locales/XX/messages'"

**Problem:** Internationalization messages not compiled

**Error:**

```
Error: Cannot find module './locale/locales/en/messages'
```

**Solution:**

Compile locale files:

```bash
cd bluesky-app
yarn intl:compile
```

**When needed:**

- First time running app
- After pulling updates
- After changing translation files

## Testing Issues

### Running PDS Tests

#### "Could not locate the bindings file" in Tests

**Problem:** Tests fail with `better-sqlite3` native binding errors

**Error:**

```
Could not locate the bindings file. Tried:
 → .../better-sqlite3/lib/binding/node-v127-darwin-x64/better_sqlite3.node
 → .../better-sqlite3/lib/binding/node-v115-darwin-x64/better_sqlite3.node
```

**Root Cause:**

- Node 22+ has no prebuilt binaries for `better-sqlite3` v10.0.0
- C++ compilation fails due to missing headers or incompatible toolchain
- The test environment requires working SQLite bindings

**Solution: Use Node 18 or 20**

```bash
# Switch to Node 20 (recommended)
nvm use 20

# Or Node 18
nvm use 18

# Install pnpm for the Node version
npm install -g pnpm@8.15.9

# Reinstall dependencies
cd atproto
pnpm install

# Rebuild native modules
pnpm rebuild better-sqlite3

# Run tests
cd packages/pds
npm run test:sqlite -- --testPathPattern="your-test.test.ts"
```

**Why This Works:**

- Node 18/20 have prebuilt binaries available
- Avoids C++ compilation issues entirely
- Matches the project's tested configuration

#### Test Setup Requirements

**Prerequisites for running PDS tests:**

1. **Correct Node version** (18 or 20)
2. **Dependencies installed** (`pnpm install`)
3. **Packages built** (`pnpm -r build`)
4. **Dev-env package compiled** (automatically built with pnpm -r build)

**Quick test setup:**

```bash
# From atproto root
nvm use 20
npm install -g pnpm@8.15.9

# Set SDK headers for better-sqlite3 compilation (Mac)
export SDKROOT=$(xcrun --show-sdk-path)
export CXXFLAGS="-isysroot $SDKROOT -I$SDKROOT/usr/include/c++/v1"

pnpm install
pnpm build

# Run specific test
cd packages/pds
npm run test:sqlite -- --testPathPattern="follow-requests.test.ts"
```

#### Python/Setuptools Missing (Mac)

**Problem:** `node-gyp` fails with "No module named 'distutils'"

**Error:**

```
ModuleNotFoundError: No module named 'distutils'
gyp ERR! configure error
```

**Cause:** Python 3.13+ removed `distutils` module

**Solution:**

```bash
# Install setuptools for Python 3.13
python3.13 -m pip install setuptools --break-system-packages

# Then rebuild
cd atproto
pnpm rebuild better-sqlite3
```

**Better Solution:** Use Node 18/20 which have prebuilt binaries (no compilation needed)

#### C++ Compilation Errors

**Problem:** `better-sqlite3` won't compile

**Errors:**

```
fatal error: 'climits' file not found
error MSB8020: The build tools cannot be found (Windows)
prebuild-install: command not found
```

**Solution 1: Compile with SDK Headers (Mac - RECOMMENDED)**

If prebuilt binaries aren't available for your Node version, compile with proper C++ headers:

```bash
# Switch to Node 20
nvm use 20

# Set SDK path for C++ headers
cd atproto
export SDKROOT=$(xcrun --show-sdk-path)
export CXXFLAGS="-isysroot $SDKROOT -I$SDKROOT/usr/include/c++/v1"

# Clean install with proper headers
rm -rf node_modules
pnpm install
```

**Why This Works:**

- Sets the macOS SDK root for the compiler
- Points to C++ standard library headers
- Allows compilation when prebuilt binaries aren't available

**Solution 2: Try Node 18 First**

Node 18 may have better prebuilt binary availability:

```bash
nvm use 18
cd atproto
rm -rf node_modules
pnpm install
```

**If compilation still fails:**

**Mac:**

```bash
# Ensure Xcode Command Line Tools are installed
xcode-select --install
```

**Windows:**

- Install [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- Select "Desktop development with C++"

**Linux:**

```bash
sudo apt-get install build-essential python3
```

#### Test Database Locked

**Problem:** "Database is locked" error during tests

**Cause:** Previous test run didn't clean up properly

**Solution:**

```bash
# Kill any running Node processes
pkill -f node

# Clean test databases
cd atproto/packages/pds
rm -rf .test-dbs

# Run tests again
npm run test:sqlite
```

#### Tests Hang or Timeout

**Problem:** Tests start but never complete

**Common causes:**

1. **Missing `afterAll` cleanup** - Tests don't close database connections
2. **Port conflicts** - Test can't bind to required port
3. **Resource leaks** - Previous test didn't release resources

**Solutions:**

```bash
# Run with detect-open-handles to find leaks
npm run test:sqlite -- --detectOpenHandles --testPathPattern="your-test.test.ts"

# Kill processes on test ports
lsof -ti:2583 | xargs kill -9

# Run single test file to isolate issue
npm run test:sqlite -- --testPathPattern="specific-test.test.ts"
```

#### Dev-Env Package Not Found

**Problem:** Tests fail with "Cannot find module '@atproto/dev-env'"

**Error:**

```
Cannot find module '@atproto/dev-env'
```

**Cause:** Dev dependencies not built

**Solution:**

```bash
cd atproto

# Build all packages (including dev-env)
pnpm build

# Or build just dev-env and dependencies
pnpm --filter @atproto/dev-env... build

# Verify it's built
ls packages/dev-env/dist  # Should contain compiled files
```

#### Test Results Reference

**Expected results for privacy feature tests:**

```bash
# Privacy preferences tests
npm run test:sqlite -- --testPathPattern="preferences.test.ts"
# Expected: 17 passed (all privacy settings tests)

# Follow requests tests
npm run test:sqlite -- --testPathPattern="follow-requests.test.ts"
# Expected: 7 passed, 2 failed
# Note: 2 backlink tests expected to fail (feature not fully implemented)
```

## Database Issues

### SQLite Database Locked

**Problem:** "Database is locked" error

**Causes:**

- Multiple PDS instances accessing same database
- Previous PDS process didn't exit cleanly

**Solutions:**

1. **Stop all PDS instances**
2. **Check for processes:**

   ```bash
   # Windows
   tasklist | findstr node

   # Mac/Linux
   ps aux | grep node
   ```

3. **Kill stale processes**
4. **Restart PDS**

### Database Corruption

**Problem:** Database errors, malformed disk image

**Symptoms:**

```
Error: database disk image is malformed
```

**Solution:** Clean slate (⚠️ deletes all data)

**Docker PDS:**

```bash
cd official-pds
docker compose -f compose.local.yaml down
rm -rf data
mkdir -p data
docker compose -f compose.local.yaml up -d
```

**Monorepo PDS:**

```bash
cd atproto/packages/pds
rm -rf data blobs
mkdir -p data blobs data/actors
npm run start
```

## Performance Issues

### Slow Build Times

**Problem:** Building takes forever

**Solutions:**

1. **Clean build:**

   ```bash
   cd atproto
   rm -rf packages/*/dist node_modules
   pnpm install
   pnpm -r build
   ```

2. **Build only what you need:**

   ```bash
   pnpm --filter @atproto/pds build
   ```

3. **Use --ignore-scripts:**
   ```bash
   pnpm install --ignore-scripts
   ```

### High Memory Usage

**Problem:** System running out of memory

**Causes:**

- Multiple services running
- Large blobs directory
- Development tools open

**Solutions:**

1. **Close unnecessary services**
2. **Restart Docker**
3. **Clean up old data**
4. **Increase Docker memory limit** (Settings → Resources)

## Getting Help

If you're still stuck:

1. **Check specific component guides:**

   - [PDS Troubleshooting](../pds/troubleshooting.md)
   - [Handle Configuration](../guides/handle-configuration.md)

2. **Check GitHub issues:**

   - [ATProto Issues](https://github.com/bluesky-social/atproto/issues)
   - [Bluesky App Issues](https://github.com/bluesky-social/social-app/issues)

3. **Search documentation:**

   - [AT Protocol Docs](https://atproto.com)
   - [Bluesky Developer Docs](https://docs.bsky.app)

4. **Ask the community:**
   - [ATProto Discussions](https://github.com/bluesky-social/atproto/discussions)
   - [Bluesky Discord](https://discord.gg/bluesky)

## Debug Mode

Enable verbose logging for more details:

**PDS (.env):**

```bash
LOG_LEVEL="debug"
LOG_ENABLED="1"
```

**Bluesky App:**

- Open debug menu (Cmd+D on iOS, Cmd+M on Android)
- Enable "Debug Mode"

**Metro Bundler:**

```bash
REACT_NATIVE_METRO_LOGGIN G=1 yarn web
```

## Common Command Reference

```bash
# Check service health
curl http://localhost:2583/xrpc/_health  # PDS
curl http://localhost:2584/xrpc/_health  # AppView

# Check Node version
node --version  # Should be v20.x.x

# Check Docker
docker ps  # List running containers
docker logs <container-id>  # View logs

# Clean reinstall (atproto)
cd atproto
rm -rf node_modules packages/*/dist
pnpm install
pnpm -r build

# Clean reinstall (bluesky-app)
cd bluesky-app
rm -rf node_modules
yarn install
yarn intl:compile

# Kill process on port
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>
```

---

**Still having issues?** Check the component-specific troubleshooting guides linked above!
