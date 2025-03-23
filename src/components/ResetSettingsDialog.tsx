
import React from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ResetSettingsProps {
  settingsType: string;
  onConfirm: () => void;
}

const ResetSettingsDialog = ({
  settingsType,
  onConfirm
}: ResetSettingsProps) => {
  const details = {
    title: `Are you sure you want to reset ${settingsType} settings?`,
    description: "This will revert all custom configurations to platform defaults. This action cannot be undone.",
    cancelText: "Cancel",
    confirmText: "Reset to Defaults",
    destructive: true,
    requireConfirmation: true,
    confirmationText: "RESET"
  };

  const triggerButton = (
    <Button 
      variant="outline"
      className="flex items-center gap-2"
      tooltip={`Reset all ${settingsType.toLowerCase()} settings to platform defaults`}
    >
      <RotateCcw className="h-4 w-4" />
      Reset to Defaults
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

export default ResetSettingsDialog;
