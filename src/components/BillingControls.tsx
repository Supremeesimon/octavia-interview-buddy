import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CreditCard, DollarSign, Clock, Calendar, Wallet, Plus, Users, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ResetSettingsDialog from './ResetSettingsDialog';

interface SessionPurchase {
  sessions: number;
  cost: number;
  date: Date;
}

interface BillingControlsProps {
  sessionPurchases?: SessionPurchase[];
}

const BillingControls = ({ sessionPurchases = [] }: BillingControlsProps) => {
  const { toast } = useToast();
  const [sessionCount, setSessionCount] = useState(1000);
  const [sessionsToPurchase, setSessionsToPurchase] = useState(100);
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '05/25', default: true }
  ]);
  const [billingHistory, setBillingHistory] = useState<Array<{
    date: Date;
    description: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
  }>>([
    {
      date: new Date(2025, 2, 15), // March 15, 2025
      description: "Quarterly session payment (1000 students)",
      amount: 4990,
      status: 'paid'
    },
    {
      date: new Date(2025, 2, 10), // March 10, 2025
      description: "Session purchase (500 sessions)",
      amount: 1125.00,
      status: 'paid'
    },
    {
      date: new Date(2024, 11, 15), // December 15, 2024
      description: "Quarterly session payment (1000 students)",
      amount: 4990,
      status: 'paid'
    }
  ]);
  
  const PRICE_PER_SESSION_ANNUAL = 19.96; // $19.96 per student annually
  const PRICE_PER_SESSION_QUARTERLY = 4.99; // $4.99 per student quarterly
  
  useEffect(() => {
    if (sessionPurchases.length > 0) {
      const newHistory = [...billingHistory];
      
      sessionPurchases.forEach(purchase => {
        const existingEntryIndex = newHistory.findIndex(
          entry => 
            entry.description.includes(`Session purchase (${purchase.sessions} sessions)`) && 
            entry.date.getTime() === purchase.date.getTime()
        );
        
        if (existingEntryIndex === -1) {
          newHistory.unshift({
            date: purchase.date,
            description: `Session purchase (${purchase.sessions} sessions)`,
            amount: purchase.cost,
            status: 'paid'
          });
        }
      });
      
      setBillingHistory(newHistory);
    }
  }, [sessionPurchases]);
  
  const calculateAnnualSessionCost = (count) => {
    return (count * PRICE_PER_SESSION_ANNUAL).toFixed(2);
  };
  
  const calculateQuarterlySessionCost = (count) => {
    return (count * PRICE_PER_SESSION_QUARTERLY).toFixed(2);
  };
  
  const handleSessionChange = (count) => {
    setSessionsToPurchase(count);
  };
  
  const handlePurchaseSessions = () => {
    setSessionCount(prev => prev + sessionsToPurchase);
    
    const newPurchase = {
      date: new Date(),
      description: `Session purchase (${sessionsToPurchase} students)`,
      amount: Number(calculateQuarterlySessionCost(sessionsToPurchase)),
      status: 'paid' as const
    };
    
    setBillingHistory([newPurchase, ...billingHistory]);
    
    toast({
      title: "Purchase successful",
      description: `Added ${sessionsToPurchase} student sessions to your institution`,
    });
  };
  
  const handleAddCard = () => {
    setCards([
      ...cards,
      { id: Date.now(), type: 'Mastercard', last4: '8888', expiry: '09/26', default: false }
    ]);
    
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully",
    });
  };
  
  const handleMakeDefault = (id) => {
    setCards(cards.map(card => ({
      ...card,
      default: card.id === id
    })));
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been changed",
    });
  };
  
  const totalSessionCost = sessionPurchases.reduce((total, purchase) => total + purchase.cost, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card tooltip="Purchase access sessions for your students to use the platform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Purchase Sessions
            </CardTitle>
            <CardDescription>
              Get access to the platform for your students to book interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="session-purchase">Current sessions:</Label>
                <span className="font-medium">{sessionCount} students</span>
              </div>
              
              <Label htmlFor="session-purchase">Number of sessions to purchase</Label>
              <div className="flex space-x-2">
                <Input
                  id="session-purchase"
                  type="number"
                  min="1"
                  value={sessionsToPurchase}
                  onChange={(e) => handleSessionChange(parseInt(e.target.value) || 100)}
                  className="text-right"
                />
                <span className="flex items-center text-muted-foreground px-2">students</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => handleSessionChange(100)}>
                100 Sessions
              </Button>
              <Button variant="outline" onClick={() => handleSessionChange(500)}>
                500 Sessions
              </Button>
              <Button variant="outline" onClick={() => handleSessionChange(1000)}>
                1000 Sessions
              </Button>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span>Sessions</span>
                <span>{sessionsToPurchase} students</span>
              </div>
              <div className="flex justify-between">
                <span>Quarterly cost</span>
                <span>${calculateQuarterlySessionCost(sessionsToPurchase)}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual cost</span>
                <span>${calculateAnnualSessionCost(sessionsToPurchase)}</span>
              </div>
              <div className="h-px bg-primary/10 my-1"></div>
              <div className="flex justify-between font-bold">
                <span>Total annual cost</span>
                <span>${calculateAnnualSessionCost(sessionsToPurchase)}</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p>Each session gives a student access to the platform to book interview sessions from your shared pool.</p>
              <p className="mt-1">You can purchase additional sessions separately in the Session Pool tab.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handlePurchaseSessions}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Purchase Sessions
            </Button>
          </CardFooter>
        </Card>
        
        <Card tooltip="Manage your payment methods and billing preferences">
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
      </div>
      
      <Card tooltip="Overview of your institution's subscription and financial details">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Account Summary
          </CardTitle>
          <CardDescription>
            Overview of your institution's subscription and session purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Active Sessions</div>
              <div className="text-2xl font-bold">{sessionCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Students</div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Quarterly Session Cost</div>
              <div className="text-2xl font-bold">${calculateQuarterlySessionCost(sessionCount)}</div>
              <div className="text-xs text-muted-foreground mt-1">Next payment: June 1, 2025</div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Session Purchases</div>
              <div className="text-2xl font-bold">${totalSessionCost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Current quarter</div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Total Quarterly Cost</div>
              <div className="text-2xl font-bold">
                ${(parseFloat(calculateQuarterlySessionCost(sessionCount)) + totalSessionCost).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Sessions + Additional Purchases</div>
            </div>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-md">
            <h3 className="font-medium mb-2">Session Benefits</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Each student gets access to the Octavia AI platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Students can book sessions from your shared institution pool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Access to detailed analytics and performance reports</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Customizable settings for session allocation and management</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">View Invoice History</Button>
          <Button variant="outline">Download Current Invoice</Button>
          <ResetSettingsDialog 
            settingsType="Billing"
            onConfirm={() => {
              toast({
                title: "Billing settings reset",
                description: "All billing settings have been reset to defaults",
              });
            }}
          />
        </CardFooter>
      </Card>
      
      <Card tooltip="View your previous invoices and billing transactions">
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
              {billingHistory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{format(item.date, 'MMMM d, yyyy')}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>${typeof item.amount === 'number' ? item.amount.toFixed(2) : item.amount}</TableCell>
                  <TableCell>
                    <span className={`text-xs ${
                      item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    } px-2 py-1 rounded-full`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingControls;
