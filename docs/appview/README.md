# AppView Service Documentation

The AppView is the "social layer" of AT Protocol that aggregates data from many PDSs to generate feeds, search, and social features.

## What is the AppView?

The AppView service:

- **Aggregates data** from multiple Personal Data Servers
- **Generates feeds** (Following, Discover, etc.)
- **Provides social graph** queries (followers, following)
- **Enables search** across all users and posts
- **Computes notifications** by monitoring activity
- **Generates profile views** with follower counts and stats

## Do You Need a Local AppView?

**For most development: NO! ✅**

You can build and test most features using just the PDS:

- ✅ Account management
- ✅ Post creation
- ✅ Profile privacy settings
- ✅ Follow requests
- ✅ Access control
- ✅ Authentication flows

**You only need a local AppView if you're:**

- Building feed algorithms
- Testing feed generation
- Building search features
- Testing notification aggregation
- Needing full social graph queries

## Documentation

- **[AppView Overview](overview.md)** - Detailed explanation of AppView architecture and role
- **[Local Setup](local-setup.md)** - How to run a local AppView (advanced)

## The Public AppView

By default, your local setup uses the public Bluesky AppView at `https://api.bsky.app`. This works for most development purposes, though local accounts may show as `handle.invalid` because the public AppView cannot verify local handles.

## AppView vs PDS

| Feature         | PDS     | AppView |
| --------------- | ------- | ------- |
| Store your data | ✅      | ❌      |
| Create posts    | ✅      | ❌      |
| Authentication  | ✅      | ❌      |
| Generate feeds  | ❌      | ✅      |
| Social graph    | Limited | ✅      |
| Search          | ❌      | ✅      |
| Notifications   | ❌      | ✅      |

## Working Without a Local AppView

When developing without a local AppView:

**Use PDS methods directly:**

```bash
# Instead of app.bsky.feed.getAuthorFeed (AppView)
# Use com.atproto.repo.listRecords (PDS)
curl "http://localhost:2583/xrpc/com.atproto.repo.listRecords?repo=user.test&collection=app.bsky.feed.post"
```

**Use API testing tools:**

- Bruno API collection for direct PDS testing
- Backend logic implementation and testing
- API-level feature validation

## Next Steps

1. Read the [AppView Overview](overview.md) to understand the architecture
2. Decide if you need a local AppView based on your development needs
3. If needed, follow the [Local Setup Guide](local-setup.md)

---

**Recommendation:** Start development without a local AppView. Most features can be built and tested using direct PDS API calls. Add a local AppView later only if your specific features require it.
