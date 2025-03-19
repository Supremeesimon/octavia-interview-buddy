
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
  ];

  const authLinks = [
    { name: 'Login', path: '/login' },
    { name: 'Signup', path: '/signup' },
  ];
  
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300',
      scrolled ? 'glass-effect shadow-sm' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-lg font-bold">O</span>
          </span>
          <span className="font-medium text-xl">Octavia</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path}
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
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          {authLinks.map((link) => (
            <Link 
              key={link.name}
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
          ))}
          <Link to="/interview">
            <Button className="rounded-full px-6 shadow-md transition-all hover:shadow-lg hover:scale-105">
              Start Interview
            </Button>
          </Link>
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
                  <Link to={link.path}>{link.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="border-t mt-1 pt-1" asChild>
                <Link to="/login">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/signup">Signup</Link>
              </DropdownMenuItem>
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
