import React from 'react';

const Logo = ({ size = 'medium', darkMode = false, showText = true }) => {
  const sizes = {
    small: { icon: 'w-6 h-6', text: 'text-lg' },
    medium: { icon: 'w-8 h-8', text: 'text-xl' },
    large: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;
  const textColor = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="flex items-center gap-2">
      <img 
        src="/android-chrome-512x512.png" 
        alt="Blurz Books Logo" 
        className={`${iconSize} object-contain`}
      />
      {showText && (
        <h1 className={`${textSize} font-bold ${textColor}`}>
          Blurz Books
        </h1>
      )}
    </div>
  );
};

export default Logo;