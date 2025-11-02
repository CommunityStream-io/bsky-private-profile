<!-- b5e90116-f46d-440a-abff-d64d5159b4ab b6971893-8b9e-45ee-9396-157b85f7dd06 -->
# Private Profile Integration Plan

## Overview

Integrate Instagram-style private profiles into Bluesky with approval-based follows, using PDS modifications and Pinata IPFS private gateways. Implementation follows an iterative approach with small, testable contracts between UI, PDS, and infrastructure.

## Architecture Strategy

### Core Principles

1. **Iterative Development**: Prove concepts in small increments
2. **Content-First**: Start with private content (posts/media), extend to profile metadata later
3. **Contract-Based**: Clear interfaces between UI, PDS, and gateway layers
4. **Backward Compatible**: Existing public profiles continue to work unchanged
5. **Mis en Place**: All repositories set up, tested independently, then integrated

### Integration Layers

```
┌─────────────────────────────────────────────────────┐
│  UI Layer (bluesky-app)                             │
│  - Pending follow button                            │
│  - Follow request notifications                     │
│  - Private profile indicators                       │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│  State Layer                                         │
│  - Extended follow mutations (pending state)        │
│  - Follow request queries                           │
│  - Profile privacy queries                          │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│  API/Agent Layer                                     │
│  - Follow request create/approve/deny               │
│  - Private gateway authentication                   │
│  - Content access control                           │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│  PDS Layer (modifications needed)                    │
│  - Profile privacy flag storage                     │
│  - Follow request endpoints                         │
│  - Access control validation                        │
│  - Private gateway token generation                 │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│  Storage Layer (Pinata Private Gateway)             │
│  - Private content storage                          │
│  - Token-based access control                       │
│  - Content retrieval with auth                      │
└─────────────────────────────────────────────────────┘
```

## Phase 0: Mis en Place - Repository Setup & Submodule Configuration

### Goal

