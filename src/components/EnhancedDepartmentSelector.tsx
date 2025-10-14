import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';
import { toast } from 'sonner';
import { Check, Plus } from 'lucide-react';

interface DepartmentOption {
  id: string;
  name: string;
  isExactMatch: boolean;
}

interface EnhancedDepartmentSelectorProps {
  institutionName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const EnhancedDepartmentSelector: React.FC<EnhancedDepartmentSelectorProps> = ({ 
  institutionName, 
  value, 
  onChange,
  placeholder = 'Select or type department',
  required = false
}) => {
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      const trimmedInstitutionName = institutionName?.trim() || '';
      if (trimmedInstitutionName && trimmedInstitutionName !== 'Unknown Institution') {
        setLoading(true);
        try {
          const fetchedDepartments = await InstitutionHierarchyService.getDepartmentsByInstitutionName(trimmedInstitutionName);
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

  // Filter departments based on input
  const getFilteredDepartments = (): DepartmentOption[] => {
    if (!value) return departments.map(dept => ({
      ...dept,
      isExactMatch: false
    }));

    const inputValue = value.toLowerCase().trim();
    
    // First, find exact matches (case insensitive)
    const exactMatches = departments
      .filter(dept => dept.name.toLowerCase() === inputValue)
      .map(dept => ({
        ...dept,
        isExactMatch: true
      }));

    // Then, find partial matches
    const partialMatches = departments
      .filter(dept => 
        dept.name.toLowerCase().includes(inputValue) && 
        dept.name.toLowerCase() !== inputValue
      )
      .map(dept => ({
        ...dept,
        isExactMatch: false
      }));

    // Combine exact matches first, then partial matches
    return [...exactMatches, ...partialMatches];
  };

  const filteredDepartments = getFilteredDepartments();

  // Check if current input matches an existing department
  const isExistingDepartment = departments.some(
    dept => dept.name.toLowerCase() === value.toLowerCase().trim()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleDepartmentSelect = (departmentName: string) => {
    onChange(departmentName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredDepartments.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDepartments[highlightedIndex]) {
          handleDepartmentSelect(filteredDepartments[highlightedIndex].name);
        } else if (value.trim()) {
          // If no selection but there's text, treat it as a custom entry
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Loading departments..."
          required={required}
          disabled
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={isExistingDepartment ? 'border-green-500' : ''}
      />
      
      {/* Status indicator */}
      {value && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isExistingDepartment ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Plus className="h-4 w-4 text-blue-500" />
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (filteredDepartments.length > 0 || value.trim()) && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredDepartments.map((dept, index) => (
            <div
              key={dept.id}
              className={`px-4 py-2 cursor-pointer flex items-center ${
                index === highlightedIndex 
                  ? 'bg-blue-100' 
                  : dept.isExactMatch 
                    ? 'bg-green-50 hover:bg-green-100' 
                    : 'hover:bg-gray-100'
              }`}
              onClick={() => handleDepartmentSelect(dept.name)}
            >
              {dept.isExactMatch ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <div className="h-4 w-4 mr-2"></div>
              )}
              <span>{dept.name}</span>
              {dept.isExactMatch && (
                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Existing
                </span>
              )}
            </div>
          ))}
          
          {/* Option to create new department */}
          {value.trim() && !isExistingDepartment && (
            <div
              className={`px-4 py-2 cursor-pointer flex items-center ${
                highlightedIndex === filteredDepartments.length 
                  ? 'bg-blue-100' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                handleDepartmentSelect(value);
                setIsOpen(false);
              }}
            >
              <Plus className="h-4 w-4 text-blue-500 mr-2" />
              <span>Create "{value}"</span>
              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                New
              </span>
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {value && (
        <p className="mt-1 text-sm">
          {isExistingDepartment ? (
            <span className="text-green-600">Will use existing department</span>
          ) : (
            <span className="text-blue-600">Will create new department</span>
          )}
        </p>
      )}
    </div>
  );
};

export default EnhancedDepartmentSelector;