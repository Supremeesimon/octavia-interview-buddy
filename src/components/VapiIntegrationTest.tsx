import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import config from '@/lib/config';

const VapiIntegrationTest: React.FC = () => {
  const [vapiStatus, setVapiStatus] = useState<string>('Initializing...');
  const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vapiInstance: any = null;

    const initializeVapi = async () => {
      try {
        if (!config.vapi.publicKey) {
          throw new Error('VAPI public key is missing');
        }

        // Initialize VAPI SDK
        vapiInstance = new Vapi(config.vapi.publicKey);
        setVapiStatus('VAPI SDK initialized successfully');
        
        // Test connection by setting up basic event listeners
        vapiInstance.on('call-start', () => {
          setConnectionStatus('Call started');
        });
        
        vapiInstance.on('call-end', () => {
          setConnectionStatus('Call ended');
        });
        
        vapiInstance.on('error', (err: any) => {
          setError(`VAPI Error: ${err.message}`);
        });
        
        setConnectionStatus('Ready for calls');
      } catch (err: any) {
        setError(`Initialization failed: ${err.message}`);
        setVapiStatus('Failed to initialize VAPI');
        console.error('VAPI initialization error:', err);
      }
    };

    initializeVapi();

    // Cleanup function
    return () => {
      if (vapiInstance) {
        // Clean up any active calls
        if (vapiInstance.isCallActive()) {
          vapiInstance.stop().catch(console.error);
        }
      }
    };
  }, []);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 className="text-lg font-bold mb-2">VAPI Integration Test</h2>
      <div className="space-y-2">
        <p><strong>Status:</strong> {vapiStatus}</p>
        <p><strong>Connection:</strong> {connectionStatus}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>
    </div>
  );
};

export default VapiIntegrationTest;