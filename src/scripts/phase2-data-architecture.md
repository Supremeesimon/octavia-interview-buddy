# Phase 2: Data Architecture

## 2.1 Create Data Architecture - Design complete data flow for Institution Dashboard

### 2.1.1 Design complete collection structure for all Firestore collections

#### Current Firestore Collection Structure

1. **institutions**
   - Main institution documents
   - Contains institution profile, settings, and statistics
   - Subcollections:
     - `admins` - Institution administrators
     - `departments` - Academic departments
       - Subcollections:
         - `teachers` - Teachers in the department
         - `students` - Students in the department

2. **externalUsers**
   - Users not affiliated with any institution
   - Students, teachers, or admins from external organizations

3. **platformAdmins**
   - Platform-level administrators with access to all institutions

4. **interviews**
   - Interview session records
   - Linked to students via studentId

5. **interview-feedback**
   - Feedback and evaluation data for interviews
   - Linked to interviews via interviewId

6. **end-of-call-analysis**
   - VAPI-generated analysis data
   - Contains detailed performance metrics

7. **student-stats**
   - Aggregated statistics for individual students

8. **institution-stats**
   - Aggregated statistics for institutions

9. **department-stats**
   - Aggregated statistics for departments

10. **financial_analytics**
    - Financial margin and revenue data

11. **system_config**
    - System-wide configuration settings

12. **institution_interests**
    - Signup requests from interested institutions

#### Required Collection Structure for Institution Dashboard

The Institution Dashboard requires access to data from multiple collections, organized by role-based access:

1. **institutions** (READ/WRITE)
   - Institution profile and settings
   - Custom signup links and tokens
   - Institution statistics and analytics

2. **institutions/{institutionId}/departments** (READ)
   - Department names and information
   - Department-level statistics

3. **institutions/{institutionId}/departments/{departmentId}/students** (READ/WRITE)
   - Student profiles and contact information
   - Student enrollment status
   - Student department assignment

4. **institutions/{institutionId}/admins** (READ - for self only)
   - Institution admin profiles

5. **interviews** (READ - filtered by studentId)
   - Scheduled and completed interviews
   - Interview status and scheduling information

6. **end-of-call-analysis** (READ - filtered by studentId)
   - Student performance analytics
   - Resume and interview metrics
   - Detailed analysis reports

7. **student-stats** (READ - filtered by studentId)
   - Aggregated student performance data
   - Improvement trends and statistics

8. **financial_analytics** (READ - platform admin only)
   - Financial margin data
   - Revenue and cost information

### 2.1.2 Document data access patterns for each dashboard component

#### Institution Dashboard Data Access Patterns

1. **Students Tab**
   - Collection: `institutions/{institutionId}/departments/{departmentId}/students`
   - Access Pattern: READ all students in all departments of the institution
   - Filters: Status (active/pending/rejected), search by name/email
   - Sorting: By name, signup date, last activity
   - Permissions: Institution Admin role required

2. **Pending Approvals Tab**
   - Collection: `institutions/{institutionId}/departments/{departmentId}/students`
   - Access Pattern: READ students with pending status
   - Actions: UPDATE student status (approve/reject)
   - Permissions: Institution Admin role required

3. **Scheduled Interviews Tab**
   - Collection: `interviews`
   - Access Pattern: READ interviews where studentId matches institution students
   - Filters: Date range, interview type
   - Permissions: Institution Admin role required

4. **Analytics Dashboard**
   - Collections: `end-of-call-analysis`, `student-stats`
   - Access Pattern: READ analysis data for all students in institution
   - Aggregation: Department-level and institution-level metrics
   - Permissions: Institution Admin role required

5. **Reports Tab**
   - Collections: `institutions`, `institution-stats`, `financial_analytics`
   - Access Pattern: READ institution statistics and financial data
   - Export: Generate reports in various formats
   - Permissions: Institution Admin role required

6. **Settings Tab**
   - Collection: `institutions/{institutionId}`
   - Access Pattern: READ institution profile, UPDATE settings
   - Permissions: Institution Admin role required

#### Teacher Dashboard Data Access Patterns

1. **Students Tab**
   - Collection: `institutions/{institutionId}/departments/{departmentId}/students`
   - Access Pattern: READ students in teacher's department only
   - Permissions: Teacher role required

2. **Scheduled Interviews Tab**
   - Collection: `interviews`
   - Access Pattern: READ interviews for students in teacher's department
   - Permissions: Teacher role required

3. **Analytics Dashboard**
   - Collections: `end-of-call-analysis`, `student-stats`
   - Access Pattern: READ analysis data for students in teacher's department
   - Permissions: Teacher role required

#### Student Dashboard Data Access Patterns

1. **Profile Data**
   - Collection: `institutions/{institutionId}/departments/{departmentId}/students/{studentId}`
   - Access Pattern: READ own student profile
   - Permissions: Student role required, studentId must match

2. **Interview History**
   - Collection: `interviews`
   - Access Pattern: READ interviews where studentId matches current user
   - Permissions: Student role required, studentId must match

3. **Feedback Data**
   - Collection: `interview-feedback`
   - Access Pattern: READ feedback where interviewId matches student's interviews
   - Permissions: Student role required, studentId must match

4. **Analytics Data**
   - Collections: `end-of-call-analysis`, `student-stats`
   - Access Pattern: READ analysis data where studentId matches current user
   - Permissions: Student role required, studentId must match

#### Admin Dashboard Data Access Patterns

