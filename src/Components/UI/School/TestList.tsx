
// Test list component displaying tests in a grid layout
import React from 'react';
import { Test } from '../../../utils/interfaces/interfaces';
import { FileText } from 'lucide-react';
import TestCard from './TestCard';

interface TestListProps {
  tests: Test[];
  isLoading?: boolean;
  onTestClick?: (test: Test) => void;
  onTestEdit?: (test: Test) => void;
  onTestDelete?: (testId: string) => void;
  showActions?: boolean;
}

const TestList: React.FC<TestListProps> = ({
  tests,
  isLoading = false,
  onTestClick,
  onTestEdit,
  onTestDelete,
  showActions = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-1 bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-700 rounded mb-3"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if ((tests || []).length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No tests found</h3>
        <p className="text-gray-500">Create your first test to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(tests || []).map((test) => (
        <TestCard
          key={test._id}
          test={test}
          onClick={onTestClick}
          onEdit={onTestEdit}
          onDelete={onTestDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default TestList;
