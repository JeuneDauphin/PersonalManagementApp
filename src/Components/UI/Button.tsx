// Universal button component for all CRUD operations throughout the app
import React from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, Download, Upload, Search } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonAction = 'create' | 'edit' | 'delete' | 'save' | 'cancel' | 'view' | 'download' | 'upload' | 'search' | 'custom';

interface ButtonProps {
  text?: string;
  action?: ButtonAction;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  text,
  action = 'custom',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  type = 'button',
}) => {
  // Get icon based on action
  const getActionIcon = () => {
    if (icon) return icon;

    switch (action) {
      case 'create': return <Plus size={16} />;
      case 'edit': return <Edit size={16} />;
      case 'delete': return <Trash2 size={16} />;
      case 'save': return <Save size={16} />;
      case 'cancel': return <X size={16} />;
      case 'view': return <Eye size={16} />;
      case 'download': return <Download size={16} />;
      case 'upload': return <Upload size={16} />;
      case 'search': return <Search size={16} />;
      default: return null;
    }
  };

  // Get default text based on action
  const getActionText = () => {
    if (text) return text;

    switch (action) {
      case 'create': return 'Create';
      case 'edit': return 'Edit';
      case 'delete': return 'Delete';
      case 'save': return 'Save';
      case 'cancel': return 'Cancel';
      case 'view': return 'View';
      case 'download': return 'Download';
      case 'upload': return 'Upload';
      case 'search': return 'Search';
      default: return 'Button';
    }
  };

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-small gap-1.5',
    md: 'px-4 py-2 text-body gap-2',
    lg: 'px-6 py-3 text-large gap-2',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border border-gray-300 text-white hover:bg-gray-800 focus:ring-gray-500',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500',
  };

  // Override variant based on action if not explicitly set
  const getVariantForAction = (): ButtonVariant => {
    switch (action) {
      case 'delete': return 'danger';
      case 'save': return 'success';
      case 'cancel': return 'outline';
      case 'view': return 'ghost';
      default: return variant;
    }
  };

  const finalVariant = getVariantForAction();
  const actionIcon = getActionIcon();
  const actionText = getActionText();

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[finalVariant]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={(e) => onClick(e)}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Loading...
        </>
      ) : (
        <>
          {actionIcon}
          {actionText}
        </>
      )}
    </button>
  );
};

export default Button;
