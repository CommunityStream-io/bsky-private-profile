# Bluesky Private Profile Integration

Instagram-style private profiles for Bluesky with approval-based follows, using PDS modifications and Pinata IPFS private gateways.

## 🏗️ Architecture

This repository orchestrates multiple components as git submodules for integrated development:

```
bsky-private-profile/               # Orchestrator repo
├── bluesky-app/                    # Frontend UI (Bluesky Social App)
├── atproto/                        # Backend (AT Protocol & PDS)
├── community-stream-lexicon/       # Custom ATProto lexicons
├── pinata-integration/             # Gateway service
└── workspace.code-workspace        # Cursor multi-root workspace
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (tested with Node 20+)
- pnpm 8+ (for workspace management)
- Python 3.6+ (required for native dependencies in Bluesky app)
  - Download at https://www.python.org/downloads/
- Git
- Cursor IDE (recommended)

**Note:** This project uses **corepack** to automatically manage package managers. The Bluesky app uses Yarn, while other packages use pnpm.

### Clone with All Submodules

```bash
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile
```

If you already cloned without `--recursive`:

```bash
git submodule update --init --recursive
```

### Open Workspace in Cursor

```bash
cursor workspace.code-workspace
```

This opens a multi-root workspace with all components organized for efficient development.

### Install Dependencies

This project uses **pnpm workspace** for unified package management across all submodules, with **corepack** to manage the Bluesky app's Yarn dependencies.

#### Enable Corepack (one-time setup)

```bash
corepack enable
```

#### Install All Dependencies

```bash
pnpm install:all    # Installs all workspace packages + Bluesky app with Yarn
```

Or manually:

```bash
# Install workspace packages (PDS, Pinata, Lexicon)
pnpm install

# Install Bluesky app dependencies with Yarn (managed by corepack)
cd bluesky-app && corepack yarn install
```

#### Build All Packages

```bash
pnpm build:all
```

**Known Issues:**

- The Bluesky app requires Python 3.6+ for building native dependencies (`better-sqlite3`)
- If you encounter Python errors, install Python 3 and ensure it's in your PATH

### Configure Local Development

#### 1. Set Up Local PDS

```bash
cd atproto/packages/pds

# Copy environment template
cp .env.example .env

# Edit .env with:
# PDS_HOSTNAME=localhost
# PDS_PORT=2583
# PDS_JWT_SECRET=your-secret-key

# Initialize database
npm run db:migrate

# Start PDS
npm run start:dev
```

#### 2. Configure Bluesky App

```bash
cd bluesky-app

# Point to local PDS
echo "EXPO_PUBLIC_PDS_URL=http://localhost:2583" > .env.local

# Start app
yarn web
```

#### 3. Start Pinata Integration Service

```bash
cd pinata-integration

# Configure environment
cp env.example .env
# Edit .env with your Pinata credentials

# Start service
npm run dev
```

### Run Services

```bash
pnpm start:all              # All services with formatted output + logs to logs/
pnpm dev                    # All services in parallel
pnpm dev:app                # Frontend only (localhost:19006)
pnpm dev:pds                # PDS only (localhost:2583)
pnpm dev:pinata             # Gateway only (localhost:3000)
```

**Service URLs:**

- **Bluesky App (Frontend):** http://localhost:19006
- **PDS (Backend):** http://localhost:2583
- **Pinata Gateway:** http://localhost:3000

**Logs:** When using `pnpm start:all`, service logs are saved to:

- `logs/app.log` - Bluesky app output
- `logs/pds.log` - PDS server output
- `logs/pinata.log` - Pinata gateway output

### Create Test Accounts

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.local",
    "handle": "user1.test",
    "password": "password123"
  }'
```

## 📋 Implementation Phases

### Phase 0: ✅ Mis en Place - Repository Setup (COMPLETE)

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

### Phase 1: Pending Follow State

- [ ] Add "pending" follow state to UI
- [ ] Update follow button components
- [ ] Handle pending state in profile queries

### Phase 2: Lexicon & Schema Extensions

- [ ] Define private profile lexicon
- [ ] Define follow request lexicon
- [ ] Generate TypeScript types

### Phase 3: PDS Modifications

- [ ] Add profile privacy storage
- [ ] Implement follow request endpoints
- [ ] Add access control layer
- [ ] Implement content routing

### Phase 4: Pinata Private Gateway Integration

- [ ] Implement per-profile gateway configuration
- [ ] Add gateway provisioning
- [ ] Implement token generation
- [ ] Add blob upload routing

### Phase 5: Follow Request Notifications

- [ ] Add follow-request notification type
- [ ] Implement notification UI
- [ ] Add approve/deny actions

### Phase 6: Profile Privacy Settings UI

- [ ] Create privacy settings screen
- [ ] Add profile privacy toggle
- [ ] Display private profile indicators

### Phase 7: Content Access Control

- [ ] Enforce post access control
- [ ] Implement media token injection
- [ ] Handle private content errors

## 🔧 Development Workflow

### Making Changes

```bash
# Make changes in a submodule
cd bluesky-app
git checkout -b feature/private-profiles

# Make your changes
git commit -am "Add pending follow state"
git push origin feature/private-profiles

# Update parent repo to track new commit
cd ..
git add bluesky-app
git commit -m "Update bluesky-app submodule"
git push
```

### Updating Submodules

```bash
# Update all submodules to latest
git submodule update --remote --merge

# Update specific submodule
git submodule update --remote bluesky-app
```

### Syncing Submodules

```bash
# Pull parent repo and update submodules
git pull
git submodule update --init --recursive
```

## 📚 Documentation

- [Implementation Plan](../.cursor/plans/) - Detailed phase-by-phase implementation
- [Bluesky App Docs](bluesky-app/README.md) - Frontend documentation
- [ATProto Docs](atproto/README.md) - Protocol and PDS documentation
- [Lexicon Docs](community-stream-lexicon/README.md) - Custom lexicon definitions
- [Pinata Integration](pinata-integration/README.md) - Gateway service documentation

## 🧪 Testing

### Unit Tests

```bash
# Frontend tests
cd bluesky-app && yarn test

# Backend tests
cd atproto && npm test

# Lexicon tests
cd community-stream-lexicon && npm test
```

### Integration Tests

```bash
# Run full integration test suite
npm run test:integration
```

### E2E Tests

```bash
# Run E2E tests
cd bluesky-app && yarn test:e2e
```

## 🔒 Security Considerations

- **Credentials Storage**: Pinata API keys stored encrypted in PDS
- **Token Management**: Time-limited tokens (1 hour default)
- **Access Control**: Follower validation before content access
- **HTTPS Required**: Production deployment requires HTTPS
- **Rate Limiting**: Implement in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/CommunityStream-io/bsky-private-profile/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CommunityStream-io/bsky-private-profile/discussions)

---

**Built with ❤️ by CommunityStream**
