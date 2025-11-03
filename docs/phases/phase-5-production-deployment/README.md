# Phase 5: Production Deployment Preparation ⏳ PENDING

**Status:** ⏳ Pending  
**Duration:** 1 week + infrastructure setup  
**Requires:** Public server with domain name  
**Prerequisites:** Phases 1-4 complete

## Overview

Deploy PDS to a public server with a domain name to enable full federation, proper handle resolution, and real-world testing.

## Why This Phase

Local development has limitations:
- Handles show as `handle.invalid`
- No federation with other PDSs
- Public AppView can't verify accounts
- Can't test full social features

**Production deployment solves all these issues.**

## Goals

- [ ] Acquire and configure domain
- [ ] Deploy PDS to public server
- [ ] Set up handle verification
- [ ] Enable full federation
- [ ] Real-world testing

## Tasks Breakdown

### 5.1 Domain & DNS Setup

#### Acquire Domain

**Options:**
- Use existing domain (e.g., `yourdomain.com`)
- Purchase new domain (e.g., `yourproject.app`)

**Recommended structure:**
- **PDS**: `pds.yourdomain.com`
- **Handles**: `*.yourdomain.com` or `username.yourdomain.com`

#### DNS Configuration

**Required records:**
```
# PDS server
A     pds.yourdomain.com    →  Your-Server-IP

# Handle verification (wildcard)
A     *.yourdomain.com       →  Your-Server-IP

# Or specific handles
A     alice.yourdomain.com   →  Your-Server-IP
```

**Tasks:**
- [ ] Acquire/configure domain
- [ ] Set up DNS records
- [ ] Verify DNS propagation
- [ ] Document configuration

#### SSL/TLS Certificates

**Required for:**
- HTTPS (mandatory for federation)
- Handle verification
- Security

**Options:**
- **Let's Encrypt** (free, automated)
- **Cloudflare** (free, includes CDN)
- **Commercial SSL** (paid)

**Setup with Let's Encrypt:**
```bash
# Using Certbot
sudo certbot --nginx -d pds.yourdomain.com -d *.yourdomain.com
```

**Tasks:**
- [ ] Install SSL certificates
- [ ] Configure auto-renewal
- [ ] Test HTTPS access
- [ ] Document setup

### 5.2 Public PDS Deployment

#### Server Requirements

**Minimum specs:**
- 2 CPU cores
- 4 GB RAM
- 50 GB storage (SSD recommended)
- Ubuntu 22.04 or similar

**Recommended providers:**
- DigitalOcean
- Linode
- AWS EC2
- Google Cloud
- Hetzner

#### Deployment Options

**Option A: Docker Deployment (Recommended)**

```bash
# On server
git clone https://github.com/CommunityStream-io/pds
cd pds

# Configure
cp .env.example .env
# Edit .env with production settings

# Start with Docker Compose
docker compose up -d
```

**Option B: Native Deployment**

```bash
# Build locally
cd atproto
pnpm build

# Deploy to server
rsync -avz packages/pds/dist/ server:/opt/pds/
ssh server 'pm2 start /opt/pds/index.js'
```

**Tasks:**
- [ ] Provision server
- [ ] Install dependencies
- [ ] Deploy PDS
- [ ] Configure environment
- [ ] Start services
- [ ] Verify health

#### Production Configuration

**Key settings:**
```bash
# Server
PDS_HOSTNAME="pds.yourdomain.com"
PDS_PORT="443"

# Disable dev mode
PDS_DEV_MODE="false"

# Handle domains
PDS_SERVICE_HANDLE_DOMAINS=".yourdomain.com"

# Database (use PostgreSQL in production)
PDS_DB_POSTGRES_URL="postgresql://user:pass@localhost:5432/pds"

# Email (for account verification)
PDS_EMAIL_SMTP_URL="smtps://user:pass@smtp.provider.com:465"
PDS_EMAIL_FROM_ADDRESS="noreply@yourdomain.com"

# Security
PDS_JWT_SECRET="strong-random-secret"
PDS_ADMIN_PASSWORD="strong-admin-password"
```

**Tasks:**
- [ ] Configure for production
- [ ] Set strong secrets
- [ ] Enable email
- [ ] Set up backups
- [ ] Configure monitoring

### 5.3 Handle Verification

#### Setup HTTP Well-Known

