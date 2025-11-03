# PDS Configuration

Comprehensive guide to configuring your Personal Data Server (PDS).

## Configuration Methods

### Docker PDS

Configuration via `compose.local.yaml` environment section or `.env` file.

### Monorepo PDS

Configuration via `.env` file in `atproto/packages/pds/` directory.

## Required Variables

These variables MUST be set for the PDS to start:

### Server Configuration

| Variable       | Description     | Example       | Required |
| -------------- | --------------- | ------------- | -------- |
| `PDS_HOSTNAME` | Server hostname | `"localhost"` | ✅       |
| `PDS_PORT`     | Server port     | `"2583"`      | ✅       |

### Data Storage

| Variable                      | Description              | Example                  | Required |
| ----------------------------- | ------------------------ | ------------------------ | -------- |
| `PDS_DATA_DIRECTORY`          | SQLite database location | `"/path/to/data"`        | ✅       |
| `PDS_BLOBSTORE_DISK_LOCATION` | Blob storage location    | `"/path/to/blobs"`       | ✅       |
| `PDS_ACTOR_STORE_DIRECTORY`   | Actor repository storage | `"/path/to/data/actors"` | ✅       |

**Important:** Use absolute paths for monorepo PDS! Relative paths only work when running directly from the PDS directory.

### Security Secrets

| Variable                                    | Description        | Example             | Required |
| ------------------------------------------- | ------------------ | ------------------- | -------- |
| `PDS_JWT_SECRET`                            | JWT signing secret | `"your-secret-key"` | ✅       |
| `PDS_ADMIN_PASSWORD`                        | Admin password     | `"admin"`           | ✅       |
| `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` | 64-char hex key    | `"735344..."`       | ✅       |
| `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX` | 64-char hex key    | `"8e2f9d..."`       | ✅       |

**Generate keys:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### AT Protocol Services

| Variable                | Description         | Default                   | Required |
| ----------------------- | ------------------- | ------------------------- | -------- |
| `PDS_DID_PLC_URL`       | PLC directory URL   | `"https://plc.directory"` | ✅       |
| `PDS_BSKY_APP_VIEW_URL` | Bluesky AppView API | `"https://api.bsky.app"`  | ✅       |
| `PDS_BSKY_APP_VIEW_DID` | AppView DID         | `"did:web:api.bsky.app"`  | ✅       |

## Development Mode Variables

Required for running on `localhost` without HTTPS:

| Variable                       | Description             | Value     | Required for Local Dev |
| ------------------------------ | ----------------------- | --------- | ---------------------- |
| `PDS_DEV_MODE`                 | Enable development mode | `"true"`  | ✅                     |
| `PDS_SERVICE_HANDLE_DOMAINS`   | Test handle domains     | `".test"` | ✅                     |
| `PDS_DISABLE_SSRF_PROTECTION`  | Disable SSRF checks     | `"1"`     | ✅                     |
| `PDS_INVITE_REQUIRED`          | Require invite codes    | `"0"`     | Recommended            |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Skip TLS verification   | `"0"`     | Recommended            |

**Why Development Mode?**

- Allows HTTP instead of HTTPS
- Accepts `.test` handles that don't require DNS
- Disables security features that don't work on localhost

## Optional Variables

### Logging

| Variable      | Description    | Values                                   | Default  |
| ------------- | -------------- | ---------------------------------------- | -------- |
| `LOG_ENABLED` | Enable logging | `"0"` or `"1"`                           | `"1"`    |
| `LOG_LEVEL`   | Log verbosity  | `"error"`, `"warn"`, `"info"`, `"debug"` | `"info"` |

### Features

| Variable              | Description          | Values         | Default                  |
| --------------------- | -------------------- | -------------- | ------------------------ |
| `PDS_INVITE_REQUIRED` | Require invite codes | `"0"` or `"1"` | `"1"`                    |
| `PDS_CRAWLERS`        | Allowed crawlers     | URLs           | `"https://bsky.network"` |

### OAuth Provider

| Variable                           | Description         | Example     | Default |
| ---------------------------------- | ------------------- | ----------- | ------- |
| `PDS_OAUTH_PROVIDER_NAME`          | OAuth provider name | `"My PDS"`  | -       |
| `PDS_OAUTH_PROVIDER_PRIMARY_COLOR` | Brand color         | `"#7507e3"` | -       |

### Email (Production Only)

| Variable                 | Description        | Required for Production |
| ------------------------ | ------------------ | ----------------------- |
| `PDS_EMAIL_SMTP_URL`     | SMTP server URL    | ✅                      |
| `PDS_EMAIL_FROM_ADDRESS` | From email address | ✅                      |

### Database (Advanced)

| Variable                 | Description                  | Notes                 |
| ------------------------ | ---------------------------- | --------------------- |
| `PDS_DB_POSTGRES_URL`    | PostgreSQL connection string | Alternative to SQLite |
| `PDS_DB_POSTGRES_SCHEMA` | PostgreSQL schema            | Optional              |

