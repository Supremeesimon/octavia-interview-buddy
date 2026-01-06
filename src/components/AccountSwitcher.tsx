import React, { useState } from 'react';
import { 
  User, 
  UserPlus, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  UserRoundPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccountSwitcher } from '@/hooks/use-account-switcher';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const AccountSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useFirebaseAuth();
  const { 
    activeAccount, 
    accounts, 
    hasMultipleAccounts, 
    switchAccount, 
    addCurrentAccount,
    removeAccount 
  } = useAccountSwitcher();
  const [showAccountList, setShowAccountList] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAccountSwitch = async (accountId: string) => {
    try {
      // Get the account that will be switched to
      const targetAccount = accounts.find(acc => acc.id === accountId);
      
      await switchAccount(accountId);
      setShowAccountList(false);
      
      // After switching accounts, navigate to the appropriate dashboard based on the new role
      if (targetAccount) {
        switch (targetAccount.role) {
          case 'student':
            navigate('/student');
            break;
          case 'teacher':
            navigate('/teacher-dashboard');
            break;
          case 'institution_admin':
            navigate('/dashboard');
            break;
          case 'platform_admin':
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const handleRemoveAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAccount(accountId);
  };

  // Function to add current account to the account switcher
  const handleAddAccount = () => {
    if (currentUser) {
      addCurrentAccount();
      toast.success('Current account added to account switcher');
    }
  };

  // Get the display name for an account
  const getAccountDisplayName = (account: UserProfile | null | undefined) => {
    if (!account) {
      return 'Unknown User';
    }
    return account.name || account.email?.split('@')[0] || 'Unknown User';
  };

  // Get the avatar fallback for an account
  const getAvatarFallback = (account: UserProfile | null | undefined) => {
    if (!account) {
      return 'U';
    }
    const name = getAccountDisplayName(account);
    return name.charAt(0).toUpperCase();
  };

  if (!currentUser) {
    return null; // Don't show if not logged in
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 flex items-center gap-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser?.profilePicture} alt={getAccountDisplayName(currentUser)} />
            <AvatarFallback>{getAvatarFallback(currentUser)}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block truncate max-w-[120px]">
            {getAccountDisplayName(currentUser)}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>My Accounts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Current Account */}
        <div className="px-2 py-1">
          <div className="flex items-center gap-2 w-full p-2 rounded-md bg-muted">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activeAccount?.profilePicture} alt={getAccountDisplayName(activeAccount)} />
              <AvatarFallback>{getAvatarFallback(activeAccount)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{getAccountDisplayName(activeAccount)}</div>
              <div className="text-xs text-muted-foreground truncate">{activeAccount?.email || 'No email'}</div>
            </div>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Active</span>
          </div>
        </div>
        
        {hasMultipleAccounts && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
            
            {accounts
              .filter(account => account.id !== activeAccount?.id)
              .map(account => (
                <DropdownMenuItem 
                  key={account.id} 
                  onClick={() => handleAccountSwitch(account.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={account.profilePicture} alt={getAccountDisplayName(account)} />
                      <AvatarFallback>{getAvatarFallback(account)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{getAccountDisplayName(account)}</div>
                      <div className="text-xs text-muted-foreground truncate">{account.email || 'No email'}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs"
                      onClick={(e) => handleRemoveAccount(account.id, e)}
                    >
                      ×
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAddAccount} className="cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <UserPlus className="h-4 w-4" />
            <span>Add Current Account</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountSwitcher;