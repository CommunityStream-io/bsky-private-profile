# Phase 1: Core Backend Infrastructure 🔄 IN PROGRESS

**Status:** 🔄 In Progress  
**Duration:** 2-3 weeks (estimated)  
**Can be done locally:** ✅ Yes, with Docker PDS

## Overview

Extend the PDS with custom data structures and API endpoints to support private profiles and follow requests. This phase focuses on backend implementation without UI.

## Goals

- [ ] Define custom lexicon schemas
- [ ] Implement data storage in PDS
- [ ] Create API endpoints for privacy features
- [ ] Test all endpoints with Bruno
- [ ] Document API behavior

## Why This Phase Comes First

**Backend-first approach:**
- Can test via API without UI
- Faster iteration cycle
- Bruno testing very effective
- Clear success criteria
- No dependency on AppView or frontend

## Tasks Breakdown

### 1.1 Custom Lexicon Definitions

**Goal:** Define AT Protocol schemas for private profile features

#### Privacy Settings Lexicon

**File:** `community-stream-lexicon/lexicons/com/community/actor/privacySettings.json`

**Schema:**
```json
{
  "lexicon": 1,
  "id": "com.community.actor.privacySettings",
  "defs": {
    "main": {
      "type": "record",
      "description": "Privacy settings for a user profile",
      "key": "self",
      "record": {
        "type": "object",
        "required": ["isPrivate"],
        "properties": {
          "isPrivate": {
            "type": "boolean",
            "description": "Whether the profile is private"
          },
          "allowedFollowers": {
            "type": "array",
            "description": "DIDs of approved followers",
            "items": {
              "type": "string",
              "format": "did"
            }
          },
          "createdAt": {
            "type": "string",
            "format": "datetime"
          },
          "updatedAt": {
            "type": "string",
            "format": "datetime"
          }
        }
      }
    }
  }
}
```

**Tasks:**
- [ ] Create lexicon file
- [ ] Validate against AT Protocol spec
- [ ] Generate TypeScript types
- [ ] Document field meanings and constraints

#### Follow Request Lexicon

**File:** `community-stream-lexicon/lexicons/com/community/graph/followRequest.json`

**Schema:**
```json
{
  "lexicon": 1,
  "id": "com.community.graph.followRequest",
  "defs": {
    "main": {
      "type": "record",
      "description": "Request to follow a private profile",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["subject", "status", "createdAt"],
        "properties": {
          "subject": {
            "type": "string",
            "format": "did",
            "description": "DID of the profile to follow"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "approved", "denied"],
            "description": "Current status of the request"
          },
          "createdAt": {
            "type": "string",
            "format": "datetime"
          },
          "respondedAt": {
            "type": "string",
            "format": "datetime"
          }
        }
      }
    }
  }
}
```

**Tasks:**
- [ ] Create lexicon file
- [ ] Add status enum
- [ ] Generate TypeScript types
- [ ] Document lifecycle

#### Follow Request Response Lexicon

**File:** `community-stream-lexicon/lexicons/com/community/graph/respondToFollowRequest.json`

**XRPC Procedure:**
```json
{
  "lexicon": 1,
  "id": "com.community.graph.respondToFollowRequest",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Approve or deny a follow request",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": ["requestUri", "approved"],
          "properties": {
            "requestUri": {
              "type": "string",
              "format": "at-uri",
              "description": "AT URI of the follow request"
            },
            "approved": {
              "type": "boolean",
              "description": "Whether to approve or deny"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": ["success"],
          "properties": {
            "success": {
              "type": "boolean"
            },
            "followUri": {
              "type": "string",
              "format": "at-uri",
              "description": "URI of created follow record (if approved)"
            }
          }
        }
      }
    }
  }
}
```

**Tasks:**
- [ ] Create procedure lexicon
- [ ] Define input/output schemas
- [ ] Generate TypeScript types
- [ ] Document error cases

#### Type Generation

**Commands:**
```bash
cd community-stream-lexicon
npm run build
```

**Tasks:**
- [ ] Run type generation
- [ ] Verify generated types
- [ ] Copy types to PDS project
- [ ] Import types in PDS code

### 1.2 PDS Data Storage

**Goal:** Store privacy settings and follow requests in user repositories

#### Privacy Settings Storage

**Collection:** `com.community.actor.privacySettings`

