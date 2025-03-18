
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
        
        <div className="flex items-center space-x-4">
          <Link to="/interview">
            <Button className="rounded-full px-6 shadow-md transition-all hover:shadow-lg hover:scale-105">
              Start Interview
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
