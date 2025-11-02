# Bruno Setup Guide

## 🎯 Quick Setup (VS Code)

### 1. Install Bruno Extension

Press `Ctrl+Shift+X` and search for:
```
Bruno API Client
```

Or install directly:
```
code --install-extension bruno-api-client.bruno
```

### 2. Reload VS Code

Press `Ctrl+Shift+P` → Type "Reload Window" → Press Enter

### 3. Open Bruno Panel

- Look for the **Bruno icon** in the VS Code sidebar (flask/beaker icon)
- Click it to open the Bruno panel
- Your collection should appear automatically!

### 4. Select Environment

In the Bruno panel:
- Click the **environment dropdown** (usually at the top)
- Select **"local"**
- You should see: `baseUrl: http://localhost:2583`

### 5. Test It!

1. Navigate to: `Health/PDS Health Check`
2. Click the **"Send"** or **"Run"** button
3. You should see: `{"version":"0.4.188"}`

✅ **Success!** Bruno is configured and working!

---

## 🔧 Troubleshooting

### Environment Not Showing?

**Option 1: Reload VS Code**
```
Ctrl+Shift+P → "Developer: Reload Window"
```

**Option 2: Re-open the Collection**
1. Close VS Code
2. Open the workspace: `workspace.code-workspace`
3. Bruno should auto-detect the collection

**Option 3: Manually Set Path**
1. In Bruno panel, click "..." menu
2. Select "Open Collection"
3. Navigate to: `C:\Users\trifo\bsky-private-profile\bruno-api`

### Variables Not Working?

Make sure:
- ✅ Environment is set to "local"
- ✅ File exists: `environments/local.bru`
- ✅ Variables use double braces: `{{baseUrl}}`

### Extension Not Installed?

Install manually:
1. Download from: https://marketplace.visualstudio.com/items?itemName=bruno-api-client.bruno
2. Or use Bruno Desktop: https://www.usebruno.com/

---

## 🚀 First Request Workflow

### 1. Health Check (No Auth Required)
```
Health/PDS Health Check
→ Verify PDS is running
```

### 2. Login
```
Account/Create Session (Login)
→ Auto-saves: accessToken, refreshToken, did
```

### 3. View Your Profile
```
Profile/Get Profile
→ Uses: {{accessToken}} and {{did}}
```

### 4. List Your Posts
```
Posts/List Posts
→ See your 2 existing posts!
```

### 5. Create a New Post
```
Posts/Create Post
→ Publish content to PDS
```

---

## 📝 VS Code Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Command Palette | `Ctrl+Shift+P` |
| Open Extensions | `Ctrl+Shift+X` |
| Reload Window | `Ctrl+R` (after Cmd Palette) |
| Toggle Sidebar | `Ctrl+B` |
| Toggle Panel | `Ctrl+J` |

---

## 🎓 Understanding Bruno Variables

### Environment Variables (`local.bru`)
```javascript
vars {
  baseUrl: http://localhost:2583  // ← Your PDS URL
  did: did:plc:m36qafxfncda5qfvyyzu64bh  // ← Your account
  accessToken:   // ← Auto-filled on login
  refreshToken:  // ← Auto-filled on login
}
```

### Using Variables in Requests
```
{{baseUrl}}/xrpc/_health
{{accessToken}}  // Used in Authorization header
{{did}}         // Used in repo queries
```

### Auto-Saving Variables
The login request includes a script:
```javascript
script:post-response {
  bru.setVar("accessToken", response.accessJwt);
  bru.setVar("refreshToken", response.refreshJwt);
  bru.setVar("did", response.did);
}
```

This automatically saves tokens after login! 🎉

---

## 🔐 Security Note

The `accessToken` and `refreshToken` are marked as **secret** in the environment:
```javascript
vars:secret [
  accessToken,
  refreshToken
]
```

This prevents them from being:
- ✅ Displayed in plain text
- ✅ Committed to git (add to .gitignore)
- ✅ Logged in console output

---

## 🎊 You're All Set!

Your Bruno collection is fully configured with:
- ✅ 14 ready-to-use API endpoints
- ✅ Automatic token management
- ✅ Pre-configured for your local PDS
- ✅ VS Code integration

**Start testing your PDS API! 🚀**

Need help? Check [README.md](./README.md) for full documentation.

