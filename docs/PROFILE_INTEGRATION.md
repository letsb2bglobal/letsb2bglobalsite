# User Profile Integration

## Overview
This document describes the user profile verification and creation flow integrated into the authentication system.

## Flow Diagram

```
Login → Authentication → Check Profile Exists?
                              ↓              ↓
                            Yes             No
                              ↓              ↓
                         Dashboard   Complete Profile Page
                                            ↓
                                      Create Profile
                                            ↓
                                       Dashboard
```

## API Endpoints

### 1. Check User Profile
**Endpoint:** `GET /api/user-profiles?filters[userId]={userId}`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response (Profile Exists):**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "company_name": "Lets B2B Travels",
      "user_type": "seller",
      "category": "DMC",
      "country": "India",
      "city": "Delhi",
      "website": "https://letsb2b.com",
      "whatsapp": "+918888888888",
      "userId": 17,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

**Response (No Profile):**
```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 0,
      "total": 0
    }
  }
}
```

### 2. Create User Profile
**Endpoint:** `POST /api/user-profiles`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": {
    "company_name": "Lets B2B Travels",
    "user_type": "seller",
    "category": "DMC",
    "country": "India",
    "city": "Delhi",
    "website": "https://letsb2b.com",
    "whatsapp": "+918888888888",
    "userId": 17
  }
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "documentId": "abc123",
    "company_name": "Lets B2B Travels",
    "user_type": "seller",
    "category": "DMC",
    "country": "India",
    "city": "Delhi",
    "website": "https://letsb2b.com",
    "whatsapp": "+918888888888",
    "userId": 17,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Files Created/Modified

### 1. New Files

#### `src/lib/profile.ts`
Profile API service with the following functions:

- **`checkUserProfile(userId: number)`** - Check if profile exists for given user ID
- **`createUserProfile(profileData: CreateProfileData)`** - Create new user profile
- **`verifyUserProfile(userId: number)`** - Helper function to verify profile existence

**Types:**
```typescript
interface UserProfile {
  id: number;
  documentId: string;
  company_name: string;
  user_type: 'seller' | 'buyer';
  category: string;
  country: string;
  city: string;
  website?: string;
  whatsapp?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface CreateProfileData {
  company_name: string;
  user_type: 'seller' | 'buyer';
  category: string;
  country: string;
  city: string;
  website?: string;
  whatsapp?: string;
  userId: number;
}
```

#### `src/app/profile/page.tsx`
New LinkedIn-style profile page for viewing and editing user profiles in real-time.

**Features:**
- Cover image and profile picture layout
- Inline editing for header information
- Inline editing for the "About" section
- Experience and analytics sections
- Integration with the `PUT` update API

### 2. Modified Files

#### `src/lib/profile.ts`
Added:
- **`updateUserProfile(documentId: string, profileData: Partial<CreateProfileData>)`** - Update profile info via `PUT` request.

#### `src/app/signin/page.tsx`
Modified redirects to point to `/company-profile` or `/dashboard` based on profile state.

#### `src/app/dashboard/page.tsx`
Updated "Edit Profile" link to point to the new high-fidelity `/profile` page.

## API Endpoints

### 3. Update User Profile
**Endpoint:** `PUT /api/user-profiles/{documentId}`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": {
    "company_name": "Updated Name",
    "city": "New City"
  }
}
```

## Usage Examples

### Check if Profile Exists
```typescript
import { checkUserProfile } from '@/lib/profile';

const profile = await checkUserProfile(userId);
if (profile) {
  console.log('Profile exists:', profile.company_name);
} else {
  console.log('No profile found');
}
```

### Create Profile
```typescript
import { createUserProfile } from '@/lib/profile';

const newProfile = await createUserProfile({
  company_name: 'My Company',
  user_type: 'seller',
  category: 'DMC',
  country: 'India',
  city: 'Mumbai',
  website: 'https://example.com',
  whatsapp: '+911234567890',
  userId: 17
});
```

## Validation Rules

### Required Fields
- Company Name
- Category
- Country
- City
- User ID

### Optional Fields
- Website (must be valid URL with http/https)
- WhatsApp (must be valid international phone number format)

### Field Formats
- **WhatsApp:** `+[country_code][number]` (e.g., +918888888888)
- **Website:** Must start with `http://` or `https://`
- **User Type:** Either 'seller' or 'buyer'

## Error Handling

### Profile Check Errors
If profile check fails, the user is redirected to the complete-profile page to ensure they can still proceed.

### Profile Creation Errors
- Network errors
- Validation errors from API
- Authentication errors (missing token)

All errors are displayed to the user with appropriate messaging.

## Security

- All API calls use JWT token from cookies
- Token automatically included via `getToken()` function
- Protected routes ensure only authenticated users can access profile pages

## Testing

### Test Flow 1: New User (No Profile)
1. Go to `/signin`
2. Login with credentials
3. Should redirect to `/complete-profile`
4. Fill out profile form
5. Submit
6. Should redirect to `/dashboard`

### Test Flow 2: Existing User (Has Profile)
1. Go to `/signin`
2. Login with credentials that have existing profile
3. Should redirect directly to `/dashboard`

### Manual API Testing

**Check Profile:**
```bash
curl 'https://api.letsb2b.com/api/user-profiles?filters[userId]=17' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json'
```

**Create Profile:**
```bash
curl -X POST 'https://api.letsb2b.com/api/user-profiles' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "data": {
      "company_name": "Test Company",
      "user_type": "seller",
      "category": "DMC",
      "country": "India",
      "city": "Delhi",
      "website": "https://test.com",
      "whatsapp": "+918888888888",
      "userId": 17
    }
  }'
```

## Next Steps

1. **Dashboard Page:** Create dashboard to display after successful login
2. **Profile Edit:** Add ability to edit existing profiles
3. **Profile View:** Display profile information to users
4. **Company Profile:** Integrate company profile page mentioned in requirements
5. **Multi-step Form:** Consider breaking profile creation into multiple steps
6. **Image Upload:** Add company logo/profile picture upload
7. **Validation Enhancement:** Add server-side validation feedback

## Environment Variables

Uses existing `NEXT_PUBLIC_API_URL` from `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.letsb2b.com
```

## Dependencies

No additional dependencies required. Uses:
- Existing authentication system (cookies via js-cookie)
- Next.js routing
- Existing AuthLayout component
