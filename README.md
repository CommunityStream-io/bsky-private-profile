# Bluesky Private Profile Integration

Instagram-style private profiles for Bluesky with approval-based follows, using PDS modifications and Pinata IPFS private gateways.

## Quick Start

```bash
# Clone with all submodules
git clone --recursive https://github.com/CommunityStream-io/bsky-private-profile.git
cd bsky-private-profile

# Switch to Node 20 LTS (required)
./scripts/use-node-version.bat  # Windows
# or: nvm use                     # Mac/Linux

# Open workspace in Cursor
cursor workspace.code-workspace
```

📖 **New to the project?** Start with the [Quick Start Guide](./docs/QUICK_START.md)  
📚 **Need detailed setup?** See the [Installation Guide](./docs/INSTALLATION.md)

## Documentation

### Getting Started

- 📦 **[Installation Guide](./docs/INSTALLATION.md)** - Detailed setup instructions
- 🔧 **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- ✅ **[Setup Status](./docs/SETUP_STATUS.md)** - Current setup status and lessons learned

### Development

- 🏗️ **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and components
- 💻 **[Development Guide](./docs/DEVELOPMENT.md)** - Running services and development workflow
- 🧪 **[Testing Guide](./docs/TESTING.md)** - Running tests

### Project Info

- 🤝 **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute to the project
- 📋 **[Implementation Phases](./docs/PHASES.md)** - Current phase and roadmap
- 🔒 **[Security](./docs/SECURITY.md)** - Security considerations

## Project Structure

```
bsky-private-profile/               # Orchestrator repo
├── bluesky-app/                    # Frontend UI (Bluesky Social App)
├── atproto/                        # Backend (AT Protocol & PDS - source build)
├── official-pds/                   # Official Docker PDS (recommended)
├── community-stream-lexicon/       # Custom ATProto lexicons
├── pinata-integration/             # Gateway service
├── scripts/                        # Helper scripts
└── docs/                           # Documentation
```

### PDS Options

This project supports two ways to run a Personal Data Server:

1. **Official Docker PDS** (`official-pds/`) - **Recommended for Windows**

   - ✅ Easy Docker setup
   - ✅ No native compilation needed
   - ✅ No Windows filesystem limitations
   - ✅ Production-ready
   - 🔗 Fork: [CommunityStream-io/pds](https://github.com/CommunityStream-io/pds)

2. **ATProto Monorepo PDS** (`atproto/`) - For advanced users (Linux/macOS/WSL2)
   - 🔧 Build from source
   - 🔧 Requires Node 20 + native build tools
   - ⚠️ Cannot create accounts on Windows (filesystem limitation)
   - 🔧 Full control over source code

## 🧪 API Testing with Bruno

A complete Bruno API collection is included for testing the PDS:

```bash
# Open in VS Code (Bruno extension will auto-detect)
code bruno-api/

# Or use Bruno Desktop
# Download from: https://www.usebruno.com/
```

**Quick Start:**
1. Open the `bruno-api/` collection
2. Select "local" environment
3. Run `Account/Create Session (Login)` 
4. Test other endpoints (tokens are auto-saved!)

See [bruno-api/README.md](./bruno-api/README.md) for full documentation.

## Service URLs

- **Bluesky App (Frontend):** http://localhost:19006
- **PDS (Backend):** http://localhost:2583
- **Pinata Gateway:** http://localhost:3000
- **Bruno API Collection:** `bruno-api/`

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/CommunityStream-io/bsky-private-profile/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CommunityStream-io/bsky-private-profile/discussions)

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ by CommunityStream**