1. **Institution Management**
   - Collection: `institutions`
   - Access Pattern: READ/WRITE all institutions
   - Permissions: Platform Admin role required

2. **Platform Analytics**
   - Collections: `financial_analytics`, `institution-stats`
   - Access Pattern: READ aggregated platform data
   - Permissions: Platform Admin role required

### 2.1.3 Identify missing collections that need to be created

#### Currently Missing Collections

1. **department-stats**
   - Purpose: Store aggregated statistics for departments
   - Fields:
     - departmentId (string)
     - institutionId (string)
     - totalStudents (number)
     - activeStudents (number)
     - totalInterviews (number)
     - averageScore (number)
     - topPerformingStudents (array)
     - skillDistribution (map)
     - updatedAt (timestamp)
     - createdAt (timestamp)

2. **license-tracking**
   - Purpose: Track license allocation and usage per institution
   - Fields:
     - institutionId (string)
     - totalLicenses (number)
     - usedLicenses (number)
     - allocatedLicenses (map - departmentId: count)
     - licenseType (string - "student" | "teacher")
     - expirationDate (timestamp)
     - updatedAt (timestamp)
     - createdAt (timestamp)

3. **institution-config**
   - Purpose: Store institution-specific configuration settings
   - Fields:
     - institutionId (string)
     - emailDomains (array)
     - allowedBookingsPerMonth (number)
     - sessionLength (number)
     - requireResumeUpload (boolean)
     - enableDepartmentAllocations (boolean)
     - emailNotificationSettings (map)
     - customBranding (map)
     - updatedAt (timestamp)
     - createdAt (timestamp)

4. **audit-logs**
   - Purpose: Track important actions for security and compliance
   - Fields:
     - userId (string)
     - institutionId (string)
     - action (string)
     - resourceType (string)
     - resourceId (string)
     - details (map)
     - ipAddress (string)
     - userAgent (string)
     - timestamp (timestamp)

### 2.1.4 Plan query optimization strategies

#### Query Optimization Strategies

1. **Indexing Strategy**
   - Create composite indexes for common query patterns:
     - `interviews` collection: [studentId, status, createdAt]
     - `end-of-call-analysis` collection: [studentId, timestamp]
     - `institutions` collection: [approvalStatus, createdAt]
     - `institution_interests` collection: [status, createdAt]

2. **Pagination**
   - Implement cursor-based pagination for large datasets
   - Limit initial loads to 50-100 records
   - Use `startAfter()` and `limit()` for efficient pagination

3. **Data Denormalization**
   - Store pre-aggregated statistics in dedicated collections
   - Duplicate frequently accessed data in parent documents
   - Use Cloud Functions to maintain consistency

4. **Batch Operations**
   - Use batched writes for related updates
   - Group related reads using `Promise.all()`
   - Minimize the number of round trips to Firestore

5. **Caching Strategy**
   - Implement in-memory caching for frequently accessed static data
   - Use React Query or similar library for client-side caching
   - Set appropriate cache expiration times

6. **Real-time vs. One-time Queries**
   - Use real-time listeners only for critical data that needs immediate updates
   - Use one-time queries for historical data and reports
   - Detach listeners when components unmount

7. **Query Filtering**
   - Always use `where()` clauses to filter data on the server
   - Avoid client-side filtering of large datasets
   - Use array-contains and array-contains-any for array field queries

8. **Field Selection**
   - Use `select()` to retrieve only necessary fields
   - Reduce bandwidth usage by limiting data transfer
   - Improve query performance with selective field retrieval

#### Specific Query Patterns for Institution Dashboard

1. **Get all students in an institution**
   ```javascript
   // Instead of querying each department separately
   // Use a Cloud Function to aggregate student data
   ```

2. **Get scheduled interviews for institution**
   ```javascript
   // Use a composite index on [studentId, status, scheduledAt]
   const q = query(
     collection(db, 'interviews'),
     where('studentId', 'in', studentIds),
     where('status', '==', 'scheduled'),
     orderBy('scheduledAt'),
     limit(50)
   );
   ```

3. **Get analytics data for students**
   ```javascript
   // Use a composite index on [studentId, timestamp]
   const q = query(
     collection(db, 'end-of-call-analysis'),
     where('studentId', 'in', studentIds),
     orderBy('timestamp', 'desc'),
     limit(100)
   );
   ```

4. **Get institution statistics**
   ```javascript
   // Pre-aggregate data in institution-stats collection
   const docRef = doc(db, 'institution-stats', institutionId);
   ```

### Data Security and Privacy Considerations

1. **Role-Based Access Control**
   - Implement strict Firestore security rules
   - Validate user roles on both client and server
   - Use custom claims for efficient role checking

2. **Data Isolation**
   - Ensure institutions cannot access each other's data
   - Implement proper query scoping by institutionId
   - Use server-side validation for all data access

3. **PII Protection**
   - Minimize storage of personally identifiable information
   - Implement data retention policies
   - Use encryption for sensitive data at rest

4. **Audit Trail**
   - Log all data access and modification attempts
   - Monitor for unusual access patterns
   - Implement automated alerts for suspicious activity

### Performance Monitoring

1. **Query Performance**
   - Monitor query execution times
   - Identify slow-performing queries
   - Optimize indexes based on usage patterns

2. **Data Transfer**
   - Monitor bandwidth usage
   - Optimize document sizes
   - Implement efficient data fetching strategies

3. **Real-time Updates**
   - Monitor listener attachment/detachment
   - Track active connections
   - Optimize real-time data usage
