import React from 'react';
import VapiDebugTest from '@/components/VapiDebugTest';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const VapiTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VAPI Integration Test</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            Back
          </Button>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">VAPI Debug Information</h2>
          <p className="text-gray-600 mb-6">
            This page helps verify that the VAPI integration is working correctly.
          </p>
          
          <VapiDebugTest />
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Check the status above to see if VAPI is properly initialized</li>
            <li>Click "Test VAPI" to verify the integration</li>
            <li>If using mock implementation, voice interviews will be simulated</li>
            <li>If VAPI is properly initialized, you can test actual voice interviews</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VapiTestPage;