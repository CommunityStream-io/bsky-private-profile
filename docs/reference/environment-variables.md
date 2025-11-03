# Environment Variables Reference

Complete reference of all environment variables used across components.

## Personal Data Server (PDS)

### Required Variables

| Variable                                    | Description              | Example                 | Component |
| ------------------------------------------- | ------------------------ | ----------------------- | --------- |
| `PDS_HOSTNAME`                              | Server hostname          | `localhost`             | PDS       |
| `PDS_PORT`                                  | Server port              | `2583`                  | PDS       |
| `PDS_DATA_DIRECTORY`                        | SQLite database location | `/path/to/data`         | PDS       |
| `PDS_BLOBSTORE_DISK_LOCATION`               | Blob storage location    | `/path/to/blobs`        | PDS       |
| `PDS_ACTOR_STORE_DIRECTORY`                 | Actor repository storage | `/path/to/data/actors`  | PDS       |
| `PDS_JWT_SECRET`                            | JWT signing secret       | `your-secret-key`       | PDS       |
| `PDS_ADMIN_PASSWORD`                        | Admin password           | `admin`                 | PDS       |
| `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` | 64-char hex key          | Generate with crypto    | PDS       |
| `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX` | 64-char hex key          | Generate with crypto    | PDS       |
| `PDS_DID_PLC_URL`                           | PLC directory URL        | `https://plc.directory` | PDS       |
| `PDS_BSKY_APP_VIEW_URL`                     | Bluesky AppView API      | `https://api.bsky.app`  | PDS       |
| `PDS_BSKY_APP_VIEW_DID`                     | AppView DID              | `did:web:api.bsky.app`  | PDS       |

### Development Mode Variables

| Variable                       | Description                   | Value   | Component |
| ------------------------------ | ----------------------------- | ------- | --------- |
| `PDS_DEV_MODE`                 | Enable dev mode (allows HTTP) | `true`  | PDS       |
| `PDS_SERVICE_HANDLE_DOMAINS`   | Test handle domains           | `.test` | PDS       |
| `PDS_DISABLE_SSRF_PROTECTION`  | Disable SSRF checks           | `1`     | PDS       |
| `PDS_INVITE_REQUIRED`          | Require invite codes          | `0`     | PDS       |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Skip TLS verification         | `0`     | PDS       |

### Optional PDS Variables

| Variable                           | Description                  | Default                | Component |
| ---------------------------------- | ---------------------------- | ---------------------- | --------- |
| `LOG_ENABLED`                      | Enable logging               | `1`                    | PDS       |
| `LOG_LEVEL`                        | Log verbosity                | `info`                 | PDS       |
| `PDS_CRAWLERS`                     | Allowed crawlers             | `https://bsky.network` | PDS       |
| `PDS_OAUTH_PROVIDER_NAME`          | OAuth provider name          | -                      | PDS       |
| `PDS_OAUTH_PROVIDER_PRIMARY_COLOR` | Brand color                  | `#7507e3`              | PDS       |
| `PDS_EMAIL_SMTP_URL`               | SMTP server URL              | -                      | PDS       |
| `PDS_EMAIL_FROM_ADDRESS`           | From email address           | -                      | PDS       |
| `PDS_DB_POSTGRES_URL`              | PostgreSQL connection string | -                      | PDS       |

**See:** [PDS Configuration Guide](../pds/configuration.md) for detailed information.

## Bluesky App

### Optional App Variables

| Variable                        | Description      | Example                 | Component   |
| ------------------------------- | ---------------- | ----------------------- | ----------- |
| `EXPO_PUBLIC_PDS_URL`           | Custom PDS URL   | `http://localhost:2583` | Bluesky App |
| `EXPO_PUBLIC_ANALYTICS_ENABLED` | Enable analytics | `false`                 | Bluesky App |

**Note:** Most app configuration is in code (`src/lib/constants.ts`), not environment variables.

## Pinata Integration

### Required Pinata Variables

| Variable            | Description               | Component      |
| ------------------- | ------------------------- | -------------- |
| `PINATA_API_KEY`    | Pinata API key            | Pinata Service |
| `PINATA_API_SECRET` | Pinata API secret         | Pinata Service |
| `JWT_SECRET`        | Secret for signing tokens | Pinata Service |

### Optional Pinata Variables

| Variable                | Description                    | Default                 | Component      |
| ----------------------- | ------------------------------ | ----------------------- | -------------- |
| `PORT`                  | Service port                   | `3000`                  | Pinata Service |
| `NODE_ENV`              | Environment                    | `development`           | Pinata Service |
| `PDS_URL`               | PDS URL for callbacks          | `http://localhost:2583` | Pinata Service |
| `TOKEN_EXPIRY`          | Default token expiry (seconds) | `3600`                  | Pinata Service |
| `MAX_GATEWAYS_PER_USER` | Max gateways per user          | `1`                     | Pinata Service |

**See:** [Pinata Setup Guide](../pinata/setup.md) for details.

## System Variables

### Node.js Configuration

| Variable                       | Description           | Value                       | When to Use      |
| ------------------------------ | --------------------- | --------------------------- | ---------------- |
| `NODE_ENV`                     | Node environment      | `development`, `production` | Always           |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Skip TLS verification | `0`                         | Local dev only   |
| `NODE_OPTIONS`                 | Node runtime options  | `--max-old-space-size=4096` | If memory issues |

