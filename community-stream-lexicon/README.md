# CommunityStream Custom Lexicons

Custom AT Protocol lexicons for private profile features in the CommunityStream Bluesky integration.

## Overview

This package contains three custom lexicons:

1. **com.community.actor.privacySettings** - Privacy settings for user profiles
2. **com.community.graph.followRequest** - Follow request records for private profiles
3. **com.community.graph.respondToFollowRequest** - XRPC procedure to respond to follow requests

## Structure

```
lexicons/
└── com/
    └── community/
        ├── actor/
        │   └── privacySettings.json
        └── graph/
            ├── followRequest.json
            └── respondToFollowRequest.json
```

## Building

```bash
# Install dependencies
npm install

# Generate TypeScript types
npm run build

# Watch mode for development
npm run dev
```

## Generated Types

The build process generates TypeScript types in the `src/` directory that can be imported and used in the PDS implementation.

## Usage

```typescript
import { ComCommunityActorPrivacySettings } from '@community-stream/lexicon';
```

## Lexicon Details

### Privacy Settings

**ID:** `com.community.actor.privacySettings`  
**Type:** Record  
**Key:** `self` (singleton record per user)

Stores privacy configuration for a user's profile.

### Follow Request

**ID:** `com.community.graph.followRequest`  
**Type:** Record  
**Key:** `tid` (timestamp-based ID)

Represents a request to follow a private profile.

**Status Values:**
- `pending` - Request is awaiting approval
- `approved` - Request has been approved
- `denied` - Request has been denied

### Respond to Follow Request

**ID:** `com.community.graph.respondToFollowRequest`  
**Type:** Procedure (XRPC)

Allows a user to approve or deny a follow request.

## License

MIT
