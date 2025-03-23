
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CreditCard, DollarSign, Clock, Calendar, Wallet, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BillingControls = () => {
  const { toast } = useToast();
  const [pricePerHundredSessions, setPricePerHundredSessions] = useState(4.99);
  const [sessionsToPurchase, setSessionsToPurchase] = useState(100);
  const [sessionCost, setSessionCost] = useState(calculateCost(100));
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '05/25', default: true }
  ]);
  
  function calculateCost(sessions) {
    return (sessions / 100) * pricePerHundredSessions;
  }
  
  const handleSessionChange = (amount) => {
    setSessionsToPurchase(amount);
    setSessionCost(calculateCost(amount));
  };
  
  const handlePurchase = () => {
    toast({
      title: "Purchase successful",
      description: `Added ${sessionsToPurchase} sessions to your pool`,
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Purchase Sessions
            </CardTitle>
            <CardDescription>
              Add more interview sessions to your institution's pool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-purchase">Number of sessions to purchase</Label>
              <div className="flex space-x-2">
                <Input
                  id="session-purchase"
                  type="number"
                  min="100"
                  step="100"
                  value={sessionsToPurchase}
                  onChange={(e) => handleSessionChange(parseInt(e.target.value) || 100)}
                  className="text-right"
                />
                <span className="flex items-center text-muted-foreground px-2">sessions</span>
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
                <span>{sessionsToPurchase}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per 100 sessions</span>
                <span>${pricePerHundredSessions.toFixed(2)}</span>
              </div>
              <div className="h-px bg-primary/10 my-1"></div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${sessionCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handlePurchase}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Purchase Sessions
            </Button>
          </CardFooter>
        </Card>
        
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
                <TableCell>Purchase of 500 interview sessions</TableCell>
                <TableCell>${(500/100 * 4.99).toFixed(2)}</TableCell>
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
                <TableCell>Purchase of 1000 interview sessions</TableCell>
                <TableCell>${(1000/100 * 4.99).toFixed(2)}</TableCell>
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
