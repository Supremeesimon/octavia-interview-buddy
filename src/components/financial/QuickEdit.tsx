import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Save, Settings, Users } from 'lucide-react';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { useToast } from '@/hooks/use-toast';

interface FinancialInstitution {
  id: string;
  name: string;
}

interface QuickEditProps {
  institutions: FinancialInstitution[];
  vapiCost: number;
  markupPercentage: number;
  licenseCost: number;
  calculatedSessionPrice: number;
  onVapiCostChange: (value: number) => void;
  onMarkupPercentageChange: (value: number) => void;
  onLicenseCostChange: (value: number) => void;
  selectedInstitution: string;
  onSelectedInstitutionChange: (value: string) => void;
}

const QuickEdit: React.FC<QuickEditProps> = ({
  institutions,
  vapiCost,
  markupPercentage,
  licenseCost,
  calculatedSessionPrice,
  onVapiCostChange,
  onMarkupPercentageChange,
  onLicenseCostChange,
  selectedInstitution,
  onSelectedInstitutionChange
}) => {
  const { toast } = useToast();
  const [operationType, setOperationType] = useState<string>('update-markup');
  const [newValue, setNewValue] = useState<string>('35');
  const [loading, setLoading] = useState<boolean>(false);

  const handleVapiCostChange = (value: number[]) => {
    onVapiCostChange(value[0]);
  };

  const handleMarkupChange = (value: number[]) => {
    onMarkupPercentageChange(value[0]);
  };

  const handleLicenseCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLicenseCostChange(parseFloat(e.target.value) || 0);
  };

  const handleApplyPriceChanges = async () => {
    try {
      // CRITICAL: Validate pricing before any operation
      const pricingToSave = {
        vapiCost,
        markupPercentage,
        licenseCost
      };
      
      if (!PricingSyncService.validatePricing({
        vapiCost,
        markupPercentage,
        licenseCost
      })) {
        toast({
          title: "Validation Error",
          description: "Pricing values are outside acceptable ranges. Please check and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // CRITICAL: Show confirmation dialog for financial changes
      const confirmed = window.confirm(
        `CONFIRM FINANCIAL CHANGE:\n\n` +
        `VAPI Cost: $${vapiCost.toFixed(2)}/min\n` +
        `Markup: ${markupPercentage.toFixed(1)}%\n` +
        `License Cost: $${licenseCost.toFixed(2)}/year\n\n` +
        `This will affect all institutions and future transactions.\n` +
        `Click OK to proceed or Cancel to abort.`
      );
      
      if (!confirmed) {
        return;
      }
      
      setLoading(true);
      
      // CRITICAL: Force sync to database with validation
      const syncSuccess = await PricingSyncService.forceSyncPlatformPricing({
        vapiCost,
        markupPercentage,
        licenseCost
      });
      
      if (!syncSuccess) {
        toast({
          title: "Error",
          description: "Failed to save pricing to database. Please check the console for details.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Global pricing updated",
        description: `VAPI: $${vapiCost.toFixed(2)}/min, Markup: ${markupPercentage}%, License: $${licenseCost.toFixed(2)}/year`,
      });
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
    } finally {
      setLoading(false);
    }
  };

  const profitPerMinute = calculatedSessionPrice - vapiCost;
  const marginPercentage = calculatedSessionPrice > 0 ? ((calculatedSessionPrice - vapiCost) / calculatedSessionPrice * 100) : 0;

  return (
    <>
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
                    onValueChange={onSelectedInstitutionChange}
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
                  <span className="font-bold text-lg">${profitPerMinute.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Margin percentage:</span>
                  <span className="font-bold text-lg">
                    {marginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {selectedInstitution === 'all' 
                    ? 'This will update pricing for all institutions' 
                    : 'This will update pricing for ' + (institutions.find(i => i.id.toString() === selectedInstitution)?.name || '')}
                </div>
                <Button className="w-full" onClick={handleApplyPriceChanges} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Applying..." : "Apply Price Changes"}
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
            <Select value={operationType} onValueChange={setOperationType}>
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
              <Input 
                type="number" 
                value={newValue} 
                onChange={(e) => setNewValue(e.target.value)} 
              />
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
                  <input type="checkbox" id={'inst-' + institution.id} defaultChecked />
                  <Label htmlFor={'inst-' + institution.id} className="text-sm cursor-pointer">
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
    </>
  );
};

export default QuickEdit;