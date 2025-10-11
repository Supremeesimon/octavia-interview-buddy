import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GeminiTest = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testGeminiAPI = async () => {
    setLoading(true);
    setResponse('');
    
    try {
      const apiKey = "AIzaSyAmJ09DcqFRO4x8oYeRaEjgFyKWMfXYD94";
      
      // First, let's list available models to see what's actually available
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (listResponse.ok) {
        const models = await listResponse.json();
        console.log('Available models:', models);
        setResponse(`Available models: ${JSON.stringify(models, null, 2)}`);
      } else {
        const errorText = await listResponse.text();
        throw new Error(`Failed to list models: ${listResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error testing Gemini API:', error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gemini API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testGeminiAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Gemini API'}
          </Button>
          
          {response && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Response:</h3>
              <p className="text-sm">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiTest;