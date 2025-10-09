# Octavia Interview Buddy - Architecture & Requirements Documentation

## 📋 Project Overview

**Project Name**: Octavia Interview Buddy  
**Description**: AI-powered interview practice platform for educational institutions and students  
**Technology Stack**: React 18.3.1, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Target Users**: Students, Educational Institutions, Platform Administrators  

---

## 🏗️ System Architecture

### **High-Level Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Services    │    │   Backend       │
│   (React/TS)    │◄──►│   (Voice AI)     │◄──►│   (TBD)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │    │   VAPI           │    │   Database      │
│   (shadcn/ui)   │    │   Integration    │    │   (TBD)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Frontend Architecture**

#### **Core Technologies**
- **React 18.3.1** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management and data fetching
- **React Router DOM** for navigation
- **VAPI** for real-time audio communication

#### **Project Structure**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components (49 items)
│   ├── session/         # Session management components
│   └── [feature]/       # Feature-specific components
├── pages/               # Route components (22 pages)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

---

## 👥 User Roles & Permissions

### **1. Students**
**Route**: `/student`  
**Capabilities**:
- Upload and manage resumes (PDF, LinkedIn, Voice)
- Book interview sessions
- Participate in AI-powered voice interviews
- View interview history and feedback
- Track performance analytics
- Access interview preparation resources

### **2. Institution Administrators**
**Route**: `/dashboard`  
**Capabilities**:
- Manage student enrollments and access
- Purchase and allocate interview sessions
- View institutional analytics and reports
- Configure department allocations
- Manage billing and payments
- Monitor student group performance
- Generate signup links for students

### **3. Platform Administrators**
**Route**: `/admin`  
**Capabilities**:
- Manage all institutions and users
- Configure platform-wide settings
- Monitor system performance and analytics
- Manage financial operations and pricing
- Send platform-wide broadcasts
- Export data and generate reports
- Manage platform resources and content

---

## 🛣️ Route Structure & Pages

### **Public Routes**
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Index | Landing page with hero, features, and institution contact |
| `/about` | AboutPage | Company information and mission |
| `/login` | Login | User authentication |
| `/signup` | Signup | User registration (requires .edu email) |
| `/forgot-password` | ForgotPassword | Password reset functionality |
| `/privacy` | PrivacyPolicyPage | Privacy policy and data handling |
| `/terms` | TermsOfServicePage | Terms of service |

### **Student Routes**
| Route | Component | Description |
|-------|-----------|-------------|
| `/student` | StudentDashboardPage | Main student dashboard with tabs |
| `/interview` | Interview | AI interview interface and setup |
| `/resumes` | ResumesPage | Resume management |

### **Institution Routes**
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Institution dashboard with session management |
| `/departments` | DepartmentAllocationPage | Department-specific session allocation |
| `/student-groups` | StudentGroupAllocationPage | Student group management |

### **Admin Routes**
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | AdminControlPanel | Main admin dashboard |
| `/admin/add-institution` | AddInstitutionPage | Add new institutions |
| `/admin/institution/:id/analytics` | InstitutionAnalyticsPage | Institution-specific analytics |
| `/admin/export` | ExportDataPage | Data export and reporting |

### **Commented/Future Routes**
```typescript
// Jobs marketplace features (temporarily disabled)
// /jobs - JobsPage
// /jobs/details/:id - JobDetailsPage  
// /jobs/apply/:id - JobApplicationPage
```

---

## 🧩 Core Components & Features

### **Interview System**
- **InterviewInterface**: Main AI interview component with voice interaction
- **ResumeUploadDialog**: Multi-format resume upload (PDF, LinkedIn, Voice)
- **PreInterviewDialog**: Interview preparation and tips
- **BookingCalendar**: Interview scheduling system
- **SessionManagement**: Session purchase and allocation

### **Analytics & Reporting**
- **AIAnalytics**: Advanced AI-powered insights
- **InstitutionMetrics**: Institution performance tracking
- **FinancialManagement**: Revenue and billing analytics
- **StudentDashboard**: Personal performance tracking

### **Administration**
- **AdminDashboard**: Platform-wide metrics and controls
- **InstitutionManagement**: Institution CRUD operations
- **StudentManagement**: Student account management
- **BroadcastSystem**: Communication and notifications
- **ResourceManagement**: Platform content management

### **Session & Billing**
- **SessionPurchase**: Session purchasing workflow
- **BillingControls**: Payment and subscription management
- **AllocationChangeDialog**: Session reallocation
- **PricingChangeDialog**: Dynamic pricing updates

---

## 🎯 Core Features & Requirements

### **Authentication & Authorization**
- [x] Login/Signup system with role-based routing
- [x] Educational email validation (.edu domains)
- [x] Password reset functionality
- [ ] OAuth integration (Google, Microsoft)
- [ ] Multi-factor authentication
- [ ] Session management and security

