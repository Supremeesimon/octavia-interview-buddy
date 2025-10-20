import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import Header from '@/components/Header';
import { aiAnalyticsService } from '@/services/ai-analytics.service';
import { InstitutionService } from '@/services/institution.service';
import { ResourceService } from '@/services/resource.service';
import { Institution } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { getGreetingWithName } from '@/utils/greeting.utils';

// Lazy load components
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
const InstitutionManagement = lazy(() => import('@/components/InstitutionManagement'));
const StudentManagement = lazy(() => import('@/components/StudentManagement'));
const TeacherManagement = lazy(() => import('@/components/TeacherManagement'));
const ResourceManagement = lazy(() => import('@/components/ResourceManagement'));
const BroadcastSystem = lazy(() => import('@/components/BroadcastSystem'));
const AIAnalytics = lazy(() => import('@/components/AIAnalytics'));
const FinancialManagement = lazy(() => import('@/components/FinancialManagement'));
const GeminiTest = lazy(() => import('@/components/GeminiTest'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AdminControlPanel = () => {
  const isMobile = useIsMobile();
  const { user: currentUser, isLoading: authLoading } = useFirebaseAuth();
  
  // Log the currentUser for debugging
  console.log('AdminControlPanel - currentUser:', currentUser);
  console.log('AdminControlPanel - authLoading:', authLoading);
  
  // Get initial tab from localStorage or default to 'dashboard'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedTab = localStorage.getItem('adminControlPanelActiveTab');
        const validTabs = ['dashboard', 'institutions', 'students', 'teachers', 'resources', 'broadcasting', 'analytics', 'financial', 'gemini-test'];
        const initialTab = savedTab && validTabs.includes(savedTab) ? savedTab : 'dashboard';
        console.log('Admin panel initial tab from localStorage:', savedTab, 'Setting to:', initialTab);
        return initialTab;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return 'dashboard';
      }
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [componentLoading, setComponentLoading] = useState(true);
  
  // Fetch institutions data
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await InstitutionService.getAllInstitutions();
        setInstitutions(data);
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoadingInstitutions(false);
        if (!loadingResources) {
          setComponentLoading(false);
        }
      }
    };
    
    fetchInstitutions();
  }, [activeTab, loadingResources]); // Add activeTab as dependency to refresh when switching tabs
  
  // Fetch resources data
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await ResourceService.getAllResources();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoadingResources(false);
        if (!loadingInstitutions) {
          setComponentLoading(false);
        }
      }
    };
    
    fetchResources();
  }, [loadingInstitutions]);
  
  // Set the initial tab after component mounts
  useEffect(() => {
    const initialTab = getInitialTab();
    setActiveTab(initialTab);
  }, []);
  
  // Update localStorage when tab changes
  const handleTabChange = (value: string) => {
    console.log('Admin panel tab changed to:', value);
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('adminControlPanelActiveTab', value);
        console.log('Saved admin panel tab to localStorage:', value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };
  
  // Initialize AI analytics service with Gemini API key
  useEffect(() => {
    // Use the provided Gemini API key
    const geminiApiKey = "AIzaSyAmJ09DcqFRO4x8oYeRaEjgFyKWMfXYD94";
    if (geminiApiKey) {
      aiAnalyticsService.setGeminiApiKey(geminiApiKey);
    }
  }, []);
  
  // Calculate resource management props
  const institutionCount = institutions.length;
  const totalResources = resources.length;
  const formattedInstitutions = institutions.map(inst => ({
    id: inst.id,
    name: inst.name
  }));
  console.log('Raw institutions data:', institutions);
  console.log('Institutions count:', institutionCount);
  console.log('Formatted institutions for ResourceManagement:', formattedInstitutions);
  
  // Determine overall loading state
  const isLoading = authLoading || componentLoading;
  
  return (
    <div className="min-h-screen flex flex-col overflow-hidden w-full">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'} w-full`}>
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Platform Admin Control Panel</h1>
              
              {/* Show current user info with dynamic greeting */}
              {isLoading ? (
                <div className="text-lg text-muted-foreground">
                  Loading user information...
                </div>
              ) : currentUser ? (
                <div className="text-2xl font-bold text-primary">
                  {getGreetingWithName(currentUser.name)}
                </div>
              ) : (
                <div className="text-lg text-muted-foreground">
                  User information not available
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <Tabs 
                className="w-full mb-6"
                onValueChange={handleTabChange}
                value={activeTab}
              >
                <TabsList className={`${isMobile ? 'grid-cols-2 gap-2 mb-4' : 'w-full grid-cols-9'} grid overflow-x-auto`}>
                  <TabsTrigger 
                    value="dashboard" 
                    tooltip="Platform overview, metrics, and performance statistics"
                    className={activeTab === "dashboard" ? "border-b-2 border-primary" : ""}
                  >
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="institutions" 
                    tooltip="Manage institution accounts, settings, and subscription status"
                    className={activeTab === "institutions" ? "border-b-2 border-primary" : ""}
                  >
                    Institutions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="students" 
                    tooltip="Manage student accounts, access, and activity metrics"
                    className={activeTab === "students" ? "border-b-2 border-primary" : ""}
                  >
                    Students
                  </TabsTrigger>
                  <TabsTrigger 
                    value="teachers" 
                    tooltip="Manage teacher accounts, access, and activity metrics"
                    className={activeTab === "teachers" ? "border-b-2 border-primary" : ""}
                  >
                    Teachers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resources" 
                    tooltip="Upload and manage platform resources, templates, and content"
                    className={activeTab === "resources" ? "border-b-2 border-primary" : ""}
                  >
                    Resources
                  </TabsTrigger>
                  <TabsTrigger 
                    value="broadcasting" 
                    tooltip="Send announcements and notifications to platform users"
                    className={activeTab === "broadcasting" ? "border-b-2 border-primary" : ""}
                  >
                    Broadcast
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    tooltip="Advanced data analysis and performance insights"
                    className={activeTab === "analytics" ? "border-b-2 border-primary" : ""}
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="financial" 
                    tooltip="Platform pricing management, margins, and revenue tracking"
                    className={activeTab === "financial" ? "border-b-2 border-primary" : ""}
                  >
                    Financial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gemini-test" 
                    tooltip="Test Gemini API integration"
                    className={activeTab === "gemini-test" ? "border-b-2 border-primary" : ""}
                  >
                    Gemini Test
                  </TabsTrigger>
                </TabsList>
                
                <div className="overflow-hidden">
                  <TabsContent value="dashboard">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminDashboard />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="institutions">
                    <Suspense fallback={<LoadingSpinner />}>
                      <InstitutionManagement />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="students">
                    <Suspense fallback={<LoadingSpinner />}>
                      <StudentManagement />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="teachers">
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherManagement />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="resources">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ResourceManagement 
                        institutionCount={institutionCount}
                        totalResources={totalResources}
                        institutions={formattedInstitutions}
                      />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="broadcasting">
                    <Suspense fallback={<LoadingSpinner />}>
                      <BroadcastSystem />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="analytics">
                    <Suspense fallback={<LoadingSpinner />}>
                      <AIAnalytics />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="financial">
                    <Suspense fallback={<LoadingSpinner />}>
                      <FinancialManagement />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="gemini-test">
                    <Suspense fallback={<LoadingSpinner />}>
                      <GeminiTest />
                    </Suspense>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </TooltipProvider>
      </main>
      <Toaster />
    </div>
  );
};

export default AdminControlPanel;