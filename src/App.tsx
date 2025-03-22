
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student" element={<StudentDashboardPage />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/admin" element={<AdminControlPanel />} />
          <Route path="/admin/add-institution" element={<AddInstitutionPage />} />
          <Route path="/admin/institution/:id/analytics" element={<InstitutionAnalyticsPage />} />
          <Route path="/admin/export" element={<ExportDataPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
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
