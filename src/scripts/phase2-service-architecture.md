# Phase 2: Service Architecture

## 2.2 Create Service Architecture - Plan services needed for implementation

### 2.2.1 List new services to create (e.g., InstitutionDashboardService)

#### New Services to Create

1. **InstitutionDashboardService**
   - Purpose: Central service for all Institution Dashboard data operations
   - Responsibilities:
     - Fetch institution students across all departments
     - Manage student approval/rejection workflows
     - Retrieve scheduled interviews for institution
     - Aggregate analytics data for institution
     - Handle license management operations
     - Manage institution settings and configuration
   - Location: `src/services/institution-dashboard.service.ts`

2. **TeacherDashboardService**
   - Purpose: Service for Teacher Dashboard data operations
   - Responsibilities:
     - Fetch students in teacher's department
     - Retrieve interviews for department students
     - Get analytics data for department students
   - Location: `src/services/teacher-dashboard.service.ts`

3. **StudentDashboardService**
   - Purpose: Service for Student Dashboard data operations
   - Responsibilities:
     - Fetch student's own interview history
     - Retrieve feedback for student's interviews
     - Get analytics data for student
     - Handle resume upload operations
   - Location: `src/services/student-dashboard.service.ts`

4. **AdminDashboardService**
   - Purpose: Service for Platform Admin Dashboard operations
   - Responsibilities:
     - Manage institution creation and approval
     - Retrieve platform-wide analytics
     - Handle financial data retrieval
     - Manage system configuration
   - Location: `src/services/admin-dashboard.service.ts`

5. **LicenseManagementService**
   - Purpose: Dedicated service for license tracking and allocation
   - Responsibilities:
     - Track license usage per institution
     - Allocate licenses to departments
     - Handle license purchase workflows
     - Generate license reports
   - Location: `src/services/license-management.service.ts`

6. **AnalyticsAggregationService**
   - Purpose: Service for aggregating and processing analytics data
   - Responsibilities:
     - Aggregate student performance data
     - Calculate department and institution statistics
     - Generate comparative analytics
     - Process end-of-call analysis data
   - Location: `src/services/analytics-aggregation.service.ts`

### 2.2.2 Plan methods to add to existing services

#### Enhancements to InstitutionHierarchyService

1. **getInstitutionStudents(institutionId: string)**
   - Purpose: Get all students across all departments in an institution
   - Returns: Array of student profiles with department information

2. **getInstitutionTeachers(institutionId: string)**
   - Purpose: Get all teachers across all departments in an institution
   - Returns: Array of teacher profiles with department information

3. **getInstitutionDepartments(institutionId: string)**
   - Purpose: Get all departments in an institution
   - Returns: Array of department objects

4. **approveStudent(studentId: string, institutionId: string, departmentId: string)**
   - Purpose: Approve a pending student
   - Updates: Student status and approval timestamp

5. **rejectStudent(studentId: string, institutionId: string, departmentId: string)**
   - Purpose: Reject a pending student
   - Updates: Student status and rejection timestamp

#### Enhancements to InterviewService

1. **getInstitutionInterviews(institutionId: string, filters?: InterviewFilters)**
   - Purpose: Get all interviews for students in an institution
   - Parameters: Institution ID, optional filters (date range, status, etc.)
   - Returns: Array of interview objects

2. **getDepartmentInterviews(institutionId: string, departmentId: string, filters?: InterviewFilters)**
   - Purpose: Get all interviews for students in a department
   - Parameters: Institution ID, Department ID, optional filters
   - Returns: Array of interview objects

3. **getStudentInterviewHistory(studentId: string)**
   - Purpose: Get complete interview history for a student
   - Returns: Array of interview objects sorted by date

#### Enhancements to RBACService

1. **checkInstitutionAccess(userId: string, institutionId: string)**
   - Purpose: Verify user has access to specific institution
   - Returns: Boolean indicating access permission

2. **checkDepartmentAccess(userId: string, institutionId: string, departmentId: string)**
   - Purpose: Verify user has access to specific department
   - Returns: Boolean indicating access permission

3. **getInstitutionContext(userId: string)**
   - Purpose: Get institution context for current user
   - Returns: Institution ID and role-specific context

#### Enhancements to FinancialAnalyticsService

1. **getInstitutionFinancialData(institutionId: string)**
   - Purpose: Get financial data specific to an institution
   - Returns: Financial metrics and analytics

