# Understanding the AppView Service

A comprehensive explanation of the Bluesky/AT Protocol architecture and the AppView's role.

## The AT Protocol Architecture

Bluesky uses a **distributed architecture** with separate services that each have specific roles:

```
┌─────────────────────────────────────────────────────────────┐
│                      AT Protocol Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐      ┌──────────┐      ┌─────────────────┐   │
│  │  Client  │ ───▶ │ AppView  │ ───▶ │  PDS (Yours)    │   │
│  │   (UI)   │ ◀─── │ Service  │ ◀─── │  localhost:2583 │   │
│  └──────────┘      └──────────┘      └─────────────────┘   │
│                          │                                    │
│                          │                                    │
│                          ▼                                    │
│                    ┌──────────┐                              │
│                    │   PLC    │  (DID Registry)              │
│                    │ Directory│                              │
│                    └──────────┘                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## The Three Main Components

### 1. PDS (Personal Data Server) - Your Data Home 🏠

**What it does:**
- Stores YOUR account data
- Stores YOUR posts, likes, follows
- Handles authentication (login)
- Manages your repository (repo)

**Your local PDS:**
- Running at `http://localhost:2583`
- Contains accounts: `stephen.test`, `mod-authority.test`, etc.
- Stores all posts you create

**Think of it as:** Your personal database/storage

**Example PDS methods:**
```
com.atproto.repo.createRecord    - Create a post
com.atproto.repo.listRecords     - List your posts
com.atproto.identity.resolveHandle - Resolve a handle
com.atproto.server.createAccount - Create account
```

### 2. AppView (Application View) - The Social Layer 👁️

**What it does:**
- Aggregates data from MANY PDSs
- Generates feeds (Following, Discover, etc.)
- Provides social graph queries (who follows who)
- Handles search across all users
- Computes notifications
- Generates profile views with stats

**The public AppView:**
- Running at `https://api.bsky.app`
- Crawls/indexes data from thousands of PDSs
- Generates the feeds you see on Bluesky
- Knows about millions of public users

**Think of it as:** The "social media engine" that makes everything social

**Example AppView methods:**
```
app.bsky.actor.getProfile       - Get a user's profile (with stats!)
app.bsky.feed.getTimeline       - Get your Following feed
app.bsky.feed.getAuthorFeed     - Get someone's posts
app.bsky.feed.searchPosts       - Search across all posts
app.bsky.graph.getFollowers     - Get followers list
app.bsky.notification.listNotifications - Get notifications
```

### 3. PLC Directory - The Phone Book 📞

**What it does:**
- Maps DIDs to handles
- Stores DID documents
- Tracks which PDS hosts which account

**Public PLC:**
- Running at `https://plc.directory`
- Permanent record of all DIDs
- Used by everyone to look up accounts

**Think of it as:** The global directory/registry

## Why You're Seeing `handle.invalid`

Here's what happens when you view a profile:

### Normal Flow (Production):

```
1. UI: "Show me profile for did:plc:xxx"
   ↓
2. AppView: "Let me look that up..."
   ↓
3. AppView → PLC Directory: "What handle owns this DID?"
   ↓
4. PLC: "It's alice.bsky.social"
   ↓
5. AppView: "Let me verify with her PDS..."
   ↓
6. AppView → alice's PDS: "Confirm alice.bsky.social?"
   ↓
7. PDS: "Yep! ✅"
   ↓
8. AppView → UI: Returns full profile with handle
```

### Your Local Setup:

```
1. UI: "Show me profile for did:plc:2zuvo5fg2pw5ymjbwzv6zklm"
   ↓
2. Your local PDS proxies to → Public AppView
   ↓
3. Public AppView → PLC Directory: "What handle owns this DID?"
   ↓
4. PLC: "It's stephen.test"
   ↓
5. Public AppView: "Let me verify..."
   ↓
6. Public AppView tries to reach → stephen.test (doesn't exist as domain!)
   ↓
7. Verification fails ❌
   ↓
8. AppView → UI: "handle.invalid" (can't verify ownership)
```

## What You're Missing Locally

You have:
- ✅ Local PDS
- ✅ PLC Directory (public, shared)

You DON'T have:
- ❌ Local AppView service

This means:
- ✅ Creating posts works (PDS)
- ✅ Authentication works (PDS)
- ✅ Direct repo queries work (PDS)
- ❌ Feeds don't work (need AppView)
- ❌ Profile stats wrong (need AppView)
- ❌ Handle shows as invalid (AppView can't verify)

## Do You Need a Local AppView?

**For most development: NO!**

You can build and test:
- ✅ Account management
- ✅ Post creation
- ✅ Profile privacy settings
- ✅ Follow requests
- ✅ Access control
- ✅ Authentication flows

All using **direct PDS API calls** via Bruno.

**You'd only need a local AppView if:**
- Building feed algorithms
- Testing feed generation
- Building search features
- Testing notification aggregation
- Needing to test full social graph queries

## Working With What You Have

### Use PDS Methods (Direct):

**Instead of:**
```
app.bsky.actor.getProfile         ❌ Needs AppView
app.bsky.feed.getAuthorFeed       ❌ Needs AppView
```

**Use:**
```
com.atproto.repo.listRecords      ✅ Direct PDS
com.atproto.repo.getRecord        ✅ Direct PDS
com.atproto.repo.describeRepo     ✅ Direct PDS
```

### Example: Get Your Posts

**AppView way (broken locally):**
```bash
curl "http://localhost:2583/xrpc/app.bsky.feed.getAuthorFeed?actor=stephen.test"
# Routes to public AppView → fails
```

**PDS way (works!):**
```bash
curl "http://localhost:2583/xrpc/com.atproto.repo.listRecords?repo=stephen.test&collection=app.bsky.feed.post"
# Direct PDS query → works!
```

## Setting Up a Local AppView (Advanced)

If you really need it, the AppView is part of the ATProto monorepo:

**Location:** `atproto/packages/bsky` (in your workspace)

**To run:**
```bash
cd atproto
corepack pnpm --filter @atproto/bsky build
corepack pnpm --filter @atproto/bsky start
```

**Challenges:**
- Needs its own database (PostgreSQL)
- Needs to be configured to crawl your local PDS
- Complex setup with subscriptions and indexing
- Requires significant system resources

**Not recommended** unless you specifically need to test AppView features.

## Key Takeaways

1. **PDS** = Your data storage (you have this ✅)
2. **AppView** = Social aggregation layer (you don't have this ❌)
3. **Most features work without AppView** using direct PDS methods
4. **The UI relies heavily on AppView** which is why it shows issues
5. **Use Bruno/API** for development instead of relying on the UI

## For Your Private Profile Project

You can build the entire private profile feature using **just the PDS**:

- Store privacy settings → PDS record
- Handle follow requests → PDS records
- Check access permissions → PDS logic
- Control post visibility → PDS authorization

The AppView would eventually respect these privacy settings when you deploy to production, but you don't need it running locally for development!

## Further Reading

- [AT Protocol Docs - Architecture](https://atproto.com/guides/overview)
- [AppView Service Docs](https://atproto.com/guides/applications)
- [PDS Specification](https://atproto.com/specs/pds)

---

**TL;DR: AppView is the "social layer" that aggregates data from all PDSs to generate feeds and profiles. You don't have it locally, which is why some features don't work. But you can build most features using direct PDS API calls!**

