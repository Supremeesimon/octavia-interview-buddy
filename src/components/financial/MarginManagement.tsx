import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BarChart3, Calculator, AlertTriangle } from 'lucide-react';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState<boolean>(true);

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
      await PlatformSettingsService.updateMarginAlertSettings({
        lowMarginThreshold: lowMarginThreshold,
        highVapiCostThreshold: parseFloat(highVapiCostThreshold) || 0.15,
        autoPriceAdjustment: autoPriceAdjustment,
        emailNotifications: emailNotifications
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
                  checked={true} 
                  onCheckedChange={() => {}} // TODO: Implement toggle state
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
                  checked={true} 
                  onCheckedChange={() => {}} // TODO: Implement toggle state
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