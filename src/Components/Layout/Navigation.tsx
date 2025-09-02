// Left sidebar navigation component
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  FolderOpen,
  GraduationCap,
  Users,
  Home,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  collapsed = false,
  onToggle
}) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Projects', path: '/projects', icon: FolderOpen },
    { name: 'School', path: '/school', icon: GraduationCap },
    { name: 'Contacts', path: '/contacts', icon: Users },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={toggleMobile}
          className="p-2 text-white hover:bg-gray-800 rounded-lg"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-24' : 'w-64'}
        ${mobileOpen}
        bg-gray-900 border-r border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            {!collapsed && (
              <span className="ml-3 text-white font-semibold text-lg">
                PMA
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg text-body
                  transition-colors duration-200
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} />
                {!collapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button for desktop */}
        {!mobileOpen && (
          <div className="hidden lg:block p-4 border-t border-gray-800">
            <button
              onClick={onToggle}
              className={`w-full p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;
