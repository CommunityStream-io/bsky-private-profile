# Personal Data Server (PDS) Documentation

The Personal Data Server (PDS) is your data home in the AT Protocol network. It stores your account, posts, and all your data.

## Choose Your PDS Setup

You have two options for running a local PDS:

### Option A: Docker PDS (Recommended) ✅

**Best for:**

- Windows users (avoids filesystem limitations)
- Quick setup with minimal configuration
- Production-like environment
- Users who prefer containerized services

**Pros:**

- ✅ No native module compilation needed
- ✅ Works on all platforms (including Windows)
- ✅ Simple configuration
- ✅ Pre-built Docker image
- ✅ Built-in admin tools

**Get started:** [Docker Setup Guide](docker-setup.md)

### Option B: ATProto Monorepo PDS (Advanced) ⚙️

**Best for:**

- Linux/macOS users
- Developers working on PDS source code
- Advanced users who need source-level control
- Learning the PDS codebase

**Pros:**

- ✅ Full source code access
- ✅ Direct debugging capability
- ✅ Latest development features

**Cons:**

- ❌ Requires native module compilation
- ❌ **Does not work on Windows** (filesystem limitation with DIDs containing colons)
- ❌ More complex setup
- ❌ Requires Node 20 and build tools

**Get started:** [Monorepo Setup Guide](monorepo-setup.md)

## Documentation

- **[Docker Setup](docker-setup.md)** - Set up the official Docker PDS
- **[Monorepo Setup](monorepo-setup.md)** - Build and run the ATProto PDS from source
- **[Configuration](configuration.md)** - Environment variables, secrets, and configuration options
- **[Troubleshooting](troubleshooting.md)** - Common PDS issues and solutions

## What Does the PDS Do?

The PDS is responsible for:

- **Account Management** - Creating and managing user accounts
- **Data Storage** - Storing posts, likes, follows, and all user data
- **Authentication** - Handling login and session management
- **Repository Management** - Managing your AT Protocol repository
- **Identity** - Associating your DID with your handle

## Default Configuration

Both PDS options run on:

- **Port:** 2583
- **URL:** `http://localhost:2583`
- **Health Check:** `http://localhost:2583/xrpc/_health`

## Next Steps

1. Choose your PDS option (Docker recommended for most users)
2. Follow the setup guide
3. Configure your environment
4. Create test accounts
5. Connect your Bluesky app

---

**Windows Users:** We strongly recommend the Docker PDS option. The monorepo PDS cannot create accounts on Windows due to filesystem limitations with colons in DIDs (e.g., `did:plc:xxx`).
