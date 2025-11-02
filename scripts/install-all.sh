#!/bin/bash
# install-all.sh - Install dependencies for all submodules using pnpm workspace

set -e  # Exit on error

echo "🚀 Installing dependencies using pnpm workspace..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found!"
    echo ""
    echo "📦 Installing pnpm globally..."
    npm install -g pnpm
    echo "✅ pnpm installed"
    echo ""
fi

# Display pnpm version
echo "📦 pnpm version: $(pnpm --version)"
echo ""

# Install all workspace dependencies
echo "📥 Installing all workspace dependencies..."
pnpm install
echo ""

# Build all packages that need building
echo "🏗️  Building all packages..."
pnpm -r build
echo ""

echo "🎉 All dependencies installed and built successfully!"
echo ""
echo "Available commands:"
echo "  pnpm dev              - Run all services in parallel"
echo "  pnpm dev:app          - Run bluesky app only"
echo "  pnpm dev:pds          - Run PDS server only"
echo "  pnpm dev:pinata       - Run Pinata integration only"
echo "  pnpm start:all        - Run all services with concurrently"
echo "  pnpm build:all        - Build all packages"
echo "  pnpm test             - Run all tests"
echo ""
echo "Next steps:"
echo "1. Configure environment variables (see SETUP_NOTES.md)"
echo "2. Run: pnpm dev (to start all services)"
echo "3. Open http://localhost:19006 for app, http://localhost:2583 for PDS"
