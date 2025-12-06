import React from 'react';

const LoadingSpinner = ({ darkMode }) => (
  <div className="inline-block w-10 h-10 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" 
       style={{animationDuration: '0.5s'}}></div>
);

export default LoadingSpinner;