Set up all repositories as **git submodules** in the [bsky-private-profile](https://github.com/CommunityStream-io/bsky-private-profile.git) orchestrator repository. This creates a unified workspace for fast cross-repo iteration.

### Repository Architecture

**Parent Orchestrator:**

- **Repo:** https://github.com/CommunityStream-io/bsky-private-profile.git
- **Purpose:** Central orchestration of all submodules, workspace config, integration documentation

**Submodules:**

1. **bluesky-app** - https://github.com/bluesky-social/social-app.git (Frontend UI)
2. **atproto** - https://github.com/bluesky-social/atproto.git (PDS Backend)
3. **community-stream-lexicon** - Your lexicon repo (Custom schemas)
4. **pinata-integration** - https://github.com/CommunityStream-io/pinata-integration.git (Gateway service)

### Final Directory Structure

```
bsky-private-profile/               # Orchestrator repo
├── .gitmodules                     # Submodule configuration
├── bluesky-app/                    # Submodule: Frontend
├── atproto/                        # Submodule: Backend
├── community-stream-lexicon/       # Submodule: Lexicons
├── pinata-integration/             # Submodule: Gateway
├── workspace.code-workspace        # Cursor workspace
├── docker-compose.yml              # Service orchestration
└── README.md                       # Setup documentation
```

### Quick Start (If Submodules Already Configured)

```bash
# Clone with all submodules
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile

# Install all dependencies
./scripts/install-all.sh  # Or manually install each submodule
```

### Initial Setup (First Time Configuration)

**Step 1: Clone Orchestrator & Add Submodules**

```bash
# Clone parent repo
git clone https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile

# Add bluesky-app submodule (with Windows NTFS protection)
git submodule add --config core.protectNTFS=false \
  https://github.com/bluesky-social/social-app.git bluesky-app

# Add atproto submodule
git submodule add https://github.com/bluesky-social/atproto.git atproto

# Add community-stream-lexicon submodule (use your repo URL)
git submodule add <your-lexicon-repo-url> community-stream-lexicon

# Add pinata-integration submodule
git submodule add https://github.com/CommunityStream-io/pinata-integration.git pinata-integration

# Commit submodule configuration
git add .gitmodules bluesky-app atproto community-stream-lexicon pinata-integration
git commit -m "feat: add all project submodules"
git push origin main
```

**Step 2: Create Workspace Configuration**

Create `workspace.code-workspace`:

```json
{
  "folders": [
    { "name": "🎨 Bluesky App", "path": "bluesky-app" },
    { "name": "🔧 ATProto PDS", "path": "atproto/packages/pds" },
    { "name": "📚 ATProto API", "path": "atproto/packages/api" },
    { "name": "📋 Lexicons", "path": "community-stream-lexicon" },
    { "name": "🌐 Pinata Gateway", "path": "pinata-integration" },
    { "name": "📁 Root", "path": "." }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "typescript.tsdk": "atproto/node_modules/typescript/lib"
  }
}
```

**Step 3: Install Dependencies**

```bash
# Bluesky app
cd bluesky-app && yarn install && cd ..

# ATProto (builds all packages)
cd atproto && npm install && npm run build && cd ..

# Lexicon
cd community-stream-lexicon && npm install && npm run build && cd ..

# Pinata integration
cd pinata-integration && npm install && cd ..
```

**Step 4: Configure Local PDS**

```bash
cd atproto/packages/pds

# Copy environment template
cp .env.example .env

# Edit .env:
# PDS_HOSTNAME=localhost
# PDS_PORT=2583
# PDS_JWT_SECRET=your-secret

# Initialize database
npm run db:migrate

# Start PDS
npm run start:dev
```

**Step 5: Configure Bluesky App for Local Development**

```bash
cd bluesky-app

# Point to local PDS
echo "EXPO_PUBLIC_PDS_URL=http://localhost:2583" > .env.local

# Start app
yarn web
```

### Development Workflow

**Open Workspace:**

```bash
cd bsky-private-profile
cursor workspace.code-workspace
```

**Run All Services:**

- Terminal 1: `cd bluesky-app && yarn web` (Frontend - http://localhost:19006)
- Terminal 2: `cd atproto/packages/pds && npm run start:dev` (PDS - http://localhost:2583)
- Terminal 3: `cd pinata-integration && npm run dev` (Gateway - http://localhost:3000)

**Create Test Accounts:**

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.local","handle":"user1.test","password":"password123"}'
```

### Submodule Management

**Update all submodules:**

```bash
git submodule update --remote --merge
```

**Make changes in submodule:**

```bash
cd bluesky-app
git checkout -b feature/private-profiles
# Make changes
git commit -am "Add pending follow state"
git push origin feature/private-profiles
cd ..
# Update parent to track new commit
git add bluesky-app
git commit -m "Update bluesky-app submodule"
```

### Verification Checklist

- ✅ All submodules cloned and initialized
- ✅ Workspace opens in Cursor with all folders
- ✅ Local PDS running on port 2583
- ✅ Bluesky app running on port 19006
- ✅ Pinata service running on port 3000
- ✅ Test accounts created successfully
- ✅ All projects building without errors

## Phase 1: Pending Follow State (Prove the Concept)

### Goal

Add "pending" follow state to the existing follow system without breaking current functionality. This proves the UI and state management can handle three states: not following, following, and pending.

### Files to Modify

**1. Extended Follow State Types**

- File: `bluesky-app/src/state/queries/profile.ts`
- Add: `pendingFollowUri?: string` to profile viewer state
- Add: Handle pending state in `useProfileFollowMutationQueue`

**2. Follow Button UI Updates**

- File: `bluesky-app/src/view/com/profile/FollowButton.tsx`
- Add: "Pending" button state with distinct styling
- Add: Logic to show pending state when `viewer.pendingFollowUri` exists

**3. Profile Header Updates**

- File: `bluesky-app/src/screens/Profile/Header/ProfileHeaderStandard.tsx`
- Add: Display "Requested" instead of "Follow" when pending

### Implementation Details

```typescript
// In profile.ts - extend viewer state
interface ExtendedViewerState {
  following?: string;
  pendingFollowUri?: string;  // NEW
  followedBy?: string;
}

// In FollowButton.tsx - handle pending state
const isPending = profile.viewer?.pendingFollowUri;
const isFollowing = profile.viewer?.following;

<Button 
  variant={isPending ? "outline" : isFollowing ? "secondary" : "primary"}
  label={isPending ? "Requested" : isFollowing ? "Following" : "Follow"}
  disabled={isPending}
/>
```

### Testing Contract

- ✅ Pending state persists across app navigation
- ✅ Pending button is disabled (no accidental un-request)
- ✅ Pending state clears when follow is approved
- ✅ Existing public profiles unaffected

## Phase 2: Lexicon & Schema Extensions

### Goal

Define the data schemas for private profiles and follow requests using ATProto lexicons, establishing contracts between client and PDS.

### Files to Create

**1. Private Profile Lexicon**

- Location: `community-stream-lexicon/lexicons/app.bsky.actor.profile-privacy.json`
- Defines: `isPrivate` boolean flag, privacy settings

**2. Follow Request Lexicon**

- Location: `community-stream-lexicon/lexicons/app.bsky.graph.follow-request.json`
- Defines: Follow request record structure

**3. TypeScript Types**

- File: `bluesky-app/src/types/private-profile.ts`
- Export: TypeScript interfaces generated from lexicons

### Schema Design

```json
// app.bsky.actor.profile-privacy.json
{
  "lexicon": 1,
  "id": "app.bsky.actor.profilePrivacy",
  "defs": {
    "main": {
      "type": "record",
      "key": "self",
      "record": {
        "type": "object",
        "required": ["isPrivate"],
        "properties": {
          "isPrivate": { "type": "boolean" },
          "allowFollowRequests": { "type": "boolean" },
          "createdAt": { "type": "string", "format": "datetime" }
        }
      }
    }
  }
}

// app.bsky.graph.follow-request.json
{
  "lexicon": 1,
  "id": "app.bsky.graph.followRequest",
  "defs": {
    "main": {
      "type": "record",
      "description": "Record declaring a follow request for approval",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["subject", "createdAt"],
        "properties": {
          "subject": { "type": "string", "format": "did" },
          "createdAt": { "type": "string", "format": "datetime" },
          "status": { 
            "type": "string", 
            "enum": ["pending", "approved", "denied"] 
          }
        }
      }
    }
  }
}
```

### Testing Contract

- ✅ Schema validates correctly with Zod
- ✅ TypeScript types generated match lexicon
- ✅ Can create/read records using defined schema

## Phase 3: PDS Modifications (Core Integration)

### Goal

Modify PDS to support private profiles, follow requests, and private gateway integration. This is the most complex phase requiring PDS code changes.

### PDS Changes Needed

**1. Profile Privacy Storage**

- Add: `app.bsky.actor.profilePrivacy` record collection
- Add: Endpoints to read/update privacy settings
- Location: PDS codebase (if available for modification)

**2. Follow Request Endpoints**

- Add: `app.bsky.graph.createFollowRequest` - Create pending follow
- Add: `app.bsky.graph.listFollowRequests` - List pending requests
- Add: `app.bsky.graph.approveFollowRequest` - Approve request
- Add: `app.bsky.graph.denyFollowRequest` - Deny request

**3. Access Control Layer**

- Add: Check if profile is private before returning content
- Add: Validate follower status before serving private content
- Add: Generate Pinata gateway tokens for authorized users

**4. Content Routing**

- Modify: Blob upload to route to Pinata private gateway if profile is private
- Modify: Content retrieval to use private gateway URLs
- Add: Token injection for authenticated content access

### API Contracts

```typescript
// Create follow request (instead of direct follow)
POST /xrpc/app.bsky.graph.createFollowRequest
Body: { subject: "did:plc:..." }
Response: { uri: "at://did/app.bsky.graph.followRequest/tid", status: "pending" }

// List follow requests (for notifications)
GET /xrpc/app.bsky.graph.listFollowRequests
Query: { cursor?, limit? }
Response: { 
  requests: [{ 
    uri, requester: ProfileView, createdAt, status 
  }],
  cursor?
}

// Approve follow request
POST /xrpc/app.bsky.graph.approveFollowRequest
Body: { uri: "at://..." }
Response: { followUri: "at://..." } // Creates actual follow record

// Deny follow request
POST /xrpc/app.bsky.graph.denyFollowRequest
Body: { uri: "at://..." }
Response: { success: true }
```

### Testing Contract

- ✅ Private profile flag persists correctly
- ✅ Follow requests create pending records
- ✅ Approval creates actual follow record
- ✅ Denial removes pending record
- ✅ Content access properly controlled

## Phase 4: Pinata Private Gateway Integration (Per-Profile)

### Goal

Integrate Pinata private gateways with **per-profile** configuration stored in PDS. Each private profile has its own Pinata gateway credentials, enabling individual content access control and future provisioning automation.

### Architecture Change

**Per-Profile Storage Model:**

```
PDS stores for each user:
- Profile privacy settings (isPrivate flag)
- Pinata gateway configuration (API keys, gateway URL)
- Content access policies
- Gateway provisioning status
```

### PDS Schema Extensions

**1. Gateway Configuration Record**

- Location: `community-stream-lexicon/lexicons/app.bsky.actor.gateway-config.json`
- Stored at: `at://did:plc:xxx/app.bsky.actor.gatewayConfig/self`
```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.gatewayConfig",
  "defs": {
    "main": {
      "type": "record",
      "key": "self",
      "record": {
        "type": "object",
        "required": ["provider", "gatewayUrl"],
        "properties": {
          "provider": { 
            "type": "string", 
            "enum": ["pinata", "self-hosted"] 
          },
          "gatewayUrl": { 
            "type": "string",
            "description": "Private gateway URL for this user"
          },
          "apiKeyEncrypted": { 
            "type": "string",
            "description": "Encrypted Pinata API key"
          },
          "provisioningStatus": {
            "type": "string",
            "enum": ["pending", "active", "suspended"]
          },
          "createdAt": { "type": "string", "format": "datetime" },
          "updatedAt": { "type": "string", "format": "datetime" }
        }
      }
    }
  }
}
```


**2. PDS Endpoints for Gateway Management**

New endpoints needed in PDS:

```typescript
// Provision a new Pinata gateway for user
POST /xrpc/app.bsky.actor.provisionGateway
Body: { did: string, provider: "pinata" }
Response: { gatewayUrl: string, status: "active" }

// Get user's gateway configuration
GET /xrpc/app.bsky.actor.getGatewayConfig
Query: { did: string }
Response: { provider, gatewayUrl, status }

// Update gateway configuration
POST /xrpc/app.bsky.actor.updateGatewayConfig
Body: { did: string, config: {...} }
Response: { success: boolean }
```

### Client-Side Implementation

**1. Gateway Service Layer**

- File: `bluesky-app/src/lib/api/pinata-gateway.ts`
- Functions fetch gateway config from PDS per user
```typescript
// pinata-gateway.ts
export async function uploadToPrivateGateway(
  agent: BskyAgent,
  blob: Blob,
  uploaderDid: string
): Promise<{ cid: string; gatewayUrl: string }> {
  // 1. Fetch user's gateway configuration from PDS
  const gatewayConfig = await agent.api.app.bsky.actor.getGatewayConfig({
    did: uploaderDid
  });
  
  if (!gatewayConfig.data.gatewayUrl) {
    throw new Error('No private gateway configured for this profile');
  }
  
  // 2. PDS provides temporary upload token (PDS has the API key)
  const uploadToken = await agent.api.app.bsky.actor.getGatewayUploadToken({
    did: uploaderDid
  });
  
  // 3. Upload using user's gateway
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('pinataMetadata', JSON.stringify({
    name: `content-${Date.now()}`,
    keyvalues: { uploaderDid }
  }));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${uploadToken.token}`,
    },
    body: formData
  });

  const data = await response.json();
  return {
    cid: data.IpfsHash,
    gatewayUrl: `${gatewayConfig.data.gatewayUrl}/ipfs/${data.IpfsHash}`
  };
}

