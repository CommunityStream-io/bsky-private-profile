# Component Interaction

How the different components of this project work together to create the Bluesky Private Profile integration.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  Bluesky Private Profile System                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌───────────────┐                     │
│  │  Bluesky App │────────▶│   AppView     │                     │
│  │  (Frontend)  │◀────────│  (Optional)   │                     │
│  └──────────────┘         └───────────────┘                     │
│         │                          │                              │
│         │                          │                              │
│         ▼                          ▼                              │
│  ┌─────────────────────────────────────────┐                    │
│  │              PDS (Backend)               │                    │
│  │  ┌──────────────────────────────────┐   │                    │
│  │  │ Standard Features:               │   │                    │
│  │  │ • Account Management             │   │                    │
│  │  │ • Posts, Likes, Follows          │   │                    │
│  │  │ • Authentication                 │   │                    │
│  │  └──────────────────────────────────┘   │                    │
│  │  ┌──────────────────────────────────┐   │                    │
│  │  │ Private Profile Extensions:      │   │                    │
│  │  │ • Privacy Settings Storage       │   │                    │
│  │  │ • Follow Request Handling        │   │                    │
│  │  │ • Access Control Logic           │   │                    │
│  │  └──────────────────────────────────┘   │                    │
│  └─────────────────────────────────────────┘                    │
│                     │                                             │
│                     ▼                                             │
│  ┌─────────────────────────────────────────┐                    │
│  │       Pinata Integration Service        │                    │
│  │  • Private Gateway Provisioning         │                    │
│  │  • Token Generation                     │                    │
│  │  • Media Access Control                 │                    │
│  └─────────────────────────────────────────┘                    │
│                     │                                             │
│                     ▼                                             │
│  ┌─────────────────────────────────────────┐                    │
│  │            Pinata IPFS Cloud            │                    │
│  │  • Private Gateways                     │                    │
│  │  • Media Storage                        │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Roles

### Bluesky App (Frontend)

**Location:** `bluesky-app/`

**Technology:** React Native + TypeScript

**Responsibilities:**

- Display user interface
- Handle user interactions
- Call PDS APIs
- Display posts, profiles, feeds
- Manage local state

**Key Features:**

- Cross-platform (iOS, Android, Web)
- Real-time updates
- Internationalization
- Dark/light themes

**Communication:**

- **To PDS**: XRPC over HTTP/HTTPS
- **To AppView**: XRPC over HTTP/HTTPS (proxied through PDS)

### Personal Data Server (PDS)

**Location:** `atproto/packages/pds/` or `official-pds/` (Docker)

**Technology:** Node.js + TypeScript + SQLite/PostgreSQL

**Responsibilities:**

- Store user accounts and data
- Authenticate users
- Manage repositories
- Enforce access control
- Host user records
- Route blob uploads

**Standard Features:**

- Account creation and management
- Post creation and storage
- Follow relationships
- Like and repost handling
- Profile management

**Private Profile Extensions:**

- Privacy settings storage
- Follow request queue
- Access control logic
- Content visibility rules
- Private media routing

**Communication:**

- **From App**: Receives XRPC calls
- **To AppView**: Sends data via subscriptions
- **To Pinata Service**: HTTP API for gateway management
- **To PLC**: DID resolution and updates

### AppView Service (Optional)

**Location:** `atproto/packages/bsky/`

**Technology:** Node.js + TypeScript + PostgreSQL

**Responsibilities:**

- Aggregate data from PDSs
- Generate feeds (timeline, discover)
- Provide social graph queries
- Enable search functionality
- Compute notifications
- Generate profile views with stats

**When Needed:**

- Full feed generation
- Search features
- Social graph queries
- Complete Bluesky experience

**When NOT Needed:**

- Direct PDS development
- Testing PDS features
- API-level testing
- Building without social features

**Communication:**

- **From PDS**: Subscribes to PDS event streams
- **To PDS**: Queries for user data
- **From App**: Receives XRPC queries

### Pinata Integration Service

**Location:** `pinata-integration/`

**Technology:** Node.js + TypeScript

**Responsibilities:**

- Provision private IPFS gateways
- Generate time-limited access tokens
- Manage gateway configuration
- Route media uploads
- Enforce media access control

**How It Works:**

