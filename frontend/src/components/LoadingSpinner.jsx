import React from 'react';
import { Activity } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading PulseCare Portal...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
        <Activity className="w-6 h-6 text-teal-400 absolute animate-pulse" />
      </div>
      <p className="text-xs font-bold tracking-wider uppercase text-teal-400 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
