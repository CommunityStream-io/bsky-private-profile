#!/bin/bash
# clean.sh - Clean all build artifacts and node_modules from workspace

set -e  # Exit on error

echo "🧹 Cleaning bsky-private-profile workspace"
echo ""

# Parse arguments
DEEP_CLEAN=false
if [[ "$*" == *"--deep"* ]] || [[ "$*" == *"-d"* ]]; then
    DEEP_CLEAN=true
fi

# Function to clean a directory
clean_dir() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo "  ✓ Deleted $name"
        rm -rf "$dir"
    fi
}

# Function to clean a file
clean_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo "  ✓ Deleted $name"
        rm -f "$file"
    fi
}

# Clean root directory
echo "🏠 Root directory"
clean_dir "node_modules" "node_modules"
clean_dir ".cache" ".cache"
clean_dir "logs" "logs"
clean_file ".eslintcache" ".eslintcache"
find . -maxdepth 1 -name "*-debug.log*" -type f -delete 2>/dev/null || true
echo ""

# Clean bluesky-app
echo "📱 bluesky-app"
if [ -d "bluesky-app" ]; then
    cd bluesky-app
    clean_dir "node_modules" "node_modules"
    clean_dir "dist" "dist"
    clean_dir "build" "build"
    clean_dir ".expo" ".expo"
    clean_dir ".expo-shared" ".expo-shared"
    clean_dir ".cache" ".cache"
    clean_dir "coverage" "coverage"
    clean_file ".eslintcache" ".eslintcache"
    find . -maxdepth 1 -name "*-debug.log*" -type f -delete 2>/dev/null || true
    
    # iOS
    if [ -d "ios" ]; then
        echo "  📱 iOS"
        cd ios
        clean_dir "Pods" "Pods"
        clean_dir "build" "build"
        clean_file "Podfile.lock" "Podfile.lock"
        cd ..
    fi
    
    # Android
    if [ -d "android" ]; then
        echo "  🤖 Android"
        cd android
        clean_dir ".gradle" ".gradle"
        clean_dir "build" "build"
        clean_dir "app/build" "app/build"
        cd ..
    fi
    
    cd ..
else
    echo "  ⊘ Not found"
fi
echo ""

# Clean atproto packages
echo "📦 atproto packages"
if [ -d "atproto/packages" ]; then
    for pkg in atproto/packages/*; do
        if [ -d "$pkg" ]; then
            pkg_name=$(basename "$pkg")
            echo "  📦 $pkg_name"
            cd "$pkg"
            clean_dir "node_modules" "node_modules"
            clean_dir "dist" "dist"
            clean_dir "build" "build"
            clean_dir ".cache" ".cache"
            clean_file "tsconfig.tsbuildinfo" "tsconfig.tsbuildinfo"
            cd - > /dev/null
        fi
    done
else
    echo "  ⊘ Not found"
fi
echo ""

# Clean community-stream-lexicon
echo "📦 community-stream-lexicon"
if [ -d "community-stream-lexicon" ]; then
    cd community-stream-lexicon
    clean_dir "node_modules" "node_modules"
    clean_dir "dist" "dist"
    clean_dir "build" "build"
    clean_file "tsconfig.tsbuildinfo" "tsconfig.tsbuildinfo"
    cd ..
else
    echo "  ⊘ Not found"
fi
echo ""

# Clean pinata-integration
echo "📦 pinata-integration"
if [ -d "pinata-integration" ]; then
    cd pinata-integration
    clean_dir "node_modules" "node_modules"
    clean_dir "dist" "dist"
    clean_dir "build" "build"
    clean_file "tsconfig.tsbuildinfo" "tsconfig.tsbuildinfo"
    cd ..
else
    echo "  ⊘ Not found"
fi
echo ""

# Deep clean - prune pnpm store
if [ "$DEEP_CLEAN" = true ]; then
    echo "🔥 Deep clean: Removing pnpm store cache..."
    pnpm store prune || echo "  ⚠️  Failed to prune pnpm store"
    echo ""
fi

echo "✅ Workspace cleaned successfully!"
echo ""
echo "Next steps:"
echo "  pnpm install        - Reinstall dependencies"
echo "  pnpm install:all    - Full reinstall with build"
echo "  pnpm dev           - Start development"
echo ""

if [ "$DEEP_CLEAN" = false ]; then
    echo "💡 Tip: Use --deep or -d flag for deep clean (includes pnpm store)"
    echo ""
fi

