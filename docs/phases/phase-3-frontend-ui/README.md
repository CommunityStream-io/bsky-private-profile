# Phase 3: Frontend - Basic Private Profile UI ⏳ PENDING

**Status:** ⏳ Pending  
**Duration:** 2-3 weeks (estimated)  
**Can be done locally:** ✅ Yes (handles show as invalid - expected)  
**Prerequisites:** Phase 1 & 2 complete

## Overview

Build user interface for privacy settings and follow request management in the Bluesky app. Users can now interact with private profile features through the UI instead of API only.

## Goals

- [ ] Create privacy settings screen
- [ ] Implement follow request UI
- [ ] Add private profile indicators
- [ ] Wire up to backend APIs
- [ ] Test complete user flows

## Why This Phase

With backend complete (Phases 1-2), we can now build the user-facing interface. This makes features accessible to actual users.

## Tasks Breakdown

### 3.1 Privacy Settings Screen

**Location:** `bluesky-app/src/screens/Settings/PrivacySettings.tsx`

#### Screen Layout

```
┌─────────────────────────────────┐
│ ← Privacy Settings              │
├─────────────────────────────────┤
│                                 │
│ Private Profile                 │
│ Only approved followers can     │
│ view your posts and profile     │
│                                 │
│ [Toggle: Off/On]                │
│                                 │
├─────────────────────────────────┤
│ Approved Followers (3)          │
│                                 │
│ 👤 Bob Smith      [Remove]      │
│ 👤 Carol White    [Remove]      │
│ 👤 David Jones    [Remove]      │
│                                 │
└─────────────────────────────────┘
```

#### Components Needed

**PrivacySettingsScreen**
```typescript
export function PrivacySettingsScreen() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [followers, setFollowers] = useState([]);
  
  const handleToggle = async (value: boolean) => {
    // Call PDS API
    await agent.api.com.community.actor.setPrivacySettings({
      isPrivate: value
    });
    setIsPrivate(value);
  };
  
  return (
    <View>
      <Text>Private Profile</Text>
      <Switch value={isPrivate} onValueChange={handleToggle} />
      {isPrivate && (
        <ApprovedFollowersList followers={followers} />
      )}
    </View>
  );
}
```

**Tasks:**
- [ ] Create screen component
- [ ] Add toggle switch
- [ ] Add followers list
- [ ] Implement remove follower
- [ ] Add loading states
- [ ] Add error handling
- [ ] Wire up to navigation

#### API Integration

**Fetch Current Settings:**
```typescript
const {data} = await agent.api.com.community.actor.getPrivacySettings({
  actor: userDid
});
setIsPrivate(data.isPrivate);
```

**Update Settings:**
```typescript
await agent.api.com.community.actor.setPrivacySettings({
  isPrivate: newValue
});
```

**Tasks:**
- [ ] Create API client methods
- [ ] Add type definitions
- [ ] Handle errors
- [ ] Add optimistic updates
- [ ] Test API integration

### 3.2 Follow Request UI

#### Follow Button Component

**Location:** `bluesky-app/src/components/FollowButton.tsx`

**States:**
- **Public Profile:** "Follow" → "Following"
- **Private Profile:** "Request to Follow" → "Requested"
- **Approved:** "Following"

**Logic:**
```typescript
export function FollowButton({profile}) {
  const [state, setState] = useState<'follow' | 'requested' | 'following'>('follow');
  
  const handlePress = async () => {
    if (profile.isPrivate && state === 'follow') {
      // Send follow request
      await agent.api.com.community.graph.createFollowRequest({
        subject: profile.did
      });
      setState('requested');
    } else if (state === 'follow') {
      // Regular follow
      await agent.api.app.bsky.graph.follow.create({
        subject: profile.did
      });
      setState('following');
    } else {
      // Unfollow
      // ...
    }
  };
  
  return (
    <Button onPress={handlePress}>
      {state === 'follow' && (profile.isPrivate ? 'Request to Follow' : 'Follow')}
      {state === 'requested' && 'Requested'}
      {state === 'following' && 'Following'}
    </Button>
  );
}
```

**Tasks:**
- [ ] Update FollowButton component
- [ ] Add private profile logic
- [ ] Show correct button state
- [ ] Handle state transitions
- [ ] Add loading indicators
- [ ] Test all states

#### Follow Requests Screen

**Location:** `bluesky-app/src/screens/FollowRequests.tsx`

**Layout:**
```
┌─────────────────────────────────┐
│ ← Follow Requests               │
├─────────────────────────────────┤
│ Tabs: [Incoming] [Outgoing]     │
├─────────────────────────────────┤
│                                 │
│ 👤 Bob Smith wants to follow    │
│    [Approve] [Deny]             │
│                                 │
│ 👤 Carol White wants to follow  │
│    [Approve] [Deny]             │
│                                 │
└─────────────────────────────────┘
```

**Implementation:**
```typescript
export function FollowRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  
  useEffect(() => {
    loadRequests();
  }, [tab]);
  
  const loadRequests = async () => {
    const {data} = await agent.api.com.community.graph.listFollowRequests({
      direction: tab
    });
    setRequests(data.requests);
  };
  
  const handleApprove = async (requestUri: string) => {
    await agent.api.com.community.graph.respondToFollowRequest({
      requestUri,
      approved: true
    });
    loadRequests(); // Refresh
  };
  
  return (
    <View>
      <Tabs value={tab} onChange={setTab} />
      <FlatList
        data={requests}
        renderItem={({item}) => (
          <FollowRequestCard
            request={item}
            onApprove={() => handleApprove(item.uri)}
            onDeny={() => handleDeny(item.uri)}
          />
        )}
      />
    </View>
  );
}
```

