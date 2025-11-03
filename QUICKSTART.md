# 🚀 Quick Start: Local Development Environment

This is a condensed checklist for setting up local AT Protocol + Bluesky app development.

## ✅ Prerequisites Checklist

- [ ] **Docker Desktop** installed and running
- [ ] **Node.js 18+** (`nvm install 18 && nvm use 18`)
- [ ] **pnpm** (`npm install --global pnpm`)
- [ ] **Git Bash** (you're using this ✓)
- [ ] **jq** (JSON processor - download from https://jqlang.github.io/jq/download/)

## 🔧 One-Time Setup

### 1. Setup AT Protocol Backend (atproto)

```bash
cd C:/Users/trifo/bsky-private-profile/atproto

# Install dependencies
make deps

# Build all packages
make build
```

### 2. Setup Bluesky App

```bash
cd C:/Users/trifo/bsky-private-profile/bluesky-app

# Install dependencies
yarn

# Copy .env.example to .env (if you haven't already)
# cp .env.example .env
```

## 🚀 Running the Development Environment

### Terminal 1: Start the AT Protocol Backend

```bash
cd C:/Users/trifo/bsky-private-profile/atproto

# Start the dev environment (with logging)
make run-dev-env-logged
```

**Expected output:**
```
🔍 Dev-env introspection server http://localhost:2581
👤 DID Placeholder server http://localhost:2582
🌞 Main PDS http://localhost:2583
🗼 Ozone server http://localhost:2587
🌅 Bsky Appview http://localhost:2584
🌅 Bsky Appview DID did:web:localhost:2584
```

**Important:** Note the Bsky Appview DID from the output!

### Terminal 2: Verify and Get the AppView DID

```bash
# Once the dev environment is running, get the actual DID
curl http://localhost:2584/.well-known/did.json | jq .id
```

This should return something like: `"did:web:localhost:2584"`

### Terminal 3: Start the Bluesky App

Choose your platform:

#### Web (Easiest)
```bash
cd C:/Users/trifo/bsky-private-profile/bluesky-app
yarn web
```

#### iOS
```bash
cd C:/Users/trifo/bsky-private-profile/bluesky-app
yarn ios
```

#### Android
```bash
cd C:/Users/trifo/bsky-private-profile/bluesky-app

# For Android, you may need to reverse port for localhost access:
adb reverse tcp:2583 tcp:2583  # PDS
adb reverse tcp:2584 tcp:2584  # AppView

yarn android
```

## 🔗 What's Already Configured

Your Bluesky app is **already configured** to use the local dev environment when `__DEV__` is true!

### Files Already Set Up:

1. **`bluesky-app/src/lib/constants.ts` (lines 7-8)**:
   ```typescript
   export const LOCAL_DEV_SERVICE =
     Platform.OS === 'android' ? 'http://10.0.2.2:2583' : 'http://localhost:2583'
   ```

2. **`bluesky-app/src/lib/constants.ts` (line 215)**:
   ```typescript
   export const DEV_ENV_APPVIEW = `http://localhost:2584`
   ```

3. **`bluesky-app/src/state/ageAssurance/useInitAgeAssurance.ts` (lines 26-33)**:
   ```typescript
   if (__DEV__) {
     APPVIEW = DEV_ENV_APPVIEW
     APPVIEW_DID = `did:web:localhost:2584`
   }
   ```

### ⚠️ If the DID is Different

If the DID from step 2 is different than `did:web:localhost:2584`, update line 32 in:
`bluesky-app/src/state/ageAssurance/useInitAgeAssurance.ts`

## 🧪 Testing the Setup

1. **Check services are running:**
   ```bash
   curl http://localhost:2583  # PDS should respond
   curl http://localhost:2584  # AppView should respond
   ```

2. **Create an account** or sign in using the Bluesky app
   - When prompted for server, use `http://localhost:2583`
   - Or let it default if you're in dev mode

3. **Test age assurance** or other features that use the AppView

## 🛑 Stopping Everything

1. **Stop Bluesky App**: `Ctrl+C` in Terminal 3
2. **Stop AT Protocol Backend**: `Ctrl+C` in Terminal 1
3. Docker containers will automatically be cleaned up

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Find and kill process using the port
netstat -ano | findstr :2583
taskkill /PID <PID> /F
```

### Docker Not Running
```bash
# Check Docker status
docker ps

# If containers are stuck, clean them up
cd C:/Users/trifo/bsky-private-profile/atproto/packages/dev-infra
docker compose down
docker volume prune
```

### Build Errors in atproto
```bash
cd C:/Users/trifo/bsky-private-profile/atproto
rm -rf node_modules
rm -rf packages/*/dist
pnpm install --frozen-lockfile
make build
```

### Android Emulator Can't Access Localhost
```bash
# Reverse ports for Android
adb reverse tcp:2583 tcp:2583
adb reverse tcp:2584 tcp:2584
```

### App Not Connecting to Local Backend
1. Verify `__DEV__` is true in your app
2. Check the app console logs for connection attempts
3. Verify all services are running: `curl http://localhost:2583`

## 📚 Service URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **PDS** | http://localhost:2583 | Personal Data Server - user accounts & data |
| **AppView** | http://localhost:2584 | Bluesky app backend - feeds, age assurance, etc |
| **PLC** | http://localhost:2582 | DID Placeholder server |
| **Introspect** | http://localhost:2581 | Development introspection |
| **Ozone** | http://localhost:2587 | Moderation service |

## 🎯 Next Steps

Now that you have the local dev environment running:

1. ✅ Make changes to the Bluesky app
2. ✅ Test features that require backend services
3. ✅ Develop/test age assurance features
4. ✅ Create test accounts and data
5. ✅ Debug full-stack issues

## 📖 Full Documentation

- [Detailed Setup Guide](./LOCAL_DEV_SETUP.md)
- [AT Protocol Docs](https://atproto.com)
- [Bluesky App Build Instructions](./bluesky-app/docs/build.md)

---

**Happy coding!** 🎉


