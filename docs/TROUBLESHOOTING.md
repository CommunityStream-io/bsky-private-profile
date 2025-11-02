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

### Node 24.5.0 and better-sqlite3

If you see C++20 related errors with Node 24.5.0, the issue is that Node 24+ requires C++20 but `better-sqlite3` may compile with C++17.

**Solutions:**

1. Install complete Visual Studio Build Tools (see above)
2. Or use Node 20 LTS:
   ```bash
   nvm use 20
   # or
   nvm install 20
   nvm use 20
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

## Still Having Issues?

1. Check [GitHub Issues](https://github.com/CommunityStream-io/bsky-private-profile/issues)
2. Search for your specific error message
3. Create a new issue with:
   - Your error message
   - Operating system and version
   - Node.js version (`node --version`)
   - Python version (`python --version`)
   - Visual Studio Build Tools version (if Windows)
