# AT Protocol Concepts

Understanding the AT Protocol (Authenticated Transfer Protocol), the foundation of Bluesky.

## What is the AT Protocol?

The AT Protocol is a **federated social networking protocol** that provides:

- **Account portability** - Take your account to any server
- **Algorithm choice** - Choose your own content algorithms
- **Interoperability** - Different apps can work together
- **Decentralization** - No single point of control

## Core Concepts

### 1. Decentralized Identifiers (DIDs)

Your identity in the AT Protocol is a **DID** (Decentralized Identifier).

**Format:** `did:plc:xxx` or `did:web:example.com`

**Example:** `did:plc:z72i7hdynmk6r22z27h6tvur`

**Properties:**

- **Permanent** - Never changes, even if you move servers
- **Cryptographically verifiable** - Proves ownership
- **Portable** - Works across different PDS instances

**DID Document:**

```json
{
  "id": "did:plc:z72i7hdynmk6r22z27h6tvur",
  "alsoKnownAs": ["at://alice.bsky.social"],
  "verificationMethod": [...],
  "service": [
    {
      "id": "#atproto_pds",
      "type": "AtprotoPersonalDataServer",
      "serviceEndpoint": "https://pds.example.com"
    }
  ]
}
```

### 2. Handles

Human-readable names that map to DIDs.

**Format:** `username.domain`

**Examples:**

- `alice.bsky.social` (production)
- `alice.test` (local development)

**Properties:**

- **Changeable** - You can update your handle
- **Verifiable** - Proven via DNS or HTTPS
- **Multiple per DID** - One identity, many handles (though one active at a time)

**Handle Resolution:**

```
alice.bsky.social → did:plc:xxx
```

### 3. Repositories (Repos)

Your personal data store containing all your records.

**Structure:**

```
at://alice.bsky.social/
├── app.bsky.feed.post/
│   ├── 3jui7kd54zh2y  # A post
│   └── 3k2p9s4fgh3z   # Another post
├── app.bsky.graph.follow/
│   └── 3jx8h4ksd89f   # A follow
└── app.bsky.actor.profile/
    └── self            # Your profile
```

**Properties:**

- **Merkle tree** - Cryptographically verifiable history
- **Signed commits** - Tampering is detectable
- **Portable** - Can move to any PDS

### 4. Lexicons

Type schemas that define data structures (like API contracts).

**Example - Post Lexicon:**

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.post",
  "type": "record",
  "description": "A post record",
  "record": {
    "type": "object",
    "required": ["text", "createdAt"],
    "properties": {
      "text": { "type": "string", "maxLength": 300 },
      "createdAt": { "type": "string", "format": "datetime" }
    }
  }
}
```

**Benefits:**

- Type-safe APIs
- Automatic validation
- Clear documentation
- Extensible schemas

### 5. AT URIs

Universal identifiers for records in the AT Protocol.

**Format:** `at://{did-or-handle}/{collection}/{rkey}`

**Examples:**

- `at://alice.bsky.social/app.bsky.feed.post/3jui7kd54zh2y`
- `at://did:plc:xxx/app.bsky.feed.post/3jui7kd54zh2y`

**Components:**

- **Authority**: DID or handle
- **Collection**: Record type (lexicon)
- **Record Key**: Unique identifier within collection

### 6. XRPC (Cross-system RPC)

HTTP-based RPC protocol for calling methods.

**Format:** `https://pds.example.com/xrpc/{method}`

**Examples:**

```
POST /xrpc/com.atproto.repo.createRecord
GET /xrpc/app.bsky.feed.getTimeline
GET /xrpc/com.atproto.server.describeServer
```

**Method Types:**

- **Query** - Read data (GET)
- **Procedure** - Modify data (POST)
- **Subscription** - Real-time updates (WebSocket)

## Architecture Layers

### Layer 1: Identity (PLC Directory)

**Purpose:** Maps DIDs to DID documents

**Responsibilities:**

- DID registration
- DID document storage
- Handle verification
- Identity portability

**Public Service:** https://plc.directory

### Layer 2: Data Hosting (PDS)

**Purpose:** Hosts user repositories

**Responsibilities:**

- Store user data
- Authenticate users
- Manage repositories
- Handle user operations
- Serve user data to crawlers

**Example:** Your local PDS at `http://localhost:2583`

### Layer 3: Data Aggregation (AppView)

**Purpose:** Aggregates and indexes data from many PDSs

**Responsibilities:**

- Crawl PDSs
- Index records
- Generate feeds
- Power search
- Compute social graph
- Aggregate notifications

**Public Service:** https://api.bsky.app

### Layer 4: Applications (Clients)

**Purpose:** User interfaces

**Examples:**

