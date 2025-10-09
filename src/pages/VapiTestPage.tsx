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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">VAPI Assistant ID Verification</h2>
          <p className="text-gray-600 mb-6">
            This page verifies that the VAPI assistant ID has been correctly updated to fix the 
            "Cannot read properties of null (reading 'id')" error.
          </p>
          
          <VapiDebugTest />
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>If the test above shows success, the VAPI integration should now work correctly</li>
            <li>Navigate to the interview page to test starting an actual interview</li>
            <li>If you still encounter issues, check your VAPI public key in the environment configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VapiTestPage;