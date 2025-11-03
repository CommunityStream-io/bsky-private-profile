# AT Protocol PDS API Collection

Bruno API collection for testing and developing with your local AT Protocol PDS (Personal Data Server).

## 📚 Collection Structure

```
bruno-api/
├── Account/            # Account & session management
├── Posts/              # Create, list, and manage posts
├── Profile/            # User profile operations
├── Privacy Settings/   # Privacy settings for private profiles
├── Follow Requests/    # Follow request management
├── Repository/         # Repository metadata & records
├── Identity/           # Handle resolution
├── Health/             # Health checks
└── environments/       # Environment configurations
```

## 🚀 Quick Start

### 1. Install Bruno

Download from: https://www.usebruno.com/

### 2. Open Collection

1. Launch Bruno
2. Click "Open Collection"
3. Select the `bruno-api` folder

### 3. Select Environment

Click the environment dropdown and select **"local"**

### 4. Start Testing!

#### Workflow Example:

1. **Health Check**: Run `Health/PDS Health Check` to verify PDS is running
2. **Login**: Run `Account/Create Session (Login)` to authenticate
   - Access token is automatically saved to `{{accessToken}}`
3. **Create Post**: Run `Posts/Create Post` to create a test post
4. **List Posts**: Run `Posts/List Posts` to see all your posts
5. **Get Profile**: Run `Profile/Get Profile` to view profile info

## 🔐 Authentication

Most endpoints require authentication. The collection handles this automatically:

1. **Login first** using `Account/Create Session (Login)`
2. The script automatically saves your `accessToken`, `refreshToken`, and `did` to environment variables
3. All authenticated requests use `{{accessToken}}` from the environment

### Token Refresh

When your access token expires:
- Run `Account/Refresh Session` to get a new access token
- New tokens are automatically saved

## 📋 Available Endpoints

### Account Management
- **Create Account** - Register a new user
- **Create Session (Login)** - Authenticate and get tokens
- **Get Session** - View current session info
- **Refresh Session** - Refresh expired access token

### Posts
- **Create Post** - Publish a new post
- **List Posts** - View all posts from a user
- **Get Post Thread** - View a specific post with replies
- **Delete Post** - Remove a post

### Profile
- **Get Profile** - View user profile information
- **Update Profile** - Modify display name, bio, etc.

### Repository
- **Describe Repo** - Get repository metadata
- **List Records** - List records from any collection

### Identity
- **Resolve Handle** - Convert handle to DID

### Health
- **PDS Health Check** - Verify PDS is online

### Privacy Settings
- **Set Privacy (Private)** - Make profile private (requires follow approval)
- **Set Privacy (Public)** - Make profile public (default behavior)
- **Get Own Privacy Settings** - View your own privacy settings and allowed followers
- **Get Other Privacy Settings** - Check if another user's profile is private

### Follow Requests
- **Create Follow Request** - Send a request to follow a private profile
- **List Incoming Requests** - View requests from others to follow you
- **List Outgoing Requests** - View your requests to follow other private profiles
- **Approve Request** - Accept a follow request and add follower
- **Deny Request** - Reject a follow request

## 🔑 Environment Variables

The `local` environment includes:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | PDS API endpoint | `http://localhost:2583` |
| `pdsUrl` | Alternative PDS URL | `http://localhost:3000` |
| `accessToken` | JWT access token (auto-saved) | `eyJ0eXAi...` |
| `refreshToken` | JWT refresh token (auto-saved) | `eyJ0eXAi...` |
| `did` | Your account DID (auto-saved) | `did:plc:m36qafxfncda5qfvyyzu64bh` |
| `targetDid` | DID of another user for testing | `did:plc:...` |
| `privacySettingsUri` | URI of privacy settings (auto-saved) | `at://did:plc:.../com.community.actor.privacySettings/self` |
| `followRequestUri` | URI of follow request (auto-saved) | `at://did:plc:.../com.community.graph.followRequest/...` |
| `followUri` | URI of follow record (auto-saved) | `at://did:plc:.../app.bsky.graph.follow/...` |