1. User makes profile private
2. PDS calls Pinata service to create private gateway
3. Service provisions gateway with Pinata API
4. Gateway credentials stored in PDS
5. When authorized user requests media:
   - PDS requests token from Pinata service
   - Service generates time-limited token
   - App uses token to access media through gateway

**Communication:**

- **From PDS**: HTTP API calls for gateway/token operations
- **To Pinata Cloud**: Pinata API for gateway management

### Custom Lexicons

**Location:** `community-stream-lexicon/`

**Technology:** JSON schemas + TypeScript codegen

**Responsibilities:**

- Define new record types
- Extend AT Protocol schemas
- Generate TypeScript types
- Validate record structures

**Custom Record Types:**

- `com.community.actor.privacySettings` - Profile privacy configuration
- `com.community.graph.followRequest` - Follow request records
- `com.community.graph.followRequestResponse` - Accept/deny responses

**Usage:**

- Defines schemas in `lexicons/`
- Generates TypeScript types for PDS and app
- Validates records at creation time

## Data Flows

### Creating a Post (Standard)

```
1. User types post in Bluesky app
   ↓
2. App → PDS: POST /xrpc/com.atproto.repo.createRecord
   {
     repo: user-did,
     collection: "app.bsky.feed.post",
     record: {text: "Hello world!", createdAt: "..."}
   }
   ↓
3. PDS validates and stores record
   ↓
4. PDS returns AT URI: at://user.test/app.bsky.feed.post/123
   ↓
5. App displays post locally
   ↓
6. (Optional) AppView crawler indexes post
   ↓
7. (Optional) Post appears in followers' feeds via AppView
```

### Making Profile Private (New Feature)

```
1. User toggles "Private Profile" in app
   ↓
2. App → PDS: POST /xrpc/com.atproto.repo.createRecord
   {
     repo: user-did,
     collection: "com.community.actor.privacySettings",
     record: {isPrivate: true, ...}
   }
   ↓
3. PDS stores privacy settings record
   ↓
4. PDS → Pinata Service: POST /api/gateway/provision
   {userId: user-did}
   ↓
5. Pinata Service → Pinata Cloud: Creates private gateway
   ↓
6. Pinata Service returns gateway credentials
   ↓
7. PDS stores gateway configuration
   ↓
8. App displays "Profile is now private" confirmation
```

### Sending Follow Request (New Feature)

```
1. UserA tries to follow Private UserB
   ↓
2. App checks UserB's privacy settings
   ↓
3. App determines profile is private
   ↓
4. App → PDS: POST /xrpc/com.atproto.repo.createRecord
   {
     repo: userA-did,
     collection: "com.community.graph.followRequest",
     record: {subject: userB-did, ...}
   }
   ↓
5. PDS stores follow request
   ↓
6. App shows "Follow request sent" UI
   ↓
7. UserB opens app
   ↓
8. App → PDS: GET /xrpc/com.community.graph.listFollowRequests
   ↓
9. PDS returns pending requests including UserA
   ↓
10. UserB sees notification "UserA wants to follow you"
```

### Accessing Private Media (New Feature)

```
1. Authorized follower views private post with image
   ↓
2. App → PDS: Requests post record
   ↓
3. PDS checks: is requester authorized?
   ↓
4. PDS → Pinata Service: POST /api/token/generate
   {userId: profile-owner-did, grantTo: requester-did}
   ↓
5. Pinata Service generates time-limited token
   ↓
6. PDS returns post with tokenized media URL
   ↓
7. App → Pinata Gateway: GET /ipfs/{cid}?token={token}
   ↓
8. Gateway validates token and serves image
   ↓
9. App displays image
```

## Communication Protocols

### XRPC (AT Protocol RPC)

Used for all app ↔ PDS and app ↔ AppView communication.

**Format:**

```
POST https://pds.example.com/xrpc/{nsid}
Authorization: Bearer {jwt}
Content-Type: application/json

{...parameters...}
```

**Response:**

```json
{
  "data": {...},
  "cursor": "...",
  "headers": {...}
}
```

### REST API

Used for PDS ↔ Pinata Service communication.

**Example:**

```
POST http://localhost:3000/api/gateway/provision
Content-Type: application/json

{
  "userId": "did:plc:xxx"
}
```

