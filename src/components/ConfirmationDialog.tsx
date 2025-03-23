
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConfirmationDetails {
  title: string;
  description?: string;
  items?: { label: string; value: string | number }[];
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
}

interface ConfirmationDialogProps {
  details: ConfirmationDetails;
  trigger: React.ReactNode;
  onConfirm: () => void;
}

const ConfirmationDialog = ({
  details,
  trigger,
  onConfirm
}: ConfirmationDialogProps) => {
  const [confirmationInput, setConfirmationInput] = React.useState('');
  const {
    title,
    description,
    items = [],
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    destructive = false,
    requireConfirmation = false,
    confirmationText = 'CONFIRM'
  } = details;

  const handleConfirm = () => {
    if (requireConfirmation && confirmationInput !== confirmationText) {
      return;
    }
    onConfirm();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        
        {items.length > 0 && (
          <div className="py-3 space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {requireConfirmation && (
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              To confirm this action, type "{confirmationText}" below:
            </p>
            <Input
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={confirmationText}
              className="w-full"
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
            disabled={requireConfirmation && confirmationInput !== confirmationText}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
