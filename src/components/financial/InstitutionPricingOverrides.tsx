import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Filter, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InstitutionService } from '@/services/institution.service';
import { Institution, InstitutionPricingOverride } from '@/types';

interface FinancialInstitution {
  id: string;
  name: string;
  students: number;
  licenseRevenue: number;
  sessionRevenue: number;
  status: 'active' | 'pending';
  pricingOverride?: InstitutionPricingOverride;
}

interface InstitutionPricingOverrideForm {
  institutionId: string;
  customVapiCost: number;
  customMarkupPercentage: number;
  customLicenseCost: number;
  isEnabled: boolean;
}

interface InstitutionPricingOverridesProps {
  institutions: FinancialInstitution[];
  filteredInstitutions: FinancialInstitution[];
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'pending';
  vapiCost: number;
  markupPercentage: number;
  licenseCost: number;
  onSearchTermChange: (term: string) => void;
  onStatusFilterChange: (filter: 'all' | 'active' | 'pending') => void;
  onRefresh: () => void;
}

const InstitutionPricingOverrides: React.FC<InstitutionPricingOverridesProps> = ({
  institutions,
  filteredInstitutions,
  searchTerm,
  statusFilter,
  vapiCost,
  markupPercentage,
  licenseCost,
  onSearchTermChange,
  onStatusFilterChange,
  onRefresh
}) => {
  const { toast } = useToast();
  const [editingInstitution, setEditingInstitution] = useState<FinancialInstitution | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentOverride, setCurrentOverride] = useState<InstitutionPricingOverrideForm>({
    institutionId: '',
    customVapiCost: 0.11,
    customMarkupPercentage: 36.36,
    customLicenseCost: 19.96,
    isEnabled: false
  });

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
      
      // Refresh the data
      await onRefresh();
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Pricing override saved",
        description: `Custom pricing for ${editingInstitution?.name || ''} has been saved.`,
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
        
        // Refresh the data
        await onRefresh();
      } else {
        // Disable custom pricing - if override exists, update it to disabled
        if (institution.pricingOverride) {
          const updatedOverride = { ...institution.pricingOverride, isEnabled: false };
          
          // Update in Firebase
          await InstitutionService.updatePricingOverride(institutionId, updatedOverride);
          
          // Refresh the data
          await onRefresh();
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
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
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'pending') => onStatusFilterChange(value)}>
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
                onSearchTermChange('');
                onStatusFilterChange('all');
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
                          id={'custom-' + institution.id} 
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
    </>
  );
};

export default InstitutionPricingOverrides;