### WebSocket Subscriptions

Used for AppView ↔ PDS real-time data sync.

**Example:**

```
wss://pds.example.com/xrpc/com.atproto.sync.subscribeRepos

Stream of commit events →
```

## Repository Structure

### Multi-root Workspace

```
bsky-private-profile/          # Orchestrator repo
├── bluesky-app/               # Submodule: Frontend
├── atproto/                   # Submodule: Backend
├── community-stream-lexicon/  # Submodule: Custom schemas
├── pinata-integration/        # Submodule: Gateway service
├── official-pds/              # Submodule: Docker PDS
└── bruno-api/                 # API testing collection
```

### Why Submodules?

- **Independent development** - Each component can be developed separately
- **Version control** - Track specific commits of each component
- **Upstream compatibility** - Easy to pull updates from upstream repos
- **Clean separation** - Clear boundaries between components

## Development Workflow

### Frontend Development

```bash
# Terminal 1: Start PDS
cd official-pds
docker compose -f compose.local.yaml up -d

# Terminal 2: Start Bluesky app
cd bluesky-app
yarn web
```

### Backend Development

```bash
# Terminal 1: Build and start PDS
cd atproto
pnpm build
pnpm --filter @atproto/pds start

# Terminal 2: Start Bluesky app
cd bluesky-app
yarn web
```

### Full Stack Development

```bash
# Terminal 1: Start dev environment (PDS + AppView + services)
cd atproto
make run-dev-env-logged

# Terminal 2: Start Pinata service
cd pinata-integration
npm run dev

# Terminal 3: Start Bluesky app
cd bluesky-app
yarn web
```

### Lexicon Development

```bash
# Edit lexicons
cd community-stream-lexicon
# Edit files in lexicons/

# Generate TypeScript types
npm run build

# Use in PDS
cd ../atproto/packages/pds
# Import generated types
```

## Testing Workflows

### Unit Testing

**PDS:**

```bash
cd atproto
pnpm test
```

**App:**

```bash
cd bluesky-app
yarn test
```

### Integration Testing

**Via Bruno API:**

```bash
# Open Bruno
cd bruno-api
# Execute requests in collection
```

**Via curl:**

```bash
# Create account
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.local","handle":"test.test","password":"pass"}'
```

### End-to-End Testing

```bash
cd bluesky-app
yarn e2e  # Requires Maestro
```

## Deployment Architecture

### Development

- **PDS**: Docker container on localhost
- **App**: Metro bundler on localhost
- **Pinata Service**: Node process on localhost
- **AppView**: Optional, via dev-env

### Production (Future)

- **PDS**: VPS with Docker or Kubernetes
- **App**: Mobile app stores + web hosting
- **Pinata Service**: Cloud hosting (AWS, Azure, GCP)
- **AppView**: Optional self-hosted or use public

## Extension Points

### Adding New Record Types

1. Define lexicon in `community-stream-lexicon/lexicons/`
2. Build to generate TypeScript types
3. Add PDS endpoints in `atproto/packages/pds/src/api/`
4. Add app UI in `bluesky-app/src/`

### Adding New PDS Features

1. Add business logic in `atproto/packages/pds/src/services/`
2. Create API endpoints in `atproto/packages/pds/src/api/`
3. Update app to call new endpoints
4. Test via Bruno or app

### Adding New App Features

1. Create UI components in `bluesky-app/src/components/`
2. Add screens in `bluesky-app/src/screens/`
3. Connect to PDS APIs
4. Test in app

## Security Considerations

### Authentication Flow

```
1. User logs in
   ↓
2. PDS generates JWT access token (short-lived)
   ↓
3. PDS generates JWT refresh token (long-lived)
   ↓
4. App stores tokens securely
   ↓
5. App includes access token in all requests
   ↓
6. When access token expires, use refresh token to get new one
```

### Access Control

- **PDS enforces** all access control rules
- **App requests** but doesn't enforce (untrusted client)
- **Pinata Service** validates tokens for media access
- **Never trust client** - always verify on server

## Next Steps

- [System Overview](overview.md) - High-level architecture
- [AT Protocol Concepts](at-protocol.md) - Protocol fundamentals
- [Development Guide](../bluesky-app/development.md) - Development workflow

---

**Understanding component interaction is key to building features!**
