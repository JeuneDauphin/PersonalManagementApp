// Notification popup component
import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
  link?: string;
  onClick?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  isOpen,
  onClose,
  duration = 5000,
  link,
  onClick,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-800 border-green-600 text-green-100';
      case 'error':
        return 'bg-red-800 border-red-600 text-red-100';
      case 'warning':
        return 'bg-yellow-800 border-yellow-600 text-yellow-100';
      default:
        return 'bg-blue-800 border-blue-600 text-blue-100';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className={`
        ${getColorClasses()}
        border rounded-lg shadow-lg p-4
        animate-in slide-in-from-bottom-2 duration-300
        ${(onClick || link) ? 'cursor-pointer hover:opacity-90' : ''}
      `}
        onClick={handleClick}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          <div className="ml-3 flex-1">
            <h3 className="font-medium text-body">{title}</h3>
            <p className="text-small mt-1 opacity-90">{message}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-shrink-0 ml-4 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
