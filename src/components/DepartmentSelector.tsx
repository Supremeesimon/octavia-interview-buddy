import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';
import { toast } from 'sonner';

interface DepartmentSelectorProps {
  institutionName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ 
  institutionName, 
  value, 
  onChange,
  placeholder = 'Select or enter department'
}) => {
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      // Trim the institution name to handle any extra spaces
      const trimmedInstitutionName = institutionName?.trim() || '';
      if (trimmedInstitutionName && trimmedInstitutionName !== 'Unknown Institution') {
        setLoading(true);
        try {
          console.log('Fetching departments for institution:', trimmedInstitutionName);
          const fetchedDepartments = await InstitutionHierarchyService.getDepartmentsByInstitutionName(trimmedInstitutionName);
          console.log('Fetched departments:', fetchedDepartments);
          setDepartments(fetchedDepartments);
        } catch (error) {
          console.error('Error fetching departments:', error);
          toast.error('Failed to load departments');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDepartments();
  }, [institutionName]);

  useEffect(() => {
    // Check if the current value matches an existing department
    const matchesExisting = departments.some(dept => dept.name === value);
    setSelectedFromList(matchesExisting);
  }, [value, departments]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      onChange(selectedValue);
      setSelectedFromList(true);
    } else {
      setSelectedFromList(false);
    }
  };

  if (loading) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Loading departments..."
        disabled
      />
    );
  }

  if (departments.length === 0) {
    console.log('No departments found, showing input only');
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  console.log('Showing department selector with departments:', departments);
  return (
    <div className="space-y-2">
      <select
        value={selectedFromList && departments.some(d => d.name === value) ? value : ""}
        onChange={handleSelectChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select existing department or enter new</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.name}>{dept.name}</option>
        ))}
      </select>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // If they type something that's not in the list, mark as not selected from list
          if (!departments.some(dept => dept.name === e.target.value)) {
            setSelectedFromList(false);
          }
        }}
        placeholder={selectedFromList ? "Selected from list" : "Or enter new department"}
      />
    </div>
  );
};

export default DepartmentSelector;