## 📝 Testing Workflow

### Complete Test Flow:

```
1. Health Check
   └─> Verify PDS is running

2. Create Account (if needed)
   └─> Register new test user

3. Login
   └─> Get access tokens (auto-saved)

4. Get Session
   └─> Verify authentication

5. Update Profile
   └─> Set display name & bio

6. Get Profile
   └─> View updated profile

7. Create Post
   └─> Publish test content

8. List Posts
   └─> View all posts

9. Get Post Thread
   └─> View specific post
```

### 🔒 Private Profile Test Scenarios

The privacy settings and follow request endpoints enable Instagram-style private profiles. Here are the key test scenarios:

#### Scenario 1: Make Profile Private

Tests the basic privacy setting workflow.

```
1. Create test user Alice
   └─> Run Account/Create Account
   
2. Alice logs in
   └─> Run Account/Create Session (Login)
   └─> Tokens saved automatically
   
3. Alice sets privacy to private
   └─> Run Privacy Settings/Set Privacy (Private)
   └─> Verify response contains uri and cid
   
4. Alice verifies her settings
   └─> Run Privacy Settings/Get Own Privacy Settings
   └─> Verify isPrivate is true
   └─> Verify isOwnProfile is true
   
5. Bob (different user) logs in
   └─> Run Account/Create Session (Login) with Bob's credentials
   
6. Bob checks Alice's privacy settings
   └─> Set {{targetDid}} to Alice's DID
   └─> Run Privacy Settings/Get Other Privacy Settings
   └─> Verify isPrivate is true
   └─> Verify canView is false (Bob is not approved)
```

#### Scenario 2: Follow Request Flow (Happy Path)

Tests the complete follow request approval workflow.

```
1. Alice has a private profile
   └─> Complete Scenario 1 first
   
2. Bob sends follow request to Alice
   └─> Bob logs in
   └─> Set {{targetDid}} to Alice's DID
   └─> Run Follow Requests/Create Follow Request
   └─> Verify response contains uri and cid
   └─> {{followRequestUri}} is saved automatically
   
3. Alice lists incoming requests
   └─> Alice logs in
   └─> Run Follow Requests/List Incoming Requests
   └─> Verify Bob's request appears with status "pending"
   └─> Verify requester profile shows Bob's info
   
4. Alice approves Bob's request
   └─> Copy the request URI from the list
   └─> Set {{followRequestUri}} if not auto-saved
   └─> Run Follow Requests/Approve Request
   └─> Verify success is true
   └─> Verify followUri is returned
   
5. Verify Bob can now view Alice's profile
   └─> Bob logs in
   └─> Set {{targetDid}} to Alice's DID
   └─> Run Privacy Settings/Get Other Privacy Settings
   └─> Verify canView is true (Bob is now approved)
   
6. Verify follow was created
   └─> Bob can see Alice's posts
   └─> Alice appears in Bob's following list
   └─> Bob appears in Alice's followers list
```

#### Scenario 3: Deny Request

Tests the follow request denial workflow.

```
1. Alice has a private profile
   └─> Complete Scenario 1 first
   
2. Charlie sends follow request to Alice
   └─> Charlie logs in
   └─> Set {{targetDid}} to Alice's DID
   └─> Run Follow Requests/Create Follow Request
   └─> {{followRequestUri}} is saved automatically
   
3. Alice lists incoming requests
   └─> Alice logs in
   └─> Run Follow Requests/List Incoming Requests
   └─> Verify Charlie's request appears
   
4. Alice denies Charlie's request
   └─> Set {{followRequestUri}} to Charlie's request URI
   └─> Run Follow Requests/Deny Request
   └─> Verify success is true
   └─> Note: No followUri is returned
   
5. Verify no follow was created
   └─> Charlie logs in
   └─> Set {{targetDid}} to Alice's DID
   └─> Run Privacy Settings/Get Other Privacy Settings
   └─> Verify canView is still false
   
6. Charlie can see the denied status
   └─> Run Follow Requests/List Outgoing Requests
   └─> Verify request status is "denied"
```

