import React, { useState } from 'react';
import AnalyticsTestComponent from '@/components/AnalyticsTestComponent';

const AnalyticsTestPage = () => {
  const [institutionId, setInstitutionId] = useState('WxD3cWTybNsqkpj7OwW4'); // Default test ID

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Implementation Test</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Institution ID</label>
        <input
          type="text"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter institution ID"
        />
      </div>
      
      <AnalyticsTestComponent institutionId={institutionId} />
    </div>
  );
};

export default AnalyticsTestPage;