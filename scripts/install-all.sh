#!/bin/bash
# install-all.sh - Install dependencies for all submodules

set -e  # Exit on error

echo "🚀 Installing dependencies for all submodules..."
echo ""

# Bluesky App
echo "📱 Installing Bluesky App dependencies..."
cd bluesky-app
yarn install
cd ..
echo "✅ Bluesky App dependencies installed"
echo ""

# ATProto
echo "🔧 Installing ATProto dependencies..."
cd atproto
npm install
echo "🏗️  Building ATProto packages..."
npm run build
cd ..
echo "✅ ATProto dependencies installed and built"
echo ""

# Community Stream Lexicon
echo "📋 Installing Community Stream Lexicon dependencies..."
cd community-stream-lexicon
npm install
npm run build
cd ..
echo "✅ Community Stream Lexicon dependencies installed and built"
echo ""

# Pinata Integration
echo "🌐 Installing Pinata Integration dependencies..."
cd pinata-integration
npm install
cd ..
echo "✅ Pinata Integration dependencies installed"
echo ""

echo "🎉 All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables"
echo "2. Run: npm run setup:env"
echo "3. Start services"

