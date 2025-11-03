# Architecture

This repository orchestrates multiple components as git submodules for integrated development:

```
bsky-private-profile/               # Orchestrator repo
├── bluesky-app/                    # Frontend UI (Bluesky Social App)
├── atproto/                        # Backend (AT Protocol & PDS)
├── community-stream-lexicon/       # Custom ATProto lexicons
├── pinata-integration/             # Gateway service
└── workspace.code-workspace        # Cursor multi-root workspace
```

## Components

### Bluesky App (`bluesky-app/`)

Frontend UI built with React Native, written in TypeScript. This is the main user interface for the Bluesky Social app.

- **Package Manager**: Yarn (managed by corepack)
- **Tech Stack**: React Native, TypeScript
- **Port**: 19006 (web)

### ATProto PDS (`atproto/`)

Backend implementation of the AT Protocol, including the Personal Data Server (PDS).

- **Package Manager**: npm
- **Tech Stack**: TypeScript, Node.js
- **Port**: 2583
- **Location**: `atproto/packages/pds/`

### Community Stream Lexicon (`community-stream-lexicon/`)

Custom ATProto lexicons defining new schemas and APIs for private profile functionality.

- **Package Manager**: npm
- **Purpose**: Extends AT Protocol with custom lexicons

### Pinata Integration (`pinata-integration/`)

Gateway service for IPFS private gateway provisioning and token management.

- **Package Manager**: npm
- **Tech Stack**: TypeScript, Node.js
- **Port**: 3000
- **Purpose**: Manages per-profile IPFS private gateways

## Workspace Configuration

The project uses a Cursor multi-root workspace (`workspace.code-workspace`) to organize all components for efficient development. Open it with:

```bash
cursor workspace.code-workspace
```
