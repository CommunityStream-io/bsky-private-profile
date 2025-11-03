# Phase 2: Access Control Logic ⏳ PENDING

**Status:** ⏳ Pending  
**Duration:** 1-2 weeks (estimated)  
**Can be done locally:** ✅ Yes  
**Prerequisites:** Phase 1 complete

## Overview

Implement business logic to enforce privacy rules throughout the PDS. This phase adds the "smart" layer that determines who can see what based on privacy settings and follow relationships.

## Goals

- [ ] Implement read access control middleware
- [ ] Implement write access control
- [ ] Add follow state management
- [ ] Handle edge cases
- [ ] Comprehensive integration tests

## Why This Phase

With Phase 1 complete, we have data structures but no enforcement. This phase makes privacy settings actually work by intercepting requests and applying access rules.

## Tasks Breakdown

### 2.1 Read Access Control

**Goal:** Control who can view private profile content

#### Access Check Middleware

**File:** `atproto/packages/pds/src/services/access-control.ts`

**Core Logic:**

```typescript
export class AccessControlService {
  async canViewProfile(
    requester: string | null, // DID of requester (null if not auth'd)
    subject: string // DID of profile being viewed
  ): Promise<{ canView: boolean; reason?: string }> {
    // 1. Profile owner can always view
    if (requester === subject) {
      return { canView: true };
    }

    // 2. Get privacy settings
    const privacy = await this.getPrivacySettings(subject);

    // 3. If public, anyone can view
    if (!privacy?.isPrivate) {
      return { canView: true };
    }

    // 4. If private and no requester, deny
    if (!requester) {
      return { canView: false, reason: "profile_private" };
    }

    // 5. Check if requester is approved follower
    const isFollower = privacy.allowedFollowers?.includes(requester);

    return {
      canView: isFollower,
      reason: isFollower ? undefined : "not_following",
    };
  }
}
```

**Tasks:**

- [ ] Create access control service
- [ ] Implement canViewProfile method
- [ ] Add caching for performance
- [ ] Write unit tests
- [ ] Add to PDS service container

#### Filter Posts

**Endpoint Modification:** `app.bsky.feed.getAuthorFeed`

**Logic:**

```typescript
// Before returning posts, check access
const accessCheck = await ctx.services.accessControl.canViewProfile(
  requester,
  profileDid
);

if (!accessCheck.canView) {
  throw new Error("Profile is private");
}

// Return posts only if authorized
```

**Tasks:**

- [ ] Modify getAuthorFeed endpoint
- [ ] Check access before returning posts
- [ ] Return appropriate error
- [ ] Test with Bruno
- [ ] Document behavior

#### Filter Followers/Following

**Endpoint Modifications:**

- `app.bsky.graph.getFollowers`
- `app.bsky.graph.getFollows`

**Logic:**

```typescript
// Check if requester can view this information
const accessCheck = await ctx.services.accessControl.canViewProfile(
  requester,
  profileDid
);

if (!accessCheck.canView) {
  // Return empty list or error
  return { followers: [], cursor: undefined };
}
```

**Tasks:**

- [ ] Modify follower endpoints
- [ ] Check access before returning
- [ ] Test with multiple accounts
- [ ] Document behavior

#### Profile View Filtering

**Endpoint:** `app.bsky.actor.getProfile`

**Response Modification:**

```typescript
{
  did: "did:plc:xxx",
  handle: "alice.test",
  displayName: "Alice",
  isPrivate: true,  // Add this field
  canView: false,    // Add this field
  // If canView is false, limit other fields
  postsCount: undefined,
  followersCount: undefined,
  // ...
}
```

**Tasks:**

- [ ] Add privacy fields to profile response
- [ ] Limit data for unauthorized viewers
- [ ] Show "Request to Follow" state if applicable
- [ ] Test with Bruno

### 2.2 Write Access Control

**Goal:** Prevent unauthorized actions on private profiles

#### Prevent Direct Follows

**Endpoint Modification:** `com.atproto.repo.createRecord` (for follows)

**Logic:**

