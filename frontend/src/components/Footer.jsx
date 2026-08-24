import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} CuraHealth Manager. All rights reserved.</p>
        <p className="mt-1 text-xs text-gray-400">AI-Powered Patient Summary & Medication Reminder Platform</p>
      </div>
    </footer>
  );
};

export default Footer;