**Method 1: Static Files (Simple)**

For each handle, create:
```
https://alice.yourdomain.com/.well-known/atproto-did
Content: did:plc:xxx
```

**Nginx config:**
```nginx
server {
    listen 443 ssl;
    server_name *.yourdomain.com;
    
    location /.well-known/atproto-did {
        root /var/www/atproto;
    }
}
```

**Method 2: Dynamic Handler (Scalable)**

**Node.js service:**
```javascript
app.get('/.well-known/atproto-did', async (req, res) => {
  const handle = req.hostname;
  const did = await lookupDID(handle);
  res.type('text/plain').send(did);
});
```

**Method 3: DNS TXT Records (Alternative)**

```
_atproto.alice.yourdomain.com TXT "did=did:plc:xxx"
```

**Tasks:**
- [ ] Choose verification method
- [ ] Implement handler
- [ ] Test verification
- [ ] Document setup

#### Test Handle Resolution

```bash
# Test well-known endpoint
curl https://alice.yourdomain.com/.well-known/atproto-did

# Test via public AppView
curl "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=alice.yourdomain.com"
```

**Tasks:**
- [ ] Test local resolution
- [ ] Test public resolution
- [ ] Verify no `handle.invalid`
- [ ] Test multiple handles

### 5.4 App Configuration

#### Update App to Use Production PDS

**For testing:**
```typescript
// In .env.production or constants
export const PRODUCTION_PDS = 'https://pds.yourdomain.com';
```

**For release:**
- Configure OAuth properly
- Set production endpoints
- Test authentication flow
- Verify all features work

**Tasks:**
- [ ] Update app configuration
- [ ] Test with production PDS
- [ ] Verify handle resolution
- [ ] Test all features end-to-end

## Testing Strategy

### Pre-Deployment Checklist
- [ ] DNS configured and propagated
- [ ] SSL certificates installed
- [ ] PDS starts successfully
- [ ] Health endpoint responds
- [ ] Database connected
- [ ] Email configured (if applicable)

### Post-Deployment Testing
- [ ] Create test account
- [ ] Verify handle resolves correctly
- [ ] Test from Bluesky app
- [ ] Test private profile features
- [ ] Test follow requests
- [ ] Test media access
- [ ] Test federation with other PDSs

### Performance Testing
- [ ] Load testing
- [ ] Response times acceptable
- [ ] Database performance
- [ ] Media serving speed

## Success Criteria

- [ ] PDS accessible via HTTPS
- [ ] Handles resolve without `handle.invalid`
- [ ] Can create accounts with custom domain handles
- [ ] Federation works with Bluesky network
- [ ] All private profile features work
- [ ] Performance acceptable
- [ ] No security vulnerabilities

## Deliverables

1. **Deployed PDS**
   - Running on public server
   - Accessible via HTTPS
   - Production configuration

2. **Domain Configuration**
   - DNS records configured
   - SSL certificates installed
   - Handle verification working

3. **Documentation**
   - Deployment guide
   - Configuration reference
   - Troubleshooting guide
   - Backup/restore procedures

4. **Monitoring**
   - Health checks
   - Error logging
   - Performance metrics
   - Alerting setup

## Infrastructure Considerations

### Backup Strategy
- Database backups (daily)
- Configuration backups
- Disaster recovery plan
- Test restore procedures

### Monitoring
- Uptime monitoring
- Error tracking (Sentry)
- Performance monitoring
- Log aggregation

### Scalability
- Plan for growth
- Database optimization
- Caching strategy
- CDN for media

### Security
- Firewall configuration
- Regular updates
- Security audits
- Rate limiting

## Costs

**Estimated monthly costs:**
- Server: $10-50 (depending on provider/specs)
- Domain: $10-15/year ($1-2/month)
- SSL: Free (Let's Encrypt)
- Pinata: $0-20 (depending on usage)
- **Total**: ~$15-75/month

## Next Steps

After Phase 5 completion:
- **Phase 6:** AppView integration (optional)
- **Phase 7:** Polish and edge cases
- Real-world user testing
- Performance optimization

## Resources

- [Docker Deployment Guide](../../pds/docker-setup.md)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [AT Protocol Production Guide](https://atproto.com/guides/self-hosting)

---

**Note:** This phase transforms the project from local prototype to production-ready service.

