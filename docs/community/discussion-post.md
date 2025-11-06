# Draft Post for AT Protocol Discussion #1409

> Copy/paste this into the GitHub discussion

---

## Proposed Implementation: PDS-Level Private Profiles with Private IPFS Gateways

Hi @bnewbold and team! 👋

Following the discussion about private profiles and the Spring/Summer 2025 roadmap, I'm working on an **interim solution for self-hosted PDS instances** that could serve users while the official protocol-level implementation is being developed.

### High-Level Approach

**Three-layer strategy:**

1. **Private Profiles via PDS and Private IPFs gateways** - Privacy settings and follow request records stored in user repositories
2. **PDS Access Control** - Middleware enforcing privacy checks at the repository level
3. **Pinata Private Gateways** - Time-limited access tokens for private media via IPFS

This provides Instagram-style private profiles (approval-required follows, private content) without modifying the core protocol or public AppView.

### Visual Overview

I've documented the architecture with sequence and component diagrams showing:

- Follow request approval flow
- Access control enforcement
- Private media token generation

**📄 Full Technical Overview:** [Private Profiles Implementation](https://github.com/CommunityStream-io/bsky-private-profile/blob/phase-1-3-api-endpoints/docs/architecture/private-profiles-overview.md)

### Guidance Needed

As a new contributor to the AT Protocol ecosystem, I'd love guidance on a few key areas:

1. **Architecture Review** - Are there any architectural concerns or gotchas I should be aware of with this PDS-level approach? What should I look out for to ensure compatibility with the protocol's evolution?
2. **Community Coordination** - How can I best coordinate with the official roadmap?

**See full questions:** [Technical Overview - Questions Section](https://github.com/CommunityStream-io/bsky-private-profile/blob/phase-1-3-api-endpoints/docs/architecture/private-profiles-overview.md#questions-for-protocol-team)

### Scope

- ✅ Self-hosted PDS instances
- ✅ Works with existing public AppView (limited federation)
- ❌ Not intended for main Bluesky network initially
- ❌ Not attempting E2EE (waiting for Auth Scopes)

**My Goal:** Contribute to the technology and align with the protocol team's needs while providing value for the self-hosted community.

Happy to adjust the approach based on your guidance. Thanks for considering! 🙏

---

**Related:** [Full Roadmap](https://github.com/CommunityStream-io/bsky-private-profile/blob/phase-1-3-api-endpoints/docs/reference/phases.md) | [Project Board](https://github.com/orgs/CommunityStream-io/projects/3)
