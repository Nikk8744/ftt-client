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
      <div className="text-center py-8">
        <p className="text-gray-500">No risk assessment data available</p>
      </div>
    );
  }

  // Function to get color based on risk level
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk Name</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Mitigation Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((risk, index) => (
            <TableRow key={risk.id || index}>
              <TableCell className="font-medium">{risk.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                  {risk.riskLevel}
                </span>
              </TableCell>
              <TableCell>{risk.impact}</TableCell>
              <TableCell>{risk.mitigation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RiskAssessmentTable; 
