import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const InstitutionalSignupRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this is an institutional signup link
    const searchParams = new URLSearchParams(location.search);
    const institutionParam = searchParams.get('institution');
    
    if (institutionParam) {
      // Redirect to the institutional signup page with the institution name
      navigate(`/signup-institution?institution=${encodeURIComponent(institutionParam)}`);
    } else {
      // If no institution parameter, redirect to regular signup
      navigate('/signup');
    }
  }, [location, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default InstitutionalSignupRedirect;