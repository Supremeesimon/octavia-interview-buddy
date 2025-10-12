import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart, Wallet, TrendingUp, Download } from 'lucide-react';
import { FinancialAnalyticsService } from '@/services/financial-analytics.service';
import { FinancialMarginData } from '@/types';
import { useToast } from '@/hooks/use-toast';
// Import Recharts components
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

interface FinancialInstitution {
  id: string;
  name: string;
}

interface FinancialReportsProps {
  institutions: FinancialInstitution[];
  institutionCount?: number;
  studentCount?: number;
  totalRevenue?: number;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ 
  institutions,
  institutionCount = 0,
  studentCount = 0,
  totalRevenue = 0
}) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('revenue');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('quarter');
  const [financialData, setFinancialData] = useState<FinancialMarginData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load financial data
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true);
        const data = await FinancialAnalyticsService.getRecentMarginData(90); // Last 90 days
        setFinancialData(data);
      } catch (error) {
        console.error('Failed to load financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  // Prepare data for revenue report chart
  const revenueData = financialData.map(item => ({
    date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalRevenue: Number(item.totalRevenue.toFixed(2)),
    sessionRevenue: Number(item.sessionRevenue.toFixed(2)),
    licenseRevenue: Number(item.licenseRevenue.toFixed(2))
  })).reverse(); // Reverse to show chronological order

  // Prepare data for projection chart
  const projectionData = [
    { quarter: 'Q1 2025', revenue: 109400 },
    { quarter: 'Q2 2025', revenue: 125800 },
    { quarter: 'Q3 2025', revenue: 148200 },
    { quarter: 'Q4 2025', revenue: 165300 }
  ];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would filter data based on selected options
      console.log('Generating report with options:', { reportType, selectedInstitution, timePeriod });
      
      // For now, we'll just re-fetch the data with the current filters
      // In a full implementation, this would apply the filters to the query
      let filteredData = [...financialData];
      
      // Apply time period filter
      if (timePeriod === 'month') {
        // Filter for current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        filteredData = financialData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
      } else if (timePeriod === 'quarter') {
        // Filter for current quarter
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        let startMonth, endMonth;
        
        if (currentMonth >= 0 && currentMonth <= 2) {
          startMonth = 0; endMonth = 2; // Q1
        } else if (currentMonth >= 3 && currentMonth <= 5) {
          startMonth = 3; endMonth = 5; // Q2
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          startMonth = 6; endMonth = 8; // Q3
        } else {
          startMonth = 9; endMonth = 11; // Q4
        }
        
        filteredData = financialData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === currentYear && 
                 itemDate.getMonth() >= startMonth && 
                 itemDate.getMonth() <= endMonth;
        });
      } else if (timePeriod === 'year') {
        // Filter for current year
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        filteredData = financialData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === currentYear;
        });
      }
      
      // Apply report type filter (in a full implementation, this would change the chart type)
      // For now, we'll just update the state to trigger a re-render
      setFinancialData(filteredData);
      
      toast({
        title: "Report Generated",
        description: `Generated ${reportType} report for ${timePeriod === 'month' ? 'current month' : timePeriod === 'quarter' ? 'current quarter' : 'current year'}`,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      toast({
        title: "Export Started",
        description: `Preparing ${format} export...`,
      });
      
      // Prepare data for export
      const exportData = financialData.map(item => ({
        date: item.date.toLocaleDateString(),
        totalRevenue: item.totalRevenue,
        sessionRevenue: item.sessionRevenue,
        licenseRevenue: item.licenseRevenue,
        totalCost: item.totalCost,
        totalProfit: item.totalProfit,
        marginPercentage: item.marginPercentage,
        totalSessions: item.totalSessions,
        averageSessionLength: item.averageSessionLength
      }));
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `financial-report-${timestamp}`;
      
      // Prepare contextual information
      const contextualInfo = {
        exportDate: new Date().toLocaleString(),
        reportType,
        timePeriod,
        institutionFilter: selectedInstitution === 'all' ? 'All Institutions' : 
                          institutions.find(i => i.id.toString() === selectedInstitution)?.name || selectedInstitution,
        platformSummary: {
          totalInstitutions: institutionCount,
          totalStudents: studentCount,
          currentTotalRevenue: totalRevenue,
          platformStatus: institutionCount === 0 ? 'No institutions added' :
                         studentCount === 0 ? 'No students added' :
                         totalRevenue === 0 ? 'No revenue generated' :
                         'Active platform'
        }
      };
      
      if (format === 'CSV') {
        // Generate CSV content with contextual information
        let csvContent = `Financial Report Export\n`;
        csvContent += `Export Date: ${contextualInfo.exportDate}\n`;
        csvContent += `Report Type: ${contextualInfo.reportType}\n`;
        csvContent += `Time Period: ${contextualInfo.timePeriod}\n`;
        csvContent += `Institution Filter: ${contextualInfo.institutionFilter}\n`;
        csvContent += `Platform Status: ${contextualInfo.platformSummary.platformStatus}\n`;
        csvContent += `Total Institutions: ${contextualInfo.platformSummary.totalInstitutions}\n`;
        csvContent += `Total Students: ${contextualInfo.platformSummary.totalStudents}\n`;
        csvContent += `Current Total Revenue: $${contextualInfo.platformSummary.currentTotalRevenue.toFixed(2)}\n\n`;
        
        if (exportData.length > 0) {
          const headers = Object.keys(exportData[0]).join(',');
          const rows = exportData.map(row => 
            Object.values(row).map(value => 
              typeof value === 'string' ? `"${value}"` : value
            ).join(',')
          );
          csvContent += [headers, ...rows].join('\n');
        } else {
          csvContent += 'No financial data available for the selected period.\n';
          csvContent += 'Conduct interviews to generate revenue data.\n';
        }
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Complete",
          description: "Financial report exported as CSV successfully.",
        });
      } else if (format === 'Excel') {
        // For Excel, we'll create a CSV file with contextual information
        let csvContent = `Financial Report Export\n`;
        csvContent += `Export Date: ${contextualInfo.exportDate}\n`;
        csvContent += `Report Type: ${contextualInfo.reportType}\n`;
        csvContent += `Time Period: ${contextualInfo.timePeriod}\n`;
        csvContent += `Institution Filter: ${contextualInfo.institutionFilter}\n`;
        csvContent += `Platform Status: ${contextualInfo.platformSummary.platformStatus}\n`;
        csvContent += `Total Institutions: ${contextualInfo.platformSummary.totalInstitutions}\n`;
        csvContent += `Total Students: ${contextualInfo.platformSummary.totalStudents}\n`;
        csvContent += `Current Total Revenue: $${contextualInfo.platformSummary.currentTotalRevenue.toFixed(2)}\n\n`;
        
        if (exportData.length > 0) {
          const headers = Object.keys(exportData[0]).join(',');
          const rows = exportData.map(row => 
            Object.values(row).map(value => 
              typeof value === 'string' ? `"${value}"` : value
            ).join(',')
          );
          csvContent += [headers, ...rows].join('\n');
        } else {
          csvContent += 'No financial data available for the selected period.\n';
          csvContent += 'Conduct interviews to generate revenue data.\n';
        }
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`); // Excel can open CSV files
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Complete",
          description: "Financial report exported as Excel-compatible CSV successfully.",
        });
      } else if (format === 'PDF') {
        // For PDF, we'll create a text file with formatted data and contextual information
        let pdfContent = `Financial Report Export\n`;
        pdfContent += `=====================\n\n`;
        pdfContent += `Export Date: ${contextualInfo.exportDate}\n`;
        pdfContent += `Report Type: ${contextualInfo.reportType}\n`;
        pdfContent += `Time Period: ${contextualInfo.timePeriod}\n`;
        pdfContent += `Institution Filter: ${contextualInfo.institutionFilter}\n\n`;
        
        pdfContent += `Platform Summary\n`;
        pdfContent += `----------------\n`;
        pdfContent += `Status: ${contextualInfo.platformSummary.platformStatus}\n`;
        pdfContent += `Total Institutions: ${contextualInfo.platformSummary.totalInstitutions}\n`;
        pdfContent += `Total Students: ${contextualInfo.platformSummary.totalStudents}\n`;
        pdfContent += `Current Total Revenue: $${contextualInfo.platformSummary.currentTotalRevenue.toFixed(2)}\n\n`;
        
        if (exportData.length > 0) {
          pdfContent += 'Financial Data\n';
          pdfContent += '-------------\n';
          pdfContent += 'Date,Total Revenue,Session Revenue,License Revenue,Total Cost,Total Profit,Margin %,Sessions,Avg Length\n';
          exportData.forEach(row => {
            pdfContent += `${row.date},${row.totalRevenue},${row.sessionRevenue},${row.licenseRevenue},${row.totalCost},${row.totalProfit},${row.marginPercentage},${row.totalSessions},${row.averageSessionLength}\n`;
          });
        } else {
          pdfContent += 'No Financial Data Available\n';
          pdfContent += '============================\n';
          pdfContent += 'No financial data available for the selected period.\n';
          pdfContent += 'Conduct interviews to generate revenue data.\n\n';
          
          // Add guidance based on platform status
          if (contextualInfo.platformSummary.platformStatus === 'No institutions added') {
            pdfContent += 'Next Steps:\n';
            pdfContent += '1. Add institutions through the Institution Management section\n';
            pdfContent += '2. Configure institution settings and pricing\n';
            pdfContent += '3. Have institutions add students to their accounts\n';
            pdfContent += '4. Students need to conduct practice interviews to generate session revenue\n';
          } else if (contextualInfo.platformSummary.platformStatus === 'No students added') {
            pdfContent += 'Next Steps:\n';
            pdfContent += '1. Have institutions add students to their accounts\n';
            pdfContent += '2. Students need to conduct practice interviews to generate session revenue\n';
          } else if (contextualInfo.platformSummary.platformStatus === 'No revenue generated') {
            pdfContent += 'Next Steps:\n';
            pdfContent += '1. Have students conduct practice interviews\n';
            pdfContent += '2. Each completed interview will generate session revenue\n';
            pdfContent += '3. License revenue will be calculated based on active students\n';
          }
        }
        
        // Create download link
        const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.txt`); // Simple text format for now
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Complete",
          description: "Financial report exported as text file successfully. (PDF export coming in future update)",
        });
      } else {
        toast({
          title: "Export Error",
          description: `Unsupported export format: ${format}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Failed to export report as ${format}:`, error);
      toast({
        title: "Export Error",
        description: `Failed to export report as ${format}. Please try again.`,
        variant: "destructive",
      });
    }
  };

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
              <Select value={reportType} onValueChange={setReportType}>
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
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
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
              <Select value={timePeriod} onValueChange={setTimePeriod}>
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
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
          
          <div className="h-96">
            <h3 className="font-medium mb-4">Revenue Report Visualization</h3>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="totalRevenue" name="Total Revenue" fill="#8884d8" />
                  <Bar dataKey="sessionRevenue" name="Session Revenue" fill="#82ca9d" />
                  <Bar dataKey="licenseRevenue" name="License Revenue" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No revenue data available</p>
                  <p className="text-sm mt-2">Conduct interviews to see revenue reports</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleExport('CSV')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('PDF')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('Excel')}>
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
          
          <div className="h-60">
            <h3 className="font-medium mb-4">Projection Visualization</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={projectionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Projected Revenue']}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Projected Revenue"
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FinancialReports;