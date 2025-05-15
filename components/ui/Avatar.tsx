import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  src?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 'md', 
  className = '',
  src
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  // Generate a consistent background color based on the name
  const getColorForName = (name: string) => {
    // Simple hash function
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    return colors[hash % colors.length];
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium ${
        sizeClasses[size]
      } ${src ? '' : getColorForName(name)} ${className}`}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar; 