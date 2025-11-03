# Phase 1.1 - Custom Lexicon Definitions - COMPLETED ✓

## Summary

Successfully created custom AT Protocol lexicons for private profile features. All three lexicon schemas have been defined, validated, and TypeScript types have been generated.

## Created Lexicons

### 1. Privacy Settings (`com.community.actor.privacySettings`)

**Type:** Record (singleton, key: `self`)  
**Purpose:** Store privacy configuration for user profiles

**Fields:**
- `isPrivate` (boolean, required) - Whether the profile is private
- `allowedFollowers` (string[], optional) - DIDs of approved followers
- `createdAt` (datetime, optional) - When settings were created
- `updatedAt` (datetime, optional) - When settings were last updated

### 2. Follow Request (`com.community.graph.followRequest`)

**Type:** Record (key: `tid` - timestamp-based ID)  
**Purpose:** Track follow requests to private profiles

**Fields:**
- `subject` (did, required) - DID of the profile to follow
- `status` (enum, required) - Current status: `pending`, `approved`, or `denied`
- `createdAt` (datetime, required) - When request was created
- `respondedAt` (datetime, optional) - When request was responded to

### 3. Respond to Follow Request (`com.community.graph.respondToFollowRequest`)

**Type:** Procedure (XRPC)  
**Purpose:** Approve or deny a follow request

**Input:**
- `requestUri` (at-uri, required) - AT URI of the follow request
- `approved` (boolean, required) - Whether to approve or deny

**Output:**
- `success` (boolean, required) - Whether the operation succeeded
- `followUri` (at-uri, optional) - URI of created follow record (if approved)

## Generated TypeScript Types

All TypeScript type definitions have been generated in the `src/types/` directory:
- `src/types/com/community/actor/privacySettings.ts`
- `src/types/com/community/graph/followRequest.ts`
- `src/types/com/community/graph/respondToFollowRequest.ts`

The types include:
- Interface definitions for records
- Validation functions (`isRecord`, `validateRecord`)
- Handler types for XRPC procedures
- Input/output schemas

## Build Process

The package uses `@atproto/lex-cli` to generate TypeScript types from lexicon JSON files:

```bash
# Install dependencies
npm install

# Generate types and compile
npm run build

# Watch mode for development
npm run dev
```

## Validation

All lexicons have been validated against AT Protocol specification:
- ✓ Correct lexicon version (1)
- ✓ Valid lexicon IDs
- ✓ Proper schema definitions
- ✓ Required fields specified
- ✓ Format constraints applied

## Next Steps

1. **Copy types to PDS project** - The generated types can be imported into the PDS codebase
2. **Implement PDS endpoints** - Create XRPC handlers using these lexicons
3. **Add to PDS schema** - Register collections in PDS database
4. **Test with Bruno** - Create API test collection

## Files Created

### Core Lexicon Files
- `lexicons/com/community/actor/privacySettings.json`
- `lexicons/com/community/graph/followRequest.json`
- `lexicons/com/community/graph/respondToFollowRequest.json`

### Package Configuration
- `package.json` - Package definition with build scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore rules
- `README.md` - Package documentation

### Generated Files (not in git)
- `dist/` - Compiled JavaScript and type definitions
- `src/index.ts` - Main entry point (generated)
- `src/lexicons.ts` - Lexicon schemas (generated)
- `src/util.ts` - Utility functions (generated)
- `src/types/` - Type definitions (generated)

## Usage Example

```typescript
import { 
  ComCommunityActorPrivacySettings,
  ComCommunityGraphFollowRequest,
  ComCommunityGraphRespondToFollowRequest
} from '@community-stream/lexicon';

// Validate a privacy settings record
const isValid = ComCommunityActorPrivacySettings.isRecord(record);

// Use in PDS endpoint
server.com.community.graph.respondToFollowRequest({
  auth: ctx.authVerifier.accessStandard,
  handler: async ({ input, auth }) => {
    // Implementation
  }
});
```

## Dependencies

- `@atproto/api` - AT Protocol client library
- `@atproto/lexicon` - Lexicon validation
- `@atproto/xrpc-server` - XRPC server implementation
- `@atproto/lex-cli` - Lexicon code generator (dev)
- `typescript` - TypeScript compiler (dev)

---

**Status:** ✅ Complete  
**Date:** 2025-11-03  
**Phase:** 1.1 Custom Lexicon Definitions
