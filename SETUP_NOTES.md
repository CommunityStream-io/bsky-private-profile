# Setup Notes - Phase 0 Completion

## ✅ Completed

### Submodules Added
- ✅ **bluesky-app**: Frontend UI from https://github.com/bluesky-social/social-app.git
- ✅ **atproto**: Backend PDS from https://github.com/bluesky-social/atproto.git  
- ✅ **community-stream-lexicon**: Custom lexicons from https://github.com/CommunityStream-io/community-stream-lexicon.git

### Infrastructure
- ✅ **workspace.code-workspace**: Multi-root workspace configuration for Cursor
- ✅ **README.md**: Comprehensive setup and development guide
- ✅ **scripts/install-all.sh**: Automated dependency installation
- ✅ **.gitignore**: Proper git ignore configuration

### Pinata Integration Service
- ✅ Created initial structure locally in `pinata-integration/`
- ✅ TypeScript configuration
- ✅ Express server with placeholder endpoints
- ✅ README with API documentation
- ✅ Package.json with all dependencies
- ✅ Initial git commit

## 🔄 Next Steps for Pinata Integration

The `pinata-integration` directory has been initialized as a local git repository but **needs to be added as a proper submodule**. Here's how:

### Option 1: Push to GitHub and Add as Submodule (Recommended)

```bash
# 1. Create repo on GitHub
# Go to https://github.com/CommunityStream-io and create "pinata-integration" repo

# 2. In pinata-integration directory, add remote and push
cd pinata-integration
git remote add origin https://github.com/CommunityStream-io/pinata-integration.git
git branch -M main
git push -u origin main
cd ..

# 3. Remove local directory and add as submodule
rm -rf pinata-integration
git submodule add https://github.com/CommunityStream-io/pinata-integration.git pinata-integration

# 4. Commit the submodule addition
git add .gitmodules pinata-integration
git commit -m "feat: add pinata-integration as submodule"
git push origin main
```

### Option 2: Continue with Local Development

If you want to continue developing locally before pushing to GitHub:

```bash
# The pinata-integration directory will remain as a regular directory
# You can work on it and push to GitHub later
# Just remember it's not yet tracked as a submodule

# When ready to convert to submodule, follow Option 1
```

## 📦 Installing Dependencies

Once all submodules are properly set up:

```bash
# Run the installation script
./scripts/install-all.sh

# Or install manually
cd bluesky-app && yarn install && cd ..
cd atproto && npm install && npm run build && cd ..
cd community-stream-lexicon && npm install && npm run build && cd ..
cd pinata-integration && npm install && cd ..
```

## 🚀 Starting Development

### Terminal Setup

Open 4 terminals (use Cursor's workspace for easy management):

```bash
# Terminal 1: Frontend
cd bluesky-app
yarn web
# Access at http://localhost:19006

# Terminal 2: PDS Backend
cd atproto/packages/pds
cp .env.example .env
# Edit .env with local settings
npm run db:migrate
npm run start:dev
# Access at http://localhost:2583

# Terminal 3: Pinata Integration
cd pinata-integration
cp env.example .env
# Edit .env with Pinata credentials
npm run dev
# Access at http://localhost:3000

# Terminal 4: General commands
# Use for git, testing, etc.
```

### Open in Cursor

```bash
cursor workspace.code-workspace
```

This will open a multi-root workspace with:
- 🎨 Bluesky App (Frontend)
- 🔧 ATProto PDS (Backend)
- 📚 ATProto API (Client)
- 📋 Community Stream Lexicon
- 🌐 Pinata Integration
- 📁 Root

## 🧪 Verify Setup

After starting all services:

```bash
# Test PDS
curl http://localhost:2583/xrpc/_health

# Test Bluesky App
# Open http://localhost:19006 in browser

# Test Pinata Integration
curl http://localhost:3000/health

# Create test account
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.local",
    "handle": "test.local",
    "password": "password123"
  }'
```

## 📝 Status

**Phase 0: Mis en Place - Repository Setup**

Status: 95% Complete ✅

Remaining:
- [ ] Push pinata-integration to GitHub
- [ ] Add pinata-integration as proper submodule
- [ ] Test full workspace in Cursor
- [ ] Verify all services start correctly

Once these are complete, Phase 0 will be 100% done and we can move to **Phase 1: Pending Follow State**.

## 🔗 Useful Links

- Bluesky Social App: https://github.com/bluesky-social/social-app
- AT Proto: https://github.com/bluesky-social/atproto  
- CommunityStream Lexicon: https://github.com/CommunityStream-io/community-stream-lexicon
- Pinata Documentation: https://docs.pinata.cloud