export async function generateAccessToken(
  agent: BskyAgent,
  ownerDid: string,
  requesterDid: string,
  contentCid: string
): Promise<string> {
  // Request access token from PDS (which manages gateway credentials)
  const tokenResponse = await agent.api.app.bsky.actor.getContentAccessToken({
    ownerDid,
    requesterDid,
    contentCid
  });
  
  return tokenResponse.data.token;
}
```


**2. Gateway Provisioning UI**

- File: `bluesky-app/src/screens/Settings/GatewaySetup.tsx` (NEW)
- Shown when user enables private profile without gateway
```typescript
// GatewaySetup.tsx
export function GatewaySetup() {
  const {currentAccount} = useSession();
  const provisionGateway = useProvisionGatewayMutation();
  
  return (
    <View>
      <Text>Private profiles require a private IPFS gateway.</Text>
      
      <Button
        label="Provision Pinata Gateway"
        onPress={() => {
          provisionGateway.mutate({
            did: currentAccount.did,
            provider: 'pinata'
          });
        }}
      />
      
      <Text>Or provide your own gateway credentials</Text>
      <TextInput placeholder="Gateway URL" />
      <TextInput placeholder="API Key" secureTextEntry />
      <Button label="Save Custom Gateway" />
    </View>
  );
}
```


### PDS-Side Gateway Management

**Key responsibilities moved to PDS:**

1. **Credential Storage**: Store encrypted Pinata API keys per user
2. **Token Generation**: Generate time-limited upload/access tokens
3. **Access Control**: Validate follower status before issuing content tokens
4. **Provisioning**: Automate Pinata gateway creation (future)
5. **Lifecycle**: Handle gateway suspension, deletion

**Security Benefits:**

- Client never sees raw Pinata API keys
- PDS validates access before issuing tokens
- Tokens are time-limited and scoped to specific content
- Gateway credentials encrypted at rest in PDS

### Blob Upload Modification

**File:** `bluesky-app/src/lib/api/upload-blob.ts`

```typescript
export async function uploadBlob(
  agent: BskyAgent,
  input: string | Blob,
  encoding?: string,
  isPrivate?: boolean  // NEW parameter
): Promise<ComAtprotoRepoUploadBlob.Response> {
  // If private profile, route to Pinata
  if (isPrivate) {
    const { cid, gatewayUrl } = await uploadToPrivateGateway(input, {
      uploaderDid: agent.session?.did,
      isPrivate: true
    });
    
    // Return in PDS-compatible format
    return {
      data: {
        blob: {
          $type: 'blob',
          ref: { $link: cid },
          mimeType: encoding || 'application/octet-stream',
          size: input.size
        }
      }
    };
  }
  
  // Existing public upload logic
  return agent.uploadBlob(input, {encoding});
}
```

### Testing Contract

- ✅ Private content uploads to Pinata
- ✅ Access tokens generated correctly
- ✅ Authorized users can retrieve content
- ✅ Unauthorized users receive 403
- ✅ Public content still uses standard upload

## Phase 5: Follow Request Notifications

### Goal

Display follow requests in the notifications feed with approve/deny actions.

### Files to Modify

**1. Notification Types**

- File: `bluesky-app/src/lib/hooks/useNotificationHandler.ts`
- Add: `'follow-request'` to `NotificationReason` enum

**2. Notification Grouping**

- File: `bluesky-app/src/state/queries/notifications/util.ts`
- Add: `'follow-request'` to notification grouping logic
- Add: Fetching of follow request subjects

**3. Notification UI**

- File: `bluesky-app/src/view/com/notifications/NotificationFeedItem.tsx`
- Add: Follow request notification item component
- Add: Approve/Deny button actions

### UI Implementation

```typescript
// In NotificationFeedItem.tsx
if (item.type === 'follow-request') {
  return (
    <View style={styles.followRequestItem}>
      <ProfileAvatar profile={item.notification.author} />
      <Text>
        <Text bold>{item.notification.author.displayName}</Text>
        {' '}requested to follow you
      </Text>
      <View style={styles.actions}>
        <Button 
          label="Approve" 
          onPress={() => approveFollowRequest(item.notification.uri)}
          variant="primary"
        />
        <Button 
          label="Deny" 
          onPress={() => denyFollowRequest(item.notification.uri)}
          variant="outline"
        />
      </View>
    </View>
  );
}
```

### State Management

**File:** `bluesky-app/src/state/queries/follow-requests.ts` (NEW)

```typescript
export function useApproveFollowRequestMutation() {
  const agent = useAgent();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestUri: string) => {
      return await agent.api.app.bsky.graph.approveFollowRequest({
        uri: requestUri
      });
    },
    onSuccess: () => {
      // Invalidate notifications
      queryClient.invalidateQueries(['notifications']);
      // Invalidate followers list
      queryClient.invalidateQueries(['profile', 'followers']);
    }
  });
}

