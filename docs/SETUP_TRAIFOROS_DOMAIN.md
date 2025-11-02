# Setting Up traiforos.com for AT Protocol Handle Verification

Since you own `traiforos.com`, you can set up proper handle verification so the AppView recognizes your handles as valid!

## The Problem

Currently, handles show as `handle.invalid` because:
1. ✅ Your PDS accepts `stephen.traiforos.com`
2. ✅ DID is registered in PLC directory with `at://stephen.traiforos.com`
3. ❌ But when AppView tries to verify, it can't reach `https://stephen.traiforos.com/.well-known/atproto-did`
4. ❌ Result: "handle.invalid"

## The Solution: HTTP Well-Known Endpoint

You need to serve a file at `https://{handle}/.well-known/atproto-did` that returns your DID.

## Setup Options

### Option 1: Wildcard Well-Known Handler (Recommended)

Set up a web server that handles ALL `*.traiforos.com/.well-known/atproto-did` requests.

**Steps:**

1. **Set up a simple web server** (nginx, Caddy, or Node.js)
2. **Configure wildcard DNS** for `*.traiforos.com` → Your server IP
3. **Create endpoint** that extracts the subdomain and returns the DID

**Example with Node.js/Express:**

```javascript
const express = require('express');
const app = express();

// Map of handles to DIDs (you'll need to populate this)
const handleToDid = {
  'stephen.traiforos.com': 'did:plc:jcwzbyz5zu6v6wkpla6tzuoz',
  'alice.traiforos.com': 'did:plc:...',
  'mod-authority.traiforos.com': 'did:plc:...',
};

app.get('/.well-known/atproto-did', (req, res) => {
  const host = req.hostname; // Gets 'stephen.traiforos.com'
  const did = handleToDid[host];
  
  if (did) {
    res.type('text/plain').send(did);
  } else {
    res.status(404).send('Handle not found');
  }
});

app.listen(443); // HTTPS required!
```

**Requirements:**
- HTTPS (not HTTP) - AppView requires TLS
- Valid SSL certificate for `*.traiforos.com`
- Publicly accessible server

### Option 2: DNS TXT Records (Alternative)

Instead of HTTP, you can use DNS TXT records:

**For each handle, create a TXT record:**

```
_atproto.stephen.traiforos.com TXT "did=did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
_atproto.alice.traiforos.com TXT "did=did:plc:..."
```

**Pros:**
- No web server needed
- Simple DNS configuration
- Standard AT Protocol method

**Cons:**
- Need to add a DNS record for each handle
- DNS propagation delay
- Requires DNS provider access

### Option 3: Use a Handle Proxy Service (Easiest)

Set up a simple proxy that:
1. Queries your local PDS for the DID
2. Returns it in the well-known format

**Example with Cloudflare Workers:**

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/.well-known/atproto-did') {
      const hostname = url.hostname;
      
      // Query your local PDS (or maintain a mapping)
      const pdsResponse = await fetch(
        `http://your-server-ip:2583/xrpc/com.atproto.identity.resolveHandle?handle=${hostname}`
      );
      
      if (pdsResponse.ok) {
        const data = await pdsResponse.json();
        return new Response(data.did, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    return new Response('Not found', { status: 404 });
  }
}
```

## Quick Setup Guide

### Step 1: Choose Your Method

**For local development:**
- DNS TXT records (easiest if you have DNS access)

**For production-ready:**
- Wildcard web server with HTTPS

### Step 2: Configure DNS

In your DNS provider (e.g., Cloudflare, Route53, etc.):

**A) If using HTTP method:**
```
*.traiforos.com    A    YOUR_SERVER_IP
```

**B) If using DNS TXT method:**
```
_atproto.stephen.traiforos.com    TXT    "did=did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
```

### Step 3: Set Up the Well-Known Endpoint

**If using HTTP method:**

Create a file or endpoint that serves:
```
URL: https://stephen.traiforos.com/.well-known/atproto-did
Returns: did:plc:jcwzbyz5zu6v6wkpla6tzuoz
Content-Type: text/plain
```

**Requirements:**
- MUST be HTTPS (not HTTP)
- MUST return just the DID (plain text)
- MUST be publicly accessible

### Step 4: Test It

```bash
# Test DNS (if using TXT records)
dig TXT _atproto.stephen.traiforos.com

# Test HTTP (if using well-known endpoint)
curl https://stephen.traiforos.com/.well-known/atproto-did
# Should return: did:plc:jcwzbyz5zu6v6wkpla6tzuoz
```

### Step 5: Verify in AT Protocol

```bash
# This should now return the correct handle, not handle.invalid
curl "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
```

## Temporary Workaround (Until DNS is Set Up)

You can still use the accounts, but they'll show `handle.invalid` until you configure handle verification.

**What works even with handle.invalid:**
- ✅ Creating posts (via API)
- ✅ Authentication
- ✅ Direct PDS operations
- ✅ Testing via Bruno API

**What doesn't work well:**
- ❌ UI profile display
- ❌ AppView operations
- ❌ Public verification

## Example: Cloudflare DNS Setup

If you use Cloudflare for `traiforos.com`:

1. **Login to Cloudflare**
2. **Select your domain**: traiforos.com
3. **Go to DNS**
4. **Add TXT record:**
   - Type: `TXT`
   - Name: `_atproto.stephen`
   - Content: `did=did:plc:jcwzbyz5zu6v6wkpla6tzuoz`
   - TTL: Auto
   - Save

5. **Wait 5-10 minutes** for DNS propagation
6. **Test:**
   ```bash
   dig TXT _atproto.stephen.traiforos.com +short
   # Should return: "did=did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
   ```

## Example: Simple Well-Known Server

**Using Caddy (simplest):**

```caddy
*.traiforos.com {
  handle /.well-known/atproto-did {
    # Extract subdomain and return DID
    # This requires a mapping file or database lookup
    respond "did:plc:jcwzbyz5zu6v6wkpla6tzuoz"
  }
}
```

**Using nginx:**

```nginx
server {
  listen 443 ssl;
  server_name *.traiforos.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location /.well-known/atproto-did {
    # You'd need a script to look up the DID based on $host
    return 200 "did:plc:jcwzbyz5zu6v6wkpla6tzuoz";
    add_header Content-Type text/plain;
  }
}
```

## Next Steps

**Immediate (keeps using local dev):**
- Use `.test` handles for now
- Set up DNS/HTTP when ready

**When DNS is ready:**
1. Add DNS records (TXT or A records)
2. Set up well-known endpoint
3. Test verification
4. Handles will show correctly! ✅

## My Recommendation

**For now:** Stick with `.test` handles for local development. They work perfectly without any DNS setup.

**Later:** When you're ready to test production-like scenarios, set up DNS TXT records for your traiforos.com handles.

You don't need DNS setup to build and test your private profile features!

---

**Which DNS provider do you use for traiforos.com?** I can give you specific instructions!

