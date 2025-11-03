# Pinata Integration Setup

Setup guide for the Pinata integration service that manages private IPFS gateways.

## What is This Service?

The Pinata integration service provisions and manages private IPFS gateways for users with private profiles. It provides:

- **Gateway Provisioning** - Creates dedicated private gateways per user
- **Token Generation** - Issues time-limited access tokens for authorized viewers
- **Access Control** - Enforces media visibility rules
- **Gateway Management** - Handles gateway lifecycle

## Prerequisites

- **Node.js 20** (see [Prerequisites](../getting-started/prerequisites.md))
- **npm** package manager
- **Pinata Account** with API credentials

## Getting Pinata Credentials

1. **Sign up** at [pinata.cloud](https://www.pinata.cloud/)
2. **Navigate** to API Keys section
3. **Create new key** with permissions:
   - Create gateways
   - Manage gateways
   - Generate tokens
4. **Save credentials**:
   - API Key
   - API Secret

## Installation

### Step 1: Navigate to Directory

```bash
cd pinata-integration
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp env.example .env
```

### Step 4: Configure Environment

Edit `.env` with your credentials:

```bash
# Pinata API Credentials
PINATA_API_KEY=your_api_key_here
PINATA_API_SECRET=your_api_secret_here

# JWT Secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_here

# Service Configuration
PORT=3000
NODE_ENV=development

# PDS Configuration (for callbacks)
PDS_URL=http://localhost:2583
```

**Generate JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Starting the Service

### Development Mode

```bash
npm run dev
```

The service will start with hot reloading on `http://localhost:3000`.

### Production Mode

```bash
npm run build
npm start
```

## Verifying Installation

### Health Check

```bash
curl http://localhost:3000/health
```

**Expected response:**

```json
{
  "status": "ok",
  "service": "pinata-integration",
  "timestamp": "2024-11-03T12:00:00.000Z"
}
```

### Test Gateway Provisioning

```bash
curl -X POST http://localhost:3000/api/gateway/provision \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "did:plc:test123"
  }'
```

**Expected response:**

```json
{
  "gatewayId": "gateway-xxx",
  "gatewayUrl": "https://gateway-xxx.mypinata.cloud",
  "userId": "did:plc:test123"
}
```

## API Endpoints

### Provision Gateway

```
POST /api/gateway/provision
Content-Type: application/json

{
  "userId": "did:plc:xxx"
}
```

Creates a new private gateway for a user.

### Generate Access Token

```
POST /api/token/generate
Content-Type: application/json

{
  "gatewayId": "gateway-xxx",
  "userId": "did:plc:xxx",
  "grantTo": "did:plc:yyy",
  "expiresIn": 3600
}
```

Generates a time-limited token for accessing gateway content.

### Delete Gateway

```
DELETE /api/gateway/:gatewayId
```

Deletes a gateway when user makes profile public again.

### List Gateways

```
GET /api/gateway/user/:userId
```

Lists all gateways for a user.

## Integration with PDS

The PDS calls this service when:

1. **User makes profile private** → Provision gateway
2. **Authorized user requests media** → Generate token
3. **User makes profile public** → Delete gateway

**PDS Configuration:**

In your PDS `.env`, add:

```bash
PINATA_SERVICE_URL=http://localhost:3000
```

**PDS Code Example:**

```typescript
// When user makes profile private
const response = await fetch(`${PINATA_SERVICE_URL}/api/gateway/provision`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: user.did }),
});
const { gatewayId, gatewayUrl } = await response.json();
```

## Configuration Options

### Environment Variables

| Variable                | Required | Default                 | Description                    |
| ----------------------- | -------- | ----------------------- | ------------------------------ |
| `PINATA_API_KEY`        | Yes      | -                       | Pinata API key                 |
| `PINATA_API_SECRET`     | Yes      | -                       | Pinata API secret              |
| `JWT_SECRET`            | Yes      | -                       | Secret for signing tokens      |
| `PORT`                  | No       | `3000`                  | Service port                   |
| `NODE_ENV`              | No       | `development`           | Environment                    |
| `PDS_URL`               | No       | `http://localhost:2583` | PDS URL                        |
| `TOKEN_EXPIRY`          | No       | `3600`                  | Default token expiry (seconds) |
| `MAX_GATEWAYS_PER_USER` | No       | `1`                     | Max gateways per user          |

### Token Configuration

**Default token expiry:** 1 hour (3600 seconds)

**Token includes:**

- User DID (owner of content)
- Grantee DID (viewer)
- Gateway ID
- Expiration timestamp
- Signature

## Troubleshooting

### Service Won't Start

**Problem:** Port already in use

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Or change port in `.env`:**

```bash
PORT=3001
```

### Pinata API Errors

**Problem:** Invalid credentials

**Error:**

```
Error: Unauthorized - Invalid API key
```

**Solution:**

1. Verify API key and secret in `.env`
2. Check key hasn't been revoked in Pinata dashboard
3. Ensure key has correct permissions

**Problem:** Rate limit exceeded

**Error:**

```
Error: Too many requests
```

**Solution:**

- Implement caching of gateway info
- Reduce frequency of API calls
- Upgrade Pinata plan

### Gateway Creation Fails

**Problem:** Quota exceeded

**Error:**

```
Error: Gateway limit reached
```

**Solution:**

- Check Pinata plan limits
- Delete unused gateways
- Upgrade plan if needed

### Token Validation Fails

**Problem:** Invalid JWT

**Solution:**

1. Verify `JWT_SECRET` matches between service instances
2. Check token hasn't expired
3. Ensure token format is correct

## Development

### Running Tests

```bash
npm test
```

### Running with Debug Logs

```bash
DEBUG=pinata:* npm run dev
```

### Code Structure

```
pinata-integration/
├── src/
│   ├── index.ts           # Entry point
│   ├── api/               # API routes
│   │   ├── gateway.ts    # Gateway endpoints
│   │   └── token.ts      # Token endpoints
│   ├── services/          # Business logic
│   │   ├── pinata.ts     # Pinata API client
│   │   └── token.ts      # Token generation
│   └── utils/             # Utilities
├── env.example            # Environment template
├── package.json
└── tsconfig.json
```

## Production Deployment

### Requirements

- **Node.js 20** on server
- **HTTPS** recommended
- **Environment variables** configured
- **Process manager** (PM2, systemd)

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start npm --name pinata-service -- start

# Save configuration
pm2 save

# Set up startup script
pm2 startup
```

### Docker Deployment

**Dockerfile:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Build and run:**

```bash
docker build -t pinata-service .
docker run -p 3000:3000 --env-file .env pinata-service
```

## Security Considerations

### API Security

1. **Always use HTTPS** in production
2. **Validate all inputs** before calling Pinata API
3. **Rate limit endpoints** to prevent abuse
4. **Log all operations** for auditing
5. **Keep credentials secure** - never commit `.env`

### Token Security

1. **Short expiry times** - Default 1 hour
2. **Include user context** - Verify DID matches
3. **Sign tokens** - Prevent tampering
4. **Validate on use** - Always check expiry and signature

## Monitoring

### Health Checks

Set up monitoring to check:

```bash
curl http://localhost:3000/health
```

Expected uptime: 99.9%

### Metrics to Monitor

- Gateway creation rate
- Token generation rate
- API error rate
- Response times
- Pinata API quota usage

## Cost Considerations

### Pinata Pricing

- **Free tier**: Limited gateways and bandwidth
- **Paid tiers**: More gateways and bandwidth

**Estimate costs based on:**

- Number of private profiles
- Media access frequency
- Gateway bandwidth usage

### Optimization

- **Reuse gateways** when possible
- **Cache gateway info** to reduce API calls
- **Set appropriate token expiry** to balance security and API usage

## Next Steps

- [Pinata Documentation](https://docs.pinata.cloud/) - Official Pinata docs
- [PDS Configuration](../pds/configuration.md) - Configure PDS to use this service
- [Architecture](../architecture/components.md) - How this fits into the system

---

**Note:** This service is optional. The basic Bluesky functionality works without it, but private profile media features require Pinata integration.