**Implementation Tasks:**
- [ ] Add collection to PDS schema
- [ ] Create database indexes for queries
- [ ] Implement create operation
- [ ] Implement read operation
- [ ] Implement update operation
- [ ] Add validation logic
- [ ] Write unit tests

**Test Cases:**
- [ ] Create privacy settings
- [ ] Update isPrivate flag
- [ ] Add follower to allowedFollowers
- [ ] Remove follower from allowedFollowers
- [ ] Query privacy settings

#### Follow Request Storage

**Collection:** `com.community.graph.followRequest`

**Implementation Tasks:**
- [ ] Add collection to PDS schema
- [ ] Create indexes (by subject, by repo)
- [ ] Implement create operation
- [ ] Implement list operations
- [ ] Implement update operation (status change)
- [ ] Add duplicate prevention
- [ ] Write unit tests

**Test Cases:**
- [ ] Create follow request
- [ ] List requests for a user (as requester)
- [ ] List requests for a user (as recipient)
- [ ] Update request status
- [ ] Prevent duplicate requests
- [ ] Handle edge cases

### 1.3 Basic API Endpoints (PDS)

**Goal:** Create XRPC endpoints for all privacy operations

#### Endpoint: Set Privacy Settings

**Method:** `com.community.actor.setPrivacySettings`

**Type:** Procedure (POST)

**Input:**
```typescript
{
  isPrivate: boolean;
  // allowedFollowers managed automatically
}
```

**Output:**
```typescript
{
  uri: string;  // AT URI of privacy settings record
  cid: string;  // Content ID
}
```

**Implementation:**
```typescript
// File: atproto/packages/pds/src/api/com/community/actor/setPrivacySettings.ts

export default function (server: Server) {
  server.com.community.actor.setPrivacySettings({
    auth: ctx.authVerifier.accessStandard,
    handler: async ({ input, auth }) => {
      const { isPrivate } = input.body;
      const requester = auth.credentials.did;
      
      // Create or update privacy settings record
      const record = {
        $type: 'com.community.actor.privacySettings',
        isPrivate,
        allowedFollowers: [], // Populated from existing follows
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const result = await server.ctx.services.repo(requester).putRecord({
        repo: requester,
        collection: 'com.community.actor.privacySettings',
        rkey: 'self',
        record,
      });
      
      return {
        encoding: 'application/json',
        body: {
          uri: result.uri,
          cid: result.cid,
        },
      };
    },
  });
}
```

**Tasks:**
- [ ] Create endpoint file
- [ ] Implement handler
- [ ] Add authentication
- [ ] Add validation
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Add Bruno test

#### Endpoint: Get Privacy Settings

**Method:** `com.community.actor.getPrivacySettings`

**Type:** Query (GET)

**Parameters:**
```typescript
{
  actor: string;  // DID or handle
}
```

**Output:**
```typescript
{
  isPrivate: boolean;
  isOwnProfile: boolean;
  canView: boolean;
}
```

**Tasks:**
- [ ] Create endpoint file
- [ ] Implement handler
- [ ] Add access control logic
- [ ] Return appropriate info based on requester
- [ ] Write unit tests
- [ ] Add Bruno test

#### Endpoint: Create Follow Request

**Method:** `com.community.graph.createFollowRequest`

**Type:** Procedure (POST)

**Input:**
```typescript
{
  subject: string;  // DID of user to follow
}
```

**Output:**
```typescript
{
  uri: string;  // AT URI of follow request
  cid: string;
}
```

**Tasks:**
- [ ] Create endpoint file
- [ ] Check if profile is private
- [ ] Prevent duplicate requests
- [ ] Create follow request record
- [ ] Write unit tests
- [ ] Add Bruno test

#### Endpoint: List Follow Requests

**Method:** `com.community.graph.listFollowRequests`

**Type:** Query (GET)

**Parameters:**
```typescript
{
  direction: 'incoming' | 'outgoing';  // Requests to me or from me
  status?: 'pending' | 'approved' | 'denied';
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  requests: Array<{
    uri: string;
    cid: string;
    value: FollowRequest;
    requester: ProfileView;
  }>;
  cursor?: string;
}
```

**Tasks:**
- [ ] Create endpoint file
- [ ] Implement filtering logic
- [ ] Add pagination
- [ ] Enrich with profile data
- [ ] Write unit tests
- [ ] Add Bruno test

#### Endpoint: Respond to Follow Request

