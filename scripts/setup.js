#!/usr/bin/env node
/**
 * Setup script for bsky-private-profile workspace
 * Checks prerequisites and guides through configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 bsky-private-profile Setup\n');

// Check Node version
const nodeVersion = process.version;
const requiredNodeVersion = '18.0.0';
console.log(`✓ Node.js version: ${nodeVersion}`);

// Check pnpm installation
try {
  const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  console.log(`✓ pnpm version: ${pnpmVersion}`);
} catch (error) {
  console.log('✗ pnpm not installed');
  console.log('\n📦 Installing pnpm...');
  execSync('npm install -g pnpm', { stdio: 'inherit' });
  console.log('✓ pnpm installed');
}

console.log('\n📋 Checking submodules...');

const submodules = ['bluesky-app', 'atproto', 'community-stream-lexicon', 'pinata-integration'];
const missingSubmodules = [];

submodules.forEach(submodule => {
  const submodulePath = path.join(__dirname, '..', submodule);
  if (fs.existsSync(submodulePath)) {
    console.log(`✓ ${submodule}`);
  } else {
    console.log(`✗ ${submodule} (missing)`);
    missingSubmodules.push(submodule);
  }
});

if (missingSubmodules.length > 0) {
  console.log('\n⚠️  Some submodules are missing. Run:');
  console.log('   git submodule update --init --recursive');
  process.exit(1);
}

console.log('\n📝 Environment Configuration\n');

// Check for environment files
const envFiles = [
  { path: 'bluesky-app/.env.local', example: 'bluesky-app/.env.example' },
  { path: 'atproto/packages/pds/.env', example: 'atproto/packages/pds/.env.example' },
  { path: 'pinata-integration/.env', example: 'pinata-integration/env.example' }
];

let needsEnvConfig = false;

envFiles.forEach(({ path: envPath, example }) => {
  const fullPath = path.join(__dirname, '..', envPath);
  const examplePath = path.join(__dirname, '..', example);
  
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${envPath}`);
  } else {
    console.log(`✗ ${envPath} (not configured)`);
    if (fs.existsSync(examplePath)) {
      console.log(`  → Copy from: ${example}`);
    }
    needsEnvConfig = true;
  }
});

if (needsEnvConfig) {
  console.log('\n⚠️  Some environment files need configuration.');
  console.log('   See SETUP_NOTES.md for details.');
}

console.log('\n✅ Setup check complete!\n');
console.log('Next steps:');
console.log('1. Configure missing environment files (if any)');
console.log('2. Run: pnpm install:all');
console.log('3. Run: pnpm dev (to start all services)');
console.log('4. Open: http://localhost:19006\n');

