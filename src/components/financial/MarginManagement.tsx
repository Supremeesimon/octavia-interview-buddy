import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BarChart3, Calculator, AlertTriangle } from 'lucide-react';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { useToast } from '@/hooks/use-toast';
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
}

const MarginManagement: React.FC<MarginManagementProps> = ({
  vapiCost,
  markupPercentage,
  calculatedSessionPrice,
  estimatedMargin
}) => {
  const { toast } = useToast();
  const [desiredMargin, setDesiredMargin] = useState<string>('35');
  const [highVapiCostThreshold, setHighVapiCostThreshold] = useState<string>('0.15');
  const [lowMarginThreshold, setLowMarginThreshold] = useState<number>(25);
  const [autoPriceAdjustment, setAutoPriceAdjustment] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [lowMarginAlertEnabled, setLowMarginAlertEnabled] = useState<boolean>(true);
  const [highVapiCostAlertEnabled, setHighVapiCostAlertEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Sample data for margin analysis over time
  const marginTrendData = [
    { month: 'Jan', margin: 32 },
    { month: 'Feb', margin: 35 },
    { month: 'Mar', margin: 30 },
    { month: 'Apr', margin: 38 },
    { month: 'May', margin: 36 },
    { month: 'Jun', margin: 40 },
    { month: 'Jul', margin: 37 },
    { month: 'Aug', margin: 42 },
    { month: 'Sep', margin: 39 },
    { month: 'Oct', margin: 41 },
    { month: 'Nov', margin: 38 },
    { month: 'Dec', margin: 43 },
  ];

  // Sample data for revenue breakdown
  const revenueData = [
    { name: 'Licenses', value: 45 },
    { name: 'Interviews', value: 35 },
    { name: 'Subscriptions', value: 20 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Save margin alert settings to Firebase
      await PlatformSettingsService.updateMarginAlertSettings({
        lowMarginThreshold: lowMarginThreshold,
        highVapiCostThreshold: parseFloat(highVapiCostThreshold) || 0.15,
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

  return (
    <>
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