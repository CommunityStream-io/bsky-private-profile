# Prerequisites

Before you begin, make sure you have the following tools and dependencies installed.

## Required Software

### Node.js 20 LTS (Required)

Node.js 20 LTS is **mandatory** for this project. Node 24+ has compatibility issues with native modules.

**Install using nvm (recommended):**

**Windows (nvm-windows):**

```bash
nvm install 20
nvm use 20
node --version  # Should show v20.x.x
```

**macOS/Linux (nvm):**

```bash
nvm install 20
nvm use 20
node --version  # Should show v20.x.x
```

**Don't have nvm?**

- **Windows**: [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
- **macOS/Linux**: [nvm](https://github.com/nvm-sh/nvm)

The project includes a `.nvmrc` file for automatic version switching.

### Package Managers

The project uses **corepack** to automatically manage package managers:

- **Bluesky app**: Uses Yarn (managed by corepack)
- **atproto**: Uses pnpm (managed by corepack)
- **Other packages**: Use npm

**Enable corepack (one-time setup):**

```bash
corepack enable
```

### Docker Desktop (Required for Full Local Development)

Docker is required if you want to run:

- Official Docker PDS (recommended)
- Local AppView with PostgreSQL
- Development environment with all services

**Install:**

- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

**Verify installation:**

```bash
docker --version
docker ps
```

### Git

Required for cloning the repository and managing submodules.

**Verify installation:**

```bash
git --version
```

### Git Bash (Windows Users)

Git Bash provides a Unix-like terminal on Windows.

**Install:**

- Included with [Git for Windows](https://gitforwindows.org/)

### jq (JSON Processor)

Useful for parsing JSON responses from API calls.

**Install:**

- **Download**: [jq downloads](https://jqlang.github.io/jq/download/)
- **Add to PATH**: Make sure `jq` is accessible from terminal

**Verify installation:**

```bash
jq --version
```

## Optional Tools

### Native Module Build Tools (Optional)

**Only needed if you:**

- Remove `--ignore-scripts` flag when installing dependencies
- Need to compile native modules like `better-sqlite3`
- Want to build the ATProto monorepo PDS from source

**Windows:**

- Python 3.11 or earlier (3.12+ breaks `node-gyp`)
- Visual Studio Build Tools with "Desktop development with C++" workload
- Download: [Build Tools for Visual Studio 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)

**macOS:**

- Python 3.11 or earlier
- Xcode Command Line Tools: `xcode-select --install`

**Linux:**

- Python 3.11 or earlier
- Build essentials: `sudo apt-get install build-essential` (Ubuntu/Debian)

**Note:** The recommended approach is to use `--ignore-scripts` when installing dependencies to avoid needing these build tools. The Docker PDS also avoids this requirement entirely.

### PostgreSQL (For Local AppView)

Only needed if you want to run a local AppView service.

**Install:**

- **Windows**: [PostgreSQL downloads](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`
- **Docker**: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:14`

### Cursor IDE (Recommended)

This project is optimized for Cursor IDE with multi-root workspace configuration.

**Install:**

- [Cursor IDE](https://cursor.sh/)

**Open the workspace:**

```bash
cursor workspace.code-workspace
```

## System Requirements

### Minimum Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 8 GB minimum, 16 GB recommended
- **Disk Space**: 5 GB for dependencies and build artifacts
- **CPU**: Multi-core processor recommended

### Recommended Ports Available

Make sure these ports are not in use:

- **2581** - Development introspection server
- **2582** - PLC directory server
- **2583** - PDS (Personal Data Server)
- **2584** - AppView service
- **2587** - Ozone moderation service
- **3000** - Pinata integration service
- **5432** - PostgreSQL (if using local AppView)
- **8081** - Metro bundler
- **19006** - Bluesky app web interface

## Verification Checklist

Before proceeding to setup, verify:

- [ ] Node.js 20 installed and active (`node --version`)
- [ ] Corepack enabled (`corepack --version`)
- [ ] Docker installed and running (if using Docker PDS)
- [ ] Git installed (`git --version`)
- [ ] Git Bash available (Windows users)
- [ ] jq installed (optional but helpful)
- [ ] Required ports available

## Next Steps

Once you have the prerequisites installed:

1. Continue to [Quick Start](quickstart.md) for fast setup
2. Or see component-specific setup guides:
   - [PDS Setup](../pds/README.md)
   - [Bluesky App Setup](../bluesky-app/setup.md)
   - [Pinata Integration](../pinata/setup.md)

---

**Troubleshooting:** If you encounter issues with prerequisites, see the [Troubleshooting Guide](../reference/troubleshooting.md).