2. **getLicenseUsageData(institutionId: string)**
   - Purpose: Get license usage statistics for an institution
   - Returns: License allocation and usage data

### 2.2.3 Map service dependencies and implementation order

#### Service Dependencies Map

```
graph TD
    A[InstitutionDashboardService] --> B[InstitutionHierarchyService]
    A --> C[InterviewService]
    A --> D[RBACService]
    A --> E[AnalyticsAggregationService]
    A --> F[LicenseManagementService]
    
    G[TeacherDashboardService] --> B
    G --> C
    G --> D
    
    H[StudentDashboardService] --> C
    H --> D
    H --> I[FirebaseAuthService]
    
    J[AdminDashboardService] --> B
    J --> K[FinancialAnalyticsService]
    J --> D
    
    E --> C
    E --> B
    
    F --> B
    F --> K
```

#### Implementation Order

1. **First Priority Services** (Sprint 1)
   - Enhance InstitutionHierarchyService with new methods
   - Enhance InterviewService with institution/department methods
   - Create InstitutionDashboardService with basic functionality

2. **Second Priority Services** (Sprint 2-3)
   - Enhance RBACService with institution context methods
   - Create TeacherDashboardService and StudentDashboardService
   - Implement student approval/rejection workflows

3. **Third Priority Services** (Sprint 4-5)
   - Create LicenseManagementService
   - Enhance FinancialAnalyticsService
   - Create AnalyticsAggregationService

4. **Fourth Priority Services** (Sprint 6-7)
   - Create AdminDashboardService
   - Implement advanced analytics aggregation
   - Add license management functionality

#### Service Method Implementation Priorities

**InstitutionDashboardService Methods:**
1. `getInstitutionStudents()` - HIGH PRIORITY
2. `getScheduledInterviews()` - HIGH PRIORITY
3. `approveStudent()` / `rejectStudent()` - HIGH PRIORITY
4. `getStudentAnalytics()` - MEDIUM PRIORITY
5. `getInstitutionSettings()` - MEDIUM PRIORITY
6. `updateInstitutionSettings()` - MEDIUM PRIORITY
7. `getLicenseData()` - LOW PRIORITY (depends on LicenseManagementService)

**TeacherDashboardService Methods:**
1. `getDepartmentStudents()` - HIGH PRIORITY
2. `getDepartmentInterviews()` - HIGH PRIORITY
3. `getDepartmentAnalytics()` - MEDIUM PRIORITY

**StudentDashboardService Methods:**
1. `getStudentInterviews()` - HIGH PRIORITY
2. `getStudentFeedback()` - HIGH PRIORITY
3. `getStudentAnalytics()` - MEDIUM PRIORITY
4. `uploadResume()` - MEDIUM PRIORITY

**AdminDashboardService Methods:**
1. `getAllInstitutions()` - HIGH PRIORITY
2. `approveInstitution()` - HIGH PRIORITY
3. `getPlatformAnalytics()` - MEDIUM PRIORITY
4. `getFinancialData()` - MEDIUM PRIORITY

### Service Interface Design

#### InstitutionDashboardService Interface

```
interface InstitutionDashboardService {
  // Student Management
  getInstitutionStudents(institutionId: string): Promise<UserProfile[]>;
  approveStudent(studentId: string, institutionId: string, departmentId: string): Promise<void>;
  rejectStudent(studentId: string, institutionId: string, departmentId: string): Promise<void>;
  searchStudents(institutionId: string, query: string): Promise<UserProfile[]>;
  filterStudentsByStatus(institutionId: string, status: string): Promise<UserProfile[]>;
  
  // Interview Management
  getInstitutionInterviews(institutionId: string, filters?: InterviewFilters): Promise<Interview[]>;
  getScheduledInterviews(institutionId: string): Promise<Interview[]>;
  
  // Analytics
  getStudentAnalytics(institutionId: string): Promise<StudentAnalytics[]>;
  getResumeAnalytics(institutionId: string): Promise<ResumeAnalytics[]>;
  getInterviewAnalytics(institutionId: string): Promise<InterviewAnalytics[]>;
  getPlatformEngagement(institutionId: string): Promise<PlatformEngagement>;
  
  // Settings
  getInstitutionSettings(institutionId: string): Promise<InstitutionSettings>;
  updateInstitutionSettings(institutionId: string, settings: Partial<InstitutionSettings>): Promise<void>;
  
  // License Management
  getLicenseData(institutionId: string): Promise<LicenseData>;
  allocateLicenses(institutionId: string, allocation: LicenseAllocation): Promise<void>;
}
```

