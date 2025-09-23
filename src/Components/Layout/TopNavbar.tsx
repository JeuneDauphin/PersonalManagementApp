// Top navigation bar with search, filters, and actions
import React from 'react';
import { Bell, Settings, User } from 'lucide-react';
import Searchbar from '../UI/Searchbar';
import Filter from '../UI/Filter';
import Button from '../UI/Button';
//TODO: Add notifications back
// import Notification from '../UI/Notification';

interface TopNavbarProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAddNew?: () => void;
  addButtonText?: string;
  onAddSecondary?: () => void;
  addSecondaryText?: string;
  showFilters?: boolean;
  filterOptions?: any[];
  onFilterChange?: (filters: any) => void;
  showNotifications?: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  title,
  searchValue = '',
  onSearchChange,
  onAddNew,
  addButtonText = 'Add New',
  onAddSecondary,
  addSecondaryText = 'Add Task',
  showFilters = false,
  filterOptions = [],
  onFilterChange,
  showNotifications = true,
}) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Title */}
        <div className="flex items-center">
          <h1 className="text-h1 font-semibold text-white">
            {title}
          </h1>
        </div>

        {/* Center Section - Search and Filters */}
        <div className="flex items-center space-x-4 flex-1 max-w-2xl mx-8">
          {onSearchChange && (
            <div className="flex-1">
              <Searchbar
                value={searchValue}
                onChange={onSearchChange}
                placeholder={`Search ${title.toLowerCase()}...`}
              />
            </div>
          )}

          {showFilters && filterOptions.length > 0 && (
            <Filter
              options={filterOptions}
              onChange={onFilterChange}
            />
          )}
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center space-x-3">
          {onAddSecondary && (
            <Button
              action="create"
              text={addSecondaryText}
              onClick={onAddSecondary}
              variant="secondary"
            />
          )}
          {onAddNew && (
            <Button
              action="create"
              text={addButtonText}
              onClick={onAddNew}
              variant="primary"
            />
          )}

          {showNotifications && (
            <div className="relative">
              <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Bell size={20} />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          )}

          <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          <div className="flex items-center space-x-3 pl-3 border-l border-gray-600">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
