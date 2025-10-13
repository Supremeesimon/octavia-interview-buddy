import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Import components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Create a loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy load pages
const Index = React.lazy(() => import('@/pages/Index'));
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const StudentDashboardPage = React.lazy(() => import('@/pages/StudentDashboardPage'));
const TeacherDashboardPage = React.lazy(() => import('@/pages/TeacherDashboardPage'));
const AdminControlPanel = React.lazy(() => import('@/pages/AdminControlPanel'));
const Interview = React.lazy(() => import('@/pages/Interview'));
const ResumesPage = React.lazy(() => import('@/pages/ResumesPage'));
const JobsPage = React.lazy(() => import('@/pages/JobsPage'));
const JobDetailsPage = React.lazy(() => import('@/pages/JobDetailsPage'));
const JobApplicationPage = React.lazy(() => import('@/pages/JobApplicationPage'));
const AddInstitutionPage = React.lazy(() => import('@/pages/AddInstitutionPage'));
const InstitutionAnalyticsPage = React.lazy(() => import('@/pages/InstitutionAnalyticsPage'));
const ExportDataPage = React.lazy(() => import('@/pages/ExportDataPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const PrivacyPolicyPage = React.lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('@/pages/TermsOfServicePage'));
const DepartmentAllocationPage = React.lazy(() => import('@/pages/DepartmentAllocationPage'));
const StudentGroupAllocationPage = React.lazy(() => import('@/pages/StudentGroupAllocationPage'));
const AnonymousDataPage = React.lazy(() => import('@/pages/AnonymousDataPage'));
const VapiTestPage = React.lazy(() => import('@/pages/VapiTestPage'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const TestAuthPage = React.lazy(() => import('@/pages/TestAuthPage'));
const ComprehensiveAnalyticsDashboard = React.lazy(() => import('@/pages/ComprehensiveAnalyticsDashboard'));
const ExternalSignup = React.lazy(() => import('@/pages/ExternalSignup'));
const EnhancedSignup = React.lazy(() => import('@/pages/EnhancedSignup'));
const InstitutionalSignup = React.lazy(() => import('@/pages/InstitutionalSignup'));
const UserDiagnosticsPage = React.lazy(() => import('@/pages/UserDiagnosticsPage'));

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/dashboard" element={<ProtectedRoute requiredRole="institution_admin"><Dashboard /></ProtectedRoute>} />
                  <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboardPage /></ProtectedRoute>} />
                  <Route path="/teacher-dashboard" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboardPage /></ProtectedRoute>} />
                  <Route path="/interview" element={<Interview />} />
                  <Route path="/resumes" element={<ResumesPage />} />
                  <Route path="/analytics" element={<ProtectedRoute><ComprehensiveAnalyticsDashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute requiredRole="platform_admin"><AdminControlPanel /></ProtectedRoute>} />
                  <Route path="/admin/add-institution" element={<ProtectedRoute requiredRole="platform_admin"><AddInstitutionPage /></ProtectedRoute>} />
                  <Route path="/admin/institution/:id/analytics" element={<ProtectedRoute requiredRole="platform_admin"><InstitutionAnalyticsPage /></ProtectedRoute>} />
                  <Route path="/admin/export" element={<ProtectedRoute requiredRole="platform_admin"><ExportDataPage /></ProtectedRoute>} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/departments" element={<DepartmentAllocationPage />} />
                  <Route path="/student-groups" element={<StudentGroupAllocationPage />} />
                  <Route path="/analytics/anonymous-data" element={<AnonymousDataPage />} />
                  <Route path="/vapi-test" element={<VapiTestPage />} />
                  <Route path="/test-auth" element={<TestAuthPage />} />
                  <Route path="/signup-external" element={<ExternalSignup />} />
                  <Route path="/signup-enhanced" element={<EnhancedSignup />} />
                  <Route path="/signup-institution" element={<InstitutionalSignup />} />
                  <Route path="/diagnostics" element={<ProtectedRoute requiredRole="platform_admin"><UserDiagnosticsPage /></ProtectedRoute>} />
                  {/* Jobs pages are temporarily hidden */}
                  {/* <Route path="/jobs" element={<JobsPage />} /> */}
                  {/* <Route path="/jobs/details/:id" element={<JobDetailsPage />} /> */}
                  {/* <Route path="/jobs/apply/:id" element={<JobApplicationPage />} /> */}
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;