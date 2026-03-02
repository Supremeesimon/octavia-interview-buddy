import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to subscription page for external users
    navigate('/subscribe');
  }, [navigate]);

  return null; // Don't render anything since we're redirecting
};

export default SignupRedirect;