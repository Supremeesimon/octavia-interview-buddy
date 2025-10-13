import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Import all pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import StudentDashboardPage from '@/pages/StudentDashboardPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import AdminControlPanel from '@/pages/AdminControlPanel';
import Interview from '@/pages/Interview';
import ResumesPage from '@/pages/ResumesPage';
import JobsPage from '@/pages/JobsPage';
import JobDetailsPage from '@/pages/JobDetailsPage';
import JobApplicationPage from '@/pages/JobApplicationPage';
import AddInstitutionPage from '@/pages/AddInstitutionPage';
import InstitutionAnalyticsPage from '@/pages/InstitutionAnalyticsPage';
import ExportDataPage from '@/pages/ExportDataPage';
import AboutPage from '@/pages/AboutPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import DepartmentAllocationPage from '@/pages/DepartmentAllocationPage';
import StudentGroupAllocationPage from '@/pages/StudentGroupAllocationPage';
import AnonymousDataPage from '@/pages/AnonymousDataPage';
import VapiTestPage from '@/pages/VapiTestPage';
import NotFound from '@/pages/NotFound';
import TestAuthPage from '@/pages/TestAuthPage';
import ComprehensiveAnalyticsDashboard from '@/pages/ComprehensiveAnalyticsDashboard';
import ExternalSignup from '@/pages/ExternalSignup';
import EnhancedSignup from '@/pages/EnhancedSignup';
import InstitutionalSignup from '@/pages/InstitutionalSignup';
import UserDiagnosticsPage from '@/pages/UserDiagnosticsPage';
import UserDiagnosticsPage from '@/pages/UserDiagnosticsPage';

// Import components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

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