### **AI Interview System**
- [x] Voice-based interview interface
- [x] Resume analysis and question generation
- [x] Real-time audio processing via VAPI
- [x] 15-minute session management
- [ ] AI model integration for question generation
- [ ] Real-time feedback and scoring
- [ ] Interview recording and playback

### **Resume Management**
- [x] Multiple upload formats (PDF, LinkedIn URL, Voice)
- [x] Resume preview and management
- [ ] Resume parsing and analysis
- [ ] Skill extraction and matching
- [ ] Resume optimization suggestions

### **Session Management**
- [x] Session purchase and allocation system
- [x] Calendar-based booking interface
- [x] Department and group allocations
- [ ] Automated session scheduling
- [ ] Session reminder notifications
- [ ] Usage analytics and reporting

### **Analytics & Insights**
- [x] Student performance tracking
- [x] Institution-wide analytics
- [x] Financial reporting and metrics
- [ ] AI-powered insights and recommendations
- [ ] Predictive analytics
- [ ] Custom report generation

### **Administrative Features**
- [x] Multi-level user management
- [x] Institution onboarding workflow
- [x] Broadcast communication system
- [ ] Automated billing and invoicing
- [ ] Data export and compliance
- [ ] System monitoring and alerts

---

## 🔌 Integration Requirements

### **AI Services**
- **Voice AI**: Real-time speech recognition and synthesis
- **NLP**: Interview question generation and response analysis
- **Scoring Engine**: Performance evaluation and feedback

### **Third-Party Services**
- **VAPI**: Real-time audio communication
- **Payment Processing**: Stripe/PayPal integration
- **Email Service**: Notification and communication
- **Cloud Storage**: Resume and recording storage

### **Backend Services** (To Be Implemented)
- **Authentication API**: User management and security
- **Session API**: Interview session management
- **Analytics API**: Data collection and reporting
- **Billing API**: Payment and subscription management

---

## 📊 Data Models

### **User Entities**
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  institutionId: string;
  resumes: Resume[];
  interviews: Interview[];
  createdAt: Date;
}

interface Institution {
  id: string;
  name: string;
  domain: string;
  adminId: string;
  sessionPool: number;
  settings: InstitutionSettings;
  createdAt: Date;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  permissions: AdminPermissions;
  createdAt: Date;
}
```

### **Core Entities**
```typescript
interface Interview {
  id: string;
  studentId: string;
  resumeId: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  recording?: string;
  feedback?: InterviewFeedback;
  score?: number;
}

interface Resume {
  id: string;
  studentId: string;
  type: 'pdf' | 'linkedin' | 'voice';
  content: string;
  skills: string[];
  createdAt: Date;
}

interface Session {
  id: string;
  institutionId: string;
  purchasedSessions: number;
  usedSessions: number;
  price: number;
  purchaseDate: Date;
}
```

---

## 🚀 Development Roadmap

### **Phase 1: Core Foundation** ✅
- [x] Frontend architecture and routing
- [x] UI component library integration
- [x] Basic authentication flows
- [x] Student and admin dashboards

### **Phase 2: Interview System** 🚧
- [x] Interview interface development
- [x] Resume upload functionality
- [ ] AI service integration
- [ ] Real-time feedback system

### **Phase 3: Backend Integration** 📋
- [ ] API development and integration
- [ ] Database design and implementation
- [ ] Authentication and authorization
- [ ] Session management backend

### **Phase 4: Advanced Features** 📋
- [ ] AI-powered analytics
- [ ] Advanced reporting system
- [ ] Payment processing integration
- [ ] Mobile responsiveness optimization

### **Phase 5: Production Ready** 📋
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and logging
- [ ] Deployment and DevOps

---

## 🔒 Security Considerations

### **Authentication & Authorization**
- Educational email verification
- Role-based access control (RBAC)
- Session management and timeout
- Password security requirements

### **Data Protection**
- Resume and interview data encryption
- GDPR/FERPA compliance
- Secure file upload and storage
- Audio recording protection

### **Platform Security**
- API rate limiting and validation
- XSS and CSRF protection
- Secure communication (HTTPS/WSS)
- Regular security audits

---

## 📈 Performance Requirements

### **Frontend Performance**
- Page load time < 2 seconds
- Interactive elements < 100ms response
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1)

### **Audio Performance**
- Real-time audio latency < 200ms
- High-quality audio recording
- Reliable voice recognition
- Seamless audio playback

### **Scalability**
- Support for 10,000+ concurrent users
- Horizontal scaling capability
- CDN integration for static assets
- Database optimization for analytics

---

## 🛠️ Development Guidelines

### **Code Standards**
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure
- Comprehensive error handling

### **Testing Strategy**
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for critical flows
- End-to-end testing for user journeys

### **Deployment Strategy**
- Environment-based configuration
- Automated CI/CD pipeline
- Blue-green deployment
- Monitoring and alerting

---

This architecture document serves as the foundation for the Octavia Interview Buddy platform development and should be updated as the project evolves.