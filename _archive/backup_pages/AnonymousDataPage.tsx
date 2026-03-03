import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AnonymousDataChecker from '@/components/AnonymousDataChecker';

const AnonymousDataPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Anonymous Interview Data</h1>
        <p className="text-muted-foreground mt-2">
          Check if anonymous user interview data is being collected properly
        </p>
      </div>
      
      <AnonymousDataChecker />
    </div>
  );
};

export default AnonymousDataPage;