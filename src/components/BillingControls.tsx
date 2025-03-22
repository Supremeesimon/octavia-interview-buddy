
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  Clock, 
  Users, 
  Save, 
  Wallet,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BillingControls = () => {
  const { toast } = useToast();
  const [studentLicenses, setStudentLicenses] = useState(100);
  const [sessionMinutes, setSessionMinutes] = useState(15);
  const [licensePrice, setLicensePrice] = useState(4.99);
  const [minutePrice, setMinutePrice] = useState(0.15);
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '05/25', default: true }
  ]);
  
  const addLicenses = (amount: number) => {
    setStudentLicenses(prev => prev + amount);
  };
  
  const calculateMonthlyTotal = () => {
    const licenseCost = studentLicenses * licensePrice;
    const extraMinutesCost = sessionMinutes > 15 ? 
      studentLicenses * (sessionMinutes - 15) * minutePrice : 0;
    return licenseCost + extraMinutesCost;
  };
  
  const calculateYearlyTotal = () => {
    return calculateMonthlyTotal() * 12;
  };
  
  const handleSavePricing = () => {
    toast({
      title: "Pricing settings saved",
      description: "Your billing settings have been updated successfully",
    });
  };
  
  const handleAddCard = () => {
    // In a real implementation, this would open a payment form
    setCards([
      ...cards,
      { id: Date.now(), type: 'Mastercard', last4: '8888', expiry: '09/26', default: false }
    ]);
    
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully",
    });
  };
  
  const handleMakeDefault = (id: number) => {
    setCards(cards.map(card => ({
      ...card,
      default: card.id === id
    })));
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been changed",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Billing Summary
            </CardTitle>
            <CardDescription>
              Current pricing based on your settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Active student licenses:</span>
                  <span className="font-medium">{studentLicenses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Price per license:</span>
                  <span className="font-medium">${licensePrice.toFixed(2)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Minutes per student:</span>
                  <span className="font-medium">{sessionMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Extra minutes rate:</span>
                  <span className="font-medium">${minutePrice.toFixed(2)}/minute</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Extra minutes charge:</span>
                  <span className="font-medium">
                    {sessionMinutes > 15 ? 
                      `$${(studentLicenses * (sessionMinutes - 15) * minutePrice).toFixed(2)}/month` : 
                      'No extra charge'
                    }
                  </span>
                </div>
              </div>
              
              <Card className="bg-primary/5 border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Billing Totals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monthly total:</span>
                    <span className="font-bold">${calculateMonthlyTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yearly total:</span>
                    <span className="font-bold">${calculateYearlyTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Next billing date:</span>
                    <span>April 15, 2025</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Manage Licenses
            </CardTitle>
            <CardDescription>
              Add or remove student licenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Current licenses: {studentLicenses}</div>
              <p className="text-sm text-muted-foreground">
                Each license allows one student to access the platform
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => addLicenses(10)}
                  tooltip="Add 10 student licenses"
                >
                  +10 Licenses
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => addLicenses(50)}
                  tooltip="Add 50 student licenses"
                >
                  +50 Licenses
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  placeholder="Custom amount" 
                  className="flex-1"
                  min={1}
                />
                <Button>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment cards and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="font-medium">{card.type} •••• {card.last4}</div>
                    </TableCell>
                    <TableCell>{card.expiry}</TableCell>
                    <TableCell>
                      {card.default ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Backup
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!card.default && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMakeDefault(card.id)}
                        >
                          Make Default
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddCard}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Pricing Settings
            </CardTitle>
            <CardDescription>
              Configure pricing for licenses and session minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license-price">Price per license ($/month)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="license-price"
                    type="number" 
                    value={licensePrice}
                    onChange={(e) => setLicensePrice(parseFloat(e.target.value))}
                    className="pl-8"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minute-price">Price per extra minute ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="minute-price"
                    type="number" 
                    value={minutePrice}
                    onChange={(e) => setMinutePrice(parseFloat(e.target.value))}
                    className="pl-8"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-minutes">Default session minutes</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="session-minutes"
                    type="number" 
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(parseInt(e.target.value))}
                    className="pl-8"
                    min="5"
                    max="30"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  First 15 minutes are included in the base license price
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handleSavePricing}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Pricing Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Billing History
          </CardTitle>
          <CardDescription>
            View your previous invoices and billing transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>March 15, 2025</TableCell>
                <TableCell>Monthly subscription (100 licenses)</TableCell>
                <TableCell>${(100 * 4.99).toFixed(2)}</TableCell>
                <TableCell>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Paid
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Invoice
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>February 15, 2025</TableCell>
                <TableCell>Monthly subscription (100 licenses)</TableCell>
                <TableCell>${(100 * 4.99).toFixed(2)}</TableCell>
                <TableCell>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Paid
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Invoice
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>January 15, 2025</TableCell>
                <TableCell>Monthly subscription (80 licenses)</TableCell>
                <TableCell>${(80 * 4.99).toFixed(2)}</TableCell>
                <TableCell>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Paid
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Invoice
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingControls;
