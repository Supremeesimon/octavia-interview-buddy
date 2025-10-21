import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Building, BarChart3, LineChart, PieChart, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface FinancialInstitution {
  id: string;
  name: string;
  students: number;
  licenseRevenue: number;
  sessionRevenue: number;
  status: 'active' | 'pending';
  pricingOverride?: any;
}

interface FinancialDashboardProps {
  institutions: FinancialInstitution[];
  vapiCost: number;
  markupPercentage: number;
  licenseCost: number;
  totalInstitutions: number;
  activeInstitutions: number;
  totalStudents: number;
  totalLicenseRevenue: number;
  totalSessionRevenue: number;
  totalRevenue: number;
  estimatedProfit: number;
  estimatedMargin: string;
  isSynced?: boolean; // Add sync status prop
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  institutions,
  vapiCost,
  markupPercentage,
  licenseCost,
  totalInstitutions,
  activeInstitutions,
  totalStudents,
  totalLicenseRevenue,
  totalSessionRevenue,
  totalRevenue,
  estimatedProfit,
  estimatedMargin,
  isSynced = true // Default to true (synced)
}) => {
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

  return (
    <>
      {/* Sync Status Indicator */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isSynced ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Pricing is synchronized with database</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">Pricing is NOT synchronized with database</span>
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSynced ? 'All changes saved' : 'Unsaved changes detected'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
    </>
  );
};

export default FinancialDashboard;