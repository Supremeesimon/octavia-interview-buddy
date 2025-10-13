# User Hierarchy Linking Documentation

This document explains how the user hierarchy linking works in the Octavia Interview Buddy platform and how to ensure proper linking during signup.

## User Hierarchy Structure

The platform follows a specific hierarchy for organizing users:

```
Platform Admins
└── Institutions
    ├── Institution Admins
    ├── Departments
    │   ├── Teachers
    │   └── Students
```

Each level in this hierarchy has specific relationships:
- **Platform Admins** manage the entire platform and all institutions
- **Institutions** are organizations that have signed up and paid for the service
- **Institution Admins** manage teachers and students within their institution
- **Departments** belong to institutions
- **Teachers** conduct interviews with students in their department
- **Students** use the platform for interview practice

## Current User Data Structure

After running the fix scripts, the database now has the following structure:

### Institutions
- **Lethbridge Polytechnic** (ID: WxD3cWTybNsqkpj7OwW4)
  - Domain: lethbridgepolytechnic.ca
  - Active: true

### Departments
1. Computer Science (ID: JUTao6BPNocUW7Ysjg3E)
2. Business Administration (ID: u8ZDLgkvTknw7XzU5KU5)
3. Engineering (ID: zLj70FISxJR0wTRqOixN)
4. Health Sciences (ID: swBOdgcag4lk138VsjA2)
5. Arts & Humanities (ID: zMf9aMjpnbuPHi3cUWz8)

### Users
1. **Sarah** (outreach@autolawn.cloud) - Teacher
   - Department: Computer Science
   - Institution: Lethbridge Polytechnic

2. **Simon Onabanjo** (supremeesimon@gmail.com) - Platform Admin
   - No institution linking (as expected for platform admin)

3. **Onabanjo Oluwaferanmi** (oluwaferanmionabanjo@gmail.com) - Student
   - Department: Computer Science
   - Institution: Lethbridge Polytechnic
   - Teacher: Sarah (outreach@autolawn.cloud)

## Signup Process Flow

The correct signup process follows this flow:

### 1. Institution Signup
- Institutions request access through the platform
- Platform admins review and approve requests
- Platform admins create institution records and generate custom signup links
- Institutions receive custom links to sign up their admins

### 2. Institution Admin Signup
- Institution admins use the custom link provided by platform admins
- They register with their information
- Role is set to `institution_admin`
- They are linked to their institution

### 3. Teacher Signup
- Teachers are invited by institution admins or sign up through institution admin portal
- They register with their information
- Role is set to `teacher`
- They are assigned to departments by institution admins
- They are linked to their institution

### 4. Student Signup
- Students are invited by teachers or sign up through the platform
- They register with their information
- Role is set to `student`
- They are assigned to departments by teachers or institution admins
- They are linked to their institution and assigned a teacher

## Current Implementation Status

The current database structure has been corrected to reflect the proper hierarchy:
- Platform Admin: Simon Onabanjo (supremeesimon@gmail.com)
- Institution: Lethbridge Polytechnic
- Institution Admin: None yet assigned
- Teacher: Sarah (outreach@autolawn.cloud)
- Student: Onabanjo Oluwaferanmi (oluwaferanmionabanjo@gmail.com)

## Required Improvements for Proper Linking

To ensure proper linking during signup, the following improvements should be made:

### 1. Custom Signup Links
Platform admins should generate custom signup links for institutions that include:
- Institution ID
- Signup type (institution_admin, teacher, student)
- Expiration time

### 2. Role-Based Access Control
The signup process should enforce proper role assignment:
- Platform admins can only be created manually in the database
- Institution admins can only sign up with valid institution links
- Teachers can only sign up with valid institution links
- Students can sign up with valid institution links or through invitations

### 3. Proper Department Assignment
Instead of allowing users to enter department names freely:
- Teachers and students should be assigned to departments by institution admins
- Department assignment should happen after signup through the admin interface

## Implementation Plan

