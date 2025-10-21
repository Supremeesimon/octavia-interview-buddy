import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { PricingSyncService } from '@/services/pricing-sync.service';
import { PriceChangeService } from '@/services/price-change.service';

interface GlobalPricingControlProps {
  vapiCost: number;
  markupPercentage: number;
  licenseCost: number;
  originalVapiCost: number;
  originalMarkupPercentage: number;
  originalLicenseCost: number;
  onVapiCostChange: (value: number) => void;
  onMarkupPercentageChange: (value: number) => void;
  onLicenseCostChange: (value: number) => void;
  onRefresh: () => void;
}

const GlobalPricingControl: React.FC<GlobalPricingControlProps> = ({
  vapiCost,
  markupPercentage,
  licenseCost,
  originalVapiCost,
  originalMarkupPercentage,
  originalLicenseCost,
  onVapiCostChange,
  onMarkupPercentageChange,
  onLicenseCostChange,
  onRefresh
}) => {
  const { toast } = useToast();
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Quick calculate derived values
  const calculatedSessionPrice = Number((vapiCost * (1 + markupPercentage / 100)).toFixed(2));

  const handleVapiCostChange = (value: number[]) => {
    onVapiCostChange(value[0]);
  };

  const handleMarkupChange = (value: number[]) => {
    onMarkupPercentageChange(value[0]);
  };

  const handleLicenseCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLicenseCostChange(parseFloat(e.target.value) || 0);
  };

  const scheduleChange = async () => {
    if (isScheduleEnabled && scheduledDate) {
      try {
        // Create scheduled price changes for the selected date
        const changesToCreate: Omit<{ 
          changeDate: Date; 
          changeType: 'vapiCost' | 'markupPercentage' | 'licenseCost'; 
          affected: string; 
          currentValue: number; 
          newValue: number; 
          status: string 
        }, 'createdAt' | 'updatedAt'>[] = [];
        
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
              description: `Failed to schedule ${change.changeType} change. Please try again.`,
              variant: "destructive",
            });
            // Continue with other changes even if one fails
          }
        }
        
        if (createdChanges.length > 0) {
          toast({
            title: "Price changes scheduled",
            description: `${createdChanges.length} price change(s) scheduled for ${format(scheduledDate, 'PPP')}.`,
          });
          
          // Refresh the scheduled price changes data
          await onRefresh();
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
      // CRITICAL: Validate pricing before any operation
      const pricingToSave = {
        vapiCostPerMinute: vapiCost,
        markupPercentage: markupPercentage,
        annualLicenseCost: licenseCost
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
          
          // Refresh the scheduled price changes data to ensure UI is up to date
          await onRefresh();
        } catch (error) {
          console.error('CRITICAL: Failed to save global pricing:', error);
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
      console.error('CRITICAL: Failed to apply global pricing:', error);
      toast({
        title: "Error",
        description: "Failed to apply global pricing. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  return (
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
          <Switch 
            id="schedule" 
            checked={isScheduleEnabled}
            onCheckedChange={setIsScheduleEnabled}
          />
          <Label htmlFor="schedule">Schedule price change</Label>
        </div>
        <div className="space-x-2">
          {isScheduleEnabled && (
            <>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => {
                        setScheduledDate(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                      fromDate={new Date()} // Only allow future dates
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Button 
                variant="outline" 
                onClick={scheduleChange}
                disabled={!scheduledDate}
              >
                Schedule Changes
              </Button>
            </>
          )}
          <Button 
            onClick={applyGlobalPricing}
            disabled={isScheduleEnabled && !scheduledDate}
          >
            Apply Global Pricing
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GlobalPricingControl;