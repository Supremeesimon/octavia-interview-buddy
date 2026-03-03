# User Role Dashboards

This document outlines what each type of user sees when they log in to the Octavia Interview Buddy platform.

## 1. Student Dashboard

### Access Path
- URL: `/student`
- Navigation: Main dashboard with tabs for Dashboard, Interviews, and Resumes

### Key Features
1. **Personal Dashboard**
   - Interview statistics and performance metrics
   - Upcoming interview schedule
   - Recent feedback and scores
   - Skill improvement recommendations

2. **Interview Practice**
   - AI-powered interview interface
   - Multiple interview types (Behavioral, Technical, General)
   - Real-time feedback and analysis
   - Recording and transcript access

3. **Resume Management**
   - Upload and manage multiple resumes
   - AI-powered resume parsing and suggestions
   - LinkedIn profile integration
   - Voice resume recording

4. **Performance Analytics**
   - Historical interview performance
   - Skill progression tracking
   - Comparative benchmarks
   - Improvement recommendations

### UI Components
- Student performance cards with scores
- Interview scheduling calendar
- Resume upload and management interface
- Feedback visualization with charts and graphs

## 2. Institution Admin Dashboard

### Access Path
- URL: `/dashboard`
- Navigation: Tabbed interface with Overview, Session Pool, and Billing & Payments

### Key Features
1. **Institution Overview**
   - License usage and availability
   - Student registration and approval management
   - Signup link generation and management
   - Key performance metrics

2. **Student Management**
   - Student list with filtering and search
   - Approval workflow for new students
   - Performance tracking by department
   - Risk identification for struggling students

3. **Session Management**
   - Session pool monitoring
   - Department allocation of sessions
   - Purchase additional sessions
   - Usage reporting

4. **Analytics & Reporting**
   - Department performance comparison
   - Student performance analytics
   - Interview completion rates
   - Exportable reports

5. **Settings & Configuration**
   - Institution profile management
   - Notification preferences
   - Email domain verification
   - Department management

### UI Components
- License usage progress bars
- Student performance tables with expandable details
- Department comparison charts
- Session allocation management
- Billing and payment controls

## 3. Platform Admin Dashboard

### Access Path
- URL: `/admin`
- Navigation: Comprehensive tabbed interface with Dashboard, Institutions, Students, Resources, Broadcast, Analytics, and Financial

### Key Features
1. **Platform Overview**
   - System health and performance metrics
   - Institution and user growth statistics
   - Revenue and subscription metrics
   - Platform-wide analytics

2. **Institution Management**
   - Institution account creation and management
   - Subscription and billing oversight
   - Support ticket management
   - Usage monitoring

3. **User Management**
   - Student and admin account management
   - Access control and permissions
   - Account verification and security
   - User activity monitoring

4. **Resource Management**
   - Content and template management
   - AI model updates and deployment
   - Platform documentation
   - Feature flag management

5. **Broadcast System**
   - Platform-wide announcements
   - Targeted messaging to user segments
   - Notification management
   - Communication analytics

6. **Advanced Analytics**
   - AI performance and accuracy metrics
   - User engagement analytics
   - Feature adoption tracking
   - Predictive analytics

7. **Financial Management**
   - Pricing model management
   - Revenue tracking and reporting
   - Margin analysis
   - Subscription tier management

### UI Components
- Comprehensive analytics dashboards
- Multi-level navigation with collapsible sections
- Data visualization with advanced charts
- Institution and user management tables
- Resource upload and management interface

## Department Integration

### Student Registration
- Students select their department during signup
- Department information stored in user profile
- Used for analytics and reporting

### Teacher/Instructor Registration
- Teachers select their department during signup
- Department information used for student grouping
- Access control based on department affiliation

### Admin Access
- Institution admins have access to all departments within their institution
- Platform admins have access to all institutions and departments
- Department-level filtering and reporting capabilities

## Data Flow and Permissions

### Student Data Access
- Students can only view their own data
- Department information used for institutional analytics
- Performance data aggregated at department and institution levels

### Institution Admin Data Access
- Access to all students within their institution
- Department-level filtering and reporting
- Session management for their institution
- Cannot access other institutions' data

### Platform Admin Data Access
- Full access to all platform data
- Cross-institution analytics and reporting
- System configuration and management
- User and institution management capabilities

## Future Enhancements

### Department-Specific Features
- Department-branded interview experiences
- Custom question banks per department
- Department-specific performance benchmarks
- Collaborative tools for department admins

### Advanced Analytics
- Predictive modeling for student success
- Curriculum alignment with industry needs
- Department performance trend analysis
- Comparative institutional benchmarking

This structure ensures that each user type has access to the appropriate level of information and functionality while maintaining data security and privacy.