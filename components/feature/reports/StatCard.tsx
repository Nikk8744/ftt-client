'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'bg-blue-100',
  className 
}) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        {icon && (
          <div className={cn("p-3 rounded-full", color)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;