# Implementation Phases - Overview

> **📁 Detailed phase documentation:** See [phases/](../phases/) for comprehensive guides for each phase.

Phased approach to implementing Instagram-style private profiles for Bluesky.

## Current Status

**Phase 0 Complete:** Development environment set up and running locally.

**Current Phase:** Phase 1 - Core Backend Infrastructure

## Phase 0: ✅ Development Environment Setup (COMPLETE)

### Repository & Tooling

- [x] Clone and configure all submodules
- [x] Set up multi-root workspace in Cursor
- [x] Configure corepack for package manager management
- [x] Fixed workspace configuration for all packages
- [x] Installed all dependencies (2,666+ packages)

### Services Running

- [x] Docker PDS running on localhost:2583
- [x] Bluesky app development setup
- [x] Pinata integration service ready
- [x] API testing with Bruno collection

### Documentation Reorganized

- [x] Component-based documentation structure
- [x] Getting started guides
- [x] PDS, AppView, and app documentation
- [x] Troubleshooting and reference guides

### Key Discoveries Documented

- [x] Windows PDS limitations (use Docker instead)
- [x] AppView is optional for most development
- [x] `.test` handles for local development
- [x] Handle verification requires public domain
- [x] Local accounts show as `handle.invalid` without public PDS

## Phase 1: Core Backend Infrastructure (IN PROGRESS)

**Goal:** Extend PDS with private profile data storage and basic API endpoints.

**Can be done locally:** ✅ Yes, with Docker PDS

### 1.1 Custom Lexicon Definitions

- [ ] Define `com.community.actor.privacySettings` lexicon
  - `isPrivate` boolean
  - `allowedFollowers` list of DIDs
  - `pendingRequests` list of DIDs
- [ ] Define `com.community.graph.followRequest` lexicon
  - `subject` DID (who to follow)
  - `status` (pending/approved/denied)
  - `createdAt` timestamp
- [ ] Define `com.community.graph.followRequestResponse` lexicon
  - `request` reference to follow request
  - `approved` boolean
  - `respondedAt` timestamp
- [ ] Generate TypeScript types from lexicons
- [ ] Validate lexicons against AT Protocol spec

### 1.2 PDS Data Storage

- [ ] Add privacy settings record type to PDS
- [ ] Add follow request record type to PDS
- [ ] Implement storage in user repositories
- [ ] Add database indexes for queries
- [ ] Test record creation/retrieval locally

### 1.3 Basic API Endpoints (PDS)

- [ ] `com.community.actor.setPrivacySettings` - Update privacy
- [ ] `com.community.actor.getPrivacySettings` - Read privacy
- [ ] `com.community.graph.createFollowRequest` - Request to follow
- [ ] `com.community.graph.listFollowRequests` - List pending requests
- [ ] `com.community.graph.respondToFollowRequest` - Approve/deny
- [ ] Unit tests for all endpoints

**Testing Strategy:** Use Bruno API collection for endpoint testing

**Deliverable:** Working PDS endpoints that can be tested via API calls

## Phase 2: Access Control Logic (BACKEND)

**Goal:** Implement business logic to enforce privacy rules.

**Can be done locally:** ✅ Yes

### 2.1 Read Access Control

- [ ] Check if requester has access to private profile
- [ ] Implement access check middleware
- [ ] Filter posts based on privacy settings
- [ ] Filter followers/following lists
- [ ] Return appropriate errors for unauthorized access

### 2.2 Write Access Control

- [ ] Prevent follows of private accounts (create request instead)
- [ ] Validate follow request creation
- [ ] Ensure only profile owner can approve/deny
- [ ] Handle duplicate requests gracefully

### 2.3 Follow State Management

- [ ] Convert pending request to follow on approval
- [ ] Remove from pending list on denial
- [ ] Handle edge cases (user makes profile public/private)
- [ ] Cleanup orphaned requests

**Testing Strategy:** API integration tests with multiple test accounts

**Deliverable:** Fully functional access control enforced by PDS

## Phase 3: Frontend - Basic Private Profile UI

**Goal:** Add UI for privacy settings and follow request management.

**Can be done locally:** ✅ Yes, with caveats (handles show as invalid)

### 3.1 Privacy Settings Screen

- [ ] Create privacy settings screen in app
- [ ] Add "Make Profile Private" toggle
- [ ] Show list of approved followers
- [ ] Add ability to remove followers
- [ ] Wire up to PDS API endpoints

### 3.2 Follow Request UI

- [ ] Detect when trying to follow private account
- [ ] Show "Request to Follow" button instead of "Follow"
- [ ] Display "Request Pending" state
- [ ] Add notifications for new follow requests
- [ ] Implement approve/deny UI

