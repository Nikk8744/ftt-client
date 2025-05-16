'use client';

// import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Button from './ui/Button';
// import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface TeamMember {
  id: number;
  name: string;
//   addedAt: string;
}

interface TeamMembersProps {
  members: TeamMember[];
  onAddMember?: () => void;
  onRemoveMember?: (id: number) => void;
}

export default function TeamMembers({
  members = [],
  onAddMember,
  onRemoveMember,
}: TeamMembersProps) {
  // Function to format ISO date to a more readable format
//   const formatAddedDate = (dateString: string) => {
//     try {
//       return formatDate(dateString);
//     } catch {
//       return dateString || 'N/A';
//     }
//   };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">Team Members</h3>
        {onAddMember && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onAddMember}
          >
            Add Member
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              {/* <TableHead>Added</TableHead> */}
              {onRemoveMember && <TableHead className="w-[100px]">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.id}</TableCell>
                  <TableCell>{member.name || `User ${member.id}`}</TableCell>
                  {/* <TableCell>{formatAddedDate(member.addedAt)}</TableCell> */}
                  {onRemoveMember && (
                    <TableCell>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={onRemoveMember ? 4 : 3} className="text-center py-6 text-gray-500">
                  No team members added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
} 