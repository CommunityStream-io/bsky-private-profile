# Phase 6: AppView Integration ⏳ OPTIONAL

**Status:** ⏳ Optional  
**Duration:** TBD  
**Required for:** Custom feeds, search, advanced social features  
**Prerequisites:** Phase 5 complete (public deployment)

## Overview

Set up and configure an AppView service to enable full social features like custom feeds, search, and notification aggregation. This phase is **optional** and only needed for advanced features.

## Why This Is Optional

**Most private profile features work without a local AppView:**
- ✅ Privacy settings
- ✅ Follow requests
- ✅ Access control
- ✅ Private media
- ✅ Basic profile viewing

**AppView only needed for:**
- Custom feed algorithms
- Full-text search
- Complex social graph queries
- Advanced notification aggregation

**The public Bluesky AppView will eventually respect privacy settings** once the feature is federated, so running your own AppView is optional.

## Goals

- [ ] Set up local AppView (if needed)
- [ ] Configure to crawl your PDS
- [ ] Modify to respect privacy settings (future)
- [ ] Enable advanced features

## Tasks Breakdown

### 6.1 Local AppView Setup

**Only do this if you need custom feeds or search.**

#### Prerequisites

- PostgreSQL database
- PDS already running and accessible
- Significant server resources

#### Setup Steps

```bash
cd atproto/packages/bsky

# Configure
cp .env.example .env
# Edit .env

# Build
pnpm build

# Start
pnpm start
```

**Configuration:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bsky

# Server
BSKY_HOSTNAME=appview.yourdomain.com
BSKY_PORT=2584

# Your PDS
PDS_HOST_URL=https://pds.yourdomain.com

# Services
DID_PLC_URL=https://plc.directory
```

**Tasks:**
- [ ] Set up PostgreSQL
- [ ] Configure AppView
- [ ] Start service
- [ ] Verify health

### 6.2 PDS Event Subscription

**AppView needs to subscribe to your PDS events:**

```typescript
// AppView subscribes to PDS
const subscription = await subscribe('wss://pds.yourdomain.com/xrpc/com.atproto.sync.subscribeRepos');

// Process commits
subscription.on('commit', (commit) => {
  // Index records
  indexRecords(commit);
});
```

**Tasks:**
- [ ] Configure subscription
- [ ] Test event flow
- [ ] Verify indexing

### 6.3 Privacy-Aware AppView (Future)

**Modifications needed to respect privacy:**

#### Filter Private Content from Public Feeds

```typescript
async function getTimeline(requester: string) {
  const posts = await getAllPosts();
  
  // Filter out posts from private profiles
  const filtered = await Promise.all(
    posts.map(async (post) => {
      const canView = await checkAccess(requester, post.author);
      return canView ? post : null;
    })
  );
  
  return filtered.filter(Boolean);
}
```

#### Respect Follow Request States

```typescript
async function getFollowers(profileDid: string, requester: string) {
  const privacy = await getPrivacySettings(profileDid);
  
  if (privacy.isPrivate && !await canViewProfile(requester, profileDid)) {
    return [];  // Don't expose followers
  }
  
  return await queryFollowers(profileDid);
}
```

**Tasks:**
- [ ] Identify all endpoints needing privacy checks
- [ ] Implement access control
- [ ] Test with private profiles
- [ ] Verify no leaks

### 6.4 Custom Feed Algorithms

**If you want custom feeds:**

```typescript
export const customFeed: FeedAlgorithm = {
  async generate(requester: string, limit: number) {
    // Your custom algorithm
    const posts = await getPostsForUser(requester);
    
    // Apply privacy filtering
    const filtered = await filterByPrivacy(posts, requester);
    
    return filtered;
  }
};
```

**Tasks:**
- [ ] Define feed algorithm
- [ ] Implement privacy filtering
- [ ] Test feed generation
- [ ] Publish feed

## Testing Strategy

### AppView Health
- [ ] Service starts successfully
- [ ] Can connect to database
- [ ] Subscribes to PDS events
- [ ] Indexes records correctly

### Privacy Respect
- [ ] Private profiles don't appear in public feeds
- [ ] Follower lists respect privacy
- [ ] Search respects privacy
- [ ] No data leaks

### Performance
- [ ] Query times acceptable
- [ ] Database performant
- [ ] Handles scale

## Success Criteria

- [ ] AppView running and stable
- [ ] Successfully indexing PDS data
- [ ] Privacy settings respected
- [ ] Custom features working

## Deliverables

1. **AppView Service**
   - Configured and running
   - Connected to PDS
   - Database set up

2. **Privacy Modifications**
   - Access control implemented
   - Tested and verified
   - Documented

3. **Custom Features** (if applicable)
   - Feed algorithms
   - Search features
   - Documentation

## Known Challenges

- Resource intensive (database, CPU)
- Complex setup
- Requires significant testing
- Privacy implementation non-trivial

## Alternative Approach

**Instead of running your own AppView:**

1. **Use public Bluesky AppView**
   - No setup needed
   - Maintained by Bluesky team
   - Will eventually respect privacy

2. **Wait for federation**
   - Privacy features will be respected
   - No custom AppView needed

3. **Focus on PDS features**
   - Most features work via PDS
   - Simpler architecture

## Resources

- [AppView Documentation](../../appview/README.md)
- [AppView Setup Guide](../../appview/local-setup.md)
- [AT Protocol AppView Spec](https://atproto.com/guides/applications)

---

**Recommendation:** Skip this phase unless you specifically need custom feeds or search. The public AppView works fine for most use cases.

