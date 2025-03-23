
import React from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface AllocationChangeProps {
  currentMethod: string;
  newMethod: string;
  departmentsAffected?: number;
  studentsAffected: number;
  onConfirm: () => void;
}

const AllocationChangeDialog = ({
  currentMethod,
  newMethod,
  departmentsAffected = 0,
  studentsAffected,
  onConfirm
}: AllocationChangeProps) => {
  const details = {
    title: "Are you sure you want to change how sessions are allocated?",
    description: "This change will take effect immediately.",
    items: [
      { label: 'Current Method', value: currentMethod },
      { label: 'New Method', value: newMethod },
      ...(departmentsAffected > 0 ? [{ label: 'Departments Affected', value: departmentsAffected }] : []),
      { label: 'Students Affected', value: studentsAffected }
    ],
    cancelText: "Cancel",
    confirmText: "Confirm Changes",
    destructive: false
  };

  const triggerButton = (
    <Button 
      className="w-full flex items-center justify-center gap-2"
      tooltip="Save your session allocation configuration"
    >
      <Save className="h-4 w-4" />
      Save Allocation Settings
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

export default AllocationChangeDialog;
