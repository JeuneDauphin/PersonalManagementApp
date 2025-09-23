// Main layout component that wraps the entire app
import React, { useState } from 'react';
import Navigation from './Navigation';
import TopNavbar from './TopNavbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAddNew?: () => void;
  addButtonText?: string;
  // Optional secondary action button (e.g., Add Task)
  onAddSecondary?: () => void;
  addSecondaryText?: string;
  showFilters?: boolean;
  filterOptions?: any[];
  onFilterChange?: (filters: any) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Dashboard',
  searchValue,
  onSearchChange,
  onAddNew,
  addButtonText,
  onAddSecondary,
  addSecondaryText,
  showFilters,
  filterOptions,
  onFilterChange,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen bg-primary-bg flex overflow-hidden">
      {/* Sidebar */}
      <Navigation
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-[margin,padding,width] duration-600 ease-[cubic-bezier(.22,1,.36,1)] min-w-0`}>
        {/* Top Navigation */}
        <TopNavbar
          title={title}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onAddNew={onAddNew}
          addButtonText={addButtonText}
          onAddSecondary={onAddSecondary}
          addSecondaryText={addSecondaryText}
          showFilters={showFilters}
          filterOptions={filterOptions}
          onFilterChange={onFilterChange}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
