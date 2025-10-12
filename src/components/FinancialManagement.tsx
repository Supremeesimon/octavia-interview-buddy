import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react'; // Rename the Calendar icon to avoid conflict
import { 
  BarChart3, 
  DollarSign, 
  LineChart, 
  Calculator, 
  Building, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  Wallet,
  Save,
  Search,
  ArrowUpDown,
  Info,
  PieChart,
  Check,
  Download,
  Filter,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { InstitutionService } from '@/services/institution.service';
import { PriceChangeService } from '@/services/price-change.service';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { Institution, InstitutionPricingOverride, ScheduledPriceChange } from '@/types';
import PriceChangeScheduleTable from '@/components/financial/PriceChangeScheduleTable';
import InstitutionPricingOverrides from '@/components/financial/InstitutionPricingOverrides';
import GlobalPricingControl from '@/components/financial/GlobalPricingControl';
import FinancialDashboard from '@/components/financial/FinancialDashboard';
import MarginManagement from '@/components/financial/MarginManagement';
import FinancialReports from '@/components/financial/FinancialReports';
import QuickEdit from '@/components/financial/QuickEdit';

// Interface for financial institution data
interface FinancialInstitution {
  id: string;
  name: string;
  students: number;
  licenseRevenue: number;
  sessionRevenue: number;
  status: 'active' | 'pending';
  pricingOverride?: InstitutionPricingOverride;
}

// Interface for institution pricing override
interface InstitutionPricingOverrideForm {
  institutionId: string;
  customVapiCost: number;
  customMarkupPercentage: number;
  customLicenseCost: number;
  isEnabled: boolean;
}

const FinancialManagement = () => {
  const { toast } = useToast();
  
  // Get initial tab from URL hash or default to 'overview'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['overview', 'pricing', 'margins', 'reports', 'quickedit'];
      const initialTab = validTabs.includes(hash) ? hash : 'overview';
      console.log('Initial tab from hash:', hash, 'Setting to:', initialTab);
      return initialTab;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [vapiCost, setVapiCost] = useState(0.11); // Default cost per minute in dollars
  const [markupPercentage, setMarkupPercentage] = useState(36.36); // Default markup percentage
  const [licenseCost, setLicenseCost] = useState(19.96); // Default annual license cost
  const [originalVapiCost, setOriginalVapiCost] = useState(0.11); // Original value from Firebase
  const [originalMarkupPercentage, setOriginalMarkupPercentage] = useState(36.36); // Original value from Firebase
  const [originalLicenseCost, setOriginalLicenseCost] = useState(19.96); // Original value from Firebase
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false); // Keep this state
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined); // Add this state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Add this state
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [institutions, setInstitutions] = useState<FinancialInstitution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<FinancialInstitution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [scheduledPriceChanges, setScheduledPriceChanges] = useState<ScheduledPriceChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInstitution, setEditingInstitution] = useState<FinancialInstitution | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentOverride, setCurrentOverride] = useState<InstitutionPricingOverrideForm>({
    institutionId: '',
    customVapiCost: 0.11,
    customMarkupPercentage: 36.36,
    customLicenseCost: 19.96,
    isEnabled: false
  });
  const [firebaseError, setFirebaseError] = useState<string | null>(null); // Add this state
  
  // Function to refresh scheduled price changes
  const refreshScheduledPriceChanges = async () => {
    try {
      console.log('Refreshing scheduled price changes...');
      const updatedPriceChanges = await PriceChangeService.getUpcomingPriceChanges();
      console.log('Refreshed price changes:', updatedPriceChanges);
      setScheduledPriceChanges(updatedPriceChanges);
    } catch (error) {
      console.error('Failed to refresh price changes:', error);
      setFirebaseError("Failed to refresh scheduled price changes from Firebase.");
    }
  };
  
  // Fetch real institution data and scheduled price changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setFirebaseError(null); // Reset error state
        
        // Load platform pricing settings
        try {
          const pricingSettings = await PlatformSettingsService.getPricingSettings();
          if (isMounted && pricingSettings) {
            setVapiCost(pricingSettings.vapiCostPerMinute);
            setMarkupPercentage(pricingSettings.markupPercentage);
            setLicenseCost(pricingSettings.annualLicenseCost);
            // Store original values for comparison when scheduling
            setOriginalVapiCost(pricingSettings.vapiCostPerMinute);
            setOriginalMarkupPercentage(pricingSettings.markupPercentage);
            setOriginalLicenseCost(pricingSettings.annualLicenseCost);
          } else if (isMounted) {
            // Use default values if Firebase is not available
            setFirebaseError("Unable to load pricing settings from Firebase. Using default values.");
          }
        } catch (error) {
          console.warn('Failed to load platform pricing settings:', error);
          if (isMounted) {
            setFirebaseError("Failed to load pricing settings from Firebase. Using default values.");
          }
        }
        
        // Ensure all institutions have the pricingOverride field
        try {
          await InstitutionService.ensurePricingOverrideField();
        } catch (error) {
          console.warn('Failed to ensure pricing override field:', error);
          // Continue even if this fails
        }
        
        // Removed automatic sample data initialization for production
        // Sample data should only be created explicitly when needed
        
        // Fetch institutions
        let institutionsData: any[] = [];
        try {
          console.log('Fetching institutions...');
          institutionsData = await InstitutionService.getAllInstitutions();
          console.log('Fetched ' + institutionsData.length + ' institutions');
        } catch (error) {
          console.error('Failed to fetch institutions:', error);
          if (isMounted) {
            toast({
              title: "Error",
              description: "Failed to load institution data",
              variant: "destructive",
            });
          }
        }
        
        // Fetch price changes
        let priceChangesData: ScheduledPriceChange[] = [];
        try {
          console.log('Fetching upcoming price changes...');
          priceChangesData = await PriceChangeService.getUpcomingPriceChanges();
          console.log('Fetched ' + priceChangesData.length + ' upcoming price changes');
        } catch (error) {
          console.error('Failed to fetch price changes:', error);
          if (isMounted) {
            setFirebaseError("Failed to load scheduled price changes from Firebase.");
          }
          // Don't show toast for this as it's less critical
        }
        
        // Convert institutions to the format expected by the component
        if (isMounted) {
          const formattedInstitutions: FinancialInstitution[] = institutionsData.map((inst) => ({
            id: inst.id,
            name: inst.name,
            students: inst.stats?.totalStudents || 0,
            licenseRevenue: (inst.stats?.totalStudents || 0) * (licenseCost / 4), // Estimate based on students
            sessionRevenue: (inst.stats?.totalInterviews || 0) * 15 * Number((vapiCost * (1 + markupPercentage / 100)).toFixed(2)), // Estimate
            status: inst.isActive ? 'active' : 'pending',
            pricingOverride: inst.pricingOverride || undefined
          }));
          
          console.log('Setting institutions and scheduled price changes in state');
          setInstitutions(formattedInstitutions);
          setScheduledPriceChanges(priceChangesData);
        }
      } catch (error) {
        console.error('Unexpected error in fetchData:', error);
        if (isMounted) {
          setFirebaseError("An unexpected error occurred while loading data from Firebase.");
          toast({
            title: "Error",
            description: "An unexpected error occurred while loading data",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Add a periodic refresh for scheduled price changes
  useEffect(() => {
    // Set a reasonable refresh interval for production
    const interval = setInterval(() => {
      refreshScheduledPriceChanges();
    }, 60000); // Refresh every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Quick calculate derived values
  const calculatedSessionPrice = Number((vapiCost * (1 + markupPercentage / 100)).toFixed(2));
  const totalInstitutions = institutions.length;
  const activeInstitutions = institutions.filter(i => i.status === 'active').length;
  const totalStudents = institutions.reduce((acc, inst) => acc + inst.students, 0);
  const totalLicenseRevenue = institutions.reduce((acc, inst) => acc + inst.licenseRevenue, 0);
  const totalSessionRevenue = institutions.reduce((acc, inst) => acc + inst.sessionRevenue, 0);
  const totalRevenue = totalLicenseRevenue + totalSessionRevenue;
  const estimatedVapiCost = totalSessionRevenue * (vapiCost / calculatedSessionPrice);
  const estimatedProfit = totalRevenue - estimatedVapiCost;
  const estimatedMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue * 100).toFixed(1) : '0';
  
  // Update institutions when pricing changes
  useEffect(() => {
    setInstitutions(prev => prev.map(inst => ({
      ...inst,
      licenseRevenue: inst.students * (licenseCost / 4),
      sessionRevenue: (inst.students * 5) * 15 * Number((vapiCost * (1 + markupPercentage / 100)).toFixed(2)) // Estimate
    })));
  }, [vapiCost, markupPercentage, licenseCost]);
  
  const handleVapiCostChange = (value: number[]) => {
    setVapiCost(value[0]);
  };
  
  const handleMarkupChange = (value: number[]) => {
    setMarkupPercentage(value[0]);
  };
  
  const handleLicenseCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseCost(parseFloat(e.target.value) || 0);
  };
  
  const scheduleChange = async () => {
    if (isScheduleEnabled && scheduledDate) {
      try {
        // Create scheduled price changes for the selected date
        const changesToCreate: Omit<ScheduledPriceChange, 'id' | 'createdAt' | 'updatedAt'>[] = [];
        
        // Check which values have changed and create scheduled changes for them
        if (vapiCost !== originalVapiCost) {
          changesToCreate.push({
            changeDate: scheduledDate,
            changeType: 'vapiCost',
            affected: 'all',
            currentValue: originalVapiCost,
            newValue: vapiCost,
            status: 'scheduled'
          });
        }
        
        if (markupPercentage !== originalMarkupPercentage) {
          changesToCreate.push({
            changeDate: scheduledDate,
            changeType: 'markupPercentage',
            affected: 'all',
            currentValue: originalMarkupPercentage,
            newValue: markupPercentage,
            status: 'scheduled'
          });
        }
        
        if (licenseCost !== originalLicenseCost) {
          changesToCreate.push({
            changeDate: scheduledDate,
            changeType: 'licenseCost',
            affected: 'all',
            currentValue: originalLicenseCost,
            newValue: licenseCost,
            status: 'scheduled'
          });
        }
        
        // If no changes, show a message
        if (changesToCreate.length === 0) {
          toast({
            title: "No changes detected",
            description: "No pricing values have been modified.",
          });
          return;
        }
        
        // Create the scheduled changes in Firestore
        const createdChanges: string[] = [];
        for (const change of changesToCreate) {
          try {
            const id = await PriceChangeService.createPriceChange(change);
            createdChanges.push(id);
          } catch (error) {
            console.error('Failed to create price change:', error);
            toast({
              title: "Error",
              description: 'Failed to schedule ' + change.changeType + ' change. Please try again.',
              variant: "destructive",
            });
            // Continue with other changes even if one fails
          }
        }
        
        if (createdChanges.length > 0) {
          toast({
            title: "Price changes scheduled",
            description: createdChanges.length + ' price change(s) scheduled for ' + format(scheduledDate, 'PPP') + '.',
          });
          
          // Refresh the scheduled price changes data
          await refreshScheduledPriceChanges();
          
          // Update original values to match current values
          setOriginalVapiCost(vapiCost);
          setOriginalMarkupPercentage(markupPercentage);
          setOriginalLicenseCost(licenseCost);
        }
        
        // Reset the date picker
        setScheduledDate(undefined);
      } catch (error) {
        console.error('Failed to schedule price changes:', error);
        toast({
          title: "Error",
          description: "Failed to schedule price changes. Please check the console for details.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Schedule not enabled or date not selected",
        description: "Please enable scheduling and select a date first.",
        variant: "destructive",
      });
    }
  };
  
  const applyGlobalPricing = async () => {
    try {
      if (isScheduleEnabled) {
        // If scheduling is enabled but no date is selected, show an error
        if (!scheduledDate) {
          toast({
            title: "Date required",
            description: "Please select a date for the scheduled price change.",
            variant: "destructive",
          });
          return;
        }
        
        // Schedule the price changes instead of applying immediately
        await scheduleChange();
      } else {
        // Apply changes immediately (current behavior)
        try {
          await PlatformSettingsService.updatePricingSettings({
            vapiCostPerMinute: vapiCost,
            markupPercentage: markupPercentage,
            annualLicenseCost: licenseCost
          });
          
          // Update original values to match current values
          setOriginalVapiCost(vapiCost);
          setOriginalMarkupPercentage(markupPercentage);
          setOriginalLicenseCost(licenseCost);
          
          toast({
            title: "Global pricing updated",
            description: 'VAPI: $' + vapiCost.toFixed(2) + '/min, Markup: ' + markupPercentage + '%, License: $' + licenseCost.toFixed(2) + '/year',
          });
          
          // Refresh the scheduled price changes data to ensure UI is up to date
          await refreshScheduledPriceChanges();
        } catch (error) {
          console.error('Failed to save global pricing:', error);
          if (error instanceof Error && error.message.includes('Firebase not initialized')) {
            toast({
              title: "Error",
              description: "Firebase is not properly configured. Please check your environment settings.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to save global pricing settings. Please check the console for details.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to apply global pricing:', error);
      toast({
        title: "Error",
        description: "Failed to apply global pricing. Please check the console for details.",
        variant: "destructive",
      });
    }
  };
  
  // Handle edit institution pricing
  const handleEditInstitution = (institution: FinancialInstitution) => {
    setEditingInstitution(institution);
    
    // Check if this institution already has an override
    if (institution.pricingOverride) {
      setCurrentOverride({
        institutionId: institution.id,
        customVapiCost: institution.pricingOverride.customVapiCost,
        customMarkupPercentage: institution.pricingOverride.customMarkupPercentage,
        customLicenseCost: institution.pricingOverride.customLicenseCost,
        isEnabled: institution.pricingOverride.isEnabled
      });
    } else {
      // Set default values based on global settings
      setCurrentOverride({
        institutionId: institution.id,
        customVapiCost: vapiCost,
        customMarkupPercentage: markupPercentage,
        customLicenseCost: licenseCost,
        isEnabled: false
      });
    }
    
    setIsEditDialogOpen(true);
  };
  
  // Handle save institution pricing override
  const handleSaveOverride = async () => {
    if (!editingInstitution) return;
    
    try {
      // Create the pricing override object
      const pricingOverride: InstitutionPricingOverride = {
        customVapiCost: currentOverride.customVapiCost,
        customMarkupPercentage: currentOverride.customMarkupPercentage,
        customLicenseCost: currentOverride.customLicenseCost,
        isEnabled: currentOverride.isEnabled
      };
      
      // Update the institution with the new pricing override
      await InstitutionService.updatePricingOverride(currentOverride.institutionId, pricingOverride);
      
      // Update the local state
      setInstitutions(prev => prev.map(inst => 
        inst.id === currentOverride.institutionId 
          ? { ...inst, pricingOverride } 
          : inst
      ));
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Pricing override saved",
        description: 'Custom pricing for ' + (editingInstitution?.name || '') + ' has been saved.',
      });
    } catch (error) {
      console.error('Error saving pricing override:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing override",
        variant: "destructive",
      });
    }
  };
  
  // Handle custom pricing toggle
  const handleCustomPricingToggle = async (institutionId: string, checked: boolean) => {
    try {
      const institution = institutions.find(inst => inst.id === institutionId);
      if (!institution) return;
      
      if (checked) {
        // Enable custom pricing - if no override exists, create one with default values
        const pricingOverride = institution.pricingOverride || {
          customVapiCost: vapiCost,
          customMarkupPercentage: markupPercentage,
          customLicenseCost: licenseCost,
          isEnabled: true
        };
        
        // Update the override to be enabled
        const updatedOverride = { ...pricingOverride, isEnabled: true };
        
        // Update in Firebase
        await InstitutionService.updatePricingOverride(institutionId, updatedOverride);
        
        // Update local state
        setInstitutions(prev => prev.map(inst => 
          inst.id === institutionId 
            ? { ...inst, pricingOverride: updatedOverride } 
            : inst
        ));
      } else {
        // Disable custom pricing - if override exists, update it to disabled
        if (institution.pricingOverride) {
          const updatedOverride = { ...institution.pricingOverride, isEnabled: false };
          
          // Update in Firebase
          await InstitutionService.updatePricingOverride(institutionId, updatedOverride);
          
          // Update local state
          setInstitutions(prev => prev.map(inst => 
            inst.id === institutionId 
              ? { ...inst, pricingOverride: updatedOverride } 
              : inst
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling custom pricing:', error);
      toast({
        title: "Error",
        description: "Failed to update custom pricing",
        variant: "destructive",
      });
    }
  };
  
  // Get pricing for an institution (either override or global)
  const getInstitutionPricing = (institution: FinancialInstitution) => {
    if (institution.pricingOverride && institution.pricingOverride.isEnabled) {
      return {
        vapiCost: institution.pricingOverride.customVapiCost,
        markupPercentage: institution.pricingOverride.customMarkupPercentage,
        licenseCost: institution.pricingOverride.customLicenseCost
      };
    }
    
    // Return global pricing if no override or not enabled
    return {
      vapiCost,
      markupPercentage,
      licenseCost
    };
  };
  
  // Filter institutions based on search term and status
  useEffect(() => {
    let filtered = institutions;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(institution => 
        institution.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(institution => 
        institution.status === statusFilter
      );
    }
    
    setFilteredInstitutions(filtered);
  }, [searchTerm, statusFilter, institutions]);
  
  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      window.location.hash = value;
      console.log('Hash set to:', value);
    }
  };
  
  // Listen for hash changes to support browser back/forward buttons
  useEffect(() => {
    console.log('Component mounted, current hash:', window.location.hash);
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      console.log('Hash changed to:', hash);
      const validTabs = ['overview', 'pricing', 'margins', 'reports', 'quickedit'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Set initial hash if none exists
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.location.hash = activeTab;
      console.log('Setting initial hash to:', activeTab);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {firebaseError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Firebase Warning:</strong> {firebaseError}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Some features may not work correctly until Firebase is properly configured.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs className="w-full" onValueChange={handleTabChange} value={activeTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Control</TabsTrigger>
          <TabsTrigger value="margins">Margin Management</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="quickedit">Quick Edit</TabsTrigger>
        </TabsList>
        
        {/* Overview Dashboard Content */}
        <TabsContent value="overview" className="space-y-6">
          <FinancialDashboard
            institutions={institutions}
            vapiCost={vapiCost}
            markupPercentage={markupPercentage}
            licenseCost={licenseCost}
            totalInstitutions={totalInstitutions}
            activeInstitutions={activeInstitutions}
            totalStudents={totalStudents}
            totalLicenseRevenue={totalLicenseRevenue}
            totalSessionRevenue={totalSessionRevenue}
            totalRevenue={totalRevenue}
            estimatedProfit={estimatedProfit}
            estimatedMargin={estimatedMargin}
          />
        </TabsContent>
        
        {/* Pricing Control Content */}
        <TabsContent value="pricing" className="space-y-6">
          <GlobalPricingControl
            vapiCost={vapiCost}
            markupPercentage={markupPercentage}
            licenseCost={licenseCost}
            originalVapiCost={originalVapiCost}
            originalMarkupPercentage={originalMarkupPercentage}
            originalLicenseCost={originalLicenseCost}
            onVapiCostChange={(value) => setVapiCost(value)}
            onMarkupPercentageChange={(value) => setMarkupPercentage(value)}
            onLicenseCostChange={(value) => setLicenseCost(value)}
            onRefresh={refreshScheduledPriceChanges}
          />
          
          <InstitutionPricingOverrides
            institutions={institutions}
            filteredInstitutions={filteredInstitutions}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            vapiCost={vapiCost}
            markupPercentage={markupPercentage}
            licenseCost={licenseCost}
            onSearchTermChange={(term) => setSearchTerm(term)}
            onStatusFilterChange={(filter) => setStatusFilter(filter)}
            onRefresh={async () => {
              // Refresh institutions
              try {
                const institutionsData = await InstitutionService.getAllInstitutions();
                const formattedInstitutions: FinancialInstitution[] = institutionsData.map((inst) => ({
                  id: inst.id,
                  name: inst.name,
                  students: inst.stats?.totalStudents || 0,
                  licenseRevenue: (inst.stats?.totalStudents || 0) * (licenseCost / 4),
                  sessionRevenue: (inst.stats?.totalInterviews || 0) * 15 * Number((vapiCost * (1 + markupPercentage / 100)).toFixed(2)),
                  status: inst.isActive ? 'active' : 'pending',
                  pricingOverride: inst.pricingOverride || undefined
                }));
                setInstitutions(formattedInstitutions);
              } catch (error) {
                console.error('Failed to refresh institutions:', error);
                toast({
                  title: "Error",
                  description: "Failed to refresh institution data",
                  variant: "destructive",
                });
              }
              
              // Refresh scheduled price changes
              await refreshScheduledPriceChanges();
            }}
          />
          
          <PriceChangeScheduleTable
            scheduledPriceChanges={scheduledPriceChanges}
            onRefresh={refreshScheduledPriceChanges}
          />
        </TabsContent>
        
        {/* Margin Management Content */}
        <TabsContent value="margins" className="space-y-6">
          <MarginManagement
            vapiCost={vapiCost}
            markupPercentage={markupPercentage}
            calculatedSessionPrice={calculatedSessionPrice}
            estimatedMargin={estimatedMargin}
          />
        </TabsContent>
        
        {/* Financial Reports Content */}
        <TabsContent value="reports" className="space-y-6">
          <FinancialReports
            institutions={institutions}
          />
        </TabsContent>
        
        {/* Quick Edit Content */}
        <TabsContent value="quickedit" className="space-y-6">
          <QuickEdit
            institutions={institutions}
            vapiCost={vapiCost}
            markupPercentage={markupPercentage}
            licenseCost={licenseCost}
            calculatedSessionPrice={calculatedSessionPrice}
            onVapiCostChange={(value) => setVapiCost(value)}
            onMarkupPercentageChange={(value) => setMarkupPercentage(value)}
            onLicenseCostChange={(value) => setLicenseCost(value)}
            selectedInstitution={selectedInstitution}
            onSelectedInstitutionChange={(value) => setSelectedInstitution(value)}
          />
        </TabsContent>
        
        {/* Edit Institution Pricing Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Institution Pricing</DialogTitle>
              <DialogDescription>
                Set custom pricing for {editingInstitution?.name}
              </DialogDescription>
            </DialogHeader>
            
            {editingInstitution && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="custom-vapi-cost">VAPI Cost Per Minute</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        id="custom-vapi-cost"
                        type="number"
                        step="0.01"
                        min="0.05"
                        max="0.25"
                        value={currentOverride.customVapiCost}
                        onChange={(e) => setCurrentOverride({
                          ...currentOverride,
                          customVapiCost: parseFloat(e.target.value) || 0
                        })}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Base cost paid to VAPI provider per minute
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-markup">Markup Percentage</Label>
                    <div className="flex">
                      <Input
                        id="custom-markup"
                        type="number"
                        step="0.1"
                        min="10"
                        max="100"
                        value={currentOverride.customMarkupPercentage}
                        onChange={(e) => setCurrentOverride({
                          ...currentOverride,
                          customMarkupPercentage: parseFloat(e.target.value) || 0
                        })}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">
                        %
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Markup percentage applied to the base VAPI cost
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-license-cost">Annual License Cost</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="custom-license-cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentOverride.customLicenseCost}
                      onChange={(e) => setCurrentOverride({
                        ...currentOverride,
                        customLicenseCost: parseFloat(e.target.value) || 0
                      })}
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Annual cost per student license
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Calculated Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Session Minute Price</div>
                      <div className="text-lg font-bold">
                        ${Number((currentOverride.customVapiCost * (1 + currentOverride.customMarkupPercentage / 100)).toFixed(2))}/minute
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        For a 15-minute session: ${Number((currentOverride.customVapiCost * (1 + currentOverride.customMarkupPercentage / 100) * 15).toFixed(2))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Quarterly License</div>
                      <div className="text-lg font-bold">${(currentOverride.customLicenseCost / 4).toFixed(2)}/quarter</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Billed quarterly per student
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Margin per Minute</div>
                      <div className="text-lg font-bold">
                        ${Number((currentOverride.customVapiCost * (currentOverride.customMarkupPercentage / 100)).toFixed(2))}/minute
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {currentOverride.customMarkupPercentage.toFixed(1)}% of session price
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-custom-pricing"
                    checked={currentOverride.isEnabled}
                    onCheckedChange={(checked) => setCurrentOverride({
                      ...currentOverride,
                      isEnabled: checked
                    })}
                  />
                  <Label htmlFor="enable-custom-pricing">Enable Custom Pricing</Label>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOverride}>
                Save Pricing Override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;