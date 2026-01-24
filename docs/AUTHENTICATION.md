# Authentication Integration

This document describes the authentication setup for the Let's B2B application.

## Environment Variables

The API endpoint is configured in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.letsb2b.com
```

**Note:** This file is already gitignored and won't be committed to version control.

## Login API Integration

### Endpoint
```
POST https://api.letsb2b.com/api/auth/local
```

### Request Format
```json
{
  "identifier": "agent05@test.com",
  "password": "Test@12345"
}
```

### Response Format
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 17,
    "documentId": "rw4mgjkp6xoqjzzrmfzeevlr",
    "username": "agent05",
    "email": "agent05@test.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2026-01-22T07:17:40.216Z",
    "updatedAt": "2026-01-22T07:17:40.216Z",
    "publishedAt": "2026-01-22T07:17:40.216Z"
  }
}
```

## Implementation

### 1. Sign In Page
File: `src/app/signin/page.tsx`

The signin page handles user authentication:
- Validates email and password
- Makes API call to Strapi authentication endpoint
- Stores JWT token and user data in localStorage
- Redirects to dashboard on success
- Displays error messages for invalid credentials

### 2. Auth Utility Library
File: `src/lib/auth.ts`

Provides reusable authentication functions:

#### Functions Available:

**Storage Functions:**
- `setAuthData(jwt, user)` - Store auth data in localStorage
- `getToken()` - Retrieve JWT token
- `getUser()` - Retrieve user data
- `isAuthenticated()` - Check if user is logged in
- `clearAuthData()` - Logout (clear all auth data)

**API Functions:**
- `login(identifier, password)` - Login API call
- `authenticatedFetch(url, options)` - Make authenticated API requests

#### Usage Examples:

```typescript
import { login, setAuthData, isAuthenticated, getToken, clearAuthData } from '@/lib/auth';

// Login
try {
  const { jwt, user } = await login('user@example.com', 'password');
  setAuthData(jwt, user);
  // Redirect to dashboard
} catch (error) {
  console.error('Login failed:', error);
}

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Get token for API calls
const token = getToken();

// Make authenticated API call
const response = await authenticatedFetch('https://api.letsb2b.com/api/users/me');

// Logout
clearAuthData();
router.push('/signin');
```

## Security Notes

1. **JWT Storage:** Currently using localStorage for JWT storage. Consider using httpOnly cookies for production for better security.

2. **Token Expiration:** The JWT expires after 30 days (based on the token structure). You may want to implement token refresh logic.

3. **Protected Routes:** Consider creating a middleware or HOC to protect routes that require authentication.

## Next Steps

Consider implementing:

1. **Protected Route Middleware** - Automatically redirect unauthenticated users
2. **Token Refresh** - Auto-refresh expired tokens
3. **Auth Context/Provider** - React context for managing auth state globally
4. **Remember Me** - Optional persistent login
5. **Logout Functionality** - Clear auth data and redirect to signin

## Testing

Test credentials:
- Email: `agent05@test.com`
- Password: `Test@12345`

You can test the login flow by:
1. Navigate to `/signin`
2. Enter the credentials above
3. Submit the form
4. Check localStorage for `jwt` and `user` keys
5. Should redirect to `/dashboard`
