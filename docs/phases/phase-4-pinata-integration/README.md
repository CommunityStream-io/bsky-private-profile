# Phase 4: Pinata Private Gateway Integration ⏳ PENDING

**Status:** ⏳ Pending  
**Duration:** 1-2 weeks (estimated)  
**Can be done locally:** ⚠️ Partially (requires Pinata API credentials)  
**Prerequisites:** Phase 1-3 complete

## Overview

Implement private media access control using Pinata IPFS private gateways. This ensures that images and videos from private profiles are only accessible to approved followers.

## Goals

- [ ] Provision private gateways per user
- [ ] Generate time-limited access tokens
- [ ] Route private uploads through gateways
- [ ] Enforce media access control

## Why This Phase

Without this, private profile media (images, videos) would be publicly accessible via IPFS. Pinata's private gateways provide the necessary access control for media content.

## Prerequisites

- **Pinata Account**: [Sign up at pinata.cloud](https://www.pinata.cloud/)
- **API Credentials**: API Key and Secret
- **Pinata Service Running**: `pinata-integration/` service

## Tasks Breakdown

### 4.1 Gateway Provisioning

**When:** User makes profile private

**Pinata Service Endpoint:** `POST /api/gateway/provision`

**PDS Integration:**
```typescript
// In setPrivacySettings handler
if (isPrivate && !existingGateway) {
  const gateway = await fetch('http://localhost:3000/api/gateway/provision', {
    method: 'POST',
    body: JSON.stringify({userId: userDid})
  });
  
  // Store gateway info in PDS
  await ctx.db.storeGatewayInfo(userDid, gateway.gatewayId, gateway.gatewayUrl);
}
```

**Tasks:**
- [ ] Create gateway on privacy toggle
- [ ] Store gateway credentials
- [ ] Handle provisioning errors
- [ ] Test with Pinata API

### 4.2 Token Generation

**When:** Authorized user requests media

**Flow:**
```
1. User requests image from private profile
2. PDS checks authorization
3. If authorized, request token from Pinata service
4. Return tokenized URL to user
5. User accesses image with token
```

**Implementation:**
```typescript
async function getPrivateMediaUrl(blobCid: string, profileDid: string, requester: string) {
  // Check access
  if (!await canViewProfile(requester, profileDid)) {
    throw new Error('Unauthorized');
  }
  
  // Get gateway for profile
  const gateway = await getGatewayInfo(profileDid);
  
  // Request token from Pinata service
  const token = await fetch('http://localhost:3000/api/token/generate', {
    method: 'POST',
    body: JSON.stringify({
      gatewayId: gateway.id,
      userId: profileDid,
      grantTo: requester,
      expiresIn: 3600  // 1 hour
    })
  });
  
  return `${gateway.url}/ipfs/${blobCid}?token=${token.value}`;
}
```

**Tasks:**
- [ ] Implement token generation
- [ ] Set appropriate expiry
- [ ] Handle token refresh
- [ ] Test token validation

### 4.3 Media Upload Routing

**Modify blob upload for private profiles:**

**Logic:**
```typescript
async function uploadBlob(userDid: string, blob: Blob) {
  const privacy = await getPrivacySettings(userDid);
  
  if (privacy.isPrivate) {
    // Upload through private gateway
    const gateway = await getGatewayInfo(userDid);
    return uploadToPinataGateway(gateway, blob);
  } else {
    // Regular upload
    return uploadToPublicIPFS(blob);
  }
}
```

**Tasks:**
- [ ] Route private uploads
- [ ] Store gateway reference
- [ ] Update blob records
- [ ] Test upload flow

### 4.4 Media Access Control

**Serve media with access control:**

**Endpoint:** `GET /xrpc/com.atproto.sync.getBlob`

```typescript
export async function getBlob(blobCid: string, requester: string) {
  // Find blob owner
  const owner = await getBlobOwner(blobCid);
  
  // Check if private
  const privacy = await getPrivacySettings(owner);
  
  if (privacy.isPrivate) {
    // Check authorization
    if (!await canViewProfile(requester, owner)) {
      throw new Error('Unauthorized');
    }
    
    // Generate token and redirect
    const url = await getPrivateMediaUrl(blobCid, owner, requester);
    return {redirect: url};
  }
  
  // Public blob - serve directly
  return {data: await getPublicBlob(blobCid)};
}
```

**Tasks:**
- [ ] Intercept blob requests
- [ ] Check access control
- [ ] Generate tokens for authorized users
- [ ] Return 403 for unauthorized
- [ ] Test access control

## Testing Strategy

### Unit Tests
- Gateway provisioning
- Token generation
- Access control checks
- Upload routing

### Integration Tests
- Upload private image
- Authorized user views image
- Unauthorized user gets 403
- Token expiry handling

### Manual Testing
1. Make profile private
2. Upload test image
3. Try viewing as approved follower (works)
4. Try viewing as non-follower (403)
5. Verify token expiry

## Success Criteria

- [ ] Private media only accessible to authorized users
- [ ] Tokens work correctly
- [ ] Unauthorized access blocked
- [ ] Upload routing works
- [ ] No public IPFS leaks

## Deliverables

1. **Pinata Service**
   - Gateway provisioning endpoint
   - Token generation endpoint
   - Integration with PDS

2. **PDS Integration**
   - Modified blob upload
   - Modified blob serving
   - Gateway management

3. **Tests**
   - Unit tests
   - Integration tests
   - Access control verification

4. **Documentation**
   - Setup guide
   - API documentation
   - Security considerations

## Known Limitations

- Requires Pinata API credentials
- Costs associated with gateways
- Token expiry needs management
- Not tested at scale

## Next Steps

After Phase 4 completion:
- **Phase 5:** Production deployment
- Public server setup
- Handle verification
- Full federation

## Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [Pinata Integration Guide](../../pinata/setup.md)
- [IPFS Gateway Spec](https://docs.ipfs.tech/concepts/ipfs-gateway/)

---

**Note:** Can develop most logic locally, final testing requires Pinata credentials.

