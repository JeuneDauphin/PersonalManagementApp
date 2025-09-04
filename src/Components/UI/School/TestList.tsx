
// TestList component
// Displays a list of TestCard components
// Controlled by props: tests, isLoading, onTestClick

import React from 'react';
import TestCard from './TestCard';

interface Test {
  title: string;
  date: string;
  time: string;
  subjectType: string;
  subjectColor: string;
}

interface TestListProps {
  tests: Test[];
  isLoading: boolean;
  onTestClick: (test: Test) => void;
}

const TestList: React.FC<TestListProps> = ({ tests, isLoading, onTestClick }) => {
  return (
    <div className="test-list">
      {isLoading ? (
        <div>Loading...</div>
      ) : (tests || []).length === 0 ? (
        <div>No tests available.</div>
      ) : (
        (tests || []).map((test, idx) => (
          <TestCard key={idx} test={test} onClick={() => onTestClick(test)} isSelected={false} />
        ))
      )}
    </div>
  );
};

export default TestList;
