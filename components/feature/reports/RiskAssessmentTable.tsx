'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge  from '@/components/ui/Badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface Risk {
  projectName: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  mitigationPlan: string;
}

interface RiskAssessmentTableProps {
  data: Risk[];
}

const RiskAssessmentTable: React.FC<RiskAssessmentTableProps> = ({ data }) => {
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden lg:table-cell">Mitigation Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((risk, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{risk.projectName}</TableCell>
              <TableCell>
                <Badge variant={getRiskBadgeVariant(risk.riskLevel)}>
                  {risk.riskLevel}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{risk.description}</TableCell>
              <TableCell className="hidden lg:table-cell">{risk.mitigationPlan}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RiskAssessmentTable; 