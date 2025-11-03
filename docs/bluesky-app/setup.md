# Bluesky App Setup

Installation and setup guide for the Bluesky app frontend.

## Prerequisites

- **Node.js 20 LTS** (required)
- **Yarn** (managed by corepack)
- **Git**
- **Platform-specific tools** (for iOS/Android, see below)

See [Prerequisites Guide](../getting-started/prerequisites.md) for installation details.

## Installation

### Step 1: Navigate to bluesky-app Directory

```bash
cd bluesky-app
```

### Step 2: Enable Corepack (if not already done)

```bash
corepack enable
```

### Step 3: Install Dependencies

```bash
# Install with --ignore-scripts to skip native module compilation
corepack yarn install --ignore-scripts
```

**Why `--ignore-scripts`?**

- Skips native module compilation
- Avoids needing Visual Studio Build Tools on Windows
- Faster installation
- Most features work without native modules

**Without `--ignore-scripts`:**

```bash
# Only if you specifically need native modules
corepack yarn install
```

This requires build tools (Visual Studio on Windows, Xcode on macOS, build-essential on Linux).

### Step 4: Compile Internationalization Messages

**Required for first run:**

```bash
corepack yarn intl:compile
```

This compiles translation files for all supported languages. The app won't start without these compiled messages.

**What it does:**

- Compiles `.po` files to `.js` message catalogs
- Generates locale data for all supported languages
- Enables internationalization features

### Step 5: Verify Installation

```bash
# Check yarn is working
corepack yarn --version

# List available scripts
corepack yarn run
```

## Platform-Specific Setup

### Web (Easiest)

No additional setup needed! Just install dependencies and run.

```bash
corepack yarn web
```

The app will start at http://localhost:19006

### iOS

**Prerequisites:**

- macOS only
- Xcode installed (from App Store)
- Xcode Command Line Tools: `xcode-select --install`
- iOS Simulator or physical device

**Setup:**

```bash
# Install iOS dependencies (first time only)
cd ios
pod install
cd ..
```

**Run:**

```bash
corepack yarn ios
```

### Android

**Prerequisites:**

- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 11+
- Android emulator or physical device

**Setup:**

1. **Install Android Studio**
2. **Configure SDK** via Android Studio Settings
3. **Create an emulator** (AVD) or connect a physical device
4. **Set environment variables** (add to your shell profile):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# Or on Windows:
# set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Run:**

```bash
corepack yarn android
```

**Port forwarding for localhost:**

Android emulators can't access `localhost` directly. Use port forwarding:

```bash
adb reverse tcp:2583 tcp:2583  # PDS
adb reverse tcp:2584 tcp:2584  # AppView
```

Or use `http://10.0.2.2:2583` in the app configuration for Android.

## Environment Configuration

### Development Mode (Default)

The app automatically connects to local services when `__DEV__` is true:

**Files pre-configured:**

- `src/lib/constants.ts` - Local service URLs
- `src/state/ageAssurance/useInitAgeAssurance.ts` - AppView configuration

**Default local services:**

- PDS: `http://localhost:2583`
- AppView: `http://localhost:2584`
- Android PDS: `http://10.0.2.2:2583`

### Custom Environment Variables (Optional)

Create `.env.local` for custom configuration:

```bash
# Point to local PDS
EXPO_PUBLIC_PDS_URL=http://localhost:2583

# Or point to a remote PDS
EXPO_PUBLIC_PDS_URL=https://pds.yourdomain.com
```

**Note:** The app is already configured for local development, so this is usually not needed.

## Build Scripts

### Development

```bash
# Start web dev server
corepack yarn web

# Start iOS
corepack yarn ios

# Start Android
corepack yarn android

# Type checking
corepack yarn typecheck

# Linting
corepack yarn lint
```

### Testing

```bash
# Run tests
corepack yarn test

# Run tests in watch mode
corepack yarn test:watch

# E2E tests (requires Maestro)
corepack yarn e2e
```

### Building

```bash
# Build for production
corepack yarn build

# Build web
corepack yarn build:web
```

## Common Issues

### Metro Bundler Errors

**Problem:** Metro watching parent node_modules

**Error:**

```
Error: ENOENT: no such file or directory, scandir '../node_modules'
```

**Solution:** Create empty `node_modules` in project root:

```bash
cd ..  # Go to project root
mkdir node_modules
cd bluesky-app
```

### Missing Locale Files

**Problem:** App crashes with locale errors

**Error:**

```
Error: Cannot find module './locale/locales/en/messages'
```

**Solution:** Compile internationalization messages:

```bash
corepack yarn intl:compile
```

### Native Module Errors

**Problem:** Native module compilation fails

**Solution:** Use `--ignore-scripts`:

```bash
rm -rf node_modules
corepack yarn install --ignore-scripts
```

### iOS Build Fails

**Problem:** CocoaPods dependencies not installed

**Solution:**

```bash
cd ios
pod install
cd ..
```

### Android Build Fails

**Problem:** SDK not found or version mismatch

**Solution:**

1. Open Android Studio
2. Go to SDK Manager
3. Install required SDK versions (check `android/build.gradle`)
4. Sync project

### Port Already in Use

**Problem:** Metro bundler can't start

**Solution:** Kill process using port 8081:

```bash
# Mac/Linux
lsof -ti:8081 | xargs kill -9

# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

## Project Structure

```
bluesky-app/
├── src/                    # Source code
│   ├── components/        # UI components
│   ├── screens/           # Screen components
│   ├── state/             # State management (React Query, Zustand)
│   ├── lib/               # Utilities and libraries
│   ├── locale/            # Internationalization
│   └── view/              # Views and navigation
├── assets/                # Static assets
├── ios/                   # iOS native code
├── android/               # Android native code
├── web/                   # Web-specific code
└── package.json           # Dependencies and scripts
```

## Development Workflow

1. **Start PDS** (in another terminal):

   ```bash
   cd official-pds
   docker compose -f compose.local.yaml up -d
   ```

2. **Start Bluesky app**:

   ```bash
   cd bluesky-app
   corepack yarn web
   ```

3. **Make changes** to source code

4. **Hot reload** automatically updates

5. **Test** in browser at http://localhost:19006

## Next Steps

- [Configuration Guide](configuration.md) - Customize app configuration
- [Development Guide](development.md) - Development workflow and tools
- [First Steps](../getting-started/first-steps.md) - Create accounts and test

---

**Tip:** For most development, use the web version. It's faster to iterate and easier to debug than native builds.
