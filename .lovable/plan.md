

# Switch Paystack to Live Keys & Ensure Proper Redirect

## Overview

This plan covers switching your Paystack integration from test mode to live mode and ensuring payments redirect back to your app correctly.

---

## What needs to happen

### 1. Update the Paystack Secret Key to Live Key

The current `PAYSTACK_SECRET_KEY` secret needs to be updated with your **live secret key** from your Paystack dashboard.

**Where to get your live key:**
- Log into your Paystack dashboard at https://dashboard.paystack.com
- Go to **Settings → API Keys & Webhooks**
- Copy your **Live Secret Key** (starts with `sk_live_...`)

**I will prompt you to update this secret** - you'll see a button to enter your new live key.

---

### 2. Callback URL Configuration

The current implementation already handles the callback correctly:

```typescript
const callbackUrl = `${window.location.origin}/payment`;
```

This dynamically uses wherever the user is accessing the app from:
- **Preview**: `https://id-preview--9b008615-2973-4748-9a38-40b0b264bc50.lovable.app/payment`
- **Published**: `https://valentinaapp.lovable.app/payment`

**Recommendation**: For production reliability, I'll update the code to use the **published URL** (`https://valentinaapp.lovable.app/payment`) as the callback, ensuring Paystack always redirects to your production app.

---

## Technical Details

### File Changes

**`src/pages/PaymentPage.tsx`** (line 89)
- Change from dynamic `window.location.origin` to explicit production URL
- This ensures consistent redirect behavior in production

```typescript
// Before
const callbackUrl = `${window.location.origin}/payment`;

// After  
const callbackUrl = 'https://valentinaapp.lovable.app/payment';
```

### Secret Update

- Use the secret management tool to prompt you for the new live Paystack key
- The key will be securely stored and available to the edge functions

---

## Important Notes

**Before going live:**
1. Ensure your Paystack account is fully activated for live transactions
2. Test a small payment to verify everything works
3. The live key will process **real money** - double-check the amount (currently ₦2,000)

**Current payment flow:**
1. User clicks "Pay with Paystack" → Edge function initializes payment with callback URL
2. User completes payment on Paystack → Paystack redirects to `/payment?reference=xxx`
3. App detects the reference → Calls verify edge function → Updates payment status
4. User sees success screen → Redirected to `/home`