```typescript
// When creating a follow record
if (collection === "app.bsky.graph.follow") {
  const targetDid = record.subject;

  // Check if target profile is private
  const privacy = await ctx.services.accessControl.getPrivacySettings(
    targetDid
  );

  if (privacy?.isPrivate) {
    // Don't allow direct follow - must request first
    throw new Error("Profile is private - must send follow request");
  }
}
```

**Tasks:**

- [ ] Intercept follow record creation
- [ ] Check if target is private
- [ ] Return error with instruction
- [ ] Test with Bruno

#### Validate Follow Requests

**Endpoint:** `com.community.graph.createFollowRequest`

**Validation:**

```typescript
// Check if already following
const existingFollow = await getFollow(requester, subject);
if (existingFollow) {
  throw new Error("Already following");
}

// Check if request already exists
const existingRequest = await getFollowRequest(requester, subject);
if (existingRequest) {
  throw new Error("Request already pending");
}

// Check if profile is actually private
const privacy = await getPrivacySettings(subject);
if (!privacy?.isPrivate) {
  throw new Error("Profile is not private - can follow directly");
}
```

**Tasks:**

- [ ] Add validation logic
- [ ] Check for duplicates
- [ ] Verify profile is private
- [ ] Return appropriate errors
- [ ] Test edge cases

#### Authorization for Responses

**Endpoint:** `com.community.graph.respondToFollowRequest`

**Authorization:**

```typescript
// Only profile owner can respond to requests
const request = await getFollowRequest(requestUri);

if (request.subject !== requester) {
  throw new Error("Unauthorized - not your profile");
}

// Check request status
if (request.status !== "pending") {
  throw new Error("Request already processed");
}
```

**Tasks:**

- [ ] Verify requester is profile owner
- [ ] Check request status
- [ ] Prevent re-processing
- [ ] Test authorization

### 2.3 Follow State Management

**Goal:** Handle transitions between states correctly

#### Approve Request Flow

**Steps:**

1. Validate request exists and is pending
2. Create follow record
3. Add to allowedFollowers list
4. Update request status to 'approved'
5. Return follow URI

**Implementation:**

```typescript
async approveFollowRequest(requestUri: string, profileOwner: string) {
  // 1. Get and validate request
  const request = await this.getRequest(requestUri);
  if (request.subject !== profileOwner) {
    throw new Error('Unauthorized');
  }
  if (request.status !== 'pending') {
    throw new Error('Request already processed');
  }

  const requester = extractDid(requestUri);

  // 2. Create follow record
  const followResult = await this.createFollow(requester, profileOwner);

  // 3. Update privacy settings
  await this.addToAllowedFollowers(profileOwner, requester);

  // 4. Update request status
  await this.updateRequestStatus(requestUri, 'approved');

  return {
    success: true,
    followUri: followResult.uri
  };
}
```

**Tasks:**

- [ ] Implement approval flow
- [ ] Ensure atomic operations
- [ ] Handle failures gracefully
- [ ] Test complete flow
- [ ] Add rollback logic

#### Deny Request Flow

**Steps:**

1. Validate request exists and is pending
2. Update request status to 'denied'
3. Optionally notify requester

**Implementation:**

```typescript
async denyFollowRequest(requestUri: string, profileOwner: string) {
  const request = await this.getRequest(requestUri);
  if (request.subject !== profileOwner) {
    throw new Error('Unauthorized');
  }

  await this.updateRequestStatus(requestUri, 'denied');

  return {success: true};
}
```

**Tasks:**

- [ ] Implement denial flow
- [ ] Update request status
- [ ] Test flow
- [ ] Document behavior

#### Profile State Changes

**Scenario:** User makes profile private

**Logic:**

```typescript
async setPrivateMode(userDid: string, isPrivate: boolean) {
  if (isPrivate) {
    // Get current followers
    const followers = await this.getFollowers(userDid);

    // Add all current followers to allowedFollowers
    await this.updatePrivacySettings(userDid, {
      isPrivate: true,
      allowedFollowers: followers.map(f => f.did)
    });
  } else {
    // Making public - clear follow requests
    await this.clearPendingRequests(userDid);
  }
}
```

**Tasks:**