#### Scenario 4: Switch Back to Public

Tests reverting a profile to public.

```
1. Alice has a private profile with approved followers
   └─> Complete Scenario 2 first
   
2. Alice sets privacy to public
   └─> Alice logs in
   └─> Run Privacy Settings/Set Privacy (Public)
   └─> Verify response contains uri and cid
   
3. Alice verifies her settings
   └─> Run Privacy Settings/Get Own Privacy Settings
   └─> Verify isPrivate is false
   
4. Any user can now view Alice's profile
   └─> Different user logs in
   └─> Set {{targetDid}} to Alice's DID
   └─> Run Privacy Settings/Get Other Privacy Settings
   └─> Verify isPrivate is false
   └─> Verify canView is true (profile is public)
```

### Multiple User Testing Setup

To test multi-user scenarios, you need multiple accounts:

1. **Create Test Accounts:**
   ```
   - Alice: First test user (will have private profile)
   - Bob: Second test user (will send follow request)
   - Charlie: Third test user (for denial testing)
   ```

2. **Track DIDs:**
   - After creating each account, note their DID
   - Set `{{targetDid}}` to the appropriate user's DID for each test
   - Use Bruno environments or manually update the variable

3. **Switch Between Users:**
   - Run Account/Create Session (Login) with different credentials
   - This updates `{{accessToken}}` and `{{did}}` automatically
   - Now all subsequent requests use that user's context

## 🛠️ Development Tips

### Using Variables

All requests use environment variables:
- `{{baseUrl}}` - PDS endpoint
- `{{accessToken}}` - Auth token
- `{{did}}` - Your DID
- `{{targetDid}}` - Another user's DID for testing

### Automatic Token Management

The login request includes a post-response script that automatically:
```javascript
bru.setVar("accessToken", response.accessJwt);
bru.setVar("refreshToken", response.refreshJwt);
bru.setVar("did", response.did);
```

### Collections to Test

Common AT Protocol collections:
- `app.bsky.feed.post` - Posts
- `app.bsky.feed.like` - Likes
- `app.bsky.feed.repost` - Reposts
- `app.bsky.graph.follow` - Follows
- `app.bsky.actor.profile` - Profile

Custom collections for private profiles:
- `com.community.actor.privacySettings` - Privacy settings
- `com.community.graph.followRequest` - Follow requests

## 🎯 Your Current Setup

Based on your local PDS:

**Accounts:**
- `stephen.traiforos.com` - Primary test account
- `catherine.traiforos.com` - Secondary test account
- `mod-authority.traiforos.com` - Moderation testing

**DIDs:**
- `stephen.traiforos.com` → `did:plc:2zuvo5fg2pw5ymjbwzv6zklm`

The environment is pre-configured with `stephen.traiforos.com`'s DID since that's your active account.

## 📖 Documentation

For more information about AT Protocol endpoints:
- [AT Protocol Docs](https://atproto.com/specs/xrpc)
- [Bluesky Lexicons](https://github.com/bluesky-social/atproto/tree/main/lexicons)

## 🤝 Contributing

To add new endpoints:

1. Create a new `.bru` file in the appropriate folder
2. Use the Bruno DSL format:
   ```
   meta {
     name: Endpoint Name
     type: http
     seq: 1
   }
   
   get {
     url: {{baseUrl}}/xrpc/endpoint.name
     body: none
     auth: bearer
   }
   ```

## 🎉 Ready to Test!

Your PDS is running and all endpoints are ready to test. Start with the health check and login, then explore the available functionality!

**Happy Testing! 🚀**

