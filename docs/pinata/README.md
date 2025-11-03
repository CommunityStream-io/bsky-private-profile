# Pinata Integration Documentation

The Pinata integration service manages IPFS private gateway provisioning and token management for private profile features.

## Overview

This service provides:

- **Private Gateway Management** - Per-profile IPFS private gateways
- **Token Generation** - Secure access tokens for private content
- **Blob Upload Routing** - Routes media uploads through appropriate gateways
- **Access Control** - Enforces privacy settings for media content

## Technology Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Package Manager:** npm
- **Default Port:** 3000

## What is Pinata?

[Pinata](https://www.pinata.cloud/) is an IPFS pinning service that provides:

- Reliable IPFS storage
- Private gateways for access-controlled content
- High-performance content delivery
- Management APIs

## Why Use Pinata for Private Profiles?

The Bluesky Private Profile feature needs to restrict access to media content (images, videos) based on user privacy settings. Pinata's private gateways enable:

1. **Access Control** - Only authorized users can access content
2. **Token-Based Authentication** - Secure, time-limited access tokens
3. **Per-Profile Gateways** - Each private profile gets its own gateway
4. **Seamless Integration** - Works with existing AT Protocol infrastructure

## Service Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Bluesky    │────▶│   Pinata     │────▶│   Pinata    │
│    App      │     │ Integration  │     │   Service   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     PDS      │
                    └──────────────┘
```

## Documentation

- **[Setup Guide](setup.md)** - Installation, configuration, and getting started

## Quick Start

```bash
# Navigate to pinata-integration directory
cd pinata-integration

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your Pinata credentials
# (Get credentials from https://pinata.cloud)

# Start the service
npm run dev
```

## Configuration

The service requires Pinata API credentials:

- **Pinata API Key** - Your Pinata API key
- **Pinata API Secret** - Your Pinata API secret
- **JWT Secret** - Secret for signing tokens

See the [Setup Guide](setup.md) for detailed configuration instructions.

## API Endpoints

The service provides endpoints for:

- Creating private gateways
- Generating access tokens
- Managing gateway configuration
- Uploading blobs through gateways

## Next Steps

1. Follow the [Setup Guide](setup.md) to configure the service
2. Obtain Pinata API credentials from [pinata.cloud](https://www.pinata.cloud/)
3. Start the service and test with your PDS

---

**Note:** This service is optional. The basic Bluesky functionality works without it, but private profile media features require Pinata integration.
