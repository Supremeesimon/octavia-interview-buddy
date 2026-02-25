import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  CreditCard, 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { SessionService } from '@/services/session.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InstitutionPaymentData {
  institutionId: string;
  institutionName: string;
  stripeCustomerId: string;
  paymentMethods: PaymentMethod[];
  hasPaymentMethods: boolean;
  error?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaymentMethodsSummary {
  totalInstitutions: number;
  institutionsWithPaymentMethods: number;
  adoptionRate: number;
}

const PaymentMethodsOverview = () => {
  const [paymentData, setPaymentData] = useState<InstitutionPaymentData[]>([]);
  const [summary, setSummary] = useState<PaymentMethodsSummary>({
    totalInstitutions: 0,
    institutionsWithPaymentMethods: 0,
    adoptionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [expandedInstitutions, setExpandedInstitutions] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await SessionService.getAllInstitutionPaymentMethods();
      
      setPaymentData(response.data || []);
      setSummary(response.summary || {
        totalInstitutions: 0,
        institutionsWithPaymentMethods: 0,
        adoptionRate: 0
      });
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      toast.error('Failed to load payment method data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const toggleInstitutionExpansion = (institutionId: string) => {
    setExpandedInstitutions(prev => ({
      ...prev,
      [institutionId]: !prev[institutionId]
    }));
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return 'bg-blue-100 text-blue-800';
      case 'mastercard': return 'bg-red-100 text-red-800';
      case 'amex': return 'bg-green-100 text-green-800';
      case 'discover': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              Total Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalInstitutions}</div>
            <p className="text-sm text-muted-foreground">Registered institutions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment-Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.institutionsWithPaymentMethods}</div>
            <p className="text-sm text-muted-foreground">Have payment methods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Adoption Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.adoptionRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${summary.adoptionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Institution Payment Methods</h3>
          <p className="text-muted-foreground">Overview of payment method adoption across institutions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchPaymentData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method Status by Institution
          </CardTitle>
          <CardDescription>
            Click on institutions to view detailed payment method information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Methods</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentData.map((institution) => (
                  <React.Fragment key={institution.institutionId}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleInstitutionExpansion(institution.institutionId)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {institution.institutionName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {institution.hasPaymentMethods ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Payment Ready
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            No Payment Methods
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {institution.paymentMethods.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {institution.paymentMethods.slice(0, 2).map((pm) => (
                              <Badge 
                                key={pm.id} 
                                variant="outline" 
                                className={getCardBrandColor(pm.brand)}
                              >
                                {getCardBrandIcon(pm.brand)} {pm.brand} ••••{pm.last4}
                              </Badge>
                            ))}
                            {institution.paymentMethods.length > 2 && (
                              <Badge variant="outline">
                                +{institution.paymentMethods.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/institution/${institution.institutionId}/analytics`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    {expandedInstitutions[institution.institutionId] && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/10">
                          <div className="p-4">
                            <h4 className="font-medium mb-3">Payment Methods Details</h4>
                            
                            {institution.error ? (
                              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-3">
                                <div className="flex items-center gap-2 text-destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span className="font-medium">Error loading payment methods</span>
                                </div>
                                <p className="text-sm text-destructive/80 mt-1">{institution.error}</p>
                              </div>
                            ) : null}
                            
                            {institution.paymentMethods.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {institution.paymentMethods.map((pm) => (
                                  <Card key={pm.id} className="shadow-sm">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-2xl">{getCardBrandIcon(pm.brand)}</span>
                                          <div>
                                            <div className="font-medium">{pm.brand}</div>
                                            <div className="text-sm text-muted-foreground">
                                              •••• {pm.last4}
                                            </div>
                                          </div>
                                        </div>
                                        {pm.isDefault && (
                                          <Badge variant="default" className="text-xs">
                                            Default
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="text-sm text-muted-foreground">
                                        Expires: {pm.expMonth}/{pm.expYear}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No payment methods configured</p>
                                <p className="text-sm">This institution hasn't added any payment methods yet</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Intelligence Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Operational Oversight</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {summary.institutionsWithPaymentMethods} of {summary.totalInstitutions} institutions can make purchases</li>
                <li>• {summary.totalInstitutions - summary.institutionsWithPaymentMethods} institutions need payment setup assistance</li>
                <li>• {summary.adoptionRate}% payment method adoption rate</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Support Priorities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Focus on institutions without payment methods</li>
                <li>• Proactive outreach to incomplete setups</li>
                <li>• Monitor expiring payment methods</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Growth Opportunities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Target {summary.totalInstitutions - summary.institutionsWithPaymentMethods} institutions for conversion</li>
                <li>• Potential revenue from payment-ready institutions</li>
                <li>• Improve onboarding funnel effectiveness</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsOverview;