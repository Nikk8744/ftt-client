'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Button from '../../ui/Button';
import { EllipsisVertical, Trash2, User, UserPlus } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
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
  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
            <p className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        {onAddMember && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onAddMember}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>
      
      {/* Table Content */}
      <ScrollArea className="h-[320px]">
        {members.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100">
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    User ID
                  </div>
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                </TableHead>
                {onRemoveMember && (
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-[120px]">
                    <div className="flex items-center gap-2">
                      <EllipsisVertical className="h-4 w-4" />
                      Actions
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow 
                  key={member.id} 
                  className="hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {(member.name || `User ${member.id}`).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">#{member.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.name || `User ${member.id}`}
                      </p>
                      <p className="text-xs text-gray-500">Team Member</p>
                    </div>
                  </TableCell>
                  {onRemoveMember && (
                    <TableCell className="px-4 py-3">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onRemoveMember(member.id)}
                        className="text-xs px-2 py-1 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:block">Remove</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">No team members yet</h4>
            <p className="text-xs text-gray-500 mb-6 max-w-sm">
              Your team is empty. Start building your team by adding members who can collaborate on this project.
            </p>
            {onAddMember && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onAddMember}
                className="text-xs px-4 py-2 flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Your First Member
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}