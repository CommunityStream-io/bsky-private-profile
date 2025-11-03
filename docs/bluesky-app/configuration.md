# Bluesky App Configuration

Configuration options for the Bluesky app to work with local or remote services.

## Default Configuration

The app is **pre-configured** to work with local services in development mode.

### Development Mode Detection

When `__DEV__` is `true`, the app automatically uses local services:

**File:** `src/lib/constants.ts`

```typescript
export const LOCAL_DEV_SERVICE =
  Platform.OS === "android" ? "http://10.0.2.2:2583" : "http://localhost:2583";
```

**File:** `src/state/ageAssurance/useInitAgeAssurance.ts`

```typescript
if (__DEV__) {
  APPVIEW = DEV_ENV_APPVIEW;
  APPVIEW_DID = `did:web:localhost:2584`;
}
```

## Service URLs

### Personal Data Server (PDS)

**Default (Development):**

- **Web/iOS**: `http://localhost:2583`
- **Android**: `http://10.0.2.2:2583` (Android emulator localhost)

**Custom PDS:**

Create `.env.local`:

```bash
EXPO_PUBLIC_PDS_URL=http://localhost:2583
# Or remote:
# EXPO_PUBLIC_PDS_URL=https://pds.yourdomain.com
```

### AppView Service

**Default (Development):**

- `http://localhost:2584`
- DID: `did:web:localhost:2584`

**Default (Production):**

- `https://api.bsky.app`
- DID: `did:web:api.bsky.app`

### Changing the AppView

If you're running a local AppView with a different DID:

**File:** `src/state/ageAssurance/useInitAgeAssurance.ts` (line ~32)

```typescript
if (__DEV__) {
  APPVIEW = DEV_ENV_APPVIEW;
  APPVIEW_DID = `did:web:localhost:2584`; // Update this if different
}
```

## Platform-Specific Configuration

### Android Emulator

Android emulators can't access `localhost` directly. Two options:

#### Option 1: Port Forwarding (Recommended)

```bash
adb reverse tcp:2583 tcp:2583  # PDS
adb reverse tcp:2584 tcp:2584  # AppView
```

Then use `http://localhost:2583` in the app.

#### Option 2: Use 10.0.2.2

The app already does this automatically:

```typescript
Platform.OS === "android" ? "http://10.0.2.2:2583" : "http://localhost:2583";
```

No additional configuration needed!

### iOS Simulator

iOS simulator can access `localhost` directly. No special configuration needed.

### Physical Devices

For physical devices, your computer and device must be on the same network:

1. **Find your computer's local IP:**

   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. **Update constants:**

   **File:** `src/lib/constants.ts`

   ```typescript
   export const LOCAL_DEV_SERVICE = "http://192.168.1.100:2583"; // Your IP
   ```

3. **Ensure PDS accepts external connections**

## Environment Files

### .env.local (Optional)

Custom environment variables for local development:

```bash
# PDS URL
EXPO_PUBLIC_PDS_URL=http://localhost:2583

# Feature flags
EXPO_PUBLIC_ENABLE_SOME_FEATURE=true

# Analytics
EXPO_PUBLIC_ANALYTICS_ENABLED=false
```

### .env.production (Optional)

Production environment variables:

```bash
EXPO_PUBLIC_PDS_URL=https://bsky.social
```

## Changing Service URLs at Runtime

### Via App UI

1. **Open the app**
2. **At login screen**, select "Custom" or "Other" server
3. **Enter PDS URL**: `http://localhost:2583`
4. **Create account or login**

This works without code changes!

### Via Code

For permanent changes, edit:

**File:** `src/lib/constants.ts`

```typescript
export const LOCAL_DEV_SERVICE = "http://your-pds-url:2583";
export const DEV_ENV_APPVIEW = "http://your-appview-url:2584";
```

## Feature Flags

The app includes feature flags for enabling/disabling features:

**File:** `src/lib/flags.ts` (or similar)

```typescript
export const FEATURE_FLAGS = {
  ENABLE_PRIVATE_PROFILES: true,
  ENABLE_FOLLOW_REQUESTS: true,
  // ... more flags
};
```

## Build Configuration

### Development Build

**File:** `app.config.js`

```javascript
module.exports = {
  expo: {
    name: "Bluesky",
    slug: "bluesky",
    scheme: "bluesky",
    // ... development configuration
  },
};
```

### Production Build

EAS Build configuration:

