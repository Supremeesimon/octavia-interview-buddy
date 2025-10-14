# Institutional Signup Token Handling Fix

## Problem Description

Users were encountering "Invalid or expired link" errors when clicking the "Sign in" button on institutional signup pages. This happened because:

1. Some signup links are generated without tokens (generic links like `/signup-institution?institution=...`)
2. When these links were used, the `customSignupToken` was empty
3. The "Sign in" link would then be generated as `/login-institution?token=` (with empty token)
4. The InstitutionalLogin component would correctly reject empty tokens as invalid

## Root Cause

The issue was in the link generation logic. There are two types of institutional signup links:

1. **Custom Signup Links** (with tokens):
   - Format: `/signup-institution/{signupToken}`
   - Generated for specific institutions with unique tokens
   - Should link to institutional login with token validation

2. **Generic Signup Links** (without tokens):
   - Format: `/signup-institution?institution=...`
   - Generated for general access without specific institution tokens
   - Should link to generic login without token validation

## Solution

Modified the "Sign in" link generation in `InstitutionalSignup.tsx` to handle both cases:

```jsx
<div className="mt-6 text-center text-sm">
  <p className="text-muted-foreground">
    Already have an account?{' '}
    {customSignupToken ? (
      <Link to={`/login-institution?token=${customSignupToken}`} className="text-primary hover:underline">
        Sign in
      </Link>
    ) : (
      <a href="/login" className="text-primary hover:underline">
        Sign in
      </a>
    )}
  </p>
</div>
```

This change ensures that:
- When a valid token exists, users are directed to institutional login with token validation
- When no token exists, users are directed to generic login without token validation

## Testing

The fix was tested with both scenarios:
1. Custom signup links with tokens → Institutional login with token validation
2. Generic signup links without tokens → Generic login without token validation

## Impact

This fix resolves the "Invalid or expired link" error for users accessing generic institutional signup links, improving the user experience by directing them to the appropriate login page based on the type of signup link they used.