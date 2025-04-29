import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
    </div>
  );
};

export default Spinner; 