### 3.3 Profile Indicators

- [ ] Show lock icon on private profiles
- [ ] Update profile view to handle private state
- [ ] Show "This profile is private" message for unauthorized viewers
- [ ] Display pending request state in UI

**Testing Strategy:** Manual testing with local app and multiple accounts

**Known Limitation:** Handles will show as `handle.invalid` when using local PDS with public AppView. This is expected and doesn't affect functionality testing.

**Deliverable:** Working UI for privacy features (tested locally)

## Phase 4: Pinata Private Gateway Integration

**Goal:** Implement private media access control using Pinata gateways.

**Can be done locally:** ⚠️ Partially (requires Pinata API credentials)

### 4.1 Gateway Provisioning

- [ ] Implement gateway provisioning in Pinata service
- [ ] Store gateway credentials in PDS
- [ ] Associate gateways with user accounts
- [ ] Handle gateway lifecycle (create/delete)

### 4.2 Token Generation

- [ ] Implement time-limited token generation
- [ ] Add authorization checks before token generation
- [ ] Include requester DID in token claims
- [ ] Set appropriate token expiry times

### 4.3 Media Upload Routing

- [ ] Route private profile uploads through private gateway
- [ ] Update blob upload logic in PDS
- [ ] Store gateway references with blobs
- [ ] Handle blob deletion

### 4.4 Media Access Control

- [ ] Inject tokens when serving media to authorized users
- [ ] Return 403 for unauthorized media access
- [ ] Handle token expiry gracefully
- [ ] Test with various image types

**Prerequisites:**

- Pinata account with API credentials
- Pinata service running locally

**Testing Strategy:** Upload test images and verify access control

**Deliverable:** Private media only accessible to approved followers

## Phase 5: Production Deployment Preparation

**Goal:** Address limitations that prevent full federation.

**Requires:** Public server with domain name

### 5.1 Domain & DNS Setup

- [ ] Acquire domain for production PDS (e.g., `pds.yourdomain.com`)
- [ ] Set up DNS records
- [ ] Configure SSL/TLS certificates
- [ ] Set up handle verification (HTTP well-known or DNS TXT)

### 5.2 Public PDS Deployment

- [ ] Deploy PDS to public server
- [ ] Configure for production (disable dev mode)
- [ ] Set up proper authentication
- [ ] Configure database backups
- [ ] Set up monitoring and logging

### 5.3 Handle Verification

- [ ] Implement `.yourdomain.com` handle verification
- [ ] Set up wildcard DNS or well-known endpoints
- [ ] Test handle resolution from public AppView
- [ ] Verify handles no longer show as `handle.invalid`

### 5.4 App Configuration

- [ ] Update app to use production PDS URL
- [ ] Configure proper OAuth flows
- [ ] Test mobile app builds
- [ ] Submit to app stores (if applicable)

**Deliverable:** Publicly accessible PDS with verified handles

## Phase 6: AppView Integration (OPTIONAL)

**Goal:** Enable full social features with local or custom AppView.

**Required for:**

- Custom feed algorithms
- Full-text search
- Notification aggregation
- Social graph queries

**Not required for:** Basic private profile functionality

### 6.1 Local AppView Setup (Optional)

- [ ] Set up PostgreSQL for AppView
- [ ] Configure AppView to crawl local PDS
- [ ] Set up event subscriptions
- [ ] Test feed generation

### 6.2 Privacy-Aware AppView (Future)

- [ ] Modify AppView to respect privacy settings
- [ ] Filter private content from public feeds
- [ ] Handle follow request states in social graph
- [ ] Update notification generation logic

**Note:** This phase is optional and may not be needed if using the public Bluesky AppView, which will eventually respect privacy settings once federated.

**Deliverable:** Custom AppView respecting privacy (if needed)

## Phase 7: Polish & Edge Cases

**Goal:** Handle edge cases and improve UX.

### 7.1 Edge Case Handling

- [ ] User makes profile private (existing followers remain)
- [ ] User makes profile public (pending requests auto-approve)
- [ ] User blocks someone who has pending request
- [ ] Handle migration scenarios
- [ ] Cleanup orphaned data

### 7.2 Performance Optimization

- [ ] Optimize access control checks
- [ ] Cache privacy settings
- [ ] Batch follow request queries
- [ ] Optimize gateway token generation

### 7.3 UX Improvements

- [ ] Add loading states
- [ ] Improve error messages
- [ ] Add success confirmations
- [ ] Implement retry logic
- [ ] Polish animations and transitions

### 7.4 Documentation

- [ ] User guide for private profiles
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide for privacy features

**Deliverable:** Production-ready private profile feature

## Implementation Strategy

### Local Development (Phases 1-4)

**What Works:**

