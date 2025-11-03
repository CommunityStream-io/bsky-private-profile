# Private Profile Test Scenarios

This document provides detailed test scenarios for the private profile feature. These scenarios help verify that the privacy settings and follow request workflows function correctly.

## Prerequisites

Before running these tests, ensure:
1. ✅ PDS is running at `http://localhost:2583`
2. ✅ Bruno is installed and the collection is opened
3. ✅ "local" environment is selected
4. ✅ Multiple test accounts are created (Alice, Bob, Charlie)

## Test Account Setup

Create three test accounts for comprehensive testing:

| Account | Role | Purpose |
|---------|------|---------|
| Alice | Private profile owner | Has a private profile, receives follow requests |
| Bob | Approved follower | Sends request, gets approved by Alice |
| Charlie | Rejected requester | Sends request, gets denied by Alice |

### Creating Test Accounts

1. Run `Account/Create Account` for each user
2. Note each user's DID after creation
3. Update environment variables as needed

## Scenario 1: Make Profile Private

**Goal:** Verify that a user can set their profile to private and others see it as private.

**Prerequisites:** 
- Alice and Bob accounts exist
- Both users are logged out

**Steps:**

1. **Alice creates account (if needed)**
   ```
   Request: Account/Create Account
   Body: { "email": "alice@test.com", "handle": "alice.test.com", "password": "password123" }
   Expected: Account created successfully
   ```

2. **Alice logs in**
   ```
   Request: Account/Create Session (Login)
   Body: { "identifier": "alice.test.com", "password": "password123" }
   Expected: Tokens saved to environment
   Variables set: accessToken, refreshToken, did
   ```

3. **Alice sets privacy to private**
   ```
   Request: Privacy Settings/Set Privacy (Private)
   Body: { "isPrivate": true }
   Expected: 
   - Status: 200
   - Response contains: uri, cid
   - privacySettingsUri saved to environment
   ```

4. **Alice verifies her own settings**
   ```
   Request: Privacy Settings/Get Own Privacy Settings
   Query: actor={{did}}
   Expected:
   - isPrivate: true
   - isOwnProfile: true
   - canView: true (owner can always view own profile)
   - allowedFollowers: [] (empty initially)
   ```

5. **Bob logs in**
   ```
   Request: Account/Create Session (Login)
   Body: { "identifier": "bob.test.com", "password": "password123" }
   Expected: Tokens saved to environment
   ```

6. **Bob checks Alice's privacy settings**
   ```
   Setup: Set targetDid to Alice's DID
   Request: Privacy Settings/Get Other Privacy Settings
   Query: actor={{targetDid}}
   Expected:
   - isPrivate: true
   - isOwnProfile: false
   - canView: false (Bob is not an approved follower)
   ```

**Success Criteria:**
- ✅ Alice can set profile to private
- ✅ Alice sees her own privacy settings
- ✅ Bob sees Alice's profile is private
- ✅ Bob cannot view Alice's private content (canView: false)

---

## Scenario 2: Follow Request Flow (Approval)

**Goal:** Test the complete follow request approval workflow from creation to approval.

**Prerequisites:**
- Scenario 1 completed (Alice has private profile)
- Bob is logged in

**Steps:**

1. **Bob sends follow request to Alice**
   ```
   Setup: Set targetDid to Alice's DID
   Request: Follow Requests/Create Follow Request
   Body: { "subject": "{{targetDid}}" }
   Expected:
   - Status: 200
   - Response contains: uri, cid
   - followRequestUri saved to environment
   - Request status: "pending"
   ```

2. **Bob verifies his outgoing request**
   ```
   Request: Follow Requests/List Outgoing Requests
   Query: direction=outgoing, status=pending
   Expected:
   - Request list contains Alice as subject
   - Request status: "pending"
   - Subject profile shows Alice's info
   ```

3. **Alice logs in**
   ```
   Request: Account/Create Session (Login)
   Body: { "identifier": "alice.test.com", "password": "password123" }
   Expected: Tokens saved to environment
   ```

4. **Alice lists incoming requests**
   ```
   Request: Follow Requests/List Incoming Requests
   Query: direction=incoming, status=pending
   Expected:
   - Request list contains Bob's request
   - Requester profile shows Bob's info
   - Request status: "pending"
   - Request contains uri for approval
   ```

5. **Alice approves Bob's request**
   ```
   Setup: Copy request URI from previous response (or use saved {{followRequestUri}})
   Request: Follow Requests/Approve Request
   Body: { "requestUri": "{{followRequestUri}}", "approved": true }
   Expected:
   - success: true
   - followUri: returned (URI of created follow record)
   - Request status updated to "approved"
   ```

6. **Verify Bob can now view Alice's profile**
   ```
   Bob logs in (if needed)
   Setup: Set targetDid to Alice's DID
   Request: Privacy Settings/Get Other Privacy Settings
   Query: actor={{targetDid}}
   Expected:
   - isPrivate: true
   - canView: true (Bob is now an approved follower)
   ```