- [ ] Handle private → public transition
- [ ] Handle public → private transition
- [ ] Preserve existing followers
- [ ] Clean up pending requests
- [ ] Test transitions

#### Unfollow Handling

**When user unfollows:**

```typescript
async handleUnfollow(follower: string, subject: string) {
  // Remove from allowedFollowers if profile is private
  const privacy = await this.getPrivacySettings(subject);

  if (privacy?.isPrivate) {
    await this.removeFromAllowedFollowers(subject, follower);
  }
}
```

**Tasks:**

- [ ] Intercept unfollow events
- [ ] Update allowedFollowers
- [ ] Test behavior

### 2.4 Edge Case Handling

**Goal:** Handle unusual scenarios gracefully

#### Edge Cases to Handle

1. **Concurrent Requests**

   - Two follow requests sent simultaneously
   - Solution: Use database constraints

2. **Request While Approved**

   - User unfollows then requests again
   - Solution: Allow new request, remove old follow

3. **Profile Owner Blocks Requester**

   - Request exists but owner blocks user
   - Solution: Auto-deny request, prevent future requests

4. **Circular Requests**

   - Alice requests Bob, Bob requests Alice
   - Solution: Allow (not actually circular)

5. **Request Cleanup**
   - Old denied/approved requests
   - Solution: Periodic cleanup job (Phase 7)

**Tasks:**

- [ ] Identify all edge cases
- [ ] Implement handling for each
- [ ] Write specific tests
- [ ] Document behavior

## Testing Strategy

### Unit Tests

**Test each service method:**

- Access control checks
- Follow state transitions
- Edge case handling
- Error conditions

### Integration Tests via Bruno

**Test complete workflows:**

**Workflow 1: Private Profile Access**

```
1. Alice makes profile private
2. Bob tries to view Alice's posts
3. Should get error
4. Bob sends follow request
5. Alice approves
6. Bob can now view posts
```

**Workflow 2: Deny Request**

```
1. Alice private, Bob requests
2. Alice denies
3. Bob still can't view
4. Verify request marked denied
```

**Workflow 3: Make Public**

```
1. Alice private with pending requests
2. Alice makes profile public
3. Pending requests auto-cleared
4. Anyone can view
```

**Tasks:**

- [ ] Create test workflows
- [ ] Document test scenarios
- [ ] Run full test suite
- [ ] Verify all pass

### Manual Testing

**Multi-account testing:**

- Create 3+ test accounts
- Test various permission combinations
- Verify access control works
- Test edge cases manually

## Success Criteria

### Functional Success

- [ ] Private profiles cannot be viewed by unauthorized users
- [ ] Follow requests required for private profiles
- [ ] Approved followers can view content
- [ ] Denied requests don't grant access
- [ ] Profile state changes handled correctly

### Technical Success

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Performance acceptable (< 100ms for access checks)
- [ ] No security vulnerabilities

### Documentation Success

- [ ] All access control rules documented
- [ ] Test scenarios documented
- [ ] API behavior changes documented

## Deliverables

1. **Access Control Service**

   - Complete implementation
   - Unit tests
   - Performance optimizations

2. **Modified Endpoints**

   - Updated feed endpoints
   - Updated follow endpoints
   - Updated profile endpoint

3. **State Management**

   - Follow request approval/denial
   - Profile state transitions
   - Edge case handling

4. **Test Suite**

   - Unit tests
   - Integration tests (Bruno)
   - Manual test scenarios

5. **Documentation**
   - Access control rules
   - State machine diagrams
   - API changes

## Known Limitations

- Still no UI (API testing only)
- No notifications (Phase 5)
- No AppView integration
- Handles still show as invalid locally

## Next Steps

After Phase 2 completion:

- **Phase 3:** Build frontend UI
- Privacy settings screen
- Follow request UI
- Profile indicators

## Resources

- [Phase 1 Documentation](../phase-1-backend-infrastructure/)
- [Access Control Patterns](https://atproto.com/guides/applications#authorization)
- [Testing Guide](../../reference/testing.md)

---

**Note:** This phase makes privacy features actually work. Focus on correctness over optimization.
