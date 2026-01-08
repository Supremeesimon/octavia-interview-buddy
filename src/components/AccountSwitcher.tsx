import React, { useState } from 'react';
import { 
  User, 
  UserPlus, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  UserRoundPlus,
  Loader2
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
import { errorHandler } from '@/lib/error-handler';

const AccountSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAccountSwitching, logout } = useFirebaseAuth();
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
      toast.success('Logged out successfully');
    } catch (error) {
      errorHandler.handleAuthError(error, 'logout');
    }
  };

  const handleAccountSwitch = async (accountId: string) => {
    // Prevent switching if already switching
    if (isAccountSwitching) {
      console.log('Account switching in progress, skipping duplicate switch');
      return;
    }
    
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
      
      toast.success('Account switched successfully');
    } catch (error) {
      errorHandler.handleAccountSwitchError(error, accountId);
    }
  };

  const handleRemoveAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAccount(accountId);
  };

  // Function to initiate adding a new account by opening login in a new tab
  const handleAddAccount = () => {
    // Create a new window/tab for the user to log in
    const newWindow = window.open('/login', '_blank', 'width=800,height=600');
    
    if (newWindow) {
      // Store a flag to indicate we're adding a new account
      localStorage.setItem('addingNewAccountViaSwitcher', 'true');
      
      // Store the return URL so the login page knows where to redirect after login
      const returnUrl = window.location.href;
      localStorage.setItem('postAuthRedirect', returnUrl);
      
      // Focus the new window
      newWindow.focus();
      
      // Optional: Show a toast to inform the user
      toast.info('Login window opened. Complete the login process to add the account.');
    } else {
      // Handle case where popup is blocked
      toast.error('Popup blocked. Please allow popups for this site or try again.');
    }
  };

  // Get the display name for an account
  const getAccountDisplayName = (account: UserProfile | null | undefined) => {
    if (!account) {
      return 'Unknown User';
    }
    return account.name || account.email?.split('@')[0] || 'Unknown User';
  };

  // Get the role display name
  const getRoleDisplayName = (role: string | undefined) => {
    if (!role) return 'User';
    switch(role) {
      case 'student':
        return 'Student';
      case 'teacher':
        return 'Teacher';
      case 'institution_admin':
        return 'Admin';
      case 'platform_admin':
        return 'Platform Admin';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
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
          disabled={isAccountSwitching}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser?.profilePicture} alt={getAccountDisplayName(currentUser)} />
            <AvatarFallback>{getAvatarFallback(currentUser)}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block truncate max-w-[120px]">
            {isAccountSwitching ? 'Switching...' : getAccountDisplayName(currentUser)}
          </span>
          {isAccountSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
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
              <div className="text-xs text-muted-foreground truncate">
                {activeAccount?.email || 'No email'} • {getRoleDisplayName(activeAccount?.role)}
              </div>
            </div>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{getRoleDisplayName(activeAccount?.role)}</span>
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
                      <div className="text-xs text-muted-foreground truncate">
                        {account.email || 'No email'} • {getRoleDisplayName(account.role)}
                      </div>
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
            <span>Add Another Account</span>
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