import React, { useState, useEffect } from 'react';
import vapiService from '@/services/vapi.service';
import config from '@/lib/config';
import Vapi from '@vapi-ai/web';

const VapiTest: React.FC = () => {
  const [vapiStatus, setVapiStatus] = useState<string>('Checking...');
  const [isMock, setIsMock] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Check if VAPI is properly initialized
    const checkVapiStatus = () => {
      try {
        // @ts-ignore - accessing private property for testing
        const vapiInstance = vapiService['vapi'];
        
        // @ts-ignore - accessing private property for testing
        const assistantId = vapiService['assistantId'];
        
        if (vapiInstance) {
          // Check if it's the mock implementation
          if (vapiInstance.start && vapiInstance.start.toString().includes('[MOCK VAPI]')) {
            setVapiStatus('Using Mock Implementation');
            setIsMock(true);
            setDetails(`Assistant ID: ${assistantId || 'Not set'}`);
          } else {
            setVapiStatus('VAPI Properly Initialized');
            setIsMock(false);
            setDetails(`Assistant ID: ${assistantId || 'Not set'} | Public Key: ${config.vapi.publicKey ? 'Set' : 'Missing'}`);
          }
        } else {
          setVapiStatus('VAPI Not Initialized');
          setIsMock(true);
          setDetails(`Assistant ID: ${assistantId || 'Not set'} | Public Key: ${config.vapi.publicKey ? 'Set' : 'Missing'}`);
        }
      } catch (error) {
        setVapiStatus('Error Checking VAPI Status');
        setIsMock(true);
        setDetails(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkVapiStatus();
  }, []);

  const testVapiConnection = async () => {
    setTestResult('Testing VAPI connection...');
    try {
      // @ts-ignore - accessing private property for testing
      const vapiInstance = vapiService['vapi'];
      
      // @ts-ignore - accessing private property for testing
      const assistantId = vapiService['assistantId'];
      
      if (!vapiInstance) {
        setTestResult('Error: VAPI instance not available');
        return;
      }
      
      // Check if it's the mock implementation
      if (vapiInstance.start && vapiInstance.start.toString().includes('[MOCK VAPI]')) {
        setTestResult('Using mock implementation - test not applicable');
        return;
      }
      
      // Test the assistant ID
      if (!assistantId) {
        setTestResult('Error: Assistant ID not configured');
        return;
      }
      
      setTestResult(`VAPI initialized with assistant ID: ${assistantId}. Testing assistant...`);
      
      // Test assistant using the service method
      const isAssistantValid = await vapiService.testAssistant();
      setTestResult(`Assistant validation result: ${isAssistantValid ? 'Valid' : 'Invalid'}`);
      
    } catch (error) {
      setTestResult(`Error testing VAPI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testVapiStart = async () => {
    setTestResult('Testing VAPI start call...');
    try {
      // @ts-ignore - accessing private property for testing
      const vapiInstance = vapiService['vapi'];
      
      // Check if it's the mock implementation
      if (vapiInstance.start && vapiInstance.start.toString().includes('[MOCK VAPI]')) {
        setTestResult('Using mock implementation - test not applicable');
        return;
      }
      
      // @ts-ignore - accessing private property for testing
      const assistantId = vapiService['assistantId'];
      
      if (!assistantId) {
        setTestResult('Error: Assistant ID not configured');
        return;
      }
      
      setTestResult(`Attempting to start test call with assistant ID: ${assistantId}...`);
      
      // This is a test call that should help us determine if the issue is with the assistant
      // Note: This might still fail if the assistant is misconfigured, but it will give us more information
      const result = await vapiInstance.start(assistantId, {
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      setTestResult(`Test call result: ${result ? 'Success' : 'Null response'}. Response: ${JSON.stringify(result)}`);
      
    } catch (error: any) {
      setTestResult(`Error during test call: ${error.message || error.toString()}`);
      console.error('Test call error details:', error);
    }
  };

  const testDirectVapi = async () => {
    setTestResult('Testing direct VAPI SDK initialization...');
    try {
      if (!config.vapi.publicKey) {
        setTestResult('Error: VAPI public key not set in configuration');
        return;
      }
      
      setTestResult(`Initializing direct VAPI instance with key: ${config.vapi.publicKey.substring(0, 8)}...`);
      
      // Create a new VAPI instance directly
      const directVapi = new Vapi(config.vapi.publicKey);
      
      // @ts-ignore - accessing private property for testing
      const assistantId = vapiService['assistantId'];
      
      if (!assistantId) {
        setTestResult('Error: Assistant ID not configured');
        return;
      }
      
      setTestResult(`Direct VAPI instance created. Testing with assistant ID: ${assistantId}...`);
      
      setTestResult(`Attempting direct call with assistant ID: ${assistantId}...`);
      
      // Try the direct call - using the correct format for VAPI SDK
      const result = await directVapi.start(assistantId, {
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
          source: 'direct-test'
        }
      });
      setTestResult(`Direct call result: ${result ? 'Success' : 'Null response'}. Response: ${JSON.stringify(result)}`);
      
    } catch (error: any) {
      setTestResult(`Error during direct VAPI test: ${error.message || error.toString()}`);
      console.error('Direct VAPI test error details:', error);
    }
  };

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h2 className="text-lg font-bold mb-2">VAPI Test Component</h2>
      <p><strong>VAPI Status:</strong> {vapiStatus}</p>
      <p><strong>Details:</strong> {details}</p>
      <p><strong>Test Result:</strong> {testResult}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <button 
          onClick={testVapiConnection}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Test VAPI Connection
        </button>
        <button 
          onClick={testVapiStart}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Test VAPI Start Call
        </button>
        <button 
          onClick={testDirectVapi}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
        >
          Test Direct VAPI SDK
        </button>
      </div>
      {isMock && (
        <p className="text-sm text-amber-600 mt-2">
          Note: VAPI is using a mock implementation. Voice interviews will be simulated.
        </p>
      )}
    </div>
  );
};

export default VapiTest;