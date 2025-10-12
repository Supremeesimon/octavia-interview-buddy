import React, { useState } from 'react';
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
        const modelsData = await listResponse.json();
        console.log('Available models:', modelsData);
        
        // Format the models data for better display
        let modelsInfo = 'Available Models:\n';
        if (modelsData.models && Array.isArray(modelsData.models)) {
          modelsData.models.forEach((model: any) => {
            modelsInfo += `\n- Name: ${model.name}\n`;
            modelsInfo += `  Display Name: ${model.displayName || 'N/A'}\n`;
            modelsInfo += `  Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}\n`;
            modelsInfo += `  Description: ${model.description || 'N/A'}\n`;
          });
        } else {
          modelsInfo += JSON.stringify(modelsData, null, 2);
        }
        
        setResponse(modelsInfo);
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

  const testGeminiModel = async () => {
    setLoading(true);
    
    try {
      const apiKey = "AIzaSyAmJ09DcqFRO4x8oYeRaEjgFyKWMfXYD94";
      
      // Test with gemini-flash-latest model
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message. Please respond with 'Test successful' if you receive this."
            }]
          }]
        })
      });
      
      if (testResponse.ok) {
        const result = await testResponse.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        setResponse(prev => `${prev}\n\nTest with gemini-flash-latest: ${text || 'No response text'}`);
      } else {
        const errorText = await testResponse.text();
        throw new Error(`Failed to test gemini-flash-latest: ${testResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error testing Gemini model:', error);
      setResponse(prev => `${prev}\n\nError testing model: ${error.message}`);
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
          <div className="flex gap-2">
            <Button onClick={testGeminiAPI} disabled={loading}>
              {loading ? 'Testing...' : 'List Available Models'}
            </Button>
            <Button onClick={testGeminiModel} disabled={loading}>
              {loading ? 'Testing...' : 'Test Flash Model'}
            </Button>
          </div>
          
          {response && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Response:</h3>
              <pre className="text-sm whitespace-pre-wrap">{response}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiTest;