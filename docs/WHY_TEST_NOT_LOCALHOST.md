# Why Use `.test` Instead of `.localhost`?

A technical deep-dive into AT Protocol's handle TLD restrictions.

## The Quick Answer

`.localhost` is **explicitly disallowed** by the AT Protocol, while `.test` is **explicitly allowed** for development.

## The Code Evidence

Found in `atproto/packages/syntax/src/handle.ts`:

```typescript
// Currently these are registration-time restrictions, not protocol-level
// restrictions. We have a couple accounts in the wild that we need to clean up
// before hard-disallow.
// See also: https://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains
export const DISALLOWED_TLDS = [
  '.local',
  '.arpa',
  '.invalid',
  '.localhost',    // ← Explicitly blocked!
  '.internal',
  '.example',
  '.alt',
  '.onion',
  // NOTE: .test is allowed in testing and devopment. In practical terms
  // "should" "never" actually resolve and get registered in production
]
```

**Key takeaway:** The comment explicitly states `.test` is allowed for testing and development!

## IETF Standards Background

These restrictions are based on [RFC 6761](https://tools.ietf.org/html/rfc6761) - "Special-Use Domain Names":

### Reserved TLDs:

| TLD | Purpose | Allowed in AT Protocol? |
|-----|---------|------------------------|
| `.test` | Testing and development | ✅ **YES** |
| `.localhost` | Loopback/local machine | ❌ **NO** |
| `.local` | mDNS/Multicast DNS | ❌ **NO** |
| `.invalid` | Guaranteed invalid | ❌ **NO** |
| `.example` | Documentation examples | ❌ **NO** |

## Why Block `.localhost`?

The AT Protocol blocks `.localhost` because:

1. **Semantic confusion** - `.localhost` implies "this machine only"
2. **Not globally meaningful** - Different meaning on each machine
3. **Can't be verified** - No way to prove ownership globally
4. **Not suitable for distributed systems** - AT Protocol is designed for federation

Even though `*.localhost` resolves to `127.0.0.1`, it's not appropriate for a globally-federated protocol.

## Why Allow `.test`?

`.test` is allowed because:

1. **Designated for testing** - RFC 6761 specifically reserves it for testing
2. **Never resolves in production** - Guaranteed to not conflict with real domains
3. **Development-friendly** - Perfect for local testing scenarios
4. **Clear intent** - Everyone knows `.test` means "not production"

## What Happens When You Try `.localhost`

### Account Creation Fails:

```bash
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -d '{"handle": "user.localhost", ...}'

# Response:
{
  "error": "InvalidHandle",
  "message": "Handle TLD is invalid or disallowed"
}
```

### Validation Code Path:

1. Account creation request received
2. Handle validation runs (`packages/syntax/src/handle.ts`)
3. TLD extracted: `.localhost`
4. Check against `DISALLOWED_TLDS` array
5. Match found! ❌
6. Return error: "Handle TLD is invalid or disallowed"

### With `.test`:

1. Account creation request received
2. Handle validation runs
3. TLD extracted: `.test`
4. Check against `DISALLOWED_TLDS` array
5. No match (not in disallowed list) ✅
6. Further validation continues (length, characters, etc.)
7. Success! Account created

## The `handle.invalid` Fallback

When handle validation fails in profile queries, the system returns:

```json
{
  "handle": "handle.invalid"
}
```

This comes from `atproto/packages/pds/src/lexicon/types/com/atproto/identity/defs.ts`:

```typescript
/** The validated handle of the account; or 'handle.invalid' if the handle 
    did not bi-directionally match the DID document. */
handle: string
```

## Historical Context

The comment mentions:
> "We have a couple accounts in the wild that we need to clean up before hard-disallow"

This suggests:
- These were originally "registration-time" restrictions
- Some accounts with disallowed TLDs might exist from before this rule
- Eventually these will become "protocol-level" restrictions

## Practical Implications

### For Local Development:

✅ **DO:**
```
stephen.test
mod-authority.test
alice.test
```

❌ **DON'T:**
```
stephen.localhost  ← Blocked!
stephen.local      ← Blocked!
stephen.invalid    ← Blocked!
```

### For Production:

Use real domains:
```
alice.bsky.social
bob.example.com
custom-domain.net
```

## Other Blocked TLDs

**`.local`** - Reserved for mDNS (Multicast DNS)
- Used by Bonjour/Zeroconf
- Not suitable for global handles

**`.arpa`** - Reverse DNS infrastructure
- Used for PTR records
- Not for user-facing handles

**`.onion`** - Tor hidden services
- Policy might change in the future (note in code)
- Currently blocked

**`.internal`** - Private/internal networks
- Similar reasoning to `.localhost`

**`.alt`** - Alternative namespace
- Non-DNS namespace
- Not appropriate for AT Protocol

## Testing the Restriction

You can verify this yourself:

```bash
# Try .localhost (will fail)
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.local",
    "handle": "test.localhost",
    "password": "password123"
  }'
# Error: "Handle TLD is invalid or disallowed"

# Try .test (will succeed)
curl -X POST http://localhost:2583/xrpc/com.atproto.server.createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.local",
    "handle": "test.test",
    "password": "password123"
  }'
# Success: Returns account with DID and tokens
```

## Summary

The AT Protocol team made a deliberate design decision:
- **Block special-use TLDs** that aren't suitable for distributed systems
- **Allow `.test`** specifically for development and testing
- **Enforce at account creation** to prevent invalid handles

This is why our troubleshooting led us to `.test` - it's the only reserved TLD that's explicitly allowed!

## References

- [RFC 6761 - Special-Use Domain Names](https://tools.ietf.org/html/rfc6761)
- [AT Protocol Source - handle.ts](https://github.com/bluesky-social/atproto/blob/main/packages/syntax/src/handle.ts)
- [IANA Special-Use Domain Names](https://www.iana.org/assignments/special-use-domain-names/)

---

**TL;DR: `.localhost` is in the `DISALLOWED_TLDS` array. `.test` is explicitly allowed for development. This is by design, following IETF standards.**

