# AT Protocol PDS API Collection

Bruno API collection for testing and developing with your local AT Protocol PDS (Personal Data Server).

## 📚 Collection Structure

```
bruno-api/
├── Account/           # Account & session management
├── Posts/             # Create, list, and manage posts
├── Profile/           # User profile operations
├── Repository/        # Repository metadata & records
├── Identity/          # Handle resolution
├── Health/            # Health checks
└── environments/      # Environment configurations
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

## 🔑 Environment Variables

The `local` environment includes:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | PDS API endpoint | `http://localhost:2583` |
| `pdsUrl` | Alternative PDS URL | `http://localhost:3000` |
| `accessToken` | JWT access token (auto-saved) | `eyJ0eXAi...` |
| `refreshToken` | JWT refresh token (auto-saved) | `eyJ0eXAi...` |
| `did` | Your account DID (auto-saved) | `did:plc:m36qafxfncda5qfvyyzu64bh` |

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

## 🛠️ Development Tips

### Using Variables

All requests use environment variables:
- `{{baseUrl}}` - PDS endpoint
- `{{accessToken}}` - Auth token
- `{{did}}` - Your DID

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

## 🎯 Your Current Setup

Based on your local PDS:

**Accounts:**
- `user1.test` - No posts
- `user2.test` - 2 posts (currently logged in)
- `alice.test` - No posts
- `alice2.test` - Created during testing

**DIDs:**
- `user2.test` → `did:plc:m36qafxfncda5qfvyyzu64bh`
- `alice2.test` → `did:plc:kyocpcpzpxtz4xmn5vqmnq47`

The environment is pre-configured with `user2.test`'s DID since that's your active account.

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