### Frontend Changes (Signup Pages)

1. **Institution Admin Signup Page**
   - Accept custom signup links with institution ID
   - Validate link before allowing signup
   - Set role to `institution_admin`
   - Link to specified institution

2. **Teacher Signup Page**
   - Accept custom signup links with institution ID
   - Validate link before allowing signup
   - Set role to `teacher`
   - Link to specified institution
   - Allow institution admin to assign department after signup

3. **Student Signup Page**
   - Accept custom signup links with institution ID
   - Validate link before allowing signup
   - Set role to `student`
   - Link to specified institution
   - Allow teacher or institution admin to assign department after signup

### Backend Changes (Firebase Functions)

1. **Custom Link Validation**
   ```javascript
   const validateSignupLink = async (token, expectedInstitutionId) => {
     // Verify the token is valid and not expired
     // Verify it's for the correct institution
     // Return institution information if valid
   };
   ```

2. **Role Assignment**
   ```javascript
   const assignUserRole = async (userData, role, institutionId) => {
     // Set the user's role based on the signup link
     // Link to the specified institution
     // Create proper user document
   };
   ```

### Database Structure Updates

The user documents in Firestore should include these fields:
- `institutionId`: Links to the institution document
- `departmentId`: Links to the department document (assigned after signup)
- `teacherId`: For students, links to their assigned teacher (assigned after signup)
- `role`: Must be one of `platform_admin`, `institution_admin`, `teacher`, or `student`

## Testing the Implementation

### Verification Scripts

Scripts have been created to verify the hierarchy linking:

1. **fix-user-hierarchy-linking.cjs**: Fixes existing user relationships
2. **verify-user-hierarchy.cjs**: Verifies that all relationships are properly established

Run these scripts with:
```bash
node src/scripts/fix-user-hierarchy-linking.cjs
node src/scripts/verify-user-hierarchy.cjs
```

### Manual Testing Process

1. **Create a new institution admin**
   - Use custom signup link
   - Verify the admin is linked to the correct institution
   - Verify role is set to `institution_admin`

2. **Create a new teacher**
   - Use custom signup link
   - Verify the teacher is linked to the correct institution
   - Verify role is set to `teacher`

3. **Create a new student**
   - Use custom signup link
   - Verify the student is linked to the correct institution
   - Verify role is set to `student`

## Future Considerations

### Multi-Institution Support

When expanding to multiple institutions:

1. **Institution Request Process**
   - Institutions request access through a contact form
   - Platform admins review and approve requests
   - Platform admins create institution records and generate custom signup links

2. **Custom Link Management**
   - Platform admins can generate, revoke, and manage custom signup links
   - Links can have expiration dates
   - Links can be limited to specific number of uses

### Department Management

1. **Department Creation**
   - Institution admins can create departments within their institution
   - Departments are linked to their institution

2. **Department Assignment**
   - Institution admins assign teachers and students to departments
   - Teachers can view only students in their departments
   - Students can view only their assigned teacher

### Access Control

1. **Platform Admins**
   - Full access to all institutions
   - Can create and manage institutions
   - Can view all platform analytics

2. **Institution Admins**
   - Full access to their institution
   - Can manage teachers and students
   - Can view institution analytics

3. **Teachers**
   - Access to students in their departments
   - Can conduct interviews with their students
   - Can view their students' progress

4. **Students**
   - Access to their own data
   - Can schedule interviews with their teacher
   - Can view their own progress

## Conclusion

The current implementation successfully establishes the user hierarchy linking with the correct roles. To maintain this structure during ongoing user registration, the signup process should be enhanced to:

1. Use custom signup links for proper access control
2. Enforce role-based signup with proper validation
3. Allow proper assignment of users to departments after signup
4. Maintain the hierarchy: Platform Admin → Institution → Institution Admin → Teacher → Student

This will ensure that all new users are properly integrated into the hierarchy without requiring manual intervention, and that the access control structure is maintained.