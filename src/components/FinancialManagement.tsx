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
  Calendar,
  ArrowUpDown,
  Info,
  PieChart,
  Check,
  Download,
  Filter,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InstitutionService } from '@/services/institution.service';
import { PriceChangeService } from '@/services/price-change.service';
import { Institution, InstitutionPricingOverride, ScheduledPriceChange } from '@/types';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [vapiCost, setVapiCost] = useState(0.11); // Default cost per minute in dollars
  const [markupPercentage, setMarkupPercentage] = useState(36.36); // Default markup percentage
  const [licenseCost, setLicenseCost] = useState(19.96); // Default annual license cost
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
  
  // Fetch real institution data and scheduled price changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ensure all institutions have the pricingOverride field
        try {
          await InstitutionService.ensurePricingOverrideField();
        } catch (error) {
          console.warn('Failed to ensure pricing override field:', error);
          // Continue even if this fails
        }
        
        // Initialize sample price change data if needed
        try {
          await PriceChangeService.initializeSampleData();
        } catch (error) {
          console.warn('Failed to initialize sample price change data:', error);
          // Continue even if this fails
        }
        
        // Fetch institutions
        let institutionsData: any[] = [];
        try {
          institutionsData = await InstitutionService.getAllInstitutions();
        } catch (error) {
          console.error('Failed to fetch institutions:', error);
          toast({
            title: "Error",
            description: "Failed to load institution data",
            variant: "destructive",
          });
        }
        
        // Fetch price changes
        let priceChangesData: ScheduledPriceChange[] = [];
        try {
          priceChangesData = await PriceChangeService.getUpcomingPriceChanges();
        } catch (error) {
          console.error('Failed to fetch price changes:', error);
          // Don't show toast for this as it's less critical
        }
        
        // Convert institutions to the format expected by the component
        const formattedInstitutions: FinancialInstitution[] = institutionsData.map((inst) => ({
          id: inst.id,
          name: inst.name,
          students: inst.stats?.totalStudents || 0,
          licenseRevenue: (inst.stats?.totalStudents || 0) * (licenseCost / 4), // Estimate based on students
          sessionRevenue: (inst.stats?.totalInterviews || 0) * 15 * Number((vapiCost * (1 + markupPercentage / 100)).toFixed(2)), // Estimate
          status: inst.isActive ? 'active' : 'pending',
          pricingOverride: inst.pricingOverride || undefined
        }));
        
        setInstitutions(formattedInstitutions);
        setScheduledPriceChanges(priceChangesData);
      } catch (error) {
        console.error('Unexpected error in fetchData:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [licenseCost, vapiCost, markupPercentage]);
  
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
  
  const handleVapiCostChange = (value: number[]) => {
    setVapiCost(value[0]);
  };
  
  const handleMarkupChange = (value: number[]) => {
    setMarkupPercentage(value[0]);
  };
  
  const handleLicenseCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseCost(parseFloat(e.target.value) || 0);
  };
  
  const applyGlobalPricing = () => {
    toast({
      title: "Global pricing updated",
      description: `VAPI: $${vapiCost.toFixed(2)}/min, Markup: ${markupPercentage}%, License: $${licenseCost.toFixed(2)}/year`,
    });
  };
  
  const scheduleChange = () => {
    toast({
      title: "Price change scheduled",
      description: "New prices will take effect on June 1, 2025",
    });
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
        description: `Custom pricing for ${editingInstitution?.name} has been saved.`,
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Control</TabsTrigger>
          <TabsTrigger value="margins">Margin Management</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="quickedit">Quick Edit</TabsTrigger>
        </TabsList>
        
        {/* Overview Dashboard Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Institutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInstitutions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeInstitutions} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all institutions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Licenses: ${totalLicenseRevenue.toLocaleString()} | Sessions: ${totalSessionRevenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Platform Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estimatedMargin}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Est. profit: ${estimatedProfit.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Institution Financial Overview
              </CardTitle>
              <CardDescription>
                Financial performance of all institutions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>License Revenue</TableHead>
                      <TableHead>Session Revenue</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Est. Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutions.map((institution) => {
                      const pricing = getInstitutionPricing(institution);
                      const sessionPrice = Number((pricing.vapiCost * (1 + pricing.markupPercentage / 100)).toFixed(2));
                      const totalInst = institution.licenseRevenue + institution.sessionRevenue;
                      const estVapiCost = totalSessionRevenue > 0 ? totalInst * (pricing.vapiCost / sessionPrice) : 0;
                      const estProfit = totalInst - estVapiCost;
                      const estMargin = totalInst > 0 ? (estProfit / totalInst * 100).toFixed(1) : '0';
                      
                      return (
                        <TableRow key={institution.id}>
                          <TableCell className="font-medium">{institution.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              institution.status === 'active' 
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{institution.students}</TableCell>
                          <TableCell>${institution.licenseRevenue.toLocaleString()}</TableCell>
                          <TableCell>${institution.sessionRevenue.toLocaleString()}</TableCell>
                          <TableCell>${totalInst.toLocaleString()}</TableCell>
                          <TableCell>{estMargin}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>
                  Platform revenue sources and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4" />
                  <p>Revenue visualization chart</p>
                  <p className="text-sm">(Integration with Recharts would go here)</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>
                  Platform revenue over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <p>Monthly trend visualization</p>
                  <p className="text-sm">(Integration with Recharts would go here)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pricing Control Content */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Global Default Pricing
              </CardTitle>
              <CardDescription>
                Set platform-wide default pricing parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="vapi-cost">VAPI Cost Per Minute</Label>
                      <span className="font-medium">${vapiCost.toFixed(2)}</span>
                    </div>
                    <Slider 
                      id="vapi-cost"
                      min={0.05} 
                      max={0.25} 
                      step={0.01} 
                      value={[vapiCost]} 
                      onValueChange={handleVapiCostChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0.05</span>
                      <span>$0.25</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Base cost paid to VAPI provider per minute
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="markup-percentage">Markup Percentage</Label>
                      <span className="font-medium">{markupPercentage.toFixed(1)}%</span>
                    </div>
                    <Slider 
                      id="markup-percentage"
                      min={10} 
                      max={100} 
                      step={0.1} 
                      value={[markupPercentage]} 
                      onValueChange={handleMarkupChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Markup percentage applied to the base VAPI cost
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="license-cost">Annual License Cost</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        id="license-cost"
                        type="number"
                        value={licenseCost}
                        onChange={handleLicenseCostChange}
                        step={0.01}
                        min={0}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Annual cost per student license ($4.99/quarter)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md mt-4">
                <h3 className="font-medium mb-2">Calculated Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Session Minute Price</div>
                    <div className="text-lg font-bold">${calculatedSessionPrice.toFixed(2)}/minute</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      For a 15-minute session: ${(calculatedSessionPrice * 15).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Quarterly License</div>
                    <div className="text-lg font-bold">${(licenseCost / 4).toFixed(2)}/quarter</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Billed quarterly per student
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Margin per Minute</div>
                    <div className="text-lg font-bold">${(calculatedSessionPrice - vapiCost).toFixed(2)}/minute</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {markupPercentage.toFixed(1)}% of session price
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Switch id="schedule" />
                <Label htmlFor="schedule">Schedule price change</Label>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={scheduleChange}>Schedule Changes</Button>
                <Button onClick={applyGlobalPricing}>Apply Global Pricing</Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Institution Pricing Overrides
              </CardTitle>
              <CardDescription>
                Set custom pricing for specific institutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4 gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="Search institutions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'pending') => setStatusFilter(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Custom Pricing</TableHead>
                      <TableHead>Markup %</TableHead>
                      <TableHead>Session Price</TableHead>
                      <TableHead>License Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstitutions.map((institution) => {
                      const pricing = getInstitutionPricing(institution);
                      const sessionPrice = Number((pricing.vapiCost * (1 + pricing.markupPercentage / 100)).toFixed(2));
                      const hasCustomPricing = institution.pricingOverride?.isEnabled || false;
                      
                      return (
                        <TableRow key={institution.id}>
                          <TableCell className="font-medium">{institution.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              institution.status === 'active' 
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{institution.students}</TableCell>
                          <TableCell>
                            <Switch 
                              id={`custom-${institution.id}`} 
                              checked={hasCustomPricing}
                              onCheckedChange={(checked) => handleCustomPricingToggle(institution.id, checked)}
                            />
                          </TableCell>
                          <TableCell>{pricing.markupPercentage.toFixed(1)}%</TableCell>
                          <TableCell>${sessionPrice.toFixed(2)}/min</TableCell>
                          <TableCell>${pricing.licenseCost.toFixed(2)}/year</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditInstitution(institution)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Price Change Schedule
              </CardTitle>
              <CardDescription>
                View and manage upcoming price changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Change Date</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledPriceChanges.length > 0 ? (
                    scheduledPriceChanges.map((change) => (
                      <TableRow key={change.id}>
                        <TableCell>{change.changeDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          {change.changeType === 'vapiCost' && 'VAPI Cost'}
                          {change.changeType === 'markupPercentage' && 'Markup Percentage'}
                          {change.changeType === 'licenseCost' && 'License Cost'}
                        </TableCell>
                        <TableCell>
                          {change.affected === 'all' ? 'All Institutions' : change.affected}
                        </TableCell>
                        <TableCell>
                          {change.changeType === 'vapiCost' && `$${change.currentValue.toFixed(2)}/min`}
                          {change.changeType === 'markupPercentage' && `${change.currentValue.toFixed(1)}%`}
                          {change.changeType === 'licenseCost' && `$${change.currentValue.toFixed(2)}/year`}
                        </TableCell>
                        <TableCell>
                          {change.changeType === 'vapiCost' && `$${change.newValue.toFixed(2)}/min`}
                          {change.changeType === 'markupPercentage' && `${change.newValue.toFixed(1)}%`}
                          {change.changeType === 'licenseCost' && `$${change.newValue.toFixed(2)}/year`}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700">
                            {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No scheduled price changes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Margin Management Content */}
        <TabsContent value="margins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Cost Analysis
              </CardTitle>
              <CardDescription>
                Monitor platform costs and profit margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Average VAPI Cost</div>
                  <div className="text-2xl font-bold">${vapiCost.toFixed(2)}/minute</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Base vendor cost
                  </div>
                </div>
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Average Selling Price</div>
                  <div className="text-2xl font-bold">${calculatedSessionPrice.toFixed(2)}/minute</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    After applying markup
                  </div>
                </div>
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Platform Margin</div>
                  <div className="text-2xl font-bold">{estimatedMargin}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Estimated profit percentage
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4 mb-6">
                <h3 className="font-medium mb-4">Margin Target Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Desired Margin Percentage</Label>
                      <div className="flex space-x-2">
                        <Input defaultValue="35" type="number" min="0" max="100" />
                        <span className="flex items-center text-muted-foreground px-2">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Current VAPI Cost</Label>
                      <div className="flex space-x-2">
                        <span className="flex items-center px-3 border border-r-0 border-input bg-muted text-muted-foreground text-sm rounded-l-md">
                          $
                        </span>
                        <Input value={vapiCost.toFixed(2)} readOnly className="rounded-l-none" />
                        <span className="flex items-center text-muted-foreground px-2">/min</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Recommended Pricing</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Minimum selling price:</span>
                        <span className="font-medium">${calculatedSessionPrice.toFixed(2)}/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>15-minute session price:</span>
                        <span className="font-medium">${(calculatedSessionPrice * 15).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-border my-2"></div>
                      <div className="flex justify-between">
                        <span>Profit per minute:</span>
                        <span className="font-medium">${(calculatedSessionPrice - vapiCost).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Apply This Pricing</Button>
                  </div>
                </div>
              </div>
              
              <div className="h-60 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <p>Margin analysis over time</p>
                  <p className="text-sm">(Integration with Recharts would go here)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Margin Alerts
              </CardTitle>
              <CardDescription>
                Configure alerts for margin thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Low Margin Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      Trigger alert when margin falls below threshold
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input className="w-20" type="number" defaultValue="25" />
                    <span className="text-muted-foreground">%</span>
                    <Switch defaultChecked id="low-margin-alert" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">High VAPI Cost Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      Trigger alert when VAPI cost exceeds threshold
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">$</span>
                    <Input className="w-20" type="number" defaultValue="0.15" step="0.01" />
                    <Switch defaultChecked id="high-cost-alert" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Automatic Price Adjustment</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically adjust prices to maintain target margin
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-price-adjustment" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Send email alerts when thresholds are triggered
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked id="email-notifications" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Alert Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Financial Reports Content */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Financial Reports
              </CardTitle>
              <CardDescription>
                Generate platform-wide financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <Label>Report Type</Label>
                  <Select defaultValue="revenue">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Report</SelectItem>
                      <SelectItem value="margin">Margin Analysis</SelectItem>
                      <SelectItem value="usage">Usage Statistics</SelectItem>
                      <SelectItem value="institution">Institution Comparison</SelectItem>
                      <SelectItem value="forecast">Financial Forecast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Institution</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      {institutions.map(institution => (
                        <SelectItem key={institution.id} value={institution.id.toString()}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Time Period</Label>
                  <Select defaultValue="quarter">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Current Month</SelectItem>
                      <SelectItem value="quarter">Current Quarter</SelectItem>
                      <SelectItem value="year">Current Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  Generate Report
                </Button>
              </div>
              
              <div className="h-96 flex items-center justify-center border rounded-md">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <p>Revenue report visualization</p>
                  <p className="text-sm">(Integration with Recharts would go here)</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Revenue Projections
              </CardTitle>
              <CardDescription>
                Forecast future platform revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Q2 2025 (Projected)</div>
                  <div className="text-2xl font-bold">$125,800</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +15% vs. Q1 2025
                  </div>
                </div>
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Q3 2025 (Projected)</div>
                  <div className="text-2xl font-bold">$148,200</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +18% vs. Q2 2025
                  </div>
                </div>
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">2025 Annual (Projected)</div>
                  <div className="text-2xl font-bold">$525,000</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +65% vs. 2024
                  </div>
                </div>
              </div>
              
              <div className="h-60 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-16 w-16 mx-auto mb-4" />
                  <p>Projection visualization</p>
                  <p className="text-sm">(Integration with Recharts would go here)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Quick Edit Content */}
        <TabsContent value="quickedit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Quick Price Adjustment
              </CardTitle>
              <CardDescription>
                Make rapid pricing changes across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Select 
                        value={selectedInstitution}
                        onValueChange={setSelectedInstitution}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Institutions</SelectItem>
                          {institutions.map(institution => (
                            <SelectItem key={institution.id} value={institution.id.toString()}>
                              {institution.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="quick-vapi-cost">VAPI Cost</Label>
                        <span className="font-medium">${vapiCost.toFixed(2)}/min</span>
                      </div>
                      <Slider 
                        id="quick-vapi-cost"
                        min={0.05} 
                        max={0.25} 
                        step={0.01} 
                        value={[vapiCost]} 
                        onValueChange={handleVapiCostChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="quick-markup">Markup Percentage</Label>
                        <span className="font-medium">{markupPercentage.toFixed(1)}%</span>
                      </div>
                      <Slider 
                        id="quick-markup"
                        min={10} 
                        max={100} 
                        step={0.1} 
                        value={[markupPercentage]} 
                        onValueChange={handleMarkupChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quick-license-cost">License Cost (Annual)</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          id="quick-license-cost"
                          type="number"
                          value={licenseCost}
                          onChange={handleLicenseCostChange}
                          step={0.01}
                          min={0}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Price Preview</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Session minute price:</span>
                      <span className="font-bold text-lg">${calculatedSessionPrice.toFixed(2)}/min</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>15-minute session:</span>
                      <span className="font-bold text-lg">${(calculatedSessionPrice * 15).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Quarterly license:</span>
                      <span className="font-bold text-lg">${(licenseCost / 4).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Annual license:</span>
                      <span className="font-bold text-lg">${licenseCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="h-px bg-border my-2"></div>
                    
                    <div className="flex justify-between items-center">
                      <span>Profit per minute:</span>
                      <span className="font-bold text-lg">${(calculatedSessionPrice - vapiCost).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Margin percentage:</span>
                      <span className="font-bold text-lg">
                        {calculatedSessionPrice > 0 ? ((calculatedSessionPrice - vapiCost) / calculatedSessionPrice * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-sm text-muted-foreground mb-2">
                      {selectedInstitution === 'all' 
                        ? 'This will update pricing for all institutions' 
                        : `This will update pricing for ${institutions.find(i => i.id.toString() === selectedInstitution)?.name}`}
                    </div>
                    <Button className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Apply Price Changes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Batch Operations
              </CardTitle>
              <CardDescription>
                Apply changes to multiple institutions at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Operation Type</Label>
                <Select defaultValue="update-markup">
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update-markup">Update Markup %</SelectItem>
                    <SelectItem value="update-vapi">Update VAPI Cost</SelectItem>
                    <SelectItem value="update-license">Update License Cost</SelectItem>
                    <SelectItem value="reset-defaults">Reset to Default Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>New Value</Label>
                <div className="flex">
                  <Input type="number" defaultValue="35" />
                  <span className="flex items-center text-muted-foreground px-4">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <Label>Filter Institutions</Label>
                  <Button variant="ghost" size="sm">Select All</Button>
                </div>
                
                <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                  {institutions.map(institution => (
                    <div key={institution.id} className="flex items-center space-x-2 py-1">
                      <input type="checkbox" id={`inst-${institution.id}`} defaultChecked />
                      <Label htmlFor={`inst-${institution.id}`} className="text-sm cursor-pointer">
                        {institution.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-md flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{institutions.length} institutions selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Changes will apply to all selected institutions
                  </p>
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </CardContent>
          </Card>
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