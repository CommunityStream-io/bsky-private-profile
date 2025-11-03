# PDS Troubleshooting

Common issues and solutions specific to running the Personal Data Server (PDS).

## Quick Reference

| Error                                                           | Quick Fix                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| **"Could not locate the bindings file"**                        | You're on Node 24+. Switch to Node 20: `nvm use 20` then reinstall |
| **"Must configure either S3 or disk blobstore"**                | Add `PDS_BLOBSTORE_DISK_LOCATION` to `.env`                        |
| **"Must configure plc rotation key"**                           | Generate keys and add to `.env` (see below)                        |
| **"Cannot open database because the directory does not exist"** | Create directories: `mkdir -p data blobs data/actors`              |
| **"Resource URL must use the https scheme"**                    | Add `PDS_DEV_MODE="true"` to `.env`                                |
| **Windows: mkdir did:plc:xxx**                                  | ATProto PDS won't work on Windows. Use Docker PDS instead          |
| **Port 2583 already in use**                                    | Stop other PDS (see below)                                         |
| **"Invalid handle" or "Unable to resolve handle"**              | Ensure `PDS_DEV_MODE="true"` and use `.test` handles               |
| **"Handle TLD is invalid or disallowed"**                       | Use `.test` handles (e.g., `user.test`), NOT `.localhost`          |

## Windows Filesystem Limitation

### Problem

**The ATProto monorepo PDS cannot create accounts on Windows!**

**Error:**

```
ENOENT: no such file or directory, mkdir 'C:\...\did:plc:xxx'
```

**Cause:** The PDS uses DIDs (like `did:plc:xxx`) as directory names. Colons are illegal in Windows file paths.

**Impact:** The PDS will start successfully but cannot create accounts on Windows.

### Solution

**Use the Docker PDS instead** → [Docker Setup Guide](docker-setup.md)

The Docker PDS runs Linux in a container, avoiding Windows filesystem limitations entirely.

**Alternative:** Use WSL2 (Windows Subsystem for Linux) to run the monorepo PDS.

## Configuration Errors

### "Must configure either S3 or disk blobstore"

**Problem:** Blob storage not configured

**Solution:** Add to `.env`:

```bash
PDS_BLOBSTORE_DISK_LOCATION="/absolute/path/to/blobs"
```

**Docker PDS:** Ensure it's in your `compose.local.yaml`:

```yaml
environment:
  PDS_BLOBSTORE_DISK_LOCATION: /pds/blobs
```

### "Must configure plc rotation key"

**Problem:** Cryptographic keys missing

**Solution:** Generate keys and add to `.env`:

```bash
# Generate PLC rotation key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate repo signing key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:

```bash
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="generated-key-here"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="generated-key-here"
```

**Docker PDS:** Add to `compose.local.yaml` environment section.

### "Cannot open database because the directory does not exist"

**Problem:** Data directories not created

**Solution:** Create required directories:

**Monorepo PDS:**

```bash
cd atproto/packages/pds
mkdir -p data blobs data/actors
```

**Docker PDS:**

```bash
cd official-pds
mkdir -p data
```

### "Resource URL must use the https scheme"

**Problem:** Development mode not enabled

**Solution:** Add to `.env`:

```bash
PDS_DEV_MODE="true"
```

This allows HTTP connections on `localhost`.

**Docker PDS:** Should already be set in `compose.local.yaml`.

## Port Conflicts

### Port 2583 Already in Use

**Problem:** Another service is using port 2583

**Find the process:**

**Windows:**

```bash
netstat -ano | findstr :2583
# Note the PID and kill it:
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -ti:2583
# Kill the process:
kill -9 <PID>

# Or one-liner:
lsof -ti:2583 | xargs kill -9
```

**Alternative:** Change the PDS port in configuration.

## Database Issues

### Database Corruption

**Problem:** SQLite database is corrupted

**Symptoms:**

- "database disk image is malformed"
- Random SQL errors
- PDS crashes on startup

**Solution:** Clean slate restart

**Monorepo PDS:**

```bash
cd atproto/packages/pds
rm -rf data
mkdir -p data data/actors
npm run start
```

**Docker PDS:**

```bash
cd official-pds
docker compose -f compose.local.yaml down
rm -rf data
mkdir -p data
docker compose -f compose.local.yaml up -d
```

⚠️ **Warning:** This deletes all accounts and data!

### Permission Denied on Data Directory

**Problem:** PDS can't write to data directory

**Linux/macOS:**

```bash
cd atproto/packages/pds
sudo chown -R $USER:$USER data blobs
```

**Windows (PowerShell as Administrator):**

```powershell
icacls data /grant Everyone:F /t
```

**Docker PDS:** Usually not an issue since container manages permissions.

## Node Version Issues

### "Could not locate the bindings file" (better-sqlite3)

**Problem:** Wrong Node version or native modules not compiled

**Symptoms:**

```
Error: Could not locate the bindings file. Tried:
  ...better-sqlite3.node
