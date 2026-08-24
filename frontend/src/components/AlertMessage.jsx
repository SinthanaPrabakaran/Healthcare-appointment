import React from 'react';

const AlertMessage = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const bgColors = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div className={`p-4 mb-4 border rounded-xl flex items-center justify-between shadow-sm ${bgColors[type] || bgColors.info}`}>
      <div className="flex items-center space-x-2">
        <span className="font-medium text-sm">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 font-bold focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
