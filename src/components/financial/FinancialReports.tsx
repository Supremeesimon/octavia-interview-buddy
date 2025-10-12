import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart, Wallet, TrendingUp, Download } from 'lucide-react';

interface FinancialInstitution {
  id: string;
  name: string;
}

interface FinancialReportsProps {
  institutions: FinancialInstitution[];
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ institutions }) => {
  return (
    <>
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
    </>
  );
};

export default FinancialReports;