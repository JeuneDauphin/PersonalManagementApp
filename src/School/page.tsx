// School page - manage lessons and tests with filtering and CRUD operations
import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';
import LessonsLists from '../Components/UI/School/LessonsLists';
import TestList from '../Components/UI/School/TestList';
import LessonCardPopup from '../Components/UI/School/LessonCardPopup';
import TestCardPopup from '../Components/UI/School/TestCardPopup';
import { useLessons, useTests } from '../utils/hooks/hooks';
import { Lesson, Test } from '../utils/interfaces/interfaces';
import { useAdvancedFilter } from '../utils/hooks/hooks';
import { apiService } from '../utils/api/Api';
import { BookOpen, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SchoolPage: React.FC = () => {
  const { data: lessons, loading: lessonsLoading, refresh: refreshLessons } = useLessons();
  const { data: tests, loading: testsLoading, refresh: refreshTests } = useTests();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showLessonPopup, setShowLessonPopup] = useState(false);
  const [showTestPopup, setShowTestPopup] = useState(false);

  // Advanced filter and search functionality for lessons
  const {
    filteredData: filteredLessons,
    searchTerm: lessonSearchTerm,
    setSearchTerm: setLessonSearchTerm,
    setFilters: setLessonFilters
  } = useAdvancedFilter(
    lessons || [],
    // Search function
    (lesson: Lesson, search: string) =>
      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      lesson.subject.toLowerCase().includes(search.toLowerCase()) ||
      (lesson.instructor || '').toLowerCase().includes(search.toLowerCase()) ||
      (lesson.description || '').toLowerCase().includes(search.toLowerCase()),
    // Filter function
    (lesson: Lesson, activeFilters: Record<string, string[]>) => {
      for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.length === 0) continue;

        switch (filterKey) {
          case 'type':
            if (!filterValues.includes(lesson.type)) return false;
            break;
          case 'status':
            const isCompleted = lesson.completed;
            if (filterValues.includes('completed') && !isCompleted) return false;
            if (filterValues.includes('pending') && isCompleted) return false;
            break;
        }
      }
      return true;
    }
  );

  // Advanced filter and search functionality for tests
  const {
    filteredData: filteredTests,
    searchTerm: testSearchTerm,
    setSearchTerm: setTestSearchTerm,
    setFilters: setTestFilters
  } = useAdvancedFilter(
    tests || [],
    // Search function
    (test: Test, search: string) =>
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      test.subject.toLowerCase().includes(search.toLowerCase()) ||
      (test.notes || '').toLowerCase().includes(search.toLowerCase()),
    // Filter function
    (test: Test, activeFilters: Record<string, string[]>) => {
      for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.length === 0) continue;

        switch (filterKey) {
          case 'type':
            if (!filterValues.includes(test.type)) return false;
            break;
        }
      }
      return true;
    }
  );

  // Update search term based on active tab
  const handleSearchChange = (value: string) => {
    if (activeTab === 'lessons') {
      setLessonSearchTerm(value);
    } else {
      setTestSearchTerm(value);
    }
  };

  // Note: getCurrentSearchTerm helper removed (unused)

  // Filter options for lessons
  const lessonFilterOptions = [
    {
      key: 'type',
      label: 'Type',
      values: [
        { value: 'lecture', label: 'Lecture', count: (lessons || []).filter(l => l.type === 'lecture').length },
        { value: 'seminar', label: 'Seminar', count: (lessons || []).filter(l => l.type === 'seminar').length },
        { value: 'lab', label: 'Lab', count: (lessons || []).filter(l => l.type === 'lab').length },
        { value: 'tutorial', label: 'Tutorial', count: (lessons || []).filter(l => l.type === 'tutorial').length },
        { value: 'exam', label: 'Exam', count: (lessons || []).filter(l => l.type === 'exam').length },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      values: [
        { value: 'completed', label: 'Completed', count: (lessons || []).filter(l => l.completed).length },
        { value: 'pending', label: 'Pending', count: (lessons || []).filter(l => !l.completed).length },
      ],
    },
  ];

  // Filter options for tests
  const testFilterOptions = [
    {
      key: 'type',
      label: 'Type',
      values: [
        { value: 'quiz', label: 'Quiz', count: (tests || []).filter(t => t.type === 'quiz').length },
        { value: 'midterm', label: 'Midterm', count: (tests || []).filter(t => t.type === 'midterm').length },
        { value: 'final', label: 'Final', count: (tests || []).filter(t => t.type === 'final').length },
        { value: 'assignment', label: 'Assignment', count: (tests || []).filter(t => t.type === 'assignment').length },
        { value: 'project', label: 'Project', count: (tests || []).filter(t => t.type === 'project').length },
      ],
    },
  ];

  // Lesson handlers
  const handleLessonClick = (lesson: Lesson) => {
    // Navigate to lesson detail page instead of opening a popup
    navigate(`/school/${lesson._id}`);
  };

  const handleLessonEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessonPopup(true);
  };

  const handleLessonDelete = async (lessonId: string) => {
    try {
      await apiService.deleteLesson(lessonId);
      refreshLessons();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const handleLessonToggle = async (lesson: Lesson) => {
    try {
      await apiService.updateLesson(lesson._id, { completed: !lesson.completed });
      refreshLessons();
    } catch (error) {
      console.error('Failed to update lesson status:', error);
    }
  };

  const handleLessonSave = async (lesson: Lesson) => {
    try {
      if (lesson._id.startsWith('temp-')) {
        // Creating new lesson
        const { _id, createdAt, updatedAt, ...lessonData } = lesson;
        await apiService.createLesson(lessonData);
      } else {
        // Updating existing lesson
        const { _id, createdAt, updatedAt, ...lessonData } = lesson;
        await apiService.updateLesson(lesson._id, lessonData);
      }
      setShowLessonPopup(false);
      refreshLessons();
    } catch (error) {
      console.error('Failed to save lesson:', error);
    }
  };

  // Test handlers
  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setShowTestPopup(true);
  };

  const handleTestEdit = (test: Test) => {
    setSelectedTest(test);
    setShowTestPopup(true);
  };

  const handleTestDelete = async (testId: string) => {
    try {
      await apiService.deleteTest(testId);
      refreshTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  const handleTestSave = async (test: Test) => {
    try {
      if (test._id.startsWith('temp-')) {
        // Creating new test
        const { _id, createdAt, updatedAt, ...testData } = test;
        await apiService.createTest(testData);
      } else {
        // Updating existing test
        const { _id, createdAt, updatedAt, ...testData } = test;
        await apiService.updateTest(test._id, testData);
      }
      setShowTestPopup(false);
      refreshTests();
    } catch (error) {
      console.error('Failed to save test:', error);
    }
  };

  const handleAddNew = () => {
    if (activeTab === 'lessons') {
      setSelectedLesson(null);
      setShowLessonPopup(true);
    } else {
      setSelectedTest(null);
      setShowTestPopup(true);
    }
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Apply filters to the current list
    if (activeTab === 'lessons') {
      setLessonFilters(filters);
    } else {
      setTestFilters(filters);
    }
  };

  // Get upcoming tests (within 7 days)
  const getUpcomingTests = () => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return (tests || []).filter(test => {
      const testDate = new Date(test.date);
      return testDate >= now && testDate <= oneWeekFromNow;
    });
  };

  // Get today's lessons
  const getTodaysLessons = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (lessons || []).filter(lesson => {
      const lessonDate = new Date(lesson.date);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate.getTime() === today.getTime();
    });
  };

  return (
    <Layout
      title="School"
      searchValue={activeTab === 'lessons' ? lessonSearchTerm : testSearchTerm}
      onSearchChange={handleSearchChange}
      onAddNew={handleAddNew}
      addButtonText={activeTab === 'lessons' ? 'Add Lesson' : 'Add Test'}
      showFilters={true}
      filterOptions={activeTab === 'lessons' ? lessonFilterOptions : testFilterOptions}
      onFilterChange={handleFilterChange}
    >
      <div className="h-full flex flex-col space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Today's Lessons</h3>
            <p className="text-xl font-semibold text-blue-400">{getTodaysLessons().length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Upcoming Tests</h3>
            <p className="text-xl font-semibold text-yellow-400">{getUpcomingTests().length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Total Lessons</h3>
            <p className="text-xl font-semibold text-white">{(lessons || []).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-small text-gray-400 mb-1">Total Tests</h3>
            <p className="text-xl font-semibold text-white">{(tests || []).length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'lessons'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
          >
            <BookOpen size={16} />
            <span>Lessons ({(lessons || []).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'tests'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
          >
            <FileText size={16} />
            <span>Tests ({(tests || []).length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'lessons' ? (
            <LessonsLists
              lessons={filteredLessons}
              isLoading={lessonsLoading}
              onLessonClick={handleLessonClick}
              onLessonEdit={handleLessonEdit}
              onLessonDelete={handleLessonDelete}
              onLessonToggle={handleLessonToggle}
              showActions={true}
            />
          ) : (
            <TestList
              tests={filteredTests}
              isLoading={testsLoading}
              onTestClick={handleTestClick}
              onTestEdit={handleTestEdit}
              onTestDelete={handleTestDelete}
              showActions={true}
            />
          )}
        </div>
      </div>

      {/* Lesson Popup */}
      {showLessonPopup && (
        <LessonCardPopup
          lesson={selectedLesson}
          isOpen={showLessonPopup}
          onClose={() => setShowLessonPopup(false)}
          onSave={handleLessonSave}
          onDelete={selectedLesson ? () => handleLessonDelete(selectedLesson._id) : undefined}
        />
      )}

      {/* Test Popup */}
      {showTestPopup && (
        <TestCardPopup
          test={selectedTest}
          isOpen={showTestPopup}
          onClose={() => setShowTestPopup(false)}
          onSave={handleTestSave}
          onDelete={selectedTest ? () => handleTestDelete(selectedTest._id) : undefined}
        />
      )}
    </Layout>
  );
};

export default SchoolPage;
