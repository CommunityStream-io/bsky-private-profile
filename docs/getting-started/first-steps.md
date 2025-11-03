# First Steps

Now that you have the development environment running, let's verify everything works and create your first test account.

## Verify Services Are Running

### Check PDS Status

```bash
# Health check
curl http://localhost:2583/xrpc/_health

# Expected response:
# {"version":"0.4.x"}
```

### Check AppView Status (Full Dev Environment Only)

```bash
# Health check
curl http://localhost:2584/xrpc/_health

# Get DID
curl http://localhost:2584/.well-known/did.json | jq .id

# Expected: "did:web:localhost:2584"
```

### Check Bluesky App

Open http://localhost:19006 in your browser. You should see the Bluesky app login screen.

## Create Your First Account

### Option A: Via Bluesky App UI

1. **Open the app**: http://localhost:19006

2. **Click "Create new account"**

3. **Select server**:

   - Choose "Custom" or "Other"
   - Enter: `http://localhost:2583`

4. **Fill in details**:

   - **Email**: Any email (e.g., `alice@test.local`)
   - **Handle**: Use `.test` domain (e.g., `alice.test`)
   - **Password**: Choose a password
   - **Display Name**: Your display name

5. **Create account** and you're in!

### Option B: Via API

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.local",
    "handle": "alice.test",
    "password": "password123"
  }'
```

**Successful response:**

```json
{
  "accessJwt": "...",
  "refreshJwt": "...",
  "handle": "alice.test",
  "did": "did:plc:...",
  "didDoc": {...}
}
```

**Save the access token** - you'll need it for authenticated API calls.

## Create Additional Test Accounts

Create multiple accounts to test social features:

```bash
# Create Bob
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@test.local",
    "handle": "bob.test",
    "password": "password123"
  }'

# Create Carol
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carol@test.local",
    "handle": "carol.test",
    "password": "password123"
  }'
```

## Login to Existing Account

### Via App

1. Open http://localhost:19006
2. Enter your handle (e.g., `alice.test`)
3. Enter your password
4. Select "Custom" server: `http://localhost:2583`
5. Click "Sign in"

### Via API

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createSession \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "alice.test",
    "password": "password123"
  }'
```

**Response contains your access token:**

```json
{
  "accessJwt": "eyJ...",
  "refreshJwt": "eyJ...",
  "handle": "alice.test",
  "did": "did:plc:...",
  "email": "alice@test.local"
}
```

## Create Your First Post

### Via API

```bash
# Replace with your actual accessJwt and DID
ACCESS_TOKEN="eyJ..."
DID="did:plc:..."

curl -X POST http://localhost:2583/xrpc/com.atproto.repo.createRecord \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"repo\": \"$DID\",
    \"collection\": \"app.bsky.feed.post\",
    \"record\": {
      \"\$type\": \"app.bsky.feed.post\",
      \"text\": \"Hello from my local PDS!\",
      \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }
  }"
```

### Via Bluesky App

1. Login to the app
2. Click the compose button (+)
3. Type your message
4. Click "Post"

## Verify Your Post

### Via API

```bash
# List your posts
curl "http://localhost:2583/xrpc/com.atproto.repo.listRecords?repo=alice.test&collection=app.bsky.feed.post" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Via App

Your post should appear in your profile feed.

## Test Social Features

### Follow Another User

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.repo.createRecord \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"repo\": \"$DID\",
    \"collection\": \"app.bsky.graph.follow\",
    \"record\": {
      \"\$type\": \"app.bsky.graph.follow\",
      \"subject\": \"did:plc:xxx\",
      \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }
  }"
```

(Replace `did:plc:xxx` with the DID of the user you want to follow)

### Like a Post

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.repo.createRecord \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"repo\": \"$DID\",
    \"collection\": \"app.bsky.feed.like\",
    \"record\": {
      \"\$type\": \"app.bsky.feed.like\",
      \"subject\": {
        \"uri\": \"at://did:plc:xxx/app.bsky.feed.post/xxx\",
        \"cid\": \"bafyxxx\"
      },
      \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }
  }"
```

## Use Bruno API Collection

The project includes a Bruno API collection for easier testing:

```bash
cd bruno-api
```

Open Bruno and load this collection. It includes pre-configured requests for:

- Account creation
- Authentication
- Creating posts
- Following users
- Profile queries

See [Bruno API documentation](../../bruno-api/README.md) for details.

## Common Issues

### "Invalid handle" Error

**Problem**: Handle doesn't end with `.test`

**Solution**: Use handles like `alice.test`, not `alice.localhost`

### "Handle already taken"

**Problem**: Account already exists

**Solution**: Either login with existing credentials or choose a different handle

### "Connection refused"

**Problem**: PDS not running

**Solution**: Start the PDS:

```bash
# Docker PDS
cd official-pds
docker compose -f compose.local.yaml up -d

# Or full dev environment
cd atproto
make run-dev-env-logged
```

### Can't login to app

**Problem**: App connecting to wrong server

**Solution**:

1. Make sure you select "Custom" server at login
2. Enter: `http://localhost:2583`
3. Verify `__DEV__` is true in the app

## Next Steps

Now that you have accounts and data:

1. **Explore the UI** - Navigate through the Bluesky app
2. **Test API calls** - Use Bruno to make authenticated requests
3. **Read the architecture docs** - Understand how it all works
4. **Start developing** - Make your first code changes!

## Useful Commands Reference

```bash
# Check PDS health
curl http://localhost:2583/xrpc/_health

# Create account
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.local","handle":"test.test","password":"pass123"}'

# Login (create session)
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createSession \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test.test","password":"pass123"}'

# List your posts
curl "http://localhost:2583/xrpc/com.atproto.repo.listRecords?repo=test.test&collection=app.bsky.feed.post"

# Resolve handle
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=test.test"

# Get account info
curl "http://localhost:2583/xrpc/com.atproto.server.describeServer"
```

## Detailed Guides

- [Login Guide](../guides/login.md) - Detailed authentication guide
- [PDS Configuration](../pds/configuration.md) - Customize your PDS
- [Troubleshooting](../reference/troubleshooting.md) - Fix common issues

---

**You're all set!** Time to start building. 🚀