#### TeacherDashboardService Interface

```
interface TeacherDashboardService {
  // Student Management
  getDepartmentStudents(teacherId: string, institutionId: string, departmentId: string): Promise<UserProfile[]>;
  searchDepartmentStudents(teacherId: string, institutionId: string, departmentId: string, query: string): Promise<UserProfile[]>;
  
  // Interview Management
  getDepartmentInterviews(teacherId: string, institutionId: string, departmentId: string): Promise<Interview[]>;
  
  // Analytics
  getDepartmentAnalytics(teacherId: string, institutionId: string, departmentId: string): Promise<StudentAnalytics[]>;
}
```

#### StudentDashboardService Interface

```
interface StudentDashboardService {
  // Interview Management
  getStudentInterviews(studentId: string): Promise<Interview[]>;
  getStudentFeedback(studentId: string): Promise<InterviewFeedback | null>;
  
  // Analytics
  getStudentAnalytics(studentId: string): Promise<StudentStats>;
  
  // Resume Management
  uploadResume(studentId: string, file: File): Promise<string>;
  getStudentResumes(studentId: string): Promise<Resume[]>;
}
```

### Error Handling and Validation

#### Service-Level Error Handling

1. **Data Validation**
   - Validate all input parameters
   - Check user permissions before data access
   - Validate data integrity before updates

2. **Error Types**
   - `PermissionError`: Insufficient permissions
   - `NotFoundError`: Requested resource not found
   - `ValidationError`: Invalid input data
   - `ServiceError`: Internal service failures

3. **Error Propagation**
   - Log errors with context information
   - Provide user-friendly error messages
   - Implement retry mechanisms for transient failures

#### Service Method Signatures with Error Handling

```
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Example method with proper error handling
async function getInstitutionStudents(institutionId: string): ServiceResponse<UserProfile[]> {
  try {
    // Validate input
    if (!institutionId) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Institution ID is required'
        }
      };
    }
    
    // Check permissions
    const hasAccess = await rbacService.checkInstitutionAccess(currentUser.id, institutionId);
    if (!hasAccess) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_ERROR',
          message: 'Insufficient permissions to access institution data'
        }
      };
    }
    
    // Fetch data
    const students = await institutionHierarchyService.getInstitutionStudents(institutionId);
    
    return {
      success: true,
      data: students
    };
  } catch (error) {
    console.error('Error fetching institution students:', error);
    return {
      success: false,
      error: {
        code: 'SERVICE_ERROR',
        message: 'Failed to fetch institution students',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}
```

### Performance Considerations

#### Caching Strategy

1. **Service-Level Caching**
   - Cache frequently accessed data (institution settings, department lists)
   - Implement TTL-based cache invalidation
   - Use memory-efficient caching mechanisms

2. **Query Optimization**
   - Use Firestore composite indexes for common query patterns
   - Implement pagination for large datasets
   - Minimize document reads through selective field retrieval

3. **Batch Operations**
   - Batch related database operations
   - Use Firestore batch writes for multi-document updates
   - Implement bulk data processing where appropriate

### Testing Strategy for Services

#### Unit Testing

1. **Individual Method Testing**
   - Test each service method with valid inputs
   - Test error conditions and edge cases
   - Mock dependencies for isolated testing

2. **Integration Testing**
   - Test service interactions with real Firestore data
   - Validate data transformation logic
   - Test permission checking workflows

3. **Performance Testing**
   - Measure response times for critical operations
   - Test with large datasets
   - Validate caching effectiveness

### Documentation Requirements

#### Service Documentation

1. **API Documentation**
   - Document all public methods with JSDoc
   - Include parameter descriptions and return types
   - Provide usage examples

2. **Error Documentation**
   - Document all possible error conditions
   - Provide error code meanings
   - Include troubleshooting guidance

3. **Dependency Documentation**
   - List all service dependencies
   - Document initialization requirements
   - Include configuration instructions

This service architecture provides a solid foundation for implementing the Institution Dashboard with real data integration while maintaining clean separation of concerns and reusing existing services where possible.

# PHASE 2.2: SERVICE ARCHITECTURE

## NEW SERVICES TO CREATE

### InstitutionDashboardService
A dedicated service to handle all Institution Dashboard data operations:

