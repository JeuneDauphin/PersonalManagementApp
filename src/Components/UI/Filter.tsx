// Generic filter component used throughout the app
import React, { useState } from 'react';
import { Filter as FilterIcon, ChevronDown, X } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  values: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
}

interface FilterProps {
  options: FilterOption[];
  onChange?: (filters: Record<string, string[]>) => void;
  className?: string;
}

const Filter: React.FC<FilterProps> = ({
  options,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const handleFilterToggle = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters };

    if (!newFilters[filterKey]) {
      newFilters[filterKey] = [];
    }

    const valueIndex = newFilters[filterKey].indexOf(value);
    if (valueIndex > -1) {
      newFilters[filterKey] = newFilters[filterKey].filter(v => v !== value);
      if (newFilters[filterKey].length === 0) {
        delete newFilters[filterKey];
      }
    } else {
      newFilters[filterKey].push(value);
    }

    setActiveFilters(newFilters);
    onChange?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onChange?.({});
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2
          bg-gray-700 border border-gray-600
          text-white rounded-lg text-body
          hover:bg-gray-600 transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        <FilterIcon size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-blue-400 hover:text-blue-300 text-small flex items-center gap-1"
                >
                  <X size={12} />
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              {options.map((option) => (
                <div key={option.key}>
                  <h4 className="font-medium text-gray-300 mb-2">{option.label}</h4>
                  <div className="space-y-1">
                    {option.values.map((value) => {
                      const isSelected = activeFilters[option.key]?.includes(value.value) || false;

                      return (
                        <label
                          key={value.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleFilterToggle(option.key, value.value)}
                            className="rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-body text-gray-300 flex-1">{value.label}</span>
                          {value.count !== undefined && (
                            <span className="text-small text-gray-400">({value.count})</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Filter;
// it is a controlled component that receives the filter, search and sort options as props
