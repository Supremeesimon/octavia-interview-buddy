import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BarChart3, Calculator, AlertTriangle } from 'lucide-react';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { FinancialAnalyticsService } from '@/services/financial-analytics.service';
import { useToast } from '@/hooks/use-toast';
import { FinancialMarginData } from '@/types';
// Import Recharts components
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// MarginManagement component for managing financial margin alerts
interface MarginManagementProps {
  vapiCost: number;
  markupPercentage: number;
  calculatedSessionPrice: number;
  estimatedMargin: string;
  institutionCount?: number;
  studentCount?: number;
  totalRevenue?: number;
  totalSessions?: number;
}

const MarginManagement: React.FC<MarginManagementProps> = ({
  vapiCost,
  markupPercentage,
  calculatedSessionPrice,
  estimatedMargin,
  institutionCount = 0,
  studentCount = 0,
  totalRevenue = 0,
  totalSessions = 0
}) => {
  const { toast } = useToast();
  const [desiredMargin, setDesiredMargin] = useState<string>('35');
  const [highVapiCostThreshold, setHighVapiCostThreshold] = useState<string>('0.15'); // This is for alerting purposes, not pricing
  const [lowMarginThreshold, setLowMarginThreshold] = useState<number>(25);
  const [autoPriceAdjustment, setAutoPriceAdjustment] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [lowMarginAlertEnabled, setLowMarginAlertEnabled] = useState<boolean>(true);
  const [highVapiCostAlertEnabled, setHighVapiCostAlertEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [marginData, setMarginData] = useState<FinancialMarginData[]>([]);

  // Load margin alert settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await PlatformSettingsService.getMarginAlertSettings();
        if (settings) {
          setLowMarginThreshold(settings.lowMarginThreshold);
          setHighVapiCostThreshold(settings.highVapiCostThreshold.toString());
          setAutoPriceAdjustment(settings.autoPriceAdjustment);
          setEmailNotifications(settings.emailNotifications);
          setLowMarginAlertEnabled(settings.lowMarginAlertEnabled);
          setHighVapiCostAlertEnabled(settings.highVapiCostAlertEnabled);
        }
      } catch (error) {
        console.error('Failed to load margin alert settings:', error);
        toast({
          title: "Error",
          description: "Failed to load margin alert settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Load financial analytics data and institution/student counts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load financial analytics data
        const data = await FinancialAnalyticsService.getRecentMarginData(30);
        setMarginData(data);
        
        // In a real implementation, we would fetch actual institution and student counts
        // For now, we'll use placeholder values that would come from the parent component
        // This would be passed as props in a real implementation
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load financial data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Save margin alert settings to Firebase
      await PlatformSettingsService.updateMarginAlertSettings({
        lowMarginThreshold: lowMarginThreshold,
        highVapiCostThreshold: parseFloat(highVapiCostThreshold) || 0.15, // This is for alerting purposes, not pricing
        autoPriceAdjustment: autoPriceAdjustment,
        emailNotifications: emailNotifications,
        lowMarginAlertEnabled: lowMarginAlertEnabled,
        highVapiCostAlertEnabled: highVapiCostAlertEnabled
      });
      
      toast({
        title: "Settings saved",
        description: "Margin alert settings have been successfully updated.",
      });
    } catch (error) {
      console.error('Failed to save margin alert settings:', error);
      toast({
        title: "Error",
        description: "Failed to save margin alert settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate recommended pricing based on desired margin
  const calculateRecommendedPricing = () => {
    const desiredMarginPercent = parseFloat(desiredMargin) || 35;
    // Formula: sellingPrice = vapiCost / (1 - (desiredMarginPercent / 100))
    // This ensures that the margin percentage is achieved
    const recommendedPrice = vapiCost / (1 - (desiredMarginPercent / 100));
    return {
      recommendedPrice: Number(recommendedPrice.toFixed(2)),
      profitPerMinute: Number((recommendedPrice - vapiCost).toFixed(2)),
      sessionPrice: Number((recommendedPrice * 15).toFixed(2))
    };
  };

  // Function to apply the recommended pricing
  const handleApplyPricing = async () => {
    try {
      setLoading(true);
      const { recommendedPrice } = calculateRecommendedPricing();
      
      // Update the global pricing settings with the recommended price
      // We need to calculate the new markup percentage based on the current vapiCost
      // Formula: markupPercentage = ((sellingPrice / vapiCost) - 1) * 100
      const newMarkupPercentage = ((recommendedPrice / vapiCost) - 1) * 100;
      
      // Update the pricing settings in Firebase
      await PlatformSettingsService.updatePricingSettings({
        vapiCostPerMinute: vapiCost,
        markupPercentage: Number(newMarkupPercentage.toFixed(2)),
        annualLicenseCost: 19.96 // Default value, could be passed as prop if needed
      });
      
      toast({
        title: "Pricing applied",
        description: `Global pricing updated to achieve ${desiredMargin}% margin.`,
      });
    } catch (error) {
      console.error('Failed to apply recommended pricing:', error);
      toast({
        title: "Error",
        description: "Failed to apply recommended pricing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate recommended pricing for display
  const { recommendedPrice, profitPerMinute, sessionPrice } = calculateRecommendedPricing();

  // Prepare data for charts
  const marginTrendData = marginData.length > 0 ? 
    marginData.map(item => ({
      date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      margin: Number(item.marginPercentage.toFixed(2)),
      revenue: Number(item.totalRevenue.toFixed(2)),
      profit: Number(item.totalProfit.toFixed(2))
    })).reverse() : // Reverse to show chronological order
    []; // Empty array when no data

  // Prepare revenue breakdown data from actual financial data
  const revenueData = marginData.length > 0 ? [
    { 
      name: 'Session Revenue', 
      value: Math.max(0, marginData[0].sessionRevenue || 0) 
    },
    { 
      name: 'License Revenue', 
      value: Math.max(0, marginData[0].licenseRevenue || 0) 
    },
    { 
      name: 'Other', 
      value: Math.max(0, (marginData[0].totalRevenue || 0) - (marginData[0].sessionRevenue || 0) - (marginData[0].licenseRevenue || 0)) 
    }
  ] : [
    { name: 'No Data', value: 100 }
  ];

  const COLORS = ['#9CA3AF', '#9CA3AF', '#9CA3AF']; // Gray color for no data
  const ACTIVE_COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Blue, Green, Yellow

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {institutionCount === 0 ? 'No institutions yet' : 
               institutionCount === 1 ? '1 institution' : 
               `${institutionCount} institutions`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {studentCount === 0 ? 'No students yet' : 
               studentCount === 1 ? '1 student' : 
               `${studentCount} students`}
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
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalRevenue === 0 ? 'No revenue yet' : 'Current revenue'}
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
              {totalRevenue === 0 ? 'No margin yet' : 'Current margin'}
            </p>
          </CardContent>
        </Card>
      </div>

      {institutionCount === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Platform Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">You haven't added any institutions to the platform yet.</p>
            <p className="text-sm text-muted-foreground">
              To start generating revenue, you'll need to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Add institutions through the Institution Management section</li>
              <li>Configure institution settings and pricing</li>
              <li>Have institutions add students to their accounts</li>
              <li>Students need to conduct practice interviews to generate session revenue</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {institutionCount > 0 && studentCount === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Add Students to Generate Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">You have {institutionCount} institution(s) but no students yet.</p>
            <p className="text-sm text-muted-foreground">
              To start generating revenue:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Have institutions add students to their accounts</li>
              <li>Students need to conduct practice interviews to generate session revenue</li>
              <li>Revenue will be generated from both license fees and session usage</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {institutionCount > 0 && studentCount > 0 && totalSessions === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <BarChart3 className="h-5 w-5" />
              Ready for Revenue Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">You have {institutionCount} institution(s) and {studentCount} student(s).</p>
            <p className="text-sm text-muted-foreground">
              To start generating revenue:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Have students conduct practice interviews</li>
              <li>Each completed interview will generate session revenue</li>
              <li>License revenue will be calculated based on active students</li>
            </ul>
          </CardContent>
        </Card>
      )}

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
                    <Input 
                      value={desiredMargin} 
                      onChange={(e) => setDesiredMargin(e.target.value)} 
                      type="number" 
                      min="0" 
                      max="100" 
                    />
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
                    <span className="font-medium">${recommendedPrice.toFixed(2)}/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>15-minute session price:</span>
                    <span className="font-medium">${sessionPrice.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between">
                    <span>Profit per minute:</span>
                    <span className="font-medium">${profitPerMinute.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleApplyPricing} disabled={loading}>
                  {loading ? "Applying..." : "Apply This Pricing"}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="h-60">
            <h3 className="font-medium mb-2">Margin Analysis Over Time</h3>
            {marginTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={marginTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={[0, 100]} 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'margin') return [`${value}%`, 'Margin'];
                      return [`$${value}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="margin" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Platform Margin"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No margin data available yet</p>
                  <p className="text-sm mt-2">Conduct interviews to see margin analysis</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Revenue Breakdown
          </CardTitle>
          <CardDescription>
            Distribution of revenue sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <h3 className="font-medium mb-2">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => {
                    if (marginData.length === 0) {
                      return 'No financial data yet';
                    }
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {revenueData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={marginData.length > 0 ? ACTIVE_COLORS[index % ACTIVE_COLORS.length] : COLORS[0]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => {
                    if (marginData.length === 0) {
                      return ['Add students and conduct interviews to see revenue data', 'No Data'];
                    }
                    return [`$${Number(value).toFixed(2)}`, 'Amount'];
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
                <Input 
                  className="w-20" 
                  type="number" 
                  value={lowMarginThreshold} 
                  onChange={(e) => setLowMarginThreshold(parseInt(e.target.value) || 25)} 
                  min="0" 
                  max="100" 
                />
                <span className="text-muted-foreground">%</span>
                <Switch 
                  checked={lowMarginAlertEnabled} 
                  onCheckedChange={setLowMarginAlertEnabled}
                  id="low-margin-alert" 
                />
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
                <Input 
                  className="w-20" 
                  type="number" 
                  value={highVapiCostThreshold}
                  onChange={(e) => setHighVapiCostThreshold(e.target.value)}
                  step="0.01" 
                />
                <Switch 
                  checked={highVapiCostAlertEnabled} 
                  onCheckedChange={setHighVapiCostAlertEnabled}
                  id="high-cost-alert" 
                />
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
                <Switch 
                  checked={autoPriceAdjustment} 
                  onCheckedChange={setAutoPriceAdjustment}
                  id="auto-price-adjustment" 
                />
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
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications}
                  id="email-notifications" 
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Alert Settings"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default MarginManagement;