```

**Solutions:**

#### 1. Check Node Version (must be 20)

```bash
node --version
# Should be v20.x.x
```

If not Node 20:

```bash
nvm use 20
# Or install it first:
nvm install 20
nvm use 20
```

#### 2. Rebuild Native Modules

**Monorepo PDS:**

```bash
cd atproto
rm -rf node_modules
corepack pnpm install
corepack pnpm -r build
```

#### 3. Use Docker PDS (Avoids this issue entirely)

Docker PDS has pre-compiled binaries.

### Python Version Issues

**Problem:** `node-gyp` fails with Python 3.12+

**Error:**

```
gyp ERR! find Python Python is not set from command line or npm configuration
```

**Solution:** Install Python 3.11 or earlier

**Windows:**

```bash
# Set Python version for npm
npm config set python "C:\Python311\python.exe"
```

**Mac:**

```bash
brew install python@3.11
```

**Or use Docker PDS** to avoid build tools entirely.

## Handle Resolution Issues

### "Invalid handle" or "Unable to resolve handle"

**Problem 1:** Development mode not enabled

**Solution:** Ensure `PDS_DEV_MODE="true"` in `.env`

**Problem 2:** Wrong handle format

**Solution:** Use `.test` handles (e.g., `alice.test`), NOT `.localhost`

**Problem 3:** Account doesn't exist

**Solution:** Create the account first:

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

### "Handle TLD is invalid or disallowed"

**Problem:** Wrong handle domain

**Correct:** `user.test` ✅  
**Wrong:** `user.localhost` ❌

**Solution:** Only `.test` handles work in local development mode.

### "Handle already taken"

**Problem:** Account already exists

**This is actually good!** It means handle resolution is working.

**Solution:** Either:

1. Login with existing credentials
2. Choose a different handle

## Docker PDS Issues

### Docker Compose Command Not Found

**Problem:** Old Docker version

**Solution:** Update Docker Desktop, or use `docker-compose` (with hyphen):

```bash
docker-compose -f compose.local.yaml up -d
```

### Cannot Connect to Docker Daemon

**Problem:** Docker Desktop not running

**Solution:** Start Docker Desktop and wait for it to be fully ready (whale icon in system tray).

### Container Starts But PDS Not Accessible

**Problem 1:** Port mapping not working

**Check:**

```bash
docker ps
# Look for ports column: should show 0.0.0.0:2583->2583/tcp
```

**Problem 2:** Container crashed

**Check logs:**

```bash
docker compose -f compose.local.yaml logs pds
```

**Solution:** Fix the error shown in logs (usually configuration issue).

### Container Keeps Restarting

**Problem:** Configuration error causing crash loop

**Check logs:**

```bash
docker compose -f compose.local.yaml logs -f pds
```

**Common causes:**

- Missing environment variables
- Invalid data directory permissions
- Port already in use

## Build Errors (Monorepo PDS)

### "Cannot find module '@atproto/...'"

**Problem:** Dependencies not built

**Solution:** Build all packages:

```bash
cd atproto
corepack pnpm -r build
```

### TypeScript Compilation Errors

**Problem:** TypeScript version mismatch or stale builds

**Solution:** Clean rebuild:

```bash
cd atproto
rm -rf packages/*/dist
corepack pnpm -r build
```

### ENOENT or Module Not Found

**Problem:** Dependencies not installed

**Solution:** Reinstall:

```bash
cd atproto
rm -rf node_modules
corepack pnpm install
corepack pnpm -r build
```

## Environment Variable Issues

### Environment Variables Not Loading

**Problem:** `.env` file not in correct location

**Monorepo PDS:** File must be at `atproto/packages/pds/.env`

**Check:**

```bash
cd atproto/packages/pds
ls -la .env
```

If missing, create it from `example.env`.

### Absolute vs Relative Paths

**Problem:** Data directories not found when using relative paths

**Solution:** Use absolute paths in `.env`:

❌ **Wrong:**

```bash
PDS_DATA_DIRECTORY="data"
```

✅ **Correct:**

```bash
PDS_DATA_DIRECTORY="/Users/yourname/bsky-private-profile/atproto/packages/pds/data"
```

**Why?** When using `pnpm --filter`, the working directory is different from when running directly.

## Health Check Failures

### PDS Not Responding to Health Checks

**Test:**

```bash
curl http://localhost:2583/xrpc/_health
```

**Problem 1:** PDS not running

**Check:**

```bash
# Docker
docker ps

# Monorepo
# Check terminal where you started it
```

**Problem 2:** Wrong port

**Check configuration:**

- Docker: `compose.local.yaml` port mapping
- Monorepo: `PDS_PORT` in `.env`

**Problem 3:** Firewall blocking

**Solution:** Allow port 2583 in firewall settings.

## Performance Issues

### Slow PDS Response Times

**Possible causes:**

- SQLite database on slow disk (use SSD)
- Large blobs directory
- Insufficient RAM

**Solution for production:** Use PostgreSQL instead of SQLite

```bash
PDS_DB_POSTGRES_URL="postgresql://user:pass@localhost:5432/pds"
```

### High Memory Usage

**Cause:** SQLite in-memory caching

**Solution:** Monitor and restart if needed. Consider PostgreSQL for production.

## Getting Help

If you're still stuck:

1. Check [Configuration Guide](configuration.md) - Verify all required variables
2. Check [General Troubleshooting](../reference/troubleshooting.md) - System-wide issues
3. Check PDS logs for specific error messages
4. Search [ATProto GitHub Issues](https://github.com/bluesky-social/atproto/issues)
5. Ask in [ATProto Discussions](https://github.com/bluesky-social/atproto/discussions)

## Debug Mode

Enable debug logging for more information:

**Monorepo PDS (.env):**

```bash
LOG_LEVEL="debug"
LOG_ENABLED="1"
```

**Docker PDS (compose.local.yaml):**

```yaml
environment:
  LOG_LEVEL: debug
  LOG_ENABLED: "1"
```

Then check logs for detailed error information.

---

**Remember:** When in doubt, use the [Docker PDS](docker-setup.md). It avoids most of these issues!
