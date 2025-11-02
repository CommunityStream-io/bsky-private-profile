#!/bin/bash
# install-manual.sh - Manual installation for each submodule

set -e  # Exit on error

echo "📦 Manual Installation - bsky-private-profile"
echo ""
echo "Each submodule will be installed with its native package manager:"
echo ""
echo "  • bluesky-app: yarn"
echo "  • atproto: pnpm (workspace)"
echo "  • community-stream-lexicon: npm"
echo "  • pinata-integration: npm"
echo ""

# Track results
SUCCESS=()
FAILED=()
SKIPPED=()

# Function to run installation
install_module() {
    local dir=$1
    local name=$2
    local command=$3
    
    echo "========================================================"
    echo "📁 $name"
    echo "========================================================"
    
    if [ ! -d "$dir" ]; then
        echo "⊘  Directory not found, skipping..."
        SKIPPED+=("$name")
        echo ""
        return
    fi
    
    echo "Running: $command"
    echo "In: $dir"
    echo ""
    
    if (cd "$dir" && eval "$command"); then
        echo ""
        echo "✅ $name - Success!"
        SUCCESS+=("$name")
    else
        echo ""
        echo "❌ $name - Failed!"
        FAILED+=("$name")
    fi
    
    echo ""
}

# 1. Install bluesky-app (Yarn)
echo "📱 Installing bluesky-app with Yarn..."
install_module "bluesky-app" "bluesky-app (Yarn)" "corepack yarn install"

# 2. Install atproto (pnpm workspace)
echo "🔷 Installing atproto with pnpm..."
echo ""
echo "💡 Installing with --ignore-scripts to avoid native module compilation issues..."
echo ""
install_module "atproto" "atproto (pnpm workspace)" "pnpm install --ignore-scripts"

if [[ " ${SUCCESS[@]} " =~ " atproto (pnpm workspace) " ]]; then
    echo "ℹ️  Note: Some native modules may not work (better-sqlite3)"
    echo "   This is OK if you're not running the PDS server locally."
    echo ""
fi

# 3. Install community-stream-lexicon (npm)
echo "📚 Installing community-stream-lexicon with npm..."
install_module "community-stream-lexicon" "community-stream-lexicon (npm)" "npm install"

# 4. Install pinata-integration (npm)
echo "📌 Installing pinata-integration with npm..."
install_module "pinata-integration" "pinata-integration (npm)" "npm install"

# 5. Install root dependencies
echo "📦 Installing root dependencies..."
install_module "." "Root (npm)" "npm install"

# Summary
echo "========================================================"
echo "📊 INSTALLATION SUMMARY"
echo "========================================================"
echo ""

if [ ${#SUCCESS[@]} -gt 0 ]; then
    echo "✅ Successful (${#SUCCESS[@]}):"
    for item in "${SUCCESS[@]}"; do
        echo "   • $item"
    done
    echo ""
fi

if [ ${#FAILED[@]} -gt 0 ]; then
    echo "❌ Failed (${#FAILED[@]}):"
    for item in "${FAILED[@]}"; do
        echo "   • $item"
    done
    echo ""
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
    echo "⊘  Skipped (${#SKIPPED[@]}):"
    for item in "${SKIPPED[@]}"; do
        echo "   • $item"
    done
    echo ""
fi

echo "========================================================"

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Some installations failed. Please check the errors above."
    echo "   You may need to install each module manually."
    echo ""
    exit 1
else
    echo ""
    echo "🎉 All installations completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  • Configure environment files (see SETUP_NOTES.md)"
    echo "  • Run: npm run dev:app (for bluesky app)"
    echo "  • Run: npm run dev:pds (for PDS server - if atproto installed)"
    echo "  • Run: npm run dev:pinata (for Pinata integration)"
    echo ""
fi