**Tasks:**
- [ ] Create screen component
- [ ] Add tab switcher
- [ ] Implement request list
- [ ] Add approve/deny actions
- [ ] Add empty states
- [ ] Handle errors
- [ ] Add to navigation

#### Notifications Badge

**Add notification badge for new follow requests:**

**Location:** `bluesky-app/src/components/Navigation.tsx`

```typescript
// Poll for new requests
const {data} = await agent.api.com.community.graph.listFollowRequests({
  direction: 'incoming',
  status: 'pending'
});

const pendingCount = data.requests.length;
// Show badge with count
```

**Tasks:**
- [ ] Add polling for new requests
- [ ] Show badge on nav icon
- [ ] Update on state changes
- [ ] Test notifications

### 3.3 Profile Indicators

#### Private Profile Badge

**Location:** `bluesky-app/src/components/ProfileHeader.tsx`

**Visual:**
```
Alice Smith 🔒
@alice.test
This profile is private
```

**Implementation:**
```typescript
{profile.isPrivate && (
  <View style={styles.privateBadge}>
    <Icon name="lock" />
    <Text>This profile is private</Text>
  </View>
)}
```

**Tasks:**
- [ ] Add lock icon to profile
- [ ] Show "private" indicator
- [ ] Style appropriately
- [ ] Test on various profiles

#### Unauthorized View State

**When viewing private profile you don't follow:**

```
┌─────────────────────────────────┐
│ 👤 Alice Smith 🔒                │
│ @alice.test                     │
├─────────────────────────────────┤
│                                 │
│ 🔒 This Account is Private      │
│                                 │
│ Follow this account to see      │
│ their posts and profile         │
│                                 │
│ [Request to Follow]             │
│                                 │
└─────────────────────────────────┘
```

**Implementation:**
```typescript
if (profile.isPrivate && !profile.canView) {
  return (
    <EmptyState
      icon="lock"
      title="This Account is Private"
      message="Follow this account to see their posts"
      action={
        <Button onPress={sendFollowRequest}>
          Request to Follow
        </Button>
      }
    />
  );
}
```

**Tasks:**
- [ ] Create empty state component
- [ ] Show when unauthorized
- [ ] Add request button
- [ ] Test various states

#### Pending Request State

**When you've sent a request:**

```
🔒 Request Pending

You've requested to follow this account.
```

**Tasks:**
- [ ] Show pending state
- [ ] Style indicator
- [ ] Update on approval

### 3.4 State Management

#### React Query Integration

**Queries:**
```typescript
// Privacy settings
const {data: privacy} = useQuery(
  ['privacy-settings', userDid],
  () => agent.api.com.community.actor.getPrivacySettings({actor: userDid})
);

// Follow requests
const {data: requests} = useQuery(
  ['follow-requests', 'incoming'],
  () => agent.api.com.community.graph.listFollowRequests({direction: 'incoming'})
);
```

**Mutations:**
```typescript
const setPrivacy = useMutation(
  (isPrivate: boolean) => agent.api.com.community.actor.setPrivacySettings({isPrivate}),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['privacy-settings']);
    }
  }
);
```

**Tasks:**
- [ ] Set up React Query
- [ ] Define all queries
- [ ] Define all mutations
- [ ] Handle cache invalidation
- [ ] Test state updates

## Testing Strategy

### Component Testing

**Unit tests for components:**
- Privacy settings toggle
- Follow button states
- Request list rendering
- Empty states

### Integration Testing

**Manual testing flows:**

**Flow 1: Make Profile Private**
1. Open settings
2. Toggle private mode
3. Verify confirmation
4. Check profile shows lock icon

**Flow 2: Approve Request**
1. Receive follow request
2. See notification badge
3. Open requests screen
4. Approve request
5. Verify follower added

**Flow 3: Request to Follow**
1. Find private profile
2. See "Request to Follow" button
3. Send request
4. See "Requested" state
5. Wait for approval
6. See content after approval

### Known Limitations During Local Testing

- Handles will show as `handle.invalid`
- Can test with multiple `.test` accounts
- Access control will work
- Just handles won't resolve properly

**This is expected and doesn't block testing!**

## Success Criteria

### Functional Success
- [ ] Can toggle privacy settings in UI
- [ ] Follow button shows correct state
- [ ] Can view and respond to requests
- [ ] Private profiles show indicators
- [ ] Unauthorized users see appropriate message

### UX Success
- [ ] Clear visual indicators
- [ ] Intuitive button labels
- [ ] Helpful empty states
- [ ] Smooth transitions
- [ ] No confusing states

### Technical Success
- [ ] All components tested
- [ ] State management working
- [ ] API integration complete
- [ ] Error handling robust

## Deliverables

1. **Privacy Settings**
   - Settings screen
   - Toggle component
   - Followers list

2. **Follow Request UI**
   - Updated follow button
   - Requests screen
   - Approve/deny actions

3. **Profile Indicators**
   - Lock icon
   - Private badge
   - Unauthorized view state

4. **Documentation**
   - Component documentation
   - User flow diagrams
   - Testing guide

## Known Issues & Workarounds

**Handle Shows Invalid:**
- **Issue:** Handles show as `handle.invalid` locally
- **Impact:** Visual only, doesn't affect functionality
- **Workaround:** Use `.test` handles, accept this limitation
- **Fix:** Phase 5 (production deployment)

## Next Steps

After Phase 3 completion:
- **Phase 4:** Pinata integration for private media
- Gateway provisioning
- Token generation
- Media access control

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Bluesky App Codebase](../../bluesky-app/README.md)
- [Design System Components](../../bluesky-app/setup.md)

---

**Note:** Focus on functionality first, polish later. Get the core flows working end-to-end.

