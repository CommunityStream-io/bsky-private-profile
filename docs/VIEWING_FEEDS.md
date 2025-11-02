# How to View Feeds in Your Local Bluesky Setup

Quick guide for seeing content in your local development environment.

## Understanding the Setup

Your local environment uses **two services**:

| Service | URL | Purpose |
|---------|-----|---------|
| **Local PDS** | `http://localhost:2583` | Stores your accounts, posts, follows |
| **Public AppView** | `https://public.api.bsky.app` | Generates feeds, aggregates public content |

The Bluesky app connects to **both** automatically!

## Where to See Content

### 1. Your Profile Feed ✅ (Local Posts)

**Best for:** Viewing posts you created on your local PDS

1. Login to `http://localhost:19006`
2. Click your profile icon or navigate to your profile
3. You'll see all posts you've created

**Create a post:**
- Use the **"+"** button in the UI
- Or use Bruno API: `Posts/Create Test Post`
- Or use the composer in the app

### 2. Discover Feed ✅ (Public Bluesky)

**Best for:** Seeing what's happening on public Bluesky

1. Login with your local account
2. Navigate to the **Discover** tab
3. You'll see public posts from `bsky.social`

**Note:** Your local posts won't appear here (they're only on your local PDS)

### 3. Following Feed ✅ (Public Bluesky)

**Best for:** Following public Bluesky users

1. Search for a public user (e.g., `pfrazee.com`)
2. Follow them
3. Their posts appear in your Following feed

**Note:** You can only follow public users, not other local test accounts (unless they're federated)

### 4. Custom Feeds 🔧 (Advanced)

To use custom feeds, you'd need to:
- Set up a feed generator service (separate project)
- Configure it to read from your local PDS
- This is beyond basic local development

## Quick Start: Create Your First Post

### Using Bruno API

1. **Login** (if not already):
   - Open `Account/Create Session (Login)`
   - Click "Send"
   - Tokens are auto-saved

2. **Create a post**:
   - Open `Posts/Create Test Post`
   - Click "Send"
   - You'll get a `uri` back

3. **View your post**:
   - Open `Posts/List Posts`
   - Click "Send"
   - You'll see your new post!

4. **View in the UI**:
   - Go to `http://localhost:19006`
   - Navigate to your profile
   - Your post appears there!

### Using the Bluesky UI

1. Login at `http://localhost:19006`
2. Click the **"+"** button (bottom right on mobile, top right on web)
3. Write your post
4. Click "Post"
5. Go to your profile to see it

## Testing Post Creation

### Method 1: Bruno API (Recommended for Testing)

```bash
# In Bruno, run these in order:
1. Account/Create Session (Login)
2. Posts/Create Test Post
3. Posts/List Posts  # Verify it was created
```

### Method 2: cURL

```bash
# Get your access token first (from Bruno after login)
ACCESS_TOKEN="your-token-here"
DID="your-did-here"

curl -X POST http://localhost:2583/xrpc/com.atproto.repo.createRecord \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "repo": "'$DID'",
    "collection": "app.bsky.feed.post",
    "record": {
      "$type": "app.bsky.feed.post",
      "text": "Hello from my local PDS!",
      "createdAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
    }
  }'
```

### Method 3: Bluesky UI

Just use the composer - it's the easiest way!

## What You'll See

### ✅ In Your Profile
- All posts you create
- Your bio, display name
- Your follower/following counts

### ✅ In Discover Feed
- Public posts from Bluesky users worldwide
- Algorithmic recommendations
- Trending content

### ✅ In Following Feed
- Posts from public Bluesky users you follow
- Reposts from people you follow

### ❌ What You WON'T See
- Posts from other local test accounts (unless you set up federation)
- Your local posts in public feeds (they're not federated)
- Custom feeds (unless you build a feed generator)

## Common Questions

### Q: Why don't I see my local posts in the Discover feed?

**A:** Your local PDS isn't federated with the public Bluesky network. Posts stay local. To see them:
- View your profile
- Or use the Bruno API to list posts

### Q: Can I follow my other local test accounts?

**A:** Yes! But you won't see their posts in feeds. You need to:
1. Follow them (search for handle, e.g., `mod-authority.test`)
2. View their profile directly to see their posts
3. Or set up a local AppView service (advanced)

### Q: How do I see posts from multiple local accounts?

**Options:**
1. **View each profile individually** (simple)
2. **Use Bruno API** to query posts from each account
3. **Set up a local AppView** (advanced, not covered in this guide)

### Q: Can I test the private profile features without feeds?

**A:** Yes! Most private profile features work at the account/profile level:
- Profile privacy settings
- Follow requests
- Access control for individual posts
- All testable through API or profile views

## Next Steps

1. ✅ **Create test posts** using Bruno or the UI
2. ✅ **Follow public Bluesky users** to test the Following feed
3. ✅ **Test profile features** (bio, avatar, etc.)
4. 🚀 **Start building private profile features!**

## Troubleshooting

### "I don't see any posts!"

1. Check you're logged in
2. Create a post first (use Bruno: `Posts/Create Test Post`)
3. Go to your profile (not the Discover feed)
4. Verify the post was created (Bruno: `Posts/List Posts`)

### "Discover feed is empty"

The Discover feed pulls from public Bluesky. If it's empty:
1. Check your internet connection
2. The public AppView might be down (rare)
3. Try refreshing the page

### "Following feed is empty"

You haven't followed anyone yet!
1. Search for a public user (e.g., `pfrazee.com`)
2. Click "Follow"
3. Their posts will appear in your Following feed

## References

- [Bruno API Collection](../bruno-api/README.md) - Test API endpoints
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [AT Protocol Docs](https://atproto.com) - Protocol documentation

---

**TL;DR: Create posts via Bruno or UI, view them on your profile. Public feeds show content from bsky.social, your local posts stay local.**

