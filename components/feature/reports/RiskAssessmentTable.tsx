'use client';

import React from 'react';
import { RiskAssessment } from '@/services/reports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RiskAssessmentTableProps {
  data: RiskAssessment[];
}

const RiskAssessmentTable: React.FC<RiskAssessmentTableProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No risk assessment data available</p>
      </div>
    );
  }

  // Function to get color based on risk level
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-left border-collapse">
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow className="border-b border-gray-200 dark:border-gray-700">
            <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Risk Name</TableHead>
            <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Risk Level</TableHead>
            <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Impact</TableHead>
            <TableHead className="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Mitigation Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          {data.map((risk, index) => (
            <TableRow key={risk.id || index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <TableCell className="py-3 px-4 font-medium">{risk.name}</TableCell>
              <TableCell className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                  {risk.riskLevel}
                </span>
              </TableCell>
              <TableCell className="py-3 px-4">{risk.impact}</TableCell>
              <TableCell className="py-3 px-4">{risk.mitigation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RiskAssessmentTable;
