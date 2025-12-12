import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { scrollToSection } from '@/lib/animations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { toast } from 'sonner';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useFirebaseAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for hash in URL and scroll to section
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        scrollToSection(id);
      }, 0);
    }
  }, [location]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    // Navigate to home first if not on home page
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      scrollToSection(id);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', tooltip: 'Go to homepage' },
    { name: 'How It Works', path: '/#how-it-works', id: 'how-it-works', tooltip: 'Learn how Octavia works' },
    { name: 'Features', path: '/#features', id: 'features', tooltip: 'Explore Octavia features' },
    { name: 'For Institutions', path: '/#institution-metrics', id: 'institution-metrics', tooltip: 'Learn about our institutional offerings' },
  ];

  const authLinks = [
    { name: 'Login', path: '/login', tooltip: 'Sign in to your account' },
    { name: 'Signup', path: '/signup-external', tooltip: 'Create a new account' },
  ];
  
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300',
      scrolled ? 'bg-background/90 shadow-sm' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/images/octavia-logo.jpg" 
                alt="Octavia Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium text-xl">Octavia</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to homepage</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Tooltip key={link.name}>
              <TooltipTrigger asChild>
                <Link 
                  to={link.path}
                  onClick={link.id ? (e) => handleNavClick(e, link.id) : undefined}
                  className={cn(
                    'text-sm transition-colors duration-200',
                    location.pathname === link.path || 
                    (location.pathname === '/' && link.path.startsWith('/#'))
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.name}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{link.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && user ? (
            // Authenticated user navigation
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to={user.role === 'student' ? '/student' : user.role === 'platform_admin' ? '/admin' : user.role === 'institution_admin' ? '/dashboard' : '/dashboard'}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to your dashboard</p>
                </TooltipContent>
              </Tooltip>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/');
                    toast.success('Logged out successfully');
                  } catch (error) {
                    toast.error('Logout failed');
                  }
                }}
                className="text-sm"
              >
                Logout
              </Button>
            </>
          ) : (
            // Unauthenticated user navigation
            <>
              {authLinks.map((link) => (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={link.path}
                      className={cn(
                        'text-sm transition-colors duration-200',
                        link.name === 'Signup' 
                          ? 'bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90' 
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {link.name}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{link.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </>
          )}
          <Button 
            className="rounded-full px-6 shadow-md transition-all hover:shadow-lg hover:scale-105"
            asChild
          >
            <Link to="/interview">
              Start Interview
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.name} asChild>
                  <Link 
                    to={link.path}
                    onClick={link.id ? (e) => handleNavClick(e, link.id) : undefined}
                  >
                    {link.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              {isAuthenticated && user ? (
                // Authenticated user mobile menu
                <>
                  <DropdownMenuItem asChild>
                    <Link to={user.role === 'student' ? '/student' : user.role === 'platform_admin' ? '/admin' : user.role === 'institution_admin' ? '/dashboard' : '/dashboard'}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await logout();
                        navigate('/');
                        toast.success('Logged out successfully');
                      } catch (error) {
                        toast.error('Logout failed');
                      }
                    }}
                    className="text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                // Unauthenticated user mobile menu
                <>
                  <DropdownMenuItem className="border-t mt-1 pt-1" asChild>
                    <Link to="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup-external">Signup</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="bg-primary text-white hover:bg-primary/90 mt-1" asChild>
                <Link to="/interview">Start Interview</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;