## Complete Configuration Examples

### Docker PDS - Local Development

**compose.local.yaml:**

```yaml
services:
  pds:
    image: ghcr.io/bluesky-social/pds:latest
    container_name: pds-local
    ports:
      - "2583:2583"
    environment:
      # Server
      PDS_HOSTNAME: localhost
      PDS_PORT: 2583

      # Data Storage
      PDS_DATA_DIRECTORY: /pds/data
      PDS_BLOBSTORE_DISK_LOCATION: /pds/blobs
      PDS_ACTOR_STORE_DIRECTORY: /pds/data/actors

      # Security
      PDS_JWT_SECRET: development-secret-change-in-production
      PDS_ADMIN_PASSWORD: admin
      PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX: "generated-key-1"
      PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX: "generated-key-2"

      # Development Mode
      PDS_DEV_MODE: "true"
      PDS_SERVICE_HANDLE_DOMAINS: ".test"
      PDS_DISABLE_SSRF_PROTECTION: "1"
      PDS_INVITE_REQUIRED: "0"

      # Logging
      LOG_ENABLED: "1"
      LOG_LEVEL: info

      # AT Protocol Services
      PDS_DID_PLC_URL: https://plc.directory
      PDS_BSKY_APP_VIEW_URL: https://api.bsky.app
      PDS_BSKY_APP_VIEW_DID: did:web:api.bsky.app
      PDS_CRAWLERS: https://bsky.network

      # Node.js
      NODE_TLS_REJECT_UNAUTHORIZED: "0"

    volumes:
      - ./data:/pds

    restart: unless-stopped
```

### Monorepo PDS - Local Development

**.env file:**

```bash
# Server Configuration
PDS_HOSTNAME="localhost"
PDS_PORT="2583"

# Data Storage (USE ABSOLUTE PATHS!)
PDS_DATA_DIRECTORY="/Users/yourname/bsky-private-profile/atproto/packages/pds/data"
PDS_BLOBSTORE_DISK_LOCATION="/Users/yourname/bsky-private-profile/atproto/packages/pds/blobs"
PDS_ACTOR_STORE_DIRECTORY="/Users/yourname/bsky-private-profile/atproto/packages/pds/data/actors"

# Security Secrets (GENERATE UNIQUE KEYS!)
PDS_JWT_SECRET="development-secret-change-in-production"
PDS_ADMIN_PASSWORD="admin"
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX="735344574b2290ce11be4eaaa90ac25d401123e5d239144e4c2ed2ee78f40482"
PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX="8e2f9dad5dca5796c0b8193e6e085035d1e2d9792655c26d211c821ebb02fe99"

# Development Mode (REQUIRED for localhost)
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"
PDS_DISABLE_SSRF_PROTECTION="1"
PDS_INVITE_REQUIRED="0"

# Logging
LOG_ENABLED="1"
LOG_LEVEL="info"

# AT Protocol Services (Public Endpoints)
PDS_DID_PLC_URL="https://plc.directory"
PDS_BSKY_APP_VIEW_URL="https://api.bsky.app"
PDS_BSKY_APP_VIEW_DID="did:web:api.bsky.app"
PDS_CRAWLERS="https://bsky.network"

# OAuth Provider Info (Optional)
PDS_OAUTH_PROVIDER_NAME="Local Development PDS"
PDS_OAUTH_PROVIDER_PRIMARY_COLOR="#7507e3"

# Node.js Settings
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

## Configuration Validation

### Check Configuration

After configuring, verify your setup:

```bash
# Check PDS is accessible
curl http://localhost:2583/xrpc/_health

# Check server description
curl http://localhost:2583/xrpc/com.atproto.server.describeServer

# Verify handle resolution works
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=test.test"
```

### Common Configuration Errors

#### "Must configure either S3 or disk blobstore"

**Problem**: `PDS_BLOBSTORE_DISK_LOCATION` not set

**Solution**: Add to `.env`:

```bash
PDS_BLOBSTORE_DISK_LOCATION="/absolute/path/to/blobs"
```

#### "Must configure plc rotation key"

**Problem**: Missing cryptographic keys

**Solution**: Generate and add keys:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### "Cannot open database because the directory does not exist"

**Problem**: Data directories don't exist

**Solution**: Create directories:

```bash
mkdir -p data blobs data/actors
```

#### "Resource URL must use the https scheme"

**Problem**: Development mode not enabled

**Solution**: Add to `.env`:

```bash
PDS_DEV_MODE="true"
```

## Production Configuration

For production deployment, additional configuration is required:

### Required for Production

- **Domain Name** - No `localhost`, use real domain
- **HTTPS/TLS** - Required for federation
- **Email SMTP** - For account verification
- **Backup Strategy** - Data persistence and recovery
- **Monitoring** - Health checks and alerting

### Production Environment Variables

```bash
# Server (use your domain)
PDS_HOSTNAME="pds.yourdomain.com"
PDS_PORT="443"

