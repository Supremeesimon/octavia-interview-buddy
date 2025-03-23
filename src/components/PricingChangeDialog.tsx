
import React from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PricingChangeProps {
  currentVAPICost: number;
  newVAPICost: number;
  currentMarkup: number;
  newMarkup: number;
  institutionsAffected: number;
  onConfirm: () => void;
  isSignificantChange?: boolean;
}

const PricingChangeDialog = ({
  currentVAPICost,
  newVAPICost,
  currentMarkup,
  newMarkup,
  institutionsAffected,
  onConfirm,
  isSignificantChange = false
}: PricingChangeProps) => {
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const details = {
    title: "Are you sure you want to change pricing settings?",
    description: "This change will affect all future session purchases.",
    items: [
      { label: 'Current VAPI Cost', value: `${formatCurrency(currentVAPICost)}/minute` },
      { label: 'New VAPI Cost', value: `${formatCurrency(newVAPICost)}/minute` },
      { label: 'Current Markup', value: formatPercentage(currentMarkup) },
      { label: 'New Markup', value: formatPercentage(newMarkup) },
      { label: 'Institutions Affected', value: institutionsAffected }
    ],
    cancelText: "Cancel",
    confirmText: "Confirm Changes",
    destructive: isSignificantChange,
    requireConfirmation: isSignificantChange,
    confirmationText: "CONFIRM"
  };

  const triggerButton = (
    <Button 
      variant={isSignificantChange ? "destructive" : "default"}
      className="flex items-center gap-2"
      tooltip="Apply these pricing changes to the platform"
    >
      {isSignificantChange && <AlertTriangle className="h-4 w-4" />}
      Apply Changes
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

export default PricingChangeDialog;
