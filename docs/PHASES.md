# Implementation Phases

## Phase 0: ✅ Mis en Place - Repository Setup (COMPLETE)

- [x] Clone and configure all submodules
- [x] Set up multi-root workspace in Cursor
- [x] Configure development environment
- [x] Set up corepack for package manager management
- [x] Fixed workspace configuration to include `atproto/packages/internal/*` and `atproto/packages/oauth/*`
- [x] Resolved TypeScript configuration issues in community-stream-lexicon
- [x] Installed all dependencies (2,666+ packages)
- [x] Configured logging for all services (logs saved to `logs/` directory)
- [x] Verified PDS and Pinata services start successfully

**Known Limitation:** Bluesky app requires Python 3.6+ for native dependencies. Install Python to run the web frontend.

## Phase 1: Pending Follow State

- [ ] Add "pending" follow state to UI
- [ ] Update follow button components
- [ ] Handle pending state in profile queries

## Phase 2: Lexicon & Schema Extensions

- [ ] Define private profile lexicon
- [ ] Define follow request lexicon
- [ ] Generate TypeScript types

## Phase 3: PDS Modifications

- [ ] Add profile privacy storage
- [ ] Implement follow request endpoints
- [ ] Add access control layer
- [ ] Implement content routing

## Phase 4: Pinata Private Gateway Integration

- [ ] Implement per-profile gateway configuration
- [ ] Add gateway provisioning
- [ ] Implement token generation
- [ ] Add blob upload routing

## Phase 5: Follow Request Notifications

- [ ] Add follow-request notification type
- [ ] Implement notification UI
- [ ] Add approve/deny actions

## Phase 6: Profile Privacy Settings UI

- [ ] Create privacy settings screen
- [ ] Add profile privacy toggle
- [ ] Display private profile indicators

## Phase 7: Content Access Control

- [ ] Enforce post access control
- [ ] Implement media token injection
- [ ] Handle private content errors