- ✅ PDS endpoint development and testing
- ✅ Access control logic implementation
- ✅ Frontend UI development
- ✅ API testing with Bruno
- ✅ Multi-account testing with `.test` handles

**Known Limitations:**

- ❌ Handles show as `handle.invalid` (expected)
- ❌ No federation with other PDSs
- ❌ Public AppView can't verify local accounts
- ❌ Can't test full social graph features

**Testing Approach:**

- Use Bruno API collection for backend testing
- Use local app for UI testing
- Create multiple `.test` accounts for testing
- Accept that handles won't fully resolve

### Production Deployment (Phase 5+)

**Required:**

- Public server with domain
- HTTPS/SSL certificates
- DNS configuration
- Handle verification setup

**Benefits:**

- ✅ Full federation with Bluesky network
- ✅ Handles resolve properly
- ✅ Can use public AppView
- ✅ Real-world testing

## Success Criteria

### Phase 1-2 Success

- [ ] Can create and read privacy settings via API
- [ ] Can send and respond to follow requests via API
- [ ] Access control blocks unauthorized access
- [ ] All endpoints have unit tests

### Phase 3 Success

- [ ] UI allows toggling profile privacy
- [ ] Can send follow requests from app
- [ ] Can approve/deny requests in app
- [ ] Private profiles show lock icon

### Phase 4 Success

- [ ] Private media uploads work
- [ ] Authorized users can view private media
- [ ] Unauthorized users get 403 errors
- [ ] Tokens expire appropriately

### Phase 5 Success

- [ ] PDS accessible from internet
- [ ] Handles resolve without `handle.invalid`
- [ ] Can create accounts with custom domain handles
- [ ] Federation works with other PDSs

## Current Priorities

**Immediate Next Steps:**

1. **Define Lexicons** (Phase 1.1)

   - Create lexicon JSON files
   - Generate TypeScript types
   - Document schema decisions

2. **Implement PDS Endpoints** (Phase 1.3)

   - Start with privacy settings endpoints
   - Add follow request endpoints
   - Write tests for each endpoint

3. **Test with Bruno** (Phase 1.3)
   - Create Bruno requests for new endpoints
   - Test with multiple accounts
   - Verify access control

**Estimated Timeline:**

- Phase 1: 2-3 weeks
- Phase 2: 1-2 weeks
- Phase 3: 2-3 weeks
- Phase 4: 1-2 weeks
- Phase 5: 1 week (+ infrastructure setup time)

## Lessons Learned

### From Setup Phase

1. **Docker PDS is essential on Windows** - Filesystem limitations make monorepo PDS unusable
2. **AppView is optional** - Most features can be built without it
3. **Local handles work fine** - Use `.test` for development
4. **Public deployment needed for full testing** - Handle resolution requires public PDS
5. **Documentation organization matters** - Component-based structure is clearer

### Key Insights

- **Start with backend** - API-first development enables testing without UI
- **Use Bruno extensively** - API testing is faster than UI testing
- **Accept limitations** - `handle.invalid` is expected locally
- **Plan for production** - Some features require public deployment
- **Keep it modular** - Each phase builds on previous work

## Detailed Phase Documentation

For comprehensive guides on each phase:

- **[Phase 0: Development Environment Setup](../phases/phase-0-setup/)** ✅ Complete
- **[Phase 1: Core Backend Infrastructure](../phases/phase-1-backend-infrastructure/)** 🔄 In Progress
- **[Phase 2: Access Control Logic](../phases/phase-2-access-control/)** ⏳ Pending
- **[Phase 3: Frontend - Basic Private Profile UI](../phases/phase-3-frontend-ui/)** ⏳ Pending
- **[Phase 4: Pinata Private Gateway Integration](../phases/phase-4-pinata-integration/)** ⏳ Pending
- **[Phase 5: Production Deployment Preparation](../phases/phase-5-production-deployment/)** ⏳ Pending
- **[Phase 6: AppView Integration](../phases/phase-6-appview-integration/)** ⏳ Optional
- **[Phase 7: Polish & Edge Cases](../phases/phase-7-polish/)** ⏳ Ongoing

Each phase includes:
- Detailed task breakdowns
- Implementation examples
- Testing strategies
- Success criteria
- Deliverables

## Resources

- [Phases Directory](../phases/) - All phase documentation
- [Lexicon Documentation](https://atproto.com/specs/lexicon)
- [PDS Development Guide](../pds/README.md)
- [AppView Overview](../appview/overview.md)
- [Architecture Documentation](../architecture/overview.md)
- [AT Protocol Spec](https://atproto.com/specs/atp)

---

**Note:** This is a living document. Phases may be adjusted based on discoveries during implementation.
