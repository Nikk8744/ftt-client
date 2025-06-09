'use client';

import React from 'react';
import TaskCompletionChart from './TaskCompletionChart';
import { TaskCompletionTrend } from '@/services/reports';

interface TaskCompletionChartWrapperProps {
  data: TaskCompletionTrend[] | null | undefined;
}

const TaskCompletionChartWrapper: React.FC<TaskCompletionChartWrapperProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No task completion data available</p>
      </div>
    );
  }

  // Map the data to match the expected format
  const formattedData = data.map(item => ({
    date: item.date,
    completed: item.completed || 0,
    created: item.created || 0
  }));

  return (
    <div className="h-64">
      <TaskCompletionChart data={formattedData} />
    </div>
  );
};

export default TaskCompletionChartWrapper; 