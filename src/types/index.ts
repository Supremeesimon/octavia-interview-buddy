/**
 * TypeScript interfaces for Octavia Interview Buddy
 * Defines all data models and API types
 */

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = 'student' | 'institution_admin' | 'platform_admin';

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

export interface ParsedResumeContent {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
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

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  institutionId: string;
  sessionPurchaseId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  institutionDomain?: string;
  role?: UserRole;
  department?: string;
  yearOfStudy?: string;
}

export interface ResumeUploadRequest {
  type: ResumeType;
  file?: File;
  linkedinUrl?: string;
  voiceData?: Blob;
}

export interface InterviewBookingRequest {
  resumeId: string;
  scheduledAt: Date;
  type: InterviewType;
}

export interface SessionPurchaseRequest {
  sessionCount: number;
  paymentMethodId: string;
}

// =============================================================================
// PERMISSION TYPES
// =============================================================================

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

// =============================================================================
// INSTITUTION INTEREST TYPES
// =============================================================================

export interface InstitutionInterest {
  id?: string;
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  studentCapacity: string;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'processed' | 'contacted';
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

// =============================================================================
// PLATFORM SETTINGS TYPES
// =============================================================================

export interface PlatformPricingSettings {
  vapiCostPerMinute: number;
  markupPercentage: number;
  annualLicenseCost: number;
  updatedAt: Date;
}

// =============================================================================
// FINANCIAL ANALYTICS TYPES
// =============================================================================

export interface FinancialMarginData {
  id?: string;
  date: Date;
  period: 'daily' | 'weekly' | 'monthly';
  vapiCostPerMinute: number;
  markupPercentage: number;
  averageSessionLength: number; // in minutes
  totalSessions: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  marginPercentage: number;
  licenseRevenue: number;
  sessionRevenue: number;
  createdAt: Date;
}
