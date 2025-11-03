# Docker PDS Setup

The official Docker PDS is the **recommended option** for local development, especially on Windows.

## Why Docker PDS?

- ✅ **Works on Windows** - No filesystem issues with DIDs containing colons
- ✅ **Simple setup** - Pre-built Docker image, no compilation needed
- ✅ **Production-like** - Same distribution used in production
- ✅ **Built-in tools** - Includes `pdsadmin` for account management
- ✅ **No build tools** - Skip Visual Studio, Python, and native module compilation

## Prerequisites

- **Docker Desktop** installed and running
  - Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - macOS: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

**Verify Docker is running:**

```bash
docker --version
docker ps
```

## Quick Setup

### Step 1: Navigate to official-pds Directory

```bash
cd official-pds
```

### Step 2: Create Data Directory

```bash
mkdir -p data
```

### Step 3: Start the PDS

```bash
# Start using local development compose file
docker compose -f compose.local.yaml up -d

# View logs (optional)
docker compose -f compose.local.yaml logs -f pds
```

### Step 4: Verify It's Running

```bash
curl http://localhost:2583/xrpc/_health
```

**Expected response:**

```json
{ "version": "0.4.188" }
```

## Configuration

The `compose.local.yaml` file is pre-configured for local development with:

- **Hostname**: `localhost`
- **Port**: `2583`
- **Development mode**: Enabled
- **Handle domains**: `.test`
- **Invite codes**: Disabled
- **Data directory**: `./data`

### Environment Variables

The Docker compose file includes all necessary configuration:

```yaml
environment:
  PDS_HOSTNAME: localhost
  PDS_PORT: 2583
  PDS_DEV_MODE: "true"
  PDS_SERVICE_HANDLE_DOMAINS: ".test"
  PDS_INVITE_REQUIRED: "0"
  PDS_DATA_DIRECTORY: /pds/data
  PDS_BLOBSTORE_DISK_LOCATION: /pds/blobs
  # ... and more
```

No additional `.env` file is needed for basic usage.

## Creating Accounts

### Via API

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

### Via pdsadmin Tool

Access the container and use the built-in admin tool:

```bash
# Access container shell
docker exec -it pds-local sh

# Create account using pdsadmin
./pdsadmin account create
```

## Managing the PDS

### View Logs

```bash
docker compose -f compose.local.yaml logs -f pds
```

### Stop the PDS

```bash
docker compose -f compose.local.yaml down
```

### Restart the PDS

```bash
docker compose -f compose.local.yaml restart
```

### Access Container Shell

```bash
docker exec -it pds-local sh
```

### Clean Data and Start Fresh

```bash
# Stop and remove containers
docker compose -f compose.local.yaml down

# Remove data directory
rm -rf data

# Recreate data directory
mkdir -p data

# Start again
docker compose -f compose.local.yaml up -d
```

## Data Persistence

Data is stored in the `./data` directory on your host machine and mounted into the container. This means:

- ✅ Data persists across container restarts
- ✅ You can backup by copying the `data/` folder
- ✅ You can reset by deleting the `data/` folder

## Networking

The PDS exposes port 2583 to your host machine:

- **From your host**: `http://localhost:2583`
- **From another container**: `http://pds-local:2583`
- **From Android emulator**: `http://10.0.2.2:2583`

## Advanced Configuration

### Custom Environment Variables

Create a `.env` file in the `official-pds/` directory:

```bash
# Custom configuration
PDS_JWT_SECRET=my-custom-secret
PDS_ADMIN_PASSWORD=my-admin-password
LOG_LEVEL=debug
```

Then reference it in your compose file:

```yaml
services:
  pds:
    env_file:
      - .env
```

### Using PostgreSQL Instead of SQLite

For production-like setup, use PostgreSQL:

```yaml
services:
  pds:
    environment:
      PDS_DB_POSTGRES_URL: postgresql://user:pass@postgres:5432/pds

  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: pds
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## Troubleshooting

### Port 2583 Already in Use

**Problem**: Another service is using port 2583

**Solution**: Find and stop the process

```bash
# Windows
netstat -ano | findstr :2583
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:2583 | xargs kill -9
```

### Docker Compose Not Found

**Problem**: `docker compose` command not recognized

**Solution**: Update Docker Desktop or use `docker-compose` (with hyphen):

```bash
docker-compose -f compose.local.yaml up -d
```

### Cannot Connect to Docker Daemon

**Problem**: Docker Desktop not running

**Solution**: Start Docker Desktop and wait for it to be fully started

### Database Errors

**Problem**: Database corruption or initialization errors

**Solution**: Clean slate restart

```bash
docker compose -f compose.local.yaml down
rm -rf data
mkdir -p data
docker compose -f compose.local.yaml up -d
```

### Permission Denied on Data Directory

**Problem**: Container can't write to data directory

**Solution**: Fix permissions

```bash
# Linux/macOS
sudo chown -R $USER:$USER data

# Windows (run as Administrator in PowerShell)
icacls data /grant Everyone:F /t
```

## Comparison: Docker PDS vs Monorepo PDS

| Feature                  | Docker PDS        | Monorepo PDS                    |
| ------------------------ | ----------------- | ------------------------------- |
| **Windows Support**      | ✅ Works          | ❌ Account creation fails       |
| **Setup Time**           | ~5 minutes        | ~30 minutes                     |
| **Build Tools Required** | ❌ No             | ✅ Yes (VS Build Tools, Python) |
| **Native Modules**       | ❌ No compilation | ✅ Must compile                 |
| **Source Code Access**   | ❌ Limited        | ✅ Full access                  |
| **Debugging**            | Container logs    | Direct debugging                |
| **Production-like**      | ✅ Yes            | Partially                       |
| **Updates**              | Pull new image    | Git pull + rebuild              |

## Production Deployment

For production deployment:

1. **Do NOT use `compose.local.yaml`** - It's for local development only
2. **Use `compose.yaml`** - Includes Caddy, TLS, auto-updates
3. **Configure a domain** - No `localhost` in production
4. **Set up HTTPS** - Required for federation
5. **See**: [Official PDS deployment guide](https://github.com/bluesky-social/pds)

## Next Steps

- [Configuration Guide](configuration.md) - Customize your PDS
- [First Steps](../getting-started/first-steps.md) - Create accounts and test
- [Troubleshooting](troubleshooting.md) - Solve common issues

---

**Recommended for:** All users, especially Windows users and those who want quick setup.
