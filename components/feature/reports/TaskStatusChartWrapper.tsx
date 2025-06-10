'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TaskStatusSummary } from '@/services/reports';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface TaskStatusChartWrapperProps {
  data: TaskStatusSummary;
}

const TaskStatusChartWrapper: React.FC<TaskStatusChartWrapperProps> = ({ data }) => {
  // If we have tasksByStatus array, use it
  const chartData = React.useMemo(() => {
    if (data.tasksByStatus && data.tasksByStatus.length > 0) {
      // Map status names to more readable format
      const statusMap: Record<string, { label: string, color: string }> = {
        'Done': { label: 'Completed', color: 'rgba(34, 197, 94, 0.7)' },
        'In-Progress': { label: 'In Progress', color: 'rgba(249, 115, 22, 0.7)' },
        'Pending': { label: 'Not Started', color: 'rgba(99, 102, 241, 0.7)' },
        'Overdue': { label: 'Overdue', color: 'rgba(239, 68, 68, 0.7)' }
      };

      const labels = data.tasksByStatus.map(item => 
        statusMap[item.status]?.label || item.status
      );
      
      const counts = data.tasksByStatus.map(item => item.count);
      
      const backgroundColors = data.tasksByStatus.map(item => 
        statusMap[item.status]?.color || 'rgba(156, 163, 175, 0.7)'
      );
      
      return {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => 
              color.replace('0.7', '1')
            ),
            borderWidth: 1,
          },
        ],
      };
    } else {
      // Fallback to the traditional approach if tasksByStatus is not available
      return {
        labels: ['Completed', 'In Progress', 'Not Started', 'Overdue'],
        datasets: [
          {
            data: [
              data.completedTasks || 0,
              data.inProgressTasks || 0,
              data.pendingTasks || 0,
              data.overdueTasks || 0,
            ],
            backgroundColor: [
              'rgba(34, 197, 94, 0.7)',  // Green for completed
              'rgba(249, 115, 22, 0.7)', // Orange for in progress
              'rgba(99, 102, 241, 0.7)', // Indigo for not started
              'rgba(239, 68, 68, 0.7)',  // Red for overdue
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(249, 115, 22, 1)',
              'rgba(99, 102, 241, 1)',
              'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Don't render if there's no data
  if (!data || (data.totalTasks === 0 && (!data.tasksByStatus || data.tasksByStatus.length === 0))) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No task data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default TaskStatusChartWrapper; 