**File:** `eas.json`

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_PDS_URL": "https://bsky.social"
      }
    }
  }
}
```

## Metro Bundler Configuration

**File:** `metro.config.js`

Controls how modules are bundled. Already configured for the project structure.

**Watching parent directories:**

If you need Metro to watch parent directories (e.g., shared packages):

```javascript
module.exports = {
  watchFolders: [
    path.resolve(__dirname, ".."),
    path.resolve(__dirname, "../atproto/packages/api"),
  ],
  // ... rest of config
};
```

## Internationalization

### Supported Languages

The app supports multiple languages. Compiled message catalogs are in:

```
src/locale/locales/
├── en/         # English
├── de/         # German
├── es/         # Spanish
├── fr/         # French
├── ja/         # Japanese
└── ...         # More languages
```

### Changing Default Language

**File:** `lingui.config.js`

```javascript
module.exports = {
  locales: ["en", "de", "es", "fr", "ja"],
  sourceLocale: "en", // Default language
  // ... rest of config
};
```

### Adding New Language

1. Add locale to `lingui.config.js`
2. Run `yarn intl:extract`
3. Translate `.po` files
4. Run `yarn intl:compile`

## Theme Configuration

The app includes light and dark themes:

**File:** `src/lib/theme.ts` (or similar)

```typescript
export const theme = {
  light: {
    primary: "#0085ff",
    background: "#ffffff",
    // ... more colors
  },
  dark: {
    primary: "#0085ff",
    background: "#000000",
    // ... more colors
  },
};
```

## API Configuration

### Timeouts

**File:** `src/lib/api.ts`

```typescript
const API_TIMEOUT = 30000; // 30 seconds
```

### Retry Logic

```typescript
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second
```

## Performance Configuration

### Bundle Size Optimization

Configured in `metro.config.js` and `babel.config.js` for optimal bundle size.

### Image Optimization

**File:** `src/lib/media.ts`

```typescript
const IMAGE_MAX_WIDTH = 2000;
const IMAGE_QUALITY = 0.8;
const IMAGE_COMPRESS_FORMAT = "JPEG";
```

## Debug Configuration

### Enable Debug Logs

**File:** `src/lib/logger.ts`

```typescript
const DEBUG = __DEV__; // Automatically enabled in dev mode
```

### React Native Debugger

Open debug menu:

- **iOS Simulator**: Cmd+D
- **Android Emulator**: Cmd+M (Mac) or Ctrl+M (Windows/Linux)
- **Physical Device**: Shake device

## Security Configuration

### HTTPS Enforcement

Production builds enforce HTTPS. Development mode allows HTTP for `localhost`.

### Certificate Pinning

**File:** `src/lib/security.ts` (if implemented)

```typescript
const PINNED_CERTIFICATES = [
  // Certificate fingerprints
];
```

## Configuration Best Practices

### Development

1. **Use default configuration** - Already set up for local services
2. **Don't commit `.env.local`** - Add to `.gitignore`
3. **Use feature flags** - For toggling experimental features
4. **Enable debug logs** - For troubleshooting

### Production

1. **Use environment variables** - Don't hardcode URLs
2. **Enable HTTPS** - Required for security
3. **Disable debug logs** - Performance and security
4. **Test on real devices** - Simulators behave differently

## Troubleshooting Configuration

### App Not Connecting to Local PDS

**Check:**

1. `__DEV__` is true (automatic in development builds)
2. PDS is running: `curl http://localhost:2583/xrpc/_health`
3. Using "Custom" server at login

**Solution:** Select "Custom" server and enter `http://localhost:2583`

### Wrong AppView DID

**Problem:** AppView DID changed

**Solution:** Update `src/state/ageAssurance/useInitAgeAssurance.ts`:

```typescript
APPVIEW_DID = `did:web:localhost:2584`; // Update to match your AppView
```

Get the correct DID:

```bash
curl http://localhost:2584/.well-known/did.json | jq .id
```

### Environment Variables Not Loading

**Problem:** `.env.local` changes not applied

**Solution:** Restart Metro bundler:

```bash
# Stop with Ctrl+C, then:
corepack yarn web
```

## Configuration Files Reference

| File                   | Purpose                                |
| ---------------------- | -------------------------------------- |
| `app.config.js`        | Expo app configuration                 |
| `eas.json`             | EAS Build configuration                |
| `metro.config.js`      | Metro bundler configuration            |
| `babel.config.js`      | Babel transpiler configuration         |
| `lingui.config.js`     | Internationalization configuration     |
| `tsconfig.json`        | TypeScript configuration               |
| `.env.local`           | Local environment variables (optional) |
| `src/lib/constants.ts` | App constants and URLs                 |

## Next Steps

- [Setup Guide](setup.md) - Installation and initial setup
- [Development Guide](development.md) - Development workflow
- [Troubleshooting](../reference/troubleshooting.md) - Fix common issues

---

**Remember:** The app is pre-configured for local development. Most users don't need custom configuration!
