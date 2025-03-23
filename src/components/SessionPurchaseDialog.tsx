
import React from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SessionPurchaseProps {
  sessionCount: number;
  sessionLength: number;
  pricePerMinute: number;
  totalCost: number;
  paymentMethod: string;
  onConfirm: () => void;
}

const SessionPurchaseDialog = ({
  sessionCount,
  sessionLength,
  pricePerMinute,
  totalCost,
  paymentMethod,
  onConfirm
}: SessionPurchaseProps) => {
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const details = {
    title: "Are you sure you want to proceed with this purchase?",
    description: "This charge will be processed immediately.",
    items: [
      { label: 'Item', value: 'Session Bundle' },
      { label: 'Quantity', value: sessionCount },
      { label: 'Session Length', value: `${sessionLength} minutes` },
      { label: 'Price Per Minute', value: formatCurrency(pricePerMinute) },
      { label: 'Total Cost', value: formatCurrency(totalCost) },
      { label: 'Payment Method', value: paymentMethod }
    ],
    cancelText: "Cancel",
    confirmText: "Confirm Payment",
    destructive: false
  };

  const triggerButton = (
    <Button 
      className="flex items-center gap-2"
      tooltip="Add these sessions to your institution's pool"
    >
      <Plus className="h-4 w-4" />
      Add Sessions
    </Button>
  );

  return (
    <ConfirmationDialog
      details={details}
      trigger={triggerButton}
      onConfirm={onConfirm}
    />
  );
};

export default SessionPurchaseDialog;
