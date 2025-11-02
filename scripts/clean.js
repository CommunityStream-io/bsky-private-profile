#!/usr/bin/env node
/**
 * Clean script for bsky-private-profile workspace
 * Removes node_modules, build artifacts, and cache files from all submodules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning bsky-private-profile workspace\n');

const rootDir = path.join(__dirname, '..');

// Directories and files to clean
const cleanTargets = [
  // Node modules
  'node_modules',
  
  // Build outputs
  'dist',
  'build',
  '.next',
  'out',
  '.expo',
  '.expo-shared',
  
  // Cache directories
  '.cache',
  '.turbo',
  '.eslintcache',
  '.parcel-cache',
  'tsconfig.tsbuildinfo',
  
  // Test coverage
  'coverage',
  
  // Logs
  'logs',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',
];

// Submodules to clean
const submodules = [
  'bluesky-app',
  'atproto/packages/pds',
  'atproto/packages/api',
  'atproto/packages/bsky',
  'atproto/packages/identity',
  'atproto/packages/oauth',
  'community-stream-lexicon',
  'pinata-integration',
];

/**
 * Recursively delete a directory
 */
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error(`  ⚠️  Failed to delete ${dirPath}: ${error.message}`);
      return false;
    }
  }
  return false;
}

/**
 * Clean a specific directory
 */
function cleanDirectory(dir) {
  const fullPath = path.join(rootDir, dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⊘  ${dir} (not found, skipping)`);
    return;
  }
  
  console.log(`📁 Cleaning ${dir}...`);
  
  let cleaned = 0;
  cleanTargets.forEach(target => {
    const targetPath = path.join(fullPath, target);
    
    // Handle glob patterns for log files
    if (target.includes('*')) {
      const dirPath = path.dirname(targetPath);
      const pattern = path.basename(target);
      
      if (fs.existsSync(dirPath)) {
        try {
          const files = fs.readdirSync(dirPath);
          const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
          
          files.forEach(file => {
            if (regex.test(file)) {
              const filePath = path.join(dirPath, file);
              if (fs.lstatSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                console.log(`  ✓ Deleted ${file}`);
                cleaned++;
              }
            }
          });
        } catch (error) {
          // Ignore errors for glob patterns
        }
      }
    } else if (deleteDirectory(targetPath)) {
      console.log(`  ✓ Deleted ${target}`);
      cleaned++;
    }
  });
  
  if (cleaned === 0) {
    console.log(`  ✓ Already clean`);
  }
}

// Clean root directory
console.log('🏠 Root directory');
cleanDirectory('.');
console.log('');

// Clean each submodule
console.log('📦 Submodules\n');
submodules.forEach(submodule => {
  cleanDirectory(submodule);
  console.log('');
});

// Clean iOS build artifacts (bluesky-app specific)
const iosDir = path.join(rootDir, 'bluesky-app', 'ios');
if (fs.existsSync(iosDir)) {
  console.log('📱 iOS build artifacts');
  ['Pods', 'Podfile.lock', 'build'].forEach(target => {
    const targetPath = path.join(iosDir, target);
    if (deleteDirectory(targetPath)) {
      console.log(`  ✓ Deleted ios/${target}`);
    }
  });
  console.log('');
}

// Clean Android build artifacts (bluesky-app specific)
const androidDir = path.join(rootDir, 'bluesky-app', 'android');
if (fs.existsSync(androidDir)) {
  console.log('🤖 Android build artifacts');
  ['.gradle', 'build', 'app/build'].forEach(target => {
    const targetPath = path.join(androidDir, target);
    if (deleteDirectory(targetPath)) {
      console.log(`  ✓ Deleted android/${target}`);
    }
  });
  console.log('');
}

// Clean pnpm store (optional, aggressive clean)
const args = process.argv.slice(2);
if (args.includes('--deep') || args.includes('-d')) {
  console.log('🔥 Deep clean: Removing pnpm store cache...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
    console.log('✓ pnpm store pruned\n');
  } catch (error) {
    console.error('⚠️  Failed to prune pnpm store\n');
  }
}

console.log('✅ Workspace cleaned successfully!\n');
console.log('Next steps:');
console.log('  pnpm install        - Reinstall dependencies');
console.log('  pnpm install:all    - Full reinstall with build');
console.log('  pnpm dev           - Start development\n');

if (!args.includes('--deep') && !args.includes('-d')) {
  console.log('💡 Tip: Use --deep or -d flag for deep clean (includes pnpm store)\n');
}

