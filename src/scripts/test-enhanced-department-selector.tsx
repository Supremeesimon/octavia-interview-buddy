import React from 'react';
import ReactDOM from 'react-dom/client';
import EnhancedDepartmentSelector from '@/components/EnhancedDepartmentSelector';

// Simple test component
const TestComponent: React.FC = () => {
  const [department, setDepartment] = React.useState('');
  
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Enhanced Department Selector Test</h1>
      <EnhancedDepartmentSelector
        institutionName="Test Institution"
        value={department}
        onChange={setDepartment}
        placeholder="Select or type department"
        required
      />
      <p style={{ marginTop: '10px' }}>
        Selected department: <strong>{department}</strong>
      </p>
    </div>
  );
};

// Render the test component
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<TestComponent />);