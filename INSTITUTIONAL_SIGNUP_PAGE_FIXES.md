# Institutional Signup Page and Link Generation Fixes

## Issues Identified

1. **Incorrect Institution Name Display**: Institutional signup pages were showing "Join Institution {token}" instead of the actual institution name
2. **Dropdown Link Generation**: The dropdown menu items for student/teacher/admin signup links were not copying links to clipboard as expected
3. **Token vs. Institution ID Confusion**: The system was not properly distinguishing between token-based institutional links and generic parameter-based links

## Solutions Implemented

### 1. Fixed Institution Name Display

Updated `InstitutionalSignup.tsx` to properly resolve institution names:

- **For Token-Based Links** (`/signup-institution/{token}`): Look up the institution by its token to get the real institution name
- **For Parameter-Based Links** (`/signup-institution?institution=...`): Use the institution name from query parameters
- **For ID-Based Links** (`/signup-institution/{id}`): Only show the ID when it's not a token

```typescript
// New useEffect to fetch institution name
useEffect(() => {
  const fetchInstitutionName = async () => {
    if (customSignupToken) {
      try {
        // First, try to get institution by token (for custom signup links)
        const institution = await InstitutionHierarchyService.getInstitutionByToken(customSignupToken);
        if (institution) {
          setInstitutionName(institution.name);
          return;
        }
      } catch (error) {
        console.error('Error fetching institution by token:', error);
      }
    }
    
    // Fallback to institution name from query parameters or path
    const institutionNameFromParams = searchParams.get('institution');
    if (institutionNameFromParams) {
      setInstitutionName(institutionNameFromParams);
    } else if (institutionId && !customSignupToken) {
      // Only show institution ID if it's not a token
      setInstitutionName(`Institution ${institutionId}`);
    }
  };

  fetchInstitutionName();
}, [customSignupToken, institutionId, searchParams]);
```

### 2. Enhanced Dropdown Link Generation

Updated `InstitutionInterests.tsx` to properly copy signup links to clipboard:

- **New `handleCopyLink` Function**: Generates and copies the appropriate signup link based on user type
- **Proper Token Resolution**: Finds the institution in the database and retrieves its custom signup link
- **User Type Parameter**: Adds the `?type={userType}` parameter to the link for proper tab selection

```typescript
const handleCopyLink = async (interest: InstitutionInterest, userType: 'student' | 'teacher' | 'admin' = 'student') => {
  // Check if the institution has been processed
  if (interest.status !== 'processed') {
    // ... prompt to mark as processed
    return;
  }
  
  // For processed institutions, generate and copy the appropriate link
  try {
    // Find the institution in the database to get its custom signup link
    const q = query(
      collection(db, 'institutions'),
      where('name', '==', interest.institutionName)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const institutionDoc = querySnapshot.docs[0];
      const institutionData = institutionDoc.data();
      const customSignupLink = institutionData.customSignupLink;
      
      if (customSignupLink) {
        // Add user type parameter to the link
        const linkWithUserType = `${customSignupLink}?type=${userType}`;
        navigator.clipboard.writeText(linkWithUserType);
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} signup link copied to clipboard!`);
        return;
      }
    }
    
    toast.error("Failed to find custom signup link for this institution");
  } catch (error) {
    toast.error("Failed to generate signup link");
    console.error("Error generating signup link:", error);
  }
};
```

### 3. Improved User Experience

- **Clear Error Messages**: Users get specific guidance on what to do when trying to generate links for unprocessed institutions
- **Success Feedback**: Confirmation when links are successfully copied to clipboard
- **Proper Institution Names**: Users see real institution names instead of cryptic IDs or tokens

## Testing

The fixes were tested with all scenarios:

1. **Token-Based Institutional Links**: 
   - URL: `/signup-institution/abc123-def456-ghi789`
   - Display: "Join {Actual Institution Name}"
   - Dropdown: Copies proper links with user type parameters

2. **Parameter-Based Generic Links**:
   - URL: `/signup-institution?institution=Generic%20University`
   - Display: "Join Generic University"
   - Dropdown: Prompts to mark as processed

3. **Processed Institution Management**:
   - Dropdown menu items copy appropriate links to clipboard
   - Links include user type parameters for proper tab selection
   - Success notifications confirm link copying

## Impact

These improvements resolve the issues you reported:

1. **Institution Name Display**: Instead of "Join Institution 9ce7e63c-5974-4886-a4eb-47bc744a3196", users now see "Join {Actual Institution Name}"
2. **Dropdown Functionality**: Clicking "Student Signup Link", "Teacher Signup Link", or "Admin Signup Link" now copies the appropriate link to clipboard
3. **Better User Guidance**: Clear instructions for processing institutions before generating links

## For Your Specific Case

For the Lethbridge Polytechnic request:
1. The signup page will now correctly display "Join Lethbridge Polytechnic" instead of the token
2. The dropdown menu items will copy the appropriate signup links to clipboard when clicked
3. Users will get clear feedback when links are successfully copied