# Bluesky App Documentation

The Bluesky app is the frontend user interface for the Bluesky Social platform, built with React Native and TypeScript.

## Overview

The Bluesky app provides:

- **Cross-platform UI** for iOS, Android, and Web
- **Social features** like posting, feeds, profiles, and notifications
- **AT Protocol integration** via the Bluesky API
- **Local development support** for testing with local PDS

## Technology Stack

- **Framework:** React Native
- **Language:** TypeScript
- **Package Manager:** Yarn (managed by corepack)
- **Bundler:** Metro
- **Platforms:** iOS, Android, Web

## Documentation

- **[Setup](setup.md)** - Installation and dependencies
- **[Configuration](configuration.md)** - Environment files and configuration
- **[Development](development.md)** - Development workflow and tools

## Default Ports

- **Web:** http://localhost:19006
- **Metro Bundler:** 8081

## Repository Structure

```
bluesky-app/
├── src/                    # Source code
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── state/             # State management
│   ├── lib/               # Utilities and libraries
│   └── locale/            # Internationalization
├── assets/                # Images, fonts, etc.
├── ios/                   # iOS native code
├── android/               # Android native code
└── web/                   # Web-specific code
```

## Key Features

### Local Development Mode

When `__DEV__` is true, the app automatically connects to local services:

- Local PDS at `http://localhost:2583`
- Local AppView at `http://localhost:2584` (if configured)

### Internationalization

The app supports multiple languages with compiled message catalogs. You must run `yarn intl:compile` before first run.

## Quick Start

```bash
# Install dependencies
cd bluesky-app
yarn install

# Compile internationalization messages
yarn intl:compile

# Start web version
yarn web

# Or start iOS
yarn ios

# Or start Android
yarn android
```

## Development Workflow

1. Make changes to source code
2. Hot reload updates automatically
3. Test on web/iOS/Android emulator
4. Create feature branch and commit
5. Push to your fork

## Next Steps

1. Follow the [Setup Guide](setup.md) to install dependencies
2. Configure your environment in [Configuration](configuration.md)
3. Learn the development workflow in [Development](development.md)

---

**Note:** The Bluesky app is configured to work with local services in development mode. Make sure your PDS is running before starting the app.
