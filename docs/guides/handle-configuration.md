# Handle Configuration Guide

Complete guide to configuring and troubleshooting handles in the AT Protocol.

## Table of Contents

1. [Understanding Handles](#understanding-handles)
2. [Local Development Handles](#local-development-handles)
3. [Production Domain Handles](#production-domain-handles)
4. [Handle Resolution](#handle-resolution)
5. [Troubleshooting](#troubleshooting)

## Understanding Handles

### What is a Handle?

A **handle** is your human-readable username in the AT Protocol.

**Format:** `username.domain`

**Examples:**

- `alice.bsky.social` (production)
- `alice.test` (local development)
- `alice.yourdomain.com` (custom domain)

### Handle vs DID

- **Handle**: Human-readable, changeable (e.g., `alice.test`)
- **DID**: Permanent identifier (e.g., `did:plc:xxx`)
- **Relationship**: Handle → resolves to → DID

One DID can have multiple handles over time (but only one active at a time).

## Local Development Handles

### Use `.test` Handles

For local development, **always use `.test` handles**.

**Format:** `username.test`

**Examples:**

- `alice.test` ✅
- `bob.test` ✅
- `testuser.test` ✅

### Why `.test` Instead of `.localhost`?

**The AT Protocol explicitly blocks `.localhost` handles!**

**Code from `atproto/packages/syntax/src/handle.ts`:**

```typescript
export const DISALLOWED_TLDS = [
  ".local",
  ".localhost", // ← Explicitly blocked!
  ".invalid",
  ".example",
  // NOTE: .test is allowed in testing and development
];
```

**Comparison:**

| TLD          | Allowed in AT Protocol? | Purpose                            |
| ------------ | ----------------------- | ---------------------------------- |
| `.test`      | ✅ **YES**              | Testing and development (RFC 6761) |
| `.localhost` | ❌ **NO**               | Loopback/local machine             |
| `.local`     | ❌ **NO**               | mDNS/Multicast DNS                 |
| `.invalid`   | ❌ **NO**               | Guaranteed invalid                 |
| `.example`   | ❌ **NO**               | Documentation examples             |

**What happens if you try `.localhost`:**

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -d '{"handle": "user.localhost", "email": "...", "password": "..."}'

# Response:
{
  "error": "InvalidHandle",
  "message": "Handle TLD is invalid or disallowed"
}
```

### Setting Up `.test` Handles

**Prerequisites:**

Ensure `PDS_DEV_MODE="true"` and `PDS_SERVICE_HANDLE_DOMAINS=".test"` in your PDS configuration.

**Docker PDS (`compose.local.yaml`):**

```yaml
environment:
  PDS_DEV_MODE: "true"
  PDS_SERVICE_HANDLE_DOMAINS: ".test"
```

**Monorepo PDS (`.env`):**

```bash
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"
```

**Create account:**

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

**Success!** Account created with handle `alice.test`

### How `.test` Handles Work

1. **No DNS required** - `.test` is reserved and never resolves
2. **PDS resolves internally** - No external verification needed
3. **Dev mode required** - Only works with `PDS_DEV_MODE="true"`
4. **Perfect for local testing** - Designed for this use case

## Production Domain Handles

### Using Your Own Domain

If you own a domain (e.g., `yourdomain.com`), you can use it for handles: `alice.yourdomain.com`

**Requirements:**

- Public server with HTTPS
- Domain configured for handle verification
- PDS accessible from internet

### Handle Verification Methods

The AT Protocol supports two methods for verifying handle ownership:

#### Method 1: HTTP Well-Known (Recommended)

**Endpoint:** `https://{handle}/.well-known/atproto-did`

**Returns:** Plain text DID

**Example:**

```bash
curl https://alice.yourdomain.com/.well-known/atproto-did
# Returns: did:plc:xxx
```

**Setup Options:**

##### Option A: Static Files

For each handle, create a static file:

```bash
# File: alice.yourdomain.com/.well-known/atproto-did
did:plc:jcwzbyz5zu6v6wkpla6tzuoz
```

**Nginx configuration:**

```nginx
server {
    listen 443 ssl;
    server_name *.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /.well-known/atproto-did {
        root /var/www/atproto;
    }
}
```

##### Option B: Dynamic Handler (Wildcard)

Set up a server that handles all subdomains:

**Node.js/Express example:**

```javascript
const express = require("express");
const app = express();

// Map of handles to DIDs
const handleToDid = {
  "alice.yourdomain.com": "did:plc:xxx",
  "bob.yourdomain.com": "did:plc:yyy",
};

app.get("/.well-known/atproto-did", (req, res) => {
  const host = req.hostname;
  const did = handleToDid[host];

  if (did) {
    res.type("text/plain").send(did);
  } else {
    res.status(404).send("Handle not found");
  }
});

app.listen(443);
```

**Requirements:**

- HTTPS (not HTTP)
- Valid SSL certificate for `*.yourdomain.com`
- Wildcard DNS: `*.yourdomain.com` → Server IP
- Publicly accessible

##### Option C: Cloudflare Workers

Deploy a serverless handler:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/atproto-did") {
      const hostname = url.hostname;

      // Query your PDS or maintain a mapping
      const pdsResponse = await fetch(
        `https://pds.yourdomain.com/xrpc/com.atproto.identity.resolveHandle?handle=${hostname}`
      );

      if (pdsResponse.ok) {
        const data = await pdsResponse.json();
        return new Response(data.did, {
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
```

#### Method 2: DNS TXT Records

**Format:** `_atproto.{handle} TXT "did={did}"`

**Example:**

```
_atproto.alice.yourdomain.com TXT "did=did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
_atproto.bob.yourdomain.com TXT "did=did:plc:yyy"
```

**Pros:**

- No web server required
- Simple DNS configuration
- Standard AT Protocol method

**Cons:**

- One DNS record per handle
- DNS propagation delay (can take hours)
- Requires DNS provider access

**How to add:**

1. **Login to your DNS provider** (Cloudflare, Route53, etc.)
2. **Add TXT record:**
   - **Name**: `_atproto.alice.yourdomain.com`
   - **Type**: TXT
   - **Value**: `did=did:plc:jcwzbyz5zu6v6wkpla6tzuoz`
3. **Wait for propagation** (5 minutes - 48 hours)
4. **Test:**
   ```bash
   dig _atproto.alice.yourdomain.com TXT
   ```

### PDS Configuration for Custom Domains

**Update PDS configuration:**

```bash
# Remove .test restriction
PDS_SERVICE_HANDLE_DOMAINS=".yourdomain.com"

# Or allow multiple
PDS_SERVICE_HANDLE_DOMAINS=".test,.yourdomain.com"
```

**For production, also set:**

```bash
PDS_HOSTNAME="pds.yourdomain.com"
PDS_DEV_MODE="false"  # Disable dev mode
```

## Handle Resolution

### How Handle Resolution Works

```
1. User requests profile for "alice.test"
   ↓
2. System resolves handle → DID
   ↓
3. Two verification methods:
   a) HTTP: GET https://alice.test/.well-known/atproto-did
   b) DNS: Query TXT _atproto.alice.test
   ↓
4. Verification succeeds → Returns DID
   ↓
5. Use DID to fetch profile data
```

### Resolution Hierarchy

The AT Protocol tries methods in this order:

1. **HTTP Well-Known** (primary)
2. **DNS TXT Record** (fallback)
3. **PDS Internal** (dev mode only)

### Test Handle Resolution

**Test your handle resolution:**

```bash
# Via PDS
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=alice.test"

# Via public AppView (production handles only)
curl "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=alice.yourdomain.com"
```

**Expected response:**

```json
{
  "did": "did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
}
```

## Troubleshooting

### Handle Shows as `handle.invalid`

**Problem:** Handle appears as `handle.invalid` in UI

**Causes:**

#### 1. Using `.localhost` TLD

**Solution:** Use `.test` instead

```bash
# Wrong
handle: "alice.localhost" ❌

# Correct
handle: "alice.test" ✅
```

#### 2. Development Mode Not Enabled

**Solution:** Enable dev mode for `.test` handles

```bash
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"
```

#### 3. PDS Not Publicly Accessible (Custom Domain)

**Problem:** Using custom domain but PDS is on `localhost`

**DID document shows:**

```json
"serviceEndpoint": "http://localhost:2583"
```

**Public AppView can't reach `localhost`!**

**Solution:** Deploy PDS to public server

- Get a server with public IP
- Configure domain: `pds.yourdomain.com`
- Enable HTTPS
- Update `PDS_HOSTNAME` in configuration

#### 4. Missing Handle Verification (Custom Domain)

**Problem:** No well-known endpoint or DNS TXT record

**Test:**

```bash
# HTTP method
curl https://alice.yourdomain.com/.well-known/atproto-did
# Should return: did:plc:xxx

# DNS method
dig _atproto.alice.yourdomain.com TXT
# Should return: "did=did:plc:xxx"
```

**Solution:** Set up verification using Method 1 or Method 2 above

### "Handle TLD is invalid or disallowed"

**Problem:** Can't create account

**Error:**

```json
{
  "error": "InvalidHandle",
  "message": "Handle TLD is invalid or disallowed"
}
```

**Causes:**

1. **Using `.localhost`** → Use `.test` instead
2. **Using other reserved TLD** (`.local`, `.invalid`, `.example`)
3. **TLD not in `PDS_SERVICE_HANDLE_DOMAINS`**

**Solutions:**

**For local development:**

```bash
PDS_SERVICE_HANDLE_DOMAINS=".test"
handle="alice.test"
```

**For custom domain:**

```bash
PDS_SERVICE_HANDLE_DOMAINS=".yourdomain.com"
handle="alice.yourdomain.com"
```

### "Unable to resolve handle"

**Problem:** Handle can't be resolved

**Test:**

```bash
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=alice.test"
```

**Possible causes:**

1. **Account doesn't exist** → Create it first
2. **Wrong server** → Using production AppView for local handle
3. **Handle changed** → User updated their handle

**Solutions:**

1. **Verify account exists:**

   ```bash
   # List accounts (if you have admin access)
   # Or try creating the account
   ```

2. **Use correct server:**

   - `.test` handles: Query local PDS
   - Custom domain: Query public AppView or local PDS

3. **Check DID document:**
   ```bash
   # Get DID from some other source, then:
   curl https://plc.directory/{did}
   ```

### Handle Resolution Works Locally But Not Publicly

**Scenario:**
✅ Local PDS resolves handle
❌ Public AppView can't resolve handle

**Example:**

```bash
# Works
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=alice.yourdomain.com"

# Fails
curl "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=alice.yourdomain.com"
```

**Problem:** PDS is not publicly accessible

**DID Document Issue:**

```json
{
  "service": [
    {
      "id": "#atproto_pds",
      "type": "AtprotoPersonalDataServer",
      "serviceEndpoint": "http://localhost:2583" // ❌ Not public!
    }
  ]
}
```

**Solution:** Deploy PDS publicly

1. **Get a server** with public IP
2. **Configure domain**: `pds.yourdomain.com` → Server IP
3. **Enable HTTPS** with SSL certificate
4. **Update PDS config:**
   ```bash
   PDS_HOSTNAME="pds.yourdomain.com"
   PDS_DEV_MODE="false"
   ```
5. **Update DID document** to use public endpoint

### DNS TXT Record Not Working

**Problem:** DNS record is set but verification fails

**Check propagation:**

```bash
dig _atproto.alice.yourdomain.com TXT
# or
nslookup -type=TXT _atproto.alice.yourdomain.com
```

**Common issues:**

1. **DNS not propagated yet** → Wait (up to 48 hours)
2. **Wrong format** → Must be `did=did:plc:xxx` (include `did=` prefix)
3. **Wrong subdomain** → Must be `_atproto.{handle}`, not just `{handle}`
4. **TTL too high** → Reduce TTL for faster updates

## Best Practices

### For Local Development

1. **Always use `.test`** - Never `.localhost`
2. **Enable dev mode** - Set `PDS_DEV_MODE="true"`
3. **Keep it simple** - No DNS or HTTPS needed
4. **Test first** - Verify handle resolution works

### For Production

1. **Use HTTPS** - Required for federation
2. **Set up verification** - HTTP well-known or DNS TXT
3. **Test publicly** - Verify handle resolves from outside
4. **Monitor expiry** - Keep SSL certificates updated
5. **Document mapping** - Maintain handle → DID mapping

### For Custom Domains

1. **Plan verification method** - HTTP or DNS?
2. **Wildcard DNS recommended** - Easier for multiple handles
3. **Use dynamic handler** - More flexible than static files
4. **Test before launch** - Verify all handles work
5. **Have fallback** - DNS TXT as backup for HTTP

## Quick Reference

### Local Development Setup

```bash
# PDS Configuration
PDS_DEV_MODE="true"
PDS_SERVICE_HANDLE_DOMAINS=".test"

# Create account
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -d '{"email":"alice@test.local","handle":"alice.test","password":"pass123"}'

# Test resolution
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=alice.test"
```

### Custom Domain Setup

```bash
# 1. Set up DNS
*.yourdomain.com → Your server IP

# 2. Configure PDS
PDS_HOSTNAME="pds.yourdomain.com"
PDS_SERVICE_HANDLE_DOMAINS=".yourdomain.com"
PDS_DEV_MODE="false"

# 3. Set up verification (choose one)
# HTTP: Deploy well-known endpoint
# DNS: Add TXT record _atproto.alice.yourdomain.com TXT "did=did:plc:xxx"

# 4. Test
curl "https://alice.yourdomain.com/.well-known/atproto-did"
```

## Resources

- **AT Protocol Spec**: https://atproto.com/specs/handle
- **RFC 6761** (Reserved TLDs): https://tools.ietf.org/html/rfc6761
- **PLC Directory**: https://plc.directory
- **Handle Validation Code**: `atproto/packages/syntax/src/handle.ts`

## Next Steps

- [PDS Configuration](../pds/configuration.md) - Configure your PDS
- [First Steps](../getting-started/first-steps.md) - Create accounts
- [Troubleshooting](../reference/troubleshooting.md) - General troubleshooting

---

**Remember:** For local development, use `.test` handles. For production, use custom domains with proper verification!
