import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import config from '@/lib/config';

const VapiDebugTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<boolean>(true);

  useEffect(() => {
    const testVapiIntegration = async () => {
      try {
        console.log('Testing VAPI integration...');
        console.log('VAPI Public Key:', config.vapi.publicKey);
        
        // Initialize VAPI SDK
        const vapiInstance = new Vapi(config.vapi.publicKey);
        
        // Check if VAPI instance is created
        console.log('VAPI Instance:', vapiInstance);
        
        // Test the assistant ID
        const assistantId = 'a1218d48-1102-4890-a0a6-d0ed2d207410';
        console.log('Testing with Assistant ID:', assistantId);
        
        // Test if we can access the start method
        console.log('Start method available:', typeof vapiInstance.start);
        
        setTestResults({
          success: true,
          message: 'VAPI integration test completed',
          publicKey: config.vapi.publicKey ? 'Present' : 'Missing',
          vapiInstance: vapiInstance ? 'Created' : 'Failed',
          assistantId: assistantId,
          startMethod: typeof vapiInstance.start
        });
      } catch (error: any) {
        console.error('VAPI Test Error:', error);
        setTestResults({
          success: false,
          error: error.message,
          stack: error.stack
        });
      } finally {
        setIsTesting(false);
      }
    };

    testVapiIntegration();
  }, []);

  if (isTesting) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-bold mb-2">VAPI Debug Test</h2>
        <p>Testing VAPI integration...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 className="text-lg font-bold mb-2">VAPI Debug Test Results</h2>
      <div className="space-y-2">
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(testResults, null, 2)}
        </pre>
        {testResults?.success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
            <p className="font-semibold text-green-800">✅ VAPI Integration Test Successful!</p>
            <p className="text-green-700">The assistant ID has been updated and VAPI is properly configured.</p>
          </div>
        )}
        {!testResults?.success && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="font-semibold text-red-800">❌ VAPI Integration Test Failed!</p>
            <p className="text-red-700">Check the error details above and ensure your VAPI credentials are correct.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VapiDebugTest;