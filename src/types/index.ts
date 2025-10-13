/**
 * TypeScript interfaces for Octavia Interview Buddy
 * Defines all data models and API types
 */

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = 'student' | 'teacher' | 'institution_admin' | 'platform_admin';

export type AdminPermission = 
  | 'manage_students'
  | 'manage_sessions'
  | 'view_analytics'
  | 'manage_billing'
  | 'manage_settings';

export type PlatformPermission = 
  | 'manage_institutions'
  | 'manage_users'
  | 'view_platform_analytics'
  | 'manage_pricing'
  | 'manage_system_settings'
  | 'access_support_tools';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  institutionId?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  institutionDomain?: string;
  department?: string;
  yearOfStudy?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile extends User {
  institutionDomain?: string;
  emailVerified: boolean;
  sessionCount: number;
  profileCompleted: boolean;
  department?: string;
  yearOfStudy?: string;
}

export interface Student extends User {
  role: 'student';
  institutionId: string;
  resumes: Resume[];
  interviews: Interview[];
  stats: StudentStats;
}

export interface InstitutionAdmin extends User {
  role: 'institution_admin';
  institutionId: string;
  permissions: AdminPermission[];
}

export interface PlatformAdmin extends User {
  role: 'platform_admin';
  permissions: PlatformPermission[];
}

export interface Teacher extends User {
  role: 'teacher';
  institutionId: string;
  department: string;
  permissions: AdminPermission[];
}

// =============================================================================
// INSTITUTION TYPES
// =============================================================================

export interface Institution {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  website?: string;
  adminId: string;
  settings: InstitutionSettings;
  sessionPool: SessionPool;
  stats: InstitutionStats;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Pricing override fields
  pricingOverride?: InstitutionPricingOverride | null;
}

export interface InstitutionPricingOverride {
  customVapiCost: number;
  customMarkupPercentage: number;
  customLicenseCost: number;
  isEnabled: boolean;
}

// Interface for scheduled price changes
export interface ScheduledPriceChange {
  id: string;
  changeDate: Date;
  changeType: 'vapiCost' | 'markupPercentage' | 'licenseCost';
  affected: 'all' | string; // 'all' for all institutions, or specific institution ID
  currentValue: number;
  newValue: number;
  status: 'scheduled' | 'applied' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface InstitutionSettings {
  allowedBookingsPerMonth: number;
  sessionLength: number; // in minutes
  requireResumeUpload: boolean;
  enableDepartmentAllocations: boolean;
  enableStudentGroups: boolean;
  emailNotifications: EmailNotificationSettings;
}

export interface EmailNotificationSettings {
  enableInterviewReminders: boolean;
  enableFeedbackEmails: boolean;
  enableWeeklyReports: boolean;
  reminderHours: number; // hours before interview
}

// =============================================================================
// SESSION TYPES
// =============================================================================

export interface SessionPool {
  id: string;
  institutionId: string;
  totalSessions: number;
  usedSessions: number;
  availableSessions: number;
  allocations: SessionAllocation[];
  purchases: SessionPurchase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionAllocation {
  id: string;
  sessionPoolId: string;
  departmentId?: string;
  groupId?: string;
  allocatedSessions: number;
  usedSessions: number;
  name: string;
  createdAt: Date;
}

export interface SessionPurchase {
  id: string;
  institutionId: string;
  sessionCount: number;
  pricePerSession: number;
  totalAmount: number;
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

// =============================================================================
// RESUME TYPES
// =============================================================================

export type ResumeType = 'pdf' | 'linkedin' | 'voice';

export interface ParsedResumeContent {
  fullName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  certifications?: Certification[];
  languages?: Language[];
  projects?: Project[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent: boolean;
  gpa?: number;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: Date;
  expirationDate?: Date;
  credentialId?: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  startDate?: Date;
  endDate?: Date;
  technologies: string[];
}

export interface Resume {
  id: string;
  studentId: string;
  type: ResumeType;
  fileName?: string;
  fileUrl?: string;
  linkedinUrl?: string;
  voiceRecordingUrl?: string;
  parsedContent: ParsedResumeContent;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// INTERVIEW TYPES
// =============================================================================

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Interview {
  id: string;
  studentId: string;
  resumeId: string;
  sessionId: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration: number; // in seconds
  status: InterviewStatus;
  type: InterviewType;
  recording?: InterviewRecording;
  transcript?: string;
  feedback?: InterviewFeedback;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InterviewType = 'behavioral' | 'technical' | 'general' | 'industry_specific';

export interface InterviewRecording {
  id: string;
  interviewId: string;
  audioUrl: string;
  duration: number;
  format: string;
  size: number;
  createdAt: Date;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  overallScore: number;
  categories: FeedbackCategory[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  detailedAnalysis: string;
  createdAt: Date;
}

export interface FeedbackCategory {
  name: string;
  score: number;
  weight: number;
  description: string;
}

// =============================================================================
// VAPI INTEGRATION TYPES
// =============================================================================

export interface VapiCall {
  id: string;
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
  duration?: number;
  transcript?: string;
  metadata?: Record<string, any>;
}

export interface VapiConfig {
  assistantId: string;
  publicKey: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface StudentStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  improvementRate: number;
  lastInterviewDate?: Date;
  strongestSkills: string[];
  areasForImprovement: string[];
}

export interface InstitutionStats {
  totalStudents: number;
  activeStudents: number;
  totalInterviews: number;
  averageScore: number;
  sessionUtilization: number;
  topPerformingDepartments: DepartmentStats[];
  monthlyUsage: MonthlyUsageStats[];
}

export interface DepartmentStats {
  name: string;
  studentCount: number;
  averageScore: number;
  totalInterviews: number;
}

export interface MonthlyUsageStats {
  month: string;
  year: number;
  interviews: number;
  students: number;
  averageScore: number;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'paypal' | 'bank_transfer';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// RESOURCE TYPES
// =============================================================================

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'Questions' | 'Guide' | 'Video';
  institutions: string[]; // Array of institution IDs or 'All'
  dateCreated: string; // YYYY-MM-DD format
  content?: string; // For Questions and Guide types
  url?: string; // For Video type
  transcript?: string; // For Video type
}

// =============================================================================
// MESSAGING TYPES
// =============================================================================

export interface Message {
  id: string;
  title: string;
  type: 'Announcement' | 'Event' | 'System' | 'Product Update' | 'Engagement';
  target: string; // Institution names or user groups
  status: 'Draft' | 'Scheduled' | 'Sent';
  content: string;
  dateCreated: string; // YYYY-MM-DD format
  dateScheduled?: string; // YYYY-MM-DD format for scheduled messages
  deliveryRate?: number; // Percentage of successful deliveries
  openRate?: number; // Percentage of opened messages
  openedBy?: string[]; // User IDs who opened the message
  createdBy: string; // User ID of creator
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'Announcement' | 'Event' | 'System' | 'Product Update' | 'Engagement';
  createdBy: string; // User ID of creator
  createdAt: Date;
  updatedAt: Date;
}

export interface BroadcastHistory {
  id: string;
  messageId: string;
  title: string;
  recipients: string[]; // List of recipient IDs
  status: 'Success' | 'Partial' | 'Failed';
  deliveryCount: number;
  totalCount: number;
  createdAt: Date;
  completedAt: Date;
}