export function useDenyFollowRequestMutation() {
  const agent = useAgent();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestUri: string) => {
      return await agent.api.app.bsky.graph.denyFollowRequest({
        uri: requestUri
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });
}
```

### Testing Contract

- ✅ Follow requests appear in notifications
- ✅ Approve creates follow relationship
- ✅ Deny removes request
- ✅ Notifications update correctly
- ✅ Profile follower count updates

## Phase 6: Profile Privacy Settings UI

### Goal

Add UI for users to toggle their profile between public and private.

### Files to Create/Modify

**1. Privacy Settings Screen**

- File: `bluesky-app/src/screens/Settings/PrivacySettings.tsx` (NEW or extend existing)
- Add: Toggle for "Private Profile"
- Add: Explanation text
- Add: Warning about switching from public to private

**2. Settings State**

- File: `bluesky-app/src/state/queries/profile-privacy.ts` (NEW)
- Add: Query for privacy settings
- Add: Mutation to update privacy settings

**3. Profile Indicator**

- File: `bluesky-app/src/screens/Profile/Header/ProfileHeaderStandard.tsx`
- Add: Lock icon or "Private" badge for private profiles

### Implementation

```typescript
// PrivacySettings.tsx
export function PrivacySettings() {
  const {currentAccount} = useSession();
  const {data: privacySettings} = usePrivacySettingsQuery(currentAccount.did);
  const updatePrivacy = useUpdatePrivacyMutation();
  
  return (
    <View>
      <ToggleButton
        label="Private Profile"
        value={privacySettings?.isPrivate ?? false}
        onChange={(value) => {
          updatePrivacy.mutate({
            did: currentAccount.did,
            isPrivate: value
          });
        }}
      />
      <Text>
        When your profile is private, only approved followers can see your posts.
      </Text>
    </View>
  );
}
```

### Testing Contract

- ✅ Toggle updates privacy setting
- ✅ Private indicator shows on profile
- ✅ Follow button changes to "Request"
- ✅ Content becomes inaccessible to non-followers

## Phase 7: Content Access Control

### Goal

Enforce content access control based on follow status and profile privacy.

### Files to Modify

**1. Post Queries**

- File: `bluesky-app/src/state/queries/post.ts`
- Add: Check if post author has private profile
- Add: Filter posts from private profiles if not following

**2. Feed Queries**

- File: `bluesky-app/src/state/queries/feed.ts`
- Add: Access control validation
- Add: Show "This profile is private" placeholder

**3. Media Retrieval**

- File: `bluesky-app/src/lib/api/upload-blob.ts` (retrieval side)
- Add: Inject Pinata access token when fetching private content
- Add: Handle 403 errors gracefully

### Implementation Logic

```typescript
// In post queries
async function fetchPost(uri: string) {
  const post = await agent.getPost({ uri });
  
  // Check if author has private profile
  if (post.author.isPrivate && !post.author.viewer?.following) {
    throw new PrivateContentError('This content is private');
  }
  
  // If private, inject gateway token for media
  if (post.author.isPrivate) {
    const token = await generateAccessToken(
      currentUser.did, 
      post.embed?.images?.[0]?.cid
    );
    post.embed.images = post.embed.images.map(img => ({
      ...img,
      fullsize: `${img.fullsize}?token=${token}`
    }));
  }
  
  return post;
}
```

### Testing Contract

- ✅ Private posts hidden from non-followers
- ✅ Private media requires token
- ✅ Token expires after timeout
- ✅ Graceful error messages
- ✅ Public content unaffected

## Implementation Order

1. **Phase 1** (1-2 days): Pending follow state - UI proof of concept
2. **Phase 2** (1 day): Lexicon definitions - establish contracts
3. **Phase 3** (3-5 days): PDS modifications - core functionality (requires PDS access)
4. **Phase 4** (2-3 days): Pinata integration - content storage
5. **Phase 5** (2 days): Follow request notifications - approval flow
6. **Phase 6** (1 day): Privacy settings UI - user control
7. **Phase 7** (2-3 days): Content access control - enforce privacy

## Testing Strategy

### Unit Tests

- Profile state mutations
- Follow request mutations
- Privacy setting queries
- Token generation

### Integration Tests

- Follow request flow (create → approve → follow)
- Privacy toggle flow (public → private → content hidden)
- Content access (authorized → success, unauthorized → 403)

### E2E Tests

- User A requests to follow private User B
- User B approves in notifications
- User A can now see User B's content
- User C (not approved) cannot see User B's content

## Success Criteria

- ✅ Users can toggle profile to private
- ✅ Follow requests create pending state
- ✅ Pending requests appear in notifications
- ✅ Approve/deny actions work correctly
- ✅ Private content only accessible to followers
- ✅ Pinata private gateway stores content
- ✅ Access tokens authenticate content retrieval
- ✅ No breaking changes to public profiles
- ✅ Graceful error handling throughout

## Future Enhancements (Not in Scope)

- Profile metadata privacy (avatar, bio)
- Follower removal (revoke access)
- Block list integration
- Bulk approve/deny
- Follow request expiration
- Digital Ocean deployment automation