'use client';

import React, { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  tooltip?: string;
  subtitle?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconBgColor,
  iconColor,
  tooltip,
  subtitle
}) => {
  return (
    <TooltipProvider>
      <Card className="p-6 border border-gray-200 rounded-xl bg-white relative">
        <div className="flex justify-between items-start">
        <div>
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>
            <div className="mt-2">
              <h3 className="text-3xl font-bold text-gray-900">
                {value}
              </h3>
            </div>
            {subtitle && (
              <div className="mt-1 text-xs text-gray-500">
                {subtitle}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`${iconBgColor} p-3 rounded-lg`}>
              <div className={`h-6 w-6 ${iconColor}`}>
                {icon}
              </div>
            </div>
          </div>
        </div>
        {tooltip && (
          <div className="absolute bottom-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-full hover:bg-indigo-100">
                  <Info className="h-4 w-4 text-indigo-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
    </Card>
    </TooltipProvider>
  );
};

export default StatCard;