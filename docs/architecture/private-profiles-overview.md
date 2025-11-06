# Private Profiles Implementation Overview

> **For AT Protocol Discussion:** Brief technical overview of PDS-level private profiles with Pinata private gateways

## Summary

We're implementing Instagram-style private profiles for self-hosted PDS instances using:

1. **Extended Privacy Settings and Follow Request/Response Lexicons** - Privacy settings and follow request records in user repositories
2. **PDS Access Control** - Middleware enforcing privacy at the repository level
3. **Pinata Private Gateways** - IPFS gateway access tokens for private media

This approach provides a solution for self-hosters while the official service for private profiles is being built.

## Architecture Components

```mermaid
graph TB
    subgraph "Client Layer"
        App[Bluesky App]
    end

    subgraph "PDS Layer"
        PDS[Personal Data Server]
        Auth[Auth Middleware]
        Privacy[Privacy Checker]
        Lexicons[Extended and New Lexicons]
    end

    subgraph "Storage Layer"
        Repo[User Repository]
        PrivacySettings[Privacy Settings Record]
        FollowRequests[Follow Request Records]
    end

    subgraph "Media Layer"
        Pinata[Pinata Service]
        PrivateGW[Private Gateway]
        PublicGW[Public Gateway]
    end

    App -->|API Requests| PDS
    PDS --> Auth
    Auth --> Privacy
    Privacy --> Lexicons
    Lexicons --> Repo
    Repo --> PrivacySettings
    Repo --> FollowRequests

    PDS -->|Public Content| PublicGW
    PDS -->|Private Content| Pinata
    Pinata -->|Provision Gateway| PrivateGW
    PrivateGW -->|Time-Limited Token| App

    style Privacy fill:#f9f,stroke:#333,stroke-width:2px
    style Pinata fill:#9ff,stroke:#333,stroke-width:2px
```

## Key Data Flows

### 1. Follow Request Flow

```mermaid
sequenceDiagram
    participant User as User A
    participant PDS_A as PDS A
    participant PDS_B as PDS B (Private)
    participant Owner as User B (Owner)

    User->>PDS_A: Follow User B
    PDS_A->>PDS_B: Check privacy settings
    PDS_B-->>PDS_A: isPrivate: true
    PDS_A->>PDS_B: Create follow request
    PDS_B->>PDS_B: Store in pendingRequests[]
    PDS_B-->>PDS_A: Request created
    PDS_A-->>User: "Request Pending"

    Note over PDS_B,Owner: Notification sent

    Owner->>PDS_B: Approve request
    PDS_B->>PDS_B: Add to allowedFollowers[]
    PDS_B->>PDS_B: Create follow relationship
    PDS_B-->>Owner: Approved
    PDS_B->>PDS_A: Notify approval
    PDS_A-->>User: "Follow accepted"
```

### 2. Private Content Access Flow

```mermaid
sequenceDiagram
    participant User as Requesting User
    participant PDS as PDS
    participant Privacy as Privacy Checker
    participant Repo as Repository

    User->>PDS: GET /profile/{did}
    PDS->>Privacy: Check access(requester, target)
    Privacy->>Repo: Get privacy settings
    Repo-->>Privacy: {isPrivate: true, allowedFollowers: [...]}

    alt User is authorized
        Privacy-->>PDS: Access granted
        PDS->>Repo: Fetch posts
        Repo-->>PDS: Return posts
        PDS-->>User: 200 OK + posts
    else User not authorized
        Privacy-->>PDS: Access denied
        PDS-->>User: 403 Forbidden
    end
```

### 3. Private Media Access Flow

```mermaid
sequenceDiagram
    participant User as Authorized User
    participant App as Bluesky App
    participant PDS as PDS
    participant Pinata as Pinata Service
    participant Gateway as Private Gateway

    App->>PDS: GET /blob/{cid}
    PDS->>PDS: Check user authorization

    alt User authorized
        PDS->>Pinata: Generate access token
        Pinata-->>PDS: {token, gatewayUrl, expiry}
        PDS-->>App: 302 Redirect + token
        App->>Gateway: GET /ipfs/{cid}?token=xxx
        Gateway->>Gateway: Validate token
        Gateway-->>App: 200 OK + image data
    else User not authorized
        PDS-->>App: 403 Forbidden
    end
```

## Extended Privacy Settings and New Follow Request Record Lexicons

### Privacy Settings Record

```typescript
// app.bsky.actor.privacySettings
{
  "lexicon": 1,
  "id": "app.bsky.actor.privacySettings",
  "defs": {
    "main": {
      "type": "record",
      "record": {
        "isPrivate": "boolean",
        "allowedFollowers": ["string"], // DIDs
        "pendingRequests": ["string"]   // DIDs
      }
    }
  }
}
```

### Follow Request Record

```typescript
// app.bsky.graph.followRequest
{
  "lexicon": 1,
  "id": "app.bsky.graph.followRequest",
  "defs": {
    "main": {
      "type": "record",
      "record": {
        "subject": "string",      // DID to follow
        "status": "string",       // pending|approved|denied
        "createdAt": "datetime"
      }
    }
  }
}
```

## API Endpoints

| Endpoint                                | Purpose                           |
| --------------------------------------- | --------------------------------- |
| `app.bsky.actor.setPrivacySettings`     | Toggle profile privacy            |
| `app.bsky.actor.getPrivacySettings`     | Read privacy state                |
| `app.bsky.graph.createFollowRequest`    | Request to follow private profile |
| `app.bsky.graph.listFollowRequests`     | List pending requests (for owner) |
| `app.bsky.graph.respondToFollowRequest` | Approve/deny requests             |

## Implementation Scope

**Target:** Self-hosted PDS instances (Phase 1-4)

**Not included:**

- Federation with main Bluesky network (requires protocol changes)
- E2EE messaging (awaiting Auth Scopes)
- Modifications to public AppView

## Questions for Protocol Team

As a new contributor to the AT Protocol ecosystem, I'd love guidance on making this a successful community effort:

1. **Architecture Review:** Are there any architectural concerns or gotchas I should be aware of with this PDS-level approach? What should I look out for to ensure compatibility with the protocol's evolution?

2. **Migration Path:** When official private data support arrives, what would make my implementation easier to migrate or sunset gracefully? Should I design with any specific compatibility considerations in mind?

3. **Community Coordination:** How can I best coordinate with the official roadmap?

**Goal:** Contribute to the technology and align with the protocol team's needs while providing value for the self-hosted community.

## Full Documentation

- **Roadmap:** [Implementation Phases](https://github.com/CommunityStream-io/bsky-private-profile/blob/main/docs/reference/phases.md)
- **Architecture:** [Full Architecture Docs](https://github.com/CommunityStream-io/bsky-private-profile/tree/main/docs/architecture)
- **Discussion:** [GitHub Issue #38](https://github.com/CommunityStream-io/bsky-private-profile/issues/38)

---

**Note:** This is an interim solution for self-hosters. I'm eager to align with the official protocol design and contribute where helpful.
