import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// Test component to verify token extraction logic
const TestTokenExtraction: React.FC = () => {
  const { institutionId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Get token from query parameters first, then from path parameters if query param is empty
  const customSignupToken = searchParams.get('token') || institutionId || '';
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Token Extraction Test</h1>
      <div>
        <h2>URL Parameters:</h2>
        <p><strong>institutionId (path):</strong> {institutionId || 'null'}</p>
        <p><strong>token (query):</strong> {searchParams.get('token') || 'null'}</p>
        <p><strong>customSignupToken (combined):</strong> {customSignupToken || 'null'}</p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Test Cases:</h3>
        <p><strong>Case 1:</strong> /signup-institution/abc123 → institutionId=abc123, token=null → customSignupToken=abc123</p>
        <p><strong>Case 2:</strong> /signup-institution?token=xyz789 → institutionId=null, token=xyz789 → customSignupToken=xyz789</p>
        <p><strong>Case 3:</strong> /signup-institution/abc123?token=xyz789 → institutionId=abc123, token=xyz789 → customSignupToken=xyz789</p>
      </div>
    </div>
  );
};

export default TestTokenExtraction;