7. **Verify Bob is in Alice's allowedFollowers**
   ```
   Alice logs in
   Request: Privacy Settings/Get Own Privacy Settings
   Expected:
   - allowedFollowers contains Bob's DID
   ```

8. **Verify follow relationship exists**
   ```
   Bob logs in
   Request: Repository/List Records
   Query: collection=app.bsky.graph.follow, repo={{did}}
   Expected:
   - Follow record exists for Alice
   ```

**Success Criteria:**
- ✅ Bob can create follow request
- ✅ Request appears in Bob's outgoing list
- ✅ Request appears in Alice's incoming list
- ✅ Alice can approve the request
- ✅ Follow record is created
- ✅ Bob is added to allowedFollowers
- ✅ Bob can now view Alice's private profile

---

## Scenario 3: Follow Request Denial

**Goal:** Verify that a user can deny a follow request and no follow is created.

**Prerequisites:**
- Alice has private profile (Scenario 1 completed)
- Charlie account exists

**Steps:**

1. **Charlie logs in**
   ```
   Request: Account/Create Session (Login)
   Body: { "identifier": "charlie.test.com", "password": "password123" }
   Expected: Tokens saved to environment
   ```

2. **Charlie sends follow request to Alice**
   ```
   Setup: Set targetDid to Alice's DID
   Request: Follow Requests/Create Follow Request
   Body: { "subject": "{{targetDid}}" }
   Expected:
   - Status: 200
   - Response contains: uri, cid
   - followRequestUri saved to environment
   ```

3. **Charlie verifies outgoing request**
   ```
   Request: Follow Requests/List Outgoing Requests
   Query: direction=outgoing, status=pending
   Expected:
   - Request to Alice is in the list
   - Status: "pending"
   ```

4. **Alice logs in**
   ```
   Request: Account/Create Session (Login)
   Body: { "identifier": "alice.test.com", "password": "password123" }
   Expected: Tokens saved to environment
   ```

5. **Alice lists incoming requests**
   ```
   Request: Follow Requests/List Incoming Requests
   Query: direction=incoming, status=pending
   Expected:
   - Charlie's request is in the list
   - Status: "pending"
   ```

6. **Alice denies Charlie's request**
   ```
   Setup: Copy request URI from Charlie's request
   Request: Follow Requests/Deny Request
   Body: { "requestUri": "{{followRequestUri}}", "approved": false }
   Expected:
   - success: true
   - No followUri returned
   - Request status updated to "denied"
   ```

7. **Verify Charlie cannot view Alice's profile**
   ```
   Charlie logs in
   Setup: Set targetDid to Alice's DID
   Request: Privacy Settings/Get Other Privacy Settings
   Query: actor={{targetDid}}
   Expected:
   - isPrivate: true
   - canView: false (Charlie was denied)
   ```

8. **Verify Charlie is NOT in Alice's allowedFollowers**
   ```
   Alice logs in
   Request: Privacy Settings/Get Own Privacy Settings
   Expected:
   - allowedFollowers does NOT contain Charlie's DID
   ```

9. **Charlie sees denied status**
   ```
   Charlie logs in
   Request: Follow Requests/List Outgoing Requests
   Query: direction=outgoing, status=denied
   Expected:
   - Request to Alice shows status: "denied"
   ```

**Success Criteria:**
- ✅ Charlie can send follow request
- ✅ Alice can deny the request
- ✅ No follow record is created
- ✅ Charlie is NOT added to allowedFollowers
- ✅ Charlie cannot view Alice's private profile
- ✅ Request status is updated to "denied"

---

## Scenario 4: Switch Back to Public

**Goal:** Verify that a private profile can be switched back to public.

**Prerequisites:**
- Alice has private profile with approved followers (Scenario 2 completed)

**Steps:**

1. **Alice logs in**
   ```
   Request: Account/Create Session (Login)
   Body: { "identifier": "alice.test.com", "password": "password123" }
   Expected: Tokens saved to environment
   ```

2. **Alice sets privacy to public**
   ```
   Request: Privacy Settings/Set Privacy (Public)
   Body: { "isPrivate": false }
   Expected:
   - Status: 200
   - Response contains: uri, cid
   ```

3. **Alice verifies her settings**
   ```
   Request: Privacy Settings/Get Own Privacy Settings
   Expected:
   - isPrivate: false
   - allowedFollowers: still contains Bob (but no longer used)
   ```

4. **Any user can now view Alice's profile**
   ```
   Charlie logs in (or any other user)
   Setup: Set targetDid to Alice's DID
   Request: Privacy Settings/Get Other Privacy Settings
   Query: actor={{targetDid}}
   Expected:
   - isPrivate: false
   - canView: true (everyone can view public profiles)
   ```

5. **Existing follows remain intact**
   ```
   Bob logs in
   Request: Repository/List Records
   Query: collection=app.bsky.graph.follow, repo={{did}}
   Expected:
   - Follow record for Alice still exists
   - Bob still follows Alice (regular follow now)
   ```

**Success Criteria:**
- ✅ Alice can switch to public
- ✅ Profile becomes visible to everyone
- ✅ Existing follows are preserved
- ✅ allowedFollowers list is maintained (for future use)

---

## Edge Cases & Error Scenarios

### Duplicate Follow Requests
**Test:** Bob tries to send another follow request while one is pending

```
Setup: Bob has pending request to Alice
Request: Follow Requests/Create Follow Request
Body: { "subject": "{{aliceDid}}" }
Expected: Error - "Follow request already exists"
Status: 400 or 409
```

### Request to Public Profile
**Test:** Sending follow request to a public profile

```
Setup: Alice has public profile
Bob logs in
Request: Follow Requests/Create Follow Request
Body: { "subject": "{{aliceDid}}" }
Expected: Error - "Profile is not private, use regular follow"
Status: 400
```

### Unauthorized Access
**Test:** User tries to approve someone else's follow request

```
Setup: Bob has request to Alice
Charlie logs in and tries to approve it
Request: Follow Requests/Approve Request
Body: { "requestUri": "{{bobsRequestUri}}", "approved": true }
Expected: Error - "Unauthorized"
Status: 403
```

### Invalid Request URI
**Test:** Approving/denying a non-existent request

```
Request: Follow Requests/Approve Request
Body: { "requestUri": "at://invalid-uri", "approved": true }
Expected: Error - "Follow request not found"
Status: 404
```

---

## Multi-User Testing Tips

### Quick User Switching
1. Create a Bruno environment for each test user (alice, bob, charlie)
2. Each environment has:
   - User's credentials
   - User's DID
   - User's tokens
3. Switch environments to switch users

### Tracking DIDs
Keep a reference table:

| User | Handle | DID | Purpose |
|------|--------|-----|---------|
| Alice | alice.test.com | did:plc:xxx... | Private profile owner |
| Bob | bob.test.com | did:plc:yyy... | Approved follower |
| Charlie | charlie.test.com | did:plc:zzz... | Denied follower |

### Environment Variables Setup

For multi-user testing, manually set these variables:

```
aliceDid = did:plc:xxx...
bobDid = did:plc:yyy...
charlieDid = did:plc:zzz...
```

Then use them in requests:
- `{{aliceDid}}` - Alice's DID
- `{{bobDid}}` - Bob's DID
- `{{charlieDid}}` - Charlie's DID

---

## Troubleshooting

### Tests Failing?

**Check PDS is running:**
```
Request: Health/PDS Health Check
Expected: Status 200
```

**Verify authentication:**
```
Request: Account/Get Session
Expected: Valid session info
```

**Check DIDs are correct:**
- Ensure targetDid is set to the correct user's DID
- Verify DIDs haven't changed after PDS restart

**Clear old data:**
- If testing repeatedly, old follow requests may exist
- Consider creating fresh test accounts
- Or manually delete old records

### Common Issues

1. **"Invalid token" error**
   - Solution: Re-login to get fresh tokens

2. **"Request not found" error**
   - Solution: Verify the followRequestUri is correct and still exists

3. **"Profile not private" error**
   - Solution: Ensure Alice's profile is set to private first

4. **Empty request lists**
   - Solution: Check that requests were created successfully
   - Verify you're logged in as the correct user

---

## Test Checklist

Use this checklist to verify all tests pass:

### Privacy Settings
- [ ] Can set profile to private
- [ ] Can set profile to public
- [ ] Can view own privacy settings
- [ ] Can view other user's privacy indicator
- [ ] Access control works correctly (canView)

### Follow Requests
- [ ] Can create follow request to private profile
- [ ] Request appears in outgoing list
- [ ] Request appears in recipient's incoming list
- [ ] Can approve request
- [ ] Approval creates follow record
- [ ] Approval adds to allowedFollowers
- [ ] Can deny request
- [ ] Denial does not create follow
- [ ] Denial does not add to allowedFollowers

### Edge Cases
- [ ] Cannot send duplicate requests
- [ ] Cannot send request to public profile
- [ ] Cannot approve other user's requests
- [ ] Handles invalid URIs gracefully

### End-to-End Workflows
- [ ] Scenario 1: Make Profile Private
- [ ] Scenario 2: Follow Request Flow (Approval)
- [ ] Scenario 3: Follow Request Denial
- [ ] Scenario 4: Switch Back to Public

---

## Next Steps

After all tests pass:

1. ✅ Document any issues found
2. ✅ Verify with real PDS instance
3. ✅ Test with actual endpoints (when implemented)
4. ✅ Add automated test assertions if needed
5. ✅ Integrate with CI/CD pipeline

---

**Note:** These tests are designed to work with the API endpoints defined in Phase 1.3. If endpoints are not yet implemented, these tests serve as the specification for the expected behavior.
