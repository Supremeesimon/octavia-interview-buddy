import React, { useState, useEffect } from 'react';
import vapiService from '@/services/vapi.service';

const VapiDebugTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [isMock, setIsMock] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Check VAPI status
    const checkVapiStatus = () => {
      try {
        // @ts-ignore - accessing private property for testing
        const vapiInstance = vapiService['vapi'];
        
        if (vapiInstance) {
          // Check if it's the mock implementation
          if (vapiInstance.start && vapiInstance.start.toString().includes('[MOCK VAPI]')) {
            setStatus('Using Mock Implementation');
            setIsMock(true);
          } else {
            setStatus('VAPI Properly Initialized');
            setIsMock(false);
          }
        } else {
          setStatus('VAPI Not Initialized');
          setIsMock(true);
        }
      } catch (error) {
        setStatus('Error Checking VAPI Status');
        setIsMock(true);
      }
    };

    checkVapiStatus();
  }, []);

  const testVapi = async () => {
    setTestResult('Testing...');
    try {
      // @ts-ignore - accessing private property for testing
      const vapiInstance = vapiService['vapi'];
      
      if (!vapiInstance) {
        setTestResult('Error: VAPI instance not available');
        return;
      }
      
      // Check if it's the mock implementation
      if (vapiInstance.start && vapiInstance.start.toString().includes('[MOCK VAPI]')) {
        setTestResult('Using mock implementation - testing with mock parameters');
        const result = await vapiInstance.start('test-assistant-id', { metadata: { test: true } });
        setTestResult(`Mock test result: ${result ? 'Success' : 'Failed'}`);
        return;
      }
      
      // For real VAPI, we'll just check if the methods exist
      setTestResult(`VAPI instance valid. Start method: ${typeof vapiInstance.start}`);
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h2 className="text-lg font-bold mb-2">VAPI Debug Test</h2>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Using Mock:</strong> {isMock ? 'Yes' : 'No'}</p>
      <p><strong>Test Result:</strong> {testResult}</p>
      <button 
        onClick={testVapi}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Test VAPI
      </button>
    </div>
  );
};

export default VapiDebugTest;