# Institutional Interest Requests Enhancement

## Problem Description

The Institutional Interest Requests feature had several issues:

1. **Generic Signup Links**: The "Generate custom signup link" button was creating generic links without tokens (`/signup-institution?institution=...`) instead of proper custom signup links with tokens.

2. **Invalid Login Links**: When users accessed generic signup links and clicked "Sign in", they would get "Invalid or expired link" errors because the login page received empty tokens.

3. **No Feedback for Processed Institutions**: After marking an institution as "Processed", there was no easy way to access the generated custom signup link.

## Solutions Implemented

### 1. Improved "Sign in" Link Handling

Modified `InstitutionalSignup.tsx` to properly handle both types of signup links:

- **Custom Signup Links** (with tokens): Direct users to institutional login with token validation
- **Generic Signup Links** (without tokens): Direct users to generic login without token validation

### 2. Enhanced Institution Processing Workflow

Updated `InstitutionInterests.tsx` to provide better guidance and feedback:

#### For Unprocessed Institutions:
- When clicking "Generate custom signup link", users are now prompted to mark the institution as "Processed" first
- This prevents creation of generic links that lead to login issues

#### For Processed Institutions:
- After marking as "Processed", the system creates a proper institution with a custom signup link
- A toast notification shows a "Copy Custom Signup Link" button for immediate access
- The custom signup link is in the format `/signup-institution/{token}` with a unique token

### 3. Better User Guidance

The system now provides clear instructions:
- Unprocessed institutions must be marked as "Processed" before generating links
- Processed institutions' custom signup links are available through the success notification
- Users are directed to the Institution Management section for additional link management

## Testing

The enhancements were tested with both scenarios:

1. **Unprocessed Institution**:
   - Clicking "Generate custom signup link" shows a prompt to mark as "Processed"
   - "Sign in" button correctly redirects to generic login

2. **Processed Institution**:
   - Marking as "Processed" generates a proper custom signup link
   - Success notification includes "Copy Custom Signup Link" button
   - "Sign in" button correctly redirects to institutional login with token validation

## Impact

These improvements resolve the "Invalid or expired link" errors and provide a better user experience for managing institutional interest requests:

- Eliminates confusion with generic vs. custom signup links
- Provides clear workflow guidance
- Ensures proper token validation for institutional login
- Improves accessibility of custom signup links for processed institutions

## For the Lethbridge Polytechnic Case

Specifically for the Lethbridge Polytechnic request you mentioned:

1. The request shows as "Processed" with a custom link generation button
2. Clicking that button previously generated a generic link, but now it will prompt to mark as "Processed" (if not already done)
3. After processing, a proper custom signup link with token will be generated
4. The custom signup link can be copied from the success notification
5. Users accessing the custom link will have a working "Sign in" button that properly validates the institutional token

This resolves the issue where users were getting "Invalid or expired link" errors when trying to sign in from institutional signup pages.