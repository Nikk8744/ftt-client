import React from 'react';
import TaskCompletionChart, { TaskCompletionData } from './TaskCompletionChart';
import { TaskCompletionTrend } from '@/services/reports';

interface TaskCompletionChartWrapperProps {
  data: TaskCompletionTrend[] | null | undefined;
  isLoading?: boolean;
}

const TaskCompletionChartWrapper: React.FC<TaskCompletionChartWrapperProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading task completion data...</p>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No task completion data available</p>
      </div>
    );
  }

  // Sort data by date (ascending)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Map the data to match the expected format for the chart component
  const formattedData: TaskCompletionData[] = sortedData.map(item => ({
    date: item.date,
    completed: item.completed || 0,
    created: item.created || 0
  }));

  return <TaskCompletionChart data={formattedData} />;
};

export default TaskCompletionChartWrapper; 
