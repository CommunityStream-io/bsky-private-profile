#!/usr/bin/env node
/**
 * Manual installation script for bsky-private-profile workspace
 * Installs each submodule using its native package manager
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Manual Installation - bsky-private-profile\n');
console.log('Each submodule will be installed with its native package manager:\n');
console.log('  • bluesky-app: yarn');
console.log('  • atproto: pnpm (workspace)');
console.log('  • community-stream-lexicon: npm');
console.log('  • pinata-integration: npm\n');

const rootDir = path.join(__dirname, '..');

/**
 * Run a command in a specific directory
 */
function runCommand(command, cwd, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📁 ${label}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Running: ${command}`);
  console.log(`In: ${cwd}\n`);
  
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    console.log(`\n✅ ${label} - Success!\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${label} - Failed!`);
    console.error(`Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Check if a directory exists
 */
function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
}

// Track results
const results = {
  success: [],
  failed: [],
  skipped: []
};

// 1. Install bluesky-app (Yarn)
const blueskyAppDir = path.join(rootDir, 'bluesky-app');
if (dirExists(blueskyAppDir)) {
  console.log('📱 Installing bluesky-app with Yarn...');
  
  // Check if yarn is available
  try {
    execSync('yarn --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('⚠️  Yarn not found globally, using corepack...');
  }
  
  // Try with --network-timeout for OneDrive sync issues
  const success = runCommand(
    'corepack yarn install --network-timeout 100000',
    blueskyAppDir,
    'bluesky-app (Yarn)'
  );
  
  if (success) {
    results.success.push('bluesky-app');
  } else {
    console.log('\n⚠️  If installation failed due to permissions:');
    console.log('   1. Close all apps using node_modules (VS Code, terminals)');
    console.log('   2. Pause OneDrive sync temporarily');
    console.log('   3. Try again\n');
    results.failed.push('bluesky-app');
  }
} else {
  console.log('⊘  bluesky-app directory not found, skipping...\n');
  results.skipped.push('bluesky-app');
}

// 2. Install atproto (pnpm workspace)
const atprotoDir = path.join(rootDir, 'atproto');
if (dirExists(atprotoDir)) {
  console.log('🔷 Installing atproto with pnpm...');
  
  // Check if pnpm is available
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ pnpm not found! Installing globally...');
    try {
      execSync('npm install -g pnpm@8.15.9', { stdio: 'inherit' });
    } catch (installError) {
      console.error('❌ Failed to install pnpm');
      results.failed.push('atproto');
    }
  }
  
  // Set environment variable to skip corepack prompts
  process.env.COREPACK_ENABLE_STRICT = '0';
  
  // Try with --ignore-scripts to avoid native module issues
  console.log('\n💡 Installing with --ignore-scripts to avoid native module compilation issues...\n');
  
  const success = runCommand(
    'pnpm install --ignore-scripts --no-frozen-lockfile',
    atprotoDir,
    'atproto (pnpm workspace - safe mode)'
  );
  
  if (success) {
    results.success.push('atproto');
    console.log('ℹ️  Note: Some native modules may not work (better-sqlite3)');
    console.log('   This is OK if you\'re not running the PDS server locally.\n');
  } else {
    results.failed.push('atproto');
  }
} else {
  console.log('⊘  atproto directory not found, skipping...\n');
  results.skipped.push('atproto');
}

// 3. Install community-stream-lexicon (npm)
const lexiconDir = path.join(rootDir, 'community-stream-lexicon');
if (dirExists(lexiconDir)) {
  console.log('📚 Installing community-stream-lexicon with npm...');
  
  const success = runCommand(
    'npm install',
    lexiconDir,
    'community-stream-lexicon (npm)'
  );
  
  if (success) {
    results.success.push('community-stream-lexicon');
  } else {
    results.failed.push('community-stream-lexicon');
  }
} else {
  console.log('⊘  community-stream-lexicon directory not found, skipping...\n');
  results.skipped.push('community-stream-lexicon');
}

// 4. Install pinata-integration (npm)
const pinataDir = path.join(rootDir, 'pinata-integration');
if (dirExists(pinataDir)) {
  console.log('📌 Installing pinata-integration with npm...');
  
  const success = runCommand(
    'npm install',
    pinataDir,
    'pinata-integration (npm)'
  );
  
  if (success) {
    results.success.push('pinata-integration');
  } else {
    results.failed.push('pinata-integration');
  }
} else {
  console.log('⊘  pinata-integration directory not found, skipping...\n');
  results.skipped.push('pinata-integration');
}

// 5. Install root dependencies (minimal)
console.log('📦 Installing root dependencies...');
const rootSuccess = runCommand(
  'npm install',
  rootDir,
  'Root (npm)'
);

if (rootSuccess) {
  results.success.push('root');
} else {
  results.failed.push('root');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 INSTALLATION SUMMARY');
console.log('='.repeat(60) + '\n');

if (results.success.length > 0) {
  console.log(`✅ Successful (${results.success.length}):`);
  results.success.forEach(item => console.log(`   • ${item}`));
  console.log('');
}

if (results.failed.length > 0) {
  console.log(`❌ Failed (${results.failed.length}):`);
  results.failed.forEach(item => console.log(`   • ${item}`));
  console.log('');
}

if (results.skipped.length > 0) {
  console.log(`⊘  Skipped (${results.skipped.length}):`);
  results.skipped.forEach(item => console.log(`   • ${item}`));
  console.log('');
}

console.log('='.repeat(60));

if (results.failed.length > 0) {
  console.log('\n⚠️  Some installations failed. Please check the errors above.');
  console.log('   You may need to install each module manually.\n');
  process.exit(1);
} else {
  console.log('\n🎉 All installations completed successfully!\n');
  console.log('Next steps:');
  console.log('  • Configure environment files (see SETUP_NOTES.md)');
  console.log('  • Run: npm run dev:app (for bluesky app)');
  console.log('  • Run: npm run dev:pds (for PDS server - if atproto installed)');
  console.log('  • Run: npm run dev:pinata (for Pinata integration)\n');
}

