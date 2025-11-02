# Bluesky Private Profile Integration

Instagram-style private profiles for Bluesky with approval-based follows, using PDS modifications and Pinata IPFS private gateways.

## Quick Start

```bash
# Clone with all submodules
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile

# Open workspace in Cursor
cursor workspace.code-workspace
```

See [Installation Guide](./docs/INSTALLATION.md) for detailed setup instructions.

## Documentation

- **[Installation Guide](./docs/INSTALLATION.md)** - Setup and installation instructions
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and components
- **[Development Guide](./docs/DEVELOPMENT.md)** - Running services and development workflow
- **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute to the project
- **[Testing Guide](./docs/TESTING.md)** - Running tests
- **[Implementation Phases](./docs/PHASES.md)** - Current phase and roadmap
- **[Security](./docs/SECURITY.md)** - Security considerations

## Project Structure

```
bsky-private-profile/               # Orchestrator repo
├── bluesky-app/                    # Frontend UI (Bluesky Social App)
├── atproto/                        # Backend (AT Protocol & PDS)
├── community-stream-lexicon/       # Custom ATProto lexicons
├── pinata-integration/             # Gateway service
└── docs/                           # Documentation
```

## Service URLs

- **Bluesky App (Frontend):** http://localhost:19006
- **PDS (Backend):** http://localhost:2583
- **Pinata Gateway:** http://localhost:3000

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/CommunityStream-io/bsky-private-profile/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CommunityStream-io/bsky-private-profile/discussions)

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ by CommunityStream**
