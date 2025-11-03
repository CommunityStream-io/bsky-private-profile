# Development Guide

## Terminal Configuration in Cursor/VSCode

The workspace is configured with **Git Bash terminal profiles** for each module. Each profile opens in the corresponding directory with color coding for easy identification.

### Using Terminal Profiles

1. **Open Command Palette**: `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. **Select**: `Terminal: Select Default Profile`
3. **Choose a profile**:
   - 🎨 **Bluesky App** - Opens terminal in `bluesky-app/`
   - 🔧 **ATProto PDS** - Opens terminal in `atproto/`
   - 🌐 **Pinata Integration** - Opens terminal in `pinata-integration/`
   - 📋 **Lexicon** - Opens terminal in `community-stream-lexicon/`
   - 📁 **Root** - Opens terminal in root directory

**Or** click the `+` dropdown next to the terminal panel and select a profile directly.

### Using Tasks

You can also run services via tasks:

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Select**: `Tasks: Run Task`
3. **Choose**:
   - 🚀 **Start All Services** - Starts all services in separate terminals
   - **Start Bluesky App** - Starts frontend only
   - **Start PDS** - Starts PDS backend only
   - **Start Pinata** - Starts Pinata gateway only

## Running Services

Run each service manually in separate terminal windows:

```bash
# Terminal 1: Start Bluesky App (Frontend)
cd bluesky-app
corepack yarn web

# Terminal 2: Start PDS (Backend)
# Option 1: From atproto root using pnpm
cd atproto
corepack pnpm --filter @atproto/pds dev

# Option 2: Or directly in the pds package
cd atproto/packages/pds
npm run dev

# Terminal 3: Start Pinata Integration Service
cd pinata-integration
npm run dev
```

### Service URLs

- **Bluesky App (Frontend):** http://localhost:19006
- **PDS (Backend):** http://localhost:2583
- **Pinata Gateway:** http://localhost:3000

### Logs

Each service should be run in its own terminal window. You can redirect logs manually if needed:

```bash
# Example: Save logs to files
cd bluesky-app && corepack yarn web > ../logs/app.log 2>&1 &
cd atproto && corepack pnpm --filter @atproto/pds dev > ../logs/pds.log 2>&1 &
cd pinata-integration && npm run dev > ../logs/pinata.log 2>&1 &
```

## Development Workflow

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

## Documentation Links

- [Implementation Plan](../.cursor/plans/) - Detailed phase-by-phase implementation
- [Bluesky App Docs](bluesky-app/README.md) - Frontend documentation
- [ATProto Docs](atproto/README.md) - Protocol and PDS documentation
- [Lexicon Docs](community-stream-lexicon/README.md) - Custom lexicon definitions
- [Pinata Integration](pinata-integration/README.md) - Gateway service documentation
