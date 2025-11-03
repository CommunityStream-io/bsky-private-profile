# How to Login to Your Local PDS

Quick guide for logging into your local PDS instead of the public Bluesky service.

## The Issue

By default, the Bluesky app connects to **`https://bsky.social`** (production).

To use your **local PDS** at `http://localhost:2583`, you need to tell the app during login.

## Solution: Use "Custom Service" at Login

### Step 1: Open the Login Screen

Go to `http://localhost:19006` and click "Sign in"

### Step 2: Choose Hosting Provider

You'll see options like:

- Bluesky (default)
- Custom

**Click "Custom" or "Choose your own provider"**

### Step 3: Enter Your Local PDS URL

```
http://localhost:2583
```

### Step 4: Login with Your Local Account

- **Handle**: `stephen.test` (or your other accounts)
- **Password**: `password123`

### Step 5: Click "Sign In"

You should now be logged into your local PDS! ✅

## Verify You're on Local PDS

After logging in:

1. **Check the profile URL**: Should reference your local handle
2. **Create a test post**: It should go to your local PDS
3. **Check Bruno API**: Your accessToken should work with `localhost:2583`

## Common Issues

### "Invalid handle" after login

**Cause**: You selected the wrong service or it reverted to `bsky.social`

**Solution**:

1. Logout
2. Login again, making sure to select "Custom"
3. Enter `http://localhost:2583`
4. Try again

### "Service not found"

**Cause**: Your local PDS isn't running

**Solution**:

```bash
cd official-pds
docker compose -f compose.local.yaml ps  # Check if running
docker compose -f compose.local.yaml up -d  # Start if not running
```

### "Cannot connect"

**Cause**: Wrong URL or PDS not accessible

**Solution**:

1. Verify PDS is running: `curl http://localhost:2583/xrpc/_health`
2. Use exactly: `http://localhost:2583` (no trailing slash)
3. Check Docker logs: `docker compose -f compose.local.yaml logs pds`

## Alternative: Set Default Service (For Development)

If you want the app to **always use local PDS by default**, you can modify the code:

### Option 1: Environment Variable (Recommended)

Create `.env.local` in `bluesky-app/`:

```bash
# bluesky-app/.env.local
EXPO_PUBLIC_PDS_URL=http://localhost:2583
```

Then modify `src/lib/constants.ts`:

```typescript
// Change this line:
export const DEFAULT_SERVICE = BSKY_SERVICE;

// To this:
export const DEFAULT_SERVICE = process.env.EXPO_PUBLIC_PDS_URL || BSKY_SERVICE;
```

Restart the dev server:

```bash
cd bluesky-app
yarn web  # or however you're running it
```

### Option 2: Hardcode for Development

Edit `bluesky-app/src/lib/constants.ts`:

```typescript
// Find this line:
export const DEFAULT_SERVICE = BSKY_SERVICE;

// Change to:
export const DEFAULT_SERVICE = LOCAL_DEV_SERVICE; // Use local PDS by default
```

**Important**: Don't commit this change! It's for local development only.

Restart your dev server after making this change.

## Testing Your Connection

### Quick Test in Bruno

1. **Login via UI** using the Custom service method above
2. **Copy your accessToken** from browser DevTools (localStorage)
3. **Paste into Bruno** environment: `accessToken` variable
4. **Run**: `Posts/List Posts`
5. Should work! ✅

### Verify Handle Resolution

```bash
curl "http://localhost:2583/xrpc/com.atproto.identity.resolveHandle?handle=stephen.test"
# Should return: {"did":"did:plc:..."}
```

## Best Practice for Local Development

1. **Always select Custom service** when logging in
2. **Use**: `http://localhost:2583`
3. **Logout** before switching between local and production
4. **Keep two browser profiles** - one for local, one for production testing

## Your Local Accounts

These accounts exist on your local PDS:

| Handle               | Purpose               | Password      |
| -------------------- | --------------------- | ------------- |
| `stephen.test`       | Personal testing      | `password123` |
| `mod-authority.test` | Moderation testing    | `password123` |
| `alice2.test`        | Account creation test | `password123` |
| `user2.test`         | Original test account | `password123` |

All require using Custom service: `http://localhost:2583`

## Screenshots (Reference)

When you see the login screen:

1. Look for "Hosting provider" or "Choose service provider"
2. Select "Custom" or "Other"
3. Enter: `http://localhost:2583`
4. Continue with your handle and password

## Troubleshooting Checklist

- [ ] PDS is running (`docker ps` shows `pds-local`)
- [ ] Health check works (`curl http://localhost:2583/xrpc/_health`)
- [ ] Selected "Custom" service in UI
- [ ] Used exact URL: `http://localhost:2583`
- [ ] Using `.test` handle (e.g., `stephen.test`)
- [ ] Using correct password: `password123`

## Still Having Issues?

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help, especially:

- "Invalid handle" issues
- PDS connection problems
- Authentication troubleshooting

---

**TL;DR: At login, select "Custom" service and enter `http://localhost:2583`, then login with `stephen.test` / `password123`**
