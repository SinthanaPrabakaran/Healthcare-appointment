import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <span className="text-6xl">404</span>
      <h1 className="text-3xl font-extrabold text-gray-900 mt-4">Page Not Found</h1>
      <p className="text-sm text-gray-600 mt-2">The page you are looking for does not exist or has been moved.</p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