# HTTPS/TLS (managed by Caddy in Docker PDS)
PDS_SCHEME="https"

# Email (required for account verification)
PDS_EMAIL_SMTP_URL="smtps://user:pass@smtp.example.com:465"
PDS_EMAIL_FROM_ADDRESS="noreply@yourdomain.com"

# Security (use strong, unique secrets)
PDS_JWT_SECRET="strong-random-secret-64-chars-minimum"
PDS_ADMIN_PASSWORD="strong-admin-password"

# Production mode (NOT development mode)
PDS_DEV_MODE="false"  # or omit entirely

# Handle domains (use your domain)
PDS_SERVICE_HANDLE_DOMAINS=".yourdomain.com"
```

See the [official PDS documentation](https://github.com/bluesky-social/pds) for complete production setup.

## Configuration Best Practices

### Security

1. **Never commit secrets** to version control
2. **Use strong passwords** and secrets
3. **Generate unique keys** for each environment
4. **Rotate keys periodically** in production
5. **Restrict admin password** access

### Development

1. **Use `.test` handles** for local development
2. **Enable development mode** for localhost
3. **Use absolute paths** in monorepo PDS
4. **Keep logs enabled** for debugging
5. **Disable invite codes** for testing

### Data Management

1. **Backup data directory** regularly in production
2. **Use PostgreSQL** for production (more robust than SQLite)
3. **Monitor disk space** for blobs and database
4. **Clean test data** between dev sessions if needed

## Environment Variable Reference

Complete alphabetical reference:

| Variable                                    | Type    | Required | Default | Description                                   |
| ------------------------------------------- | ------- | -------- | ------- | --------------------------------------------- |
| `LOG_ENABLED`                               | Boolean | No       | `1`     | Enable logging                                |
| `LOG_LEVEL`                                 | String  | No       | `info`  | Log verbosity level                           |
| `NODE_TLS_REJECT_UNAUTHORIZED`              | Boolean | No       | -       | Skip TLS verification (dev only)              |
| `PDS_ADMIN_PASSWORD`                        | String  | Yes      | -       | Admin account password                        |
| `PDS_BLOBSTORE_DISK_LOCATION`               | Path    | Yes\*    | -       | Blob storage directory                        |
| `PDS_BSKY_APP_VIEW_DID`                     | DID     | Yes      | -       | AppView DID                                   |
| `PDS_BSKY_APP_VIEW_URL`                     | URL     | Yes      | -       | AppView API URL                               |
| `PDS_CRAWLERS`                              | URLs    | No       | -       | Allowed crawler URLs                          |
| `PDS_DATA_DIRECTORY`                        | Path    | Yes      | -       | Database directory                            |
| `PDS_DB_POSTGRES_URL`                       | URL     | No       | -       | PostgreSQL connection (alternative to SQLite) |
| `PDS_DEV_MODE`                              | Boolean | Yes\*    | `false` | Enable dev mode (required for localhost)      |
| `PDS_DID_PLC_URL`                           | URL     | Yes      | -       | PLC directory URL                             |
| `PDS_DISABLE_SSRF_PROTECTION`               | Boolean | No       | `0`     | Disable SSRF protection (dev only)            |
| `PDS_EMAIL_FROM_ADDRESS`                    | Email   | Yes\*\*  | -       | Email from address                            |
| `PDS_EMAIL_SMTP_URL`                        | URL     | Yes\*\*  | -       | SMTP server URL                               |
| `PDS_HOSTNAME`                              | String  | Yes      | -       | Server hostname                               |
| `PDS_INVITE_REQUIRED`                       | Boolean | No       | `1`     | Require invite codes                          |
| `PDS_JWT_SECRET`                            | String  | Yes      | -       | JWT signing secret                            |
| `PDS_OAUTH_PROVIDER_NAME`                   | String  | No       | -       | OAuth provider name                           |
| `PDS_OAUTH_PROVIDER_PRIMARY_COLOR`          | Hex     | No       | -       | OAuth brand color                             |
| `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` | Hex     | Yes      | -       | PLC rotation key (64 chars)                   |
| `PDS_PORT`                                  | Number  | Yes      | -       | Server port                                   |
| `PDS_REPO_SIGNING_KEY_K256_PRIVATE_KEY_HEX` | Hex     | Yes      | -       | Repo signing key (64 chars)                   |
| `PDS_SERVICE_HANDLE_DOMAINS`                | String  | Yes\*    | -       | Allowed handle domains                        |

\* Required for local development  
\*\* Required for production

## Next Steps

- [Docker PDS Setup](docker-setup.md) - Set up Docker PDS with this configuration
- [Monorepo PDS Setup](monorepo-setup.md) - Set up monorepo PDS with this configuration
- [Troubleshooting](troubleshooting.md) - Fix configuration issues

---

**Security Reminder:** Never commit your `.env` file or configuration with secrets to version control. Add `.env` to `.gitignore`.
