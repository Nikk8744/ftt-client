'use client';

import React from 'react';
import TeamWorkloadChart from './TeamWorkloadChart';

interface TeamMemberWorkload {
  name: string;
  taskCount: number;
  completedTaskCount: number;
}

interface TeamWorkloadChartWrapperProps {
  data: TeamMemberWorkload[];
}

const TeamWorkloadChartWrapper: React.FC<TeamWorkloadChartWrapperProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No team workload data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <TeamWorkloadChart data={data} />
    </div>
  );
};

export default TeamWorkloadChartWrapper;