**Method:** `com.community.graph.respondToFollowRequest`

**Type:** Procedure (POST)

**Input:**
```typescript
{
  requestUri: string;  // AT URI of request
  approved: boolean;
}
```

**Output:**
```typescript
{
  success: boolean;
  followUri?: string;  // If approved, URI of created follow
}
```

**Logic:**
- If approved:
  - Create follow record
  - Add to allowedFollowers
  - Update request status to 'approved'
- If denied:
  - Update request status to 'denied'

**Tasks:**
- [ ] Create endpoint file
- [ ] Implement approval logic
- [ ] Implement denial logic
- [ ] Update privacy settings
- [ ] Write unit tests
- [ ] Add Bruno test

### 1.4 Testing with Bruno

**Goal:** Comprehensive API testing for all endpoints

#### Test Collection Structure

```
bruno-api/
├── Privacy Settings/
│   ├── Set Privacy (Private).bru
│   ├── Set Privacy (Public).bru
│   ├── Get Own Privacy Settings.bru
│   └── Get Other Privacy Settings.bru
└── Follow Requests/
    ├── Create Follow Request.bru
    ├── List Incoming Requests.bru
    ├── List Outgoing Requests.bru
    ├── Approve Request.bru
    └── Deny Request.bru
```

#### Test Scenarios

**Scenario 1: Make Profile Private**
```
1. Create test user Alice
2. Alice sets privacy to private
3. Verify settings updated
4. Bob tries to view Alice's profile
5. Verify Bob sees private indicator
```

**Scenario 2: Follow Request Flow**
```
1. Alice has private profile
2. Bob sends follow request
3. Verify request created
4. Alice lists incoming requests
5. Alice approves request
6. Verify follow created
7. Verify Bob in allowedFollowers
```

**Scenario 3: Deny Request**
```
1. Alice has private profile
2. Bob sends follow request
3. Alice denies request
4. Verify request status updated
5. Verify no follow created
```

**Tasks:**
- [ ] Create Bruno collection structure
- [ ] Add all test requests
- [ ] Set up test environments
- [ ] Document test flows
- [ ] Run full test suite
- [ ] Verify all tests pass

## Success Criteria

### Technical Success
- [ ] All lexicons defined and validated
- [ ] TypeScript types generated
- [ ] All endpoints implemented
- [ ] All unit tests passing
- [ ] All Bruno tests passing

### Functional Success
- [ ] Can create privacy settings via API
- [ ] Can read privacy settings via API
- [ ] Can send follow request to private profile
- [ ] Can list follow requests
- [ ] Can approve/deny requests
- [ ] Access control works correctly

### Documentation Success
- [ ] All endpoints documented
- [ ] Bruno collection complete
- [ ] API behavior clearly described
- [ ] Error cases documented

## Testing Strategy

### Unit Tests
- Test each endpoint in isolation
- Mock dependencies
- Test edge cases
- Verify error handling

### Integration Tests via Bruno
- Test complete workflows
- Multiple users interacting
- Real PDS instance
- Verify state changes

### Manual Testing
- Create test accounts
- Walk through user scenarios
- Verify expected behavior
- Document any issues

## Deliverables

1. **Lexicon Files**
   - Privacy settings lexicon
   - Follow request lexicon
   - Response lexicon
   - Generated TypeScript types

2. **PDS Endpoints**
   - Set/get privacy settings
   - Create/list follow requests
   - Respond to requests
   - Unit tests for all endpoints

3. **Bruno Collection**
   - Privacy settings tests
   - Follow request tests
   - Complete workflow tests
   - Environment configuration

4. **Documentation**
   - API endpoint documentation
   - Usage examples
   - Error codes and handling
   - Testing guide

## Known Limitations

- Handles will show as `handle.invalid` (expected)
- No UI yet (API only)
- No federation testing
- No AppView integration

## Next Steps

After Phase 1 completion:
- **Phase 2:** Implement access control logic
- Add middleware for authorization
- Filter content based on privacy
- Enforce follow request requirements

## Resources

- [Lexicon Documentation](https://atproto.com/specs/lexicon)
- [XRPC Specification](https://atproto.com/specs/xrpc)
- [PDS Development Guide](../../pds/README.md)
- [Bruno Documentation](https://docs.usebruno.com/)

---

**Current Focus:** Define lexicons and start PDS endpoint implementation.