```
interface InstitutionDashboardService {
  // Student Management
  getInstitutionStudents(institutionId: string): Promise<UserProfile[]>;
  approveStudent(studentId: string, institutionId: string, departmentId: string): Promise<void>;
  rejectStudent(studentId: string, institutionId: string, departmentId: string): Promise<void>;
  
  // Teacher Management
  getInstitutionTeachers(institutionId: string): Promise<UserProfile[]>;
  
  // Interview Management
  getInstitutionScheduledInterviews(institutionId: string): Promise<Interview[]>;
  getInstitutionInterviewHistory(institutionId: string): Promise<Interview[]>;
  
  // Analytics
  getStudentAnalytics(institutionId: string): Promise<StudentAnalytics>;
  getResumeAnalytics(institutionId: string): Promise<ResumeAnalytics>;
  getInterviewAnalytics(institutionId: string): Promise<InterviewAnalytics>;
  getPlatformEngagement(institutionId: string): Promise<PlatformEngagement>;
  
  // License Management
  getLicenseInfo(institutionId: string): Promise<LicenseInfo>;
  allocateLicenses(institutionId: string, count: number): Promise<void>;
  
  // Department Management
  getDepartments(institutionId: string): Promise<Department[]>;
  createDepartment(institutionId: string, departmentData: Partial<Department>): Promise<string>;
  updateDepartment(institutionId: string, departmentId: string, departmentData: Partial<Department>): Promise<void>;
}
```

## METHODS TO ADD TO EXISTING SERVICES

### RBACService Enhancements
```
class RBACService {
  // New methods for institution-level permissions
  static async getUserInstitutionPermissions(userId: string, institutionId: string): Promise<Permission[]> {
    // Implementation to fetch institution-specific permissions
  }
  
  static async isInstitutionAdmin(userId: string, institutionId: string): Promise<boolean> {
    // Check if user is admin for specific institution
  }
  
  static async getUserDepartmentAccess(userId: string, institutionId: string): Promise<string[]> {
    // Get list of departments user can access within institution
  }
}
```

### InstitutionHierarchyService Enhancements
```
class InstitutionHierarchyService {
  // Methods to navigate institution structure
  static async getInstitutionDepartments(institutionId: string): Promise<Department[]> {
    // Fetch all departments for an institution
  }
  
  static async getDepartmentMembers(institutionId: string, departmentId: string): Promise<{ 
    teachers: UserProfile[], 
    students: UserProfile[] 
  }> {
    // Get all members (teachers and students) in a department
  }
  
  static async getUserInstitutionAffiliation(userId: string): Promise<InstitutionAffiliation | null> {
    // Determine which institution a user belongs to
  }
}
```

## SERVICE DEPENDENCIES AND IMPLEMENTATION ORDER

### Priority Implementation Order:

1. **InstitutionHierarchyService** enhancements (Foundation)
   - Required by all other services for institution context
   
2. **RBACService** enhancements (Security Layer)
   - Needed for all data access validation
   
3. **InstitutionDashboardService** (Core Functionality)
   - Implements all dashboard data operations
   
4. **FinancialAnalyticsService** integration (Reporting)
   - For license and financial data display

### Dependency Mapping:
```
InstitutionDashboardService
├── InstitutionHierarchyService (enhanced)
├── RBACService (enhanced)
├── InterviewService
├── FinancialAnalyticsService
└── UserService
```

## SERVICE COMMUNICATION PATTERNS

### Asynchronous Data Loading
- All service methods should return Promises
- Implement proper error handling for network failures
- Provide loading states for UI components

### Data Transformation Layer
- Services should transform raw Firestore data into UI-ready formats
- Normalize data structures for consistent component usage
- Handle data aggregation for analytics views

### Caching Strategy
- Implement in-memory caching for frequently accessed data
- Use Firestore snapshot listeners for real-time updates where appropriate
- Clear cache on relevant data mutations

## ERROR HANDLING AND LOGGING

### Standard Error Responses
```
interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### Logging Requirements
- Log all data access attempts with user context
- Record failed permission checks
- Track performance metrics for service methods

## TESTING CONSIDERATIONS

### Unit Test Coverage
- Each service method should have unit tests
- Mock Firestore interactions for isolated testing
- Test error scenarios and edge cases

### Integration Testing Points
- Verify service-to-service communication
- Validate data transformation logic
- Confirm permission enforcement

## FUTURE EXTENSIBILITY

### Plugin Architecture
- Design services to accept extension points
- Allow for custom institution features
- Support third-party integrations

### Performance Monitoring
- Add performance tracking to service methods
- Implement usage analytics for service features
- Plan for horizontal scaling of service operations
