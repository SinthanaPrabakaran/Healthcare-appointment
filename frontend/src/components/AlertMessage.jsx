import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const AlertMessage = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const styleConfig = {
    error: {
      bg: 'bg-red-500/10 border-red-500/40 text-red-300',
      icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
    },
    info: {
      bg: 'bg-teal-500/10 border-teal-500/40 text-teal-300',
      icon: <Info className="w-5 h-5 text-teal-400 shrink-0" />
    }
  };

  const current = styleConfig[type] || styleConfig.info;

  return (
    <div className={`p-4 mb-4 border rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md transition ${current.bg}`}>
      <div className="flex items-center space-x-3">
        {current.icon}
        <span className="font-medium text-xs sm:text-sm">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
