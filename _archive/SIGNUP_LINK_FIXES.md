# Signup Link Fixes Implementation

## Issues Identified

1. **Wrong Domain**: Signup links were being generated with `https://octavia.ai` instead of `http://localhost:8080`
2. **Mock Institution ID**: Links were using a mock institution ID instead of the real one
3. **Premature Initialization**: Signup links were being initialized before institution data was loaded
4. **Server Environment Issue**: `window.location.origin` was failing in server-side environments

## Fixes Implemented

### 1. Fixed InstitutionService.regenerateSignupToken
Updated the method to use a more robust approach for generating links:
```typescript
// Before
const newLink = `${window.location.origin}/signup-institution/${newToken}`;

// After
const origin = typeof window !== 'undefined' && window.location?.origin 
  ? window.location.origin 
  : 'http://localhost:8080';
const newLink = `${origin}/signup-institution/${newToken}`;
```

### 2. Fixed InstitutionDashboard Component
Updated the component to properly initialize signup links after institution data is loaded:

#### a. Changed initial state:
```typescript
// Before
const [signupLink, setSignupLink] = useState(generateSignupLink());
const [teacherSignupLink, setTeacherSignupLink] = useState(generateSignupLink('teacher'));

// After
const [signupLink, setSignupLink] = useState('');
const [teacherSignupLink, setTeacherSignupLink] = useState('');
```

#### b. Added proper initialization in useEffect:
```typescript
// Initialize signup links after institution data is loaded
if (institutionData) {
  const studentLink = institutionData.customSignupLink 
    ? `${institutionData.customSignupLink}?type=student`
    : `https://octavia.ai/signup-institution/${user.institutionId}?type=student`;
  
  const teacherLink = institutionData.customSignupLink 
    ? `${institutionData.customSignupLink}?type=teacher`
    : `https://octavia.ai/signup-institution/${user.institutionId}?type=teacher`;
  
  setSignupLink(studentLink);
  setTeacherSignupLink(teacherLink);
}
```

#### c. Updated generateSignupLink function:
```typescript
// Before
const institutionId = user?.institutionId || "institution-xyz";
return `https://octavia.ai/signup-institution/${institutionId}?type=${userType}`;

// After
if (user?.institutionId) {
  return `https://octavia.ai/signup-institution/${user.institutionId}?type=${userType`;
}

return '';
```

### 3. Enhanced Regenerate Function
Updated the regenerateLink function to properly handle token regeneration:

```typescript
const regenerateLink = async (userType: 'student' | 'teacher' = 'student') => {
  if (institution && user.institutionId) {
    try {
      // Regenerate the institution's signup token
      const { link } = await InstitutionService.regenerateSignupToken(user.institutionId);
      
      // Update the institution state with the new link
      setInstitution({
        ...institution,
        customSignupLink: link
      });
      
      // Update the signup links with the new link and user type
      const newLink = `${link}?type=${userType}`;
      if (userType === 'student') {
        setSignupLink(newLink);
      } else {
        setTeacherSignupLink(newLink);
      }
      
      toast.success(`New ${userType} signup link generated successfully!`);
    } catch (error) {
      console.error('Error regenerating signup link:', error);
      toast.error(`Failed to regenerate ${userType} signup link`);
    }
  } else {
    // Fallback to the old method
    const newLink = generateSignupLink(userType);
    if (userType === 'student') {
      setSignupLink(newLink);
    } else {
      setTeacherSignupLink(newLink);
    }
    toast.success(`New ${userType} signup link generated successfully!`);
  }
};
```

## Verification Results

### Current Working Links
The institution now has a correct signup link:
```
http://localhost:8080/signup-institution/4183a66c-6ebf-4914-98e8-0e79b2852ff1
```

### Link Format
- ✅ Uses correct localhost domain
- ✅ Contains valid UUID token
- ✅ Type parameter is appended correctly
- ✅ Student links: `?type=student`
- ✅ Teacher links: `?type=teacher`

### Actions Available
- ✅ Copy: Users can copy the link to their clipboard
- ✅ Regenerate: Users can generate a new link (invalidates previous one)

## Expected Behavior

When users click on the signup links, they should be directed to the correct signup page with the institution context preserved. The type parameter ensures they are directed to the appropriate signup form (student or teacher).

The 404 error you were seeing was likely due to the wrong domain (`https://octavia.ai` instead of `http://localhost:8080`). With these fixes, the links should now work correctly in your local development environment.