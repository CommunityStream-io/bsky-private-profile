# Handle Configuration Guide

Quick reference for configuring handles in your local PDS setup.

## ✅ Correct Configuration

### Docker PDS (`compose.local.yaml`)

```yaml
environment:
  PDS_HOSTNAME: localhost
  PDS_DEV_MODE: "true"
  PDS_SERVICE_HANDLE_DOMAINS: ".traiforos.com,.test"  # Multiple domains supported
```

### Example Handles

✅ **Use these:**
- `stephen.traiforos.com`
- `alice.traiforos.com`
- `mod-authority.traiforos.com`
- Or `.test` handles: `user1.test`, `alice.test`

❌ **DON'T use these:**
- `user1.localhost` - Rejected: "Handle TLD is invalid or disallowed"
- `user1.local` - Also rejected
- Any TLD not listed in `PDS_SERVICE_HANDLE_DOMAINS`

## Why `.test` Works

With `PDS_DEV_MODE="true"` and `PDS_SERVICE_HANDLE_DOMAINS=".test"`:

1. **Account Creation**: PDS accepts `.test` handles
2. **Handle Resolution**: Dev mode bypasses external DNS/HTTP verification
3. **No DNS Setup Needed**: Works completely locally

## Creating Accounts

### Using Bruno API

1. Open `Account/Create Account.bru`
2. Update the body:
   ```json
   {
     "email": "yourname@test.local",
     "handle": "yourname.test",
     "password": "password123"
   }
   ```
3. Click "Send"

### Using cURL

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@test.local",
    "handle": "yourname.test",
    "password": "password123"
  }'
```

### Using pdsadmin

```bash
docker exec -it pds-local /pdsadmin/pdsadmin.sh account create
# When prompted: yourname.test
```

## Testing Handle Resolution

```bash
# Should return the DID
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=yourname.test"

# Expected response:
# {"did":"did:plc:xxxxxxxxxxxxxxxxxxxxx"}
```

## Applying Configuration Changes

**Important:** `docker compose restart` does NOT reload environment variables!

```bash
cd official-pds

# Stop the container
docker compose -f compose.local.yaml down

# Start with new configuration
docker compose -f compose.local.yaml up -d

# Verify
curl http://localhost:2583/xrpc/_health
```

## Common Issues

### "Handle TLD is invalid or disallowed"

**Cause:** Trying to use an unsupported TLD like `.localhost`

**Solution:** Use `.test` handles instead

### "Unable to resolve handle"

**Causes:**
1. `PDS_DEV_MODE` not set to `"true"`
2. `PDS_SERVICE_HANDLE_DOMAINS` not configured
3. PDS not restarted after config changes (used `restart` instead of `down` then `up`)

**Solution:** Verify configuration and do a full stop/start

### Handle shows "invalid handle" in UI

Same as "Unable to resolve handle" - check dev mode configuration

## Why NOT `.localhost`?

The AT Protocol PDS explicitly blocks `localhost` as a TLD, even though:
- It would make sense semantically
- Browsers resolve `*.localhost` to `127.0.0.1`
- It seems like it should work

The PDS only allows:
- TLDs configured in `PDS_SERVICE_HANDLE_DOMAINS` when `PDS_DEV_MODE="true"`
- `.test` is the conventional TLD for local development
- Production would use real domains

## Production Configuration

For production (NOT local development):

```yaml
environment:
  PDS_HOSTNAME: your-domain.com
  PDS_DEV_MODE: "false"  # Must be false in production!
  PDS_SERVICE_HANDLE_DOMAINS: ".your-domain.com"
```

Then set up DNS or HTTP verification for handle resolution.

## References

- [Troubleshooting Guide](../docs/reference/troubleshooting.md) - Detailed troubleshooting guide
- [Handle Configuration Guide](../docs/guides/handle-configuration.md) - Complete handle setup guide
- [AT Protocol Docs](https://atproto.com) - Official protocol documentation
- [PDS Configuration](https://github.com/bluesky-social/pds) - Official PDS repository

---

**TL;DR: Use `.test` handles with `PDS_DEV_MODE="true"` for local development. Stop and start (not restart) the container after config changes.**

