# Next.js Frontend: Subscription & Razorpay Integration Guide

This document provides the technical reference for integrating membership plans and Razorpay payments into the LetsB2B frontend.

## 1. API Endpoints Reference

| Purpose | Method | Endpoint | Payload / Params |
| :--- | :--- | :--- | :--- |
| **Fetch Active Plans** | `GET` | `/api/membership-plans?filters[is_active][$eq]=true` | N/A |
| **Membership Status** | `GET` | `/api/membership-status` | Returns summarized status (tier, expiry, active status) |
| **Check Active Subscriptions** | `GET` | `/api/membership-subscriptions?filters[user][id][$eq]=USER_ID&filters[is_active][$eq]=true` | Detailed subscription records |
| **Create Razorpay Order** | `POST` | `/api/payment/create-order` | `{ plan_id: string, amount: number }` |
| **Verify Payment** | `POST` | `/api/payment/verify` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, plan_id }` |
| **Transaction History** | `GET` | `/api/orders?filters[users_permissions_user][id][$eq]=USER_ID&sort=createdAt:desc` | List of orders/payments |

---

## 2. Global State Management (MembershipContext)

All membership data is centralized in `src/context/MembershipContext.tsx` to prevent redundant API calls. 

### Why this architecture?
- **Efficiency**: Plans and status are fetched once at app start.
- **Consistency**: All components see the same subscription state.
- **Automatic Refresh**: The `refresh()` function re-syncs all data after a successful payment.

### Usage in Components:
```tsx
const { status, plans, subscriptions, transactions, loading, refresh } = useMembership();

// status.tier: 'SILVER', 'VERIFIED', 'PREMIUM', or 'FREE'
// status.is_active: boolean
```

---

## 3. Frontend Flow Implementation

### Step A: Load Razorpay SDK
The script is loaded globally in `src/app/layout.tsx`.

### Step B: The Payment Utility
The logic is encapsulated in `src/lib/razorpay.ts`.

```typescript
// Example usage in a component
import { handlePayment } from "@/lib/razorpay";

const handleBuy = async (plan: any) => {
  const userInfo = {
    id: user.id,
    name: profile?.full_name || user.username,
    email: user.email,
    mobile: profile?.whatsapp || "",
  };

  await handlePayment({
    documentId: plan.documentId,
    current_price: plan.current_price,
    plan_name: plan.plan_name
  }, userInfo);
};
```

---

## 4. Success & failure Handling

1.  **Success Redirect**: Upon successful verification, the user is redirected to `/payment/success`.
2.  **Failure Redirect**: If the modal is closed or verification fails, the user is redirected to `/payment/failed`.
3.  **State Refresh**: The success page calls `refresh()` from the `MembershipContext` to update the UI immediately without a full page reload.

---

## 5. Environment Variables Checklist
Ensure these are set in `.env.local`:
- `NEXT_PUBLIC_API_URL`: Backend base URL (e.g., `https://api.letsb2b.com`).
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay Public Key ID.

---

## 6. Best Practices Implementation
- **Data Guarding**: User-specific data (transactions/subscriptions) is only fetched if `user.id` is present.
- **Dependency Optimization**: `useEffect` hooks listen to `user.id` instead of the full user object to avoid unnecessary re-fetches.
- **Dynamic UI**: Pricing tiers (Silver, Verified, Premium) are rendered dynamically from the `plans` array, removing the need for hardcoded UI models.
