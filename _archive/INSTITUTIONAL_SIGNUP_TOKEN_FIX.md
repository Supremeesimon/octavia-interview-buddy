# Institutional Signup Token Fix

## Problem Description

When accessing institutional signup links and clicking the "Sign in" button, users encountered an "Invalid or expired link" error. This happened because the token was not being correctly extracted from the URL in all cases.

## Root Cause

The issue was in the token extraction logic in `InstitutionalSignup.tsx`. The component was only looking for the token in query parameters (`?token=...`) but not in path parameters (`/signup-institution/{token}`).

Institutional signup links are generated in two formats:
1. **Institution links**: `/signup-institution/{signupToken}` (token in path)
2. **Department links**: `/signup-institution/{institutionId}?department=...&token={signupToken}` (institutionId in path, token in query)

The original code only handled case 2, but not case 1.

## Solution

Modified the token extraction logic to check both sources:

```typescript
// Get token from query parameters first, then from path parameters if query param is empty
const customSignupToken = searchParams.get('token') || institutionId || '';
```

This change ensures that:
1. If a token exists in query parameters, it takes precedence
2. If no query parameter token exists, but there's a path parameter, that's used as the token
3. If neither exists, an empty string is used

## Testing

The fix was tested with all three scenarios:
1. Path-only tokens: `/signup-institution/abc123` → token = "abc123"
2. Query-only tokens: `/signup-institution?token=xyz789` → token = "xyz789"
3. Both present: `/signup-institution/abc123?token=xyz789` → token = "xyz789" (query takes precedence)

## Impact

This fix resolves the "Invalid or expired link" error when clicking the "Sign in" button on institutional signup pages, improving the user experience for institutional users.