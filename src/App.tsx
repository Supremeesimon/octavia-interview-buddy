import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Interview from "./pages/Interview";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import ResumesPage from "./pages/ResumesPage";
import AdminControlPanel from "./pages/AdminControlPanel";
import AddInstitutionPage from "./pages/AddInstitutionPage";
import InstitutionAnalyticsPage from "./pages/InstitutionAnalyticsPage";
import ExportDataPage from "./pages/ExportDataPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import DepartmentAllocationPage from "./pages/DepartmentAllocationPage";
import StudentGroupAllocationPage from "./pages/StudentGroupAllocationPage";
import ComprehensiveAnalyticsDashboard from "./pages/ComprehensiveAnalyticsDashboard";
import VapiTestPage from "./pages/VapiTestPage";
import AnonymousDataPage from "./pages/AnonymousDataPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboardPage /></ProtectedRoute>} />
          <Route path="/resumes" element={<ProtectedRoute requiredRole="student"><ResumesPage /></ProtectedRoute>} />
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
          {/* Jobs pages are temporarily hidden */}
          {/* <Route path="/jobs" element={<JobsPage />} /> */}
          {/* <Route path="/jobs/details/:id" element={<JobDetailsPage />} /> */}
          {/* <Route path="/jobs/apply/:id" element={<JobApplicationPage />} /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;