- Bluesky app (official client)
- Third-party clients
- Bots and automation tools

## Data Flow

### Creating a Post

```
1. User types post in Bluesky app
   ↓
2. App calls PDS XRPC method:
   POST /xrpc/com.atproto.repo.createRecord
   ↓
3. PDS validates and stores record in user's repo
   ↓
4. PDS returns AT URI of new post
   ↓
5. Post appears in user's local repo
   ↓
6. AppView crawler discovers new post
   ↓
7. AppView indexes post for feeds and search
   ↓
8. Post appears in followers' feeds
```

### Following Another User

```
1. User clicks "Follow" in app
   ↓
2. App creates follow record:
   POST /xrpc/com.atproto.repo.createRecord
   Collection: app.bsky.graph.follow
   Subject: target user's DID
   ↓
3. PDS stores follow record
   ↓
4. AppView crawler indexes follow
   ↓
5. AppView updates social graph
   ↓
6. Target user's posts appear in follower's feed
```

### Viewing a Profile

```
1. App requests profile from AppView:
   GET /xrpc/app.bsky.actor.getProfile?actor=alice.test
   ↓
2. AppView resolves handle to DID
   ↓
3. AppView queries user's PDS for profile record
   ↓
4. AppView adds computed stats (followers, posts)
   ↓
5. AppView returns enriched profile
   ↓
6. App displays profile with stats
```

## Federation

### How Federation Works

1. **Multiple PDSs** - Anyone can run a PDS
2. **Shared AppViews** - AppViews aggregate from all PDSs
3. **Common Protocol** - All use AT Protocol standards
4. **Portable Identity** - Move between PDSs anytime

### Moving to a Different PDS

```
1. User backs up their repo
   ↓
2. User creates account on new PDS
   ↓
3. User restores repo to new PDS
   ↓
4. User updates DID document to point to new PDS
   ↓
5. AppViews automatically discover new location
   ↓
6. Old account can be deleted
```

## Security Model

### Cryptographic Signing

- All repo commits are signed with user's private key
- Anyone can verify data hasn't been tampered with
- PDS can't forge records on user's behalf

### Authentication

- JWT tokens for session management
- OAuth for third-party apps
- Private key never leaves user's control

### Authorization

- Users control their own data
- PDSs enforce access rules
- AppViews respect privacy settings

## Content Types

### Records

User-created data stored in repositories:

- **Posts** - `app.bsky.feed.post`
- **Likes** - `app.bsky.feed.like`
- **Reposts** - `app.bsky.feed.repost`
- **Follows** - `app.bsky.graph.follow`
- **Profiles** - `app.bsky.actor.profile`
- **Blocks** - `app.bsky.graph.block`

### Blobs

Binary data like images and videos:

- Stored separately from records
- Referenced by CID (Content Identifier)
- Served via blob endpoints
- Can use IPFS for distribution

## Extensibility

### Custom Lexicons

Anyone can define new record types:

```json
{
  "lexicon": 1,
  "id": "com.example.customType",
  "type": "record",
  "record": {
    "type": "object",
    "properties": {
      "customField": { "type": "string" }
    }
  }
}
```

### Custom AppViews

Build specialized aggregators:

- Topic-specific feeds
- Alternative algorithms
- Domain-specific features
- Privacy-preserving views

## Comparison with Other Protocols

| Feature              | AT Protocol     | ActivityPub      | Nostr       |
| -------------------- | --------------- | ---------------- | ----------- |
| **Identity**         | DIDs (portable) | Domain-based     | Public keys |
| **Data ownership**   | User repo       | Server-held      | Events only |
| **Portability**      | Full            | Limited          | Full        |
| **Discovery**        | AppView         | Server-to-server | Relays      |
| **Algorithm choice** | Yes             | No               | Yes         |

## Key Benefits

### For Users

- **Control your data** - Your repo, your rules
- **Choose your experience** - Pick feeds and algorithms
- **Account portability** - Never locked to one server
- **Interoperability** - One account works everywhere

### For Developers

- **Well-defined schemas** - Lexicons provide clear contracts
- **Flexible architecture** - Build PDSs, AppViews, or clients
- **Open protocol** - No gatekeepers
- **Composable** - Mix and match components

## Resources

- **AT Protocol Website**: https://atproto.com
- **Specification**: https://atproto.com/specs/atp
- **Lexicon Browser**: https://atproto.com/lexicons
- **GitHub**: https://github.com/bluesky-social/atproto

## Next Steps

- [System Overview](overview.md) - How this project uses AT Protocol
- [Component Interaction](components.md) - How components work together
- [PDS Documentation](../pds/README.md) - Set up your own PDS

---

**Understanding AT Protocol is key to building on Bluesky!**
