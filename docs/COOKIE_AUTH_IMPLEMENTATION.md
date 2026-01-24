# Cookie-Based Authentication Implementation

## Overview
This application now uses **js-cookie** library for storing authentication tokens in browser cookies instead of localStorage. This provides better security and flexibility.

## Changes Made

### 1. Installed Dependencies
```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

### 2. Updated Authentication Library (`src/lib/auth.ts`)
- **Replaced localStorage with Cookies**: All authentication data (JWT token and user info) is now stored in cookies
- **Cookie Names**:
  - `auth_token` - Stores the JWT authentication token
  - `user_data` - Stores user information as JSON

- **Cookie Configuration**:
  ```typescript
  {
    expires: 7,        // Cookies expire after 7 days
    secure: true,      // Only transmitted over HTTPS in production
    sameSite: 'strict' // CSRF protection
  }
  ```

### 3. Updated Sign-In Page (`src/app/signin/page.tsx`)
- Imported `setAuthData` function from auth library
- Replaced direct localStorage calls with `setAuthData(data.jwt, data.user)`
- Authentication data is now automatically stored in cookies

### 4. Protected Route Component
- No changes needed! The `ProtectedRoute.tsx` component already uses the auth library functions
- Works seamlessly with cookie-based storage through `isAuthenticated()` and `getUser()`

## Functions Available

### `setAuthData(jwt: string, user: User)`
Stores JWT token and user data in cookies with proper security settings.

### `getToken(): string | null`
Retrieves the JWT token from cookies.

### `getUser(): User | null`
Retrieves user data from cookies and parses it.

### `isAuthenticated(): boolean`
Checks if a valid authentication token exists in cookies.

### `clearAuthData(): void`
Removes authentication cookies (used for logout).

### `authenticatedFetch(url: string, options?: RequestInit)`
Makes authenticated API requests with the JWT token from cookies.

## Benefits of Cookie-Based Storage

1. **Better Security**:
   - Cookies can be set with `httpOnly` flag (when using server-side)
   - `secure` flag ensures transmission only over HTTPS
   - `sameSite` flag prevents CSRF attacks

2. **Automatic Expiration**:
   - Tokens automatically expire after 7 days
   - No need for manual cleanup

3. **Server-Side Compatibility**:
   - Cookies are sent automatically with every request
   - Easier to implement server-side authentication checks

4. **Cross-Tab Synchronization**:
   - Cookie changes are synchronized across browser tabs
   - Better user experience

## Testing

To test the implementation:

1. Navigate to `/signin`
2. Enter valid credentials
3. Check browser DevTools > Application > Cookies
4. You should see:
   - `auth_token` cookie with your JWT
   - `user_data` cookie with user information
5. Both cookies should have:
   - Path: `/`
   - Expires: 7 days from now
   - SameSite: `Strict`
   - Secure: `true` (in production)

## Migration Notes

If you have existing users with tokens in localStorage:

```typescript
// Optional: Migration utility (run once)
const migrateToLegacyStorage = () => {
  const oldJwt = localStorage.getItem('jwt');
  const oldUser = localStorage.getItem('user');
  
  if (oldJwt && oldUser) {
    setAuthData(oldJwt, JSON.parse(oldUser));
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  }
};
```

## Environment Variables

The authentication system uses:
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to `https://api.letsb2b.com`)
- `NODE_ENV` - Determines cookie security settings

## Next Steps

Consider implementing:
1. **Refresh Token Flow** - Auto-refresh tokens before they expire
2. **Server-Side Cookie Management** - Use Next.js API routes for httpOnly cookies
3. **Token Validation** - Verify token validity on the server
4. **Logout Functionality** - Implement proper logout with `clearAuthData()`