### Package Manager

| Variable                 | Description      | Value    | When to Set |
| ------------------------ | ---------------- | -------- | ----------- |
| `COREPACK_ENABLE_STRICT` | Enforce corepack | `0`, `1` | Optional    |

## Environment File Locations

| Component      | Environment File Location                                         |
| -------------- | ----------------------------------------------------------------- |
| Docker PDS     | `official-pds/compose.local.yaml` (environment section) or `.env` |
| Monorepo PDS   | `atproto/packages/pds/.env`                                       |
| Bluesky App    | `bluesky-app/.env.local` (optional)                               |
| Pinata Service | `pinata-integration/.env`                                         |

## Security Best Practices

### Never Commit These

Add to `.gitignore`:

```
.env
.env.local
.env.production
*.env
```

### Generate Strong Secrets

**For JWT secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**For PDS cryptographic keys:**

```bash
# Generate two separate keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Rotate Regularly

In production:

- Rotate JWT secrets every 90 days
- Rotate admin passwords every 30 days
- Keep old secrets temporarily for graceful transition

## Environment Templates

### Docker PDS Template

```yaml
environment:
  # Required
  PDS_HOSTNAME: localhost
  PDS_PORT: 2583
  PDS_DATA_DIRECTORY: /pds/data
  PDS_BLOBSTORE_DISK_LOCATION: /pds/blobs
  PDS_JWT_SECRET: "generated-secret"
  PDS_ADMIN_PASSWORD: "admin"
  PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX: "generated-key-1"
  PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX: "generated-key-2"

  # Development
  PDS_DEV_MODE: "true"
  PDS_SERVICE_HANDLE_DOMAINS: ".test"
  PDS_INVITE_REQUIRED: "0"

  # Services
  PDS_DID_PLC_URL: https://plc.directory
  PDS_BSKY_APP_VIEW_URL: https://api.bsky.app
  PDS_BSKY_APP_VIEW_DID: did:web:api.bsky.app
```

### Monorepo PDS Template

```bash
# atproto/packages/pds/.env

# Server
PDS_HOSTNAME="localhost"
PDS_PORT="2583"

# Data (USE ABSOLUTE PATHS)
PDS_DATA_DIRECTORY="/Users/yourname/path/to/data"
PDS_BLOBSTORE_DISK_LOCATION="/Users/yourname/path/to/blobs"
PDS_ACTOR_STORE_DIRECTORY="/Users/yourname/path/to/data/actors"

# Security (GENERATE UNIQUE VALUES)
PDS_JWT_SECRET="generated-secret"
PDS_ADMIN_PASSWORD="admin"
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="generated-key-1"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="generated-key-2"

# Development
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"
PDS_DISABLE_SSRF_PROTECTION="1"
PDS_INVITE_REQUIRED="0"

# Logging
LOG_ENABLED="1"
LOG_LEVEL="info"

# Services
PDS_DID_PLC_URL="https://plc.directory"
PDS_BSKY_APP_VIEW_URL="https://api.bsky.app"
PDS_BSKY_APP_VIEW_DID="did:web:api.bsky.app"

# Node.js
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

### Pinata Service Template

```bash
# pinata-integration/.env

# Pinata API Credentials (REQUIRED)
PINATA_API_KEY=your_api_key_here
PINATA_API_SECRET=your_api_secret_here

# JWT Secret (REQUIRED - generate with crypto)
JWT_SECRET=generated-secret-here

# Service Configuration
PORT=3000
NODE_ENV=development

# PDS Configuration
PDS_URL=http://localhost:2583

# Optional Settings
TOKEN_EXPIRY=3600
MAX_GATEWAYS_PER_USER=1
```

## Validation

### Check PDS Configuration

```bash
# Test PDS is accessible
curl http://localhost:2583/xrpc/_health

# Check server description
curl http://localhost:2583/xrpc/com.atproto.server.describeServer
```

### Check Environment Loaded

**Docker:**

```bash
docker exec pds-local env | grep PDS_
```

**Monorepo:**

```bash
# Check .env file exists
ls -la atproto/packages/pds/.env

# Verify paths are absolute
cat atproto/packages/pds/.env | grep DIRECTORY
```

## Troubleshooting

### Variables Not Loading

**Problem:** Environment variables not being used

**Solutions:**

1. **Check file location** - Must be in correct directory
2. **Check syntax** - No spaces around `=`
3. **Restart service** - Changes require restart
4. **Check quotes** - Use quotes for values with spaces

### Path Issues

**Problem:** "Directory does not exist" errors

**Solution:** Use absolute paths, not relative:

```bash
# ❌ Wrong
PDS_DATA_DIRECTORY="data"

# ✅ Correct
PDS_DATA_DIRECTORY="/absolute/path/to/data"
```

### Docker Environment Not Working

**Problem:** Docker container not using environment variables

**Solutions:**

1. **Check compose file** - Variables in `environment:` section
2. **Rebuild container** - `docker compose up -d --force-recreate`
3. **Check .env file** - If using external `.env`, verify `env_file:` in compose

## Next Steps

- [PDS Configuration](../pds/configuration.md) - Detailed PDS configuration
- [Pinata Setup](../pinata/setup.md) - Pinata service setup
- [Troubleshooting](troubleshooting.md) - Fix common issues

---

**Remember:** Never commit secrets to version control!
