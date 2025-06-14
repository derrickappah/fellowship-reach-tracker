
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInvitees } from '@/hooks/useInvitees';
import { format } from 'date-fns';
import { Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { InviteeListItemMobile } from './InviteeListItemMobile';
import { Input } from '@/components/ui/input';

const statusColors = {
  invited: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  attended: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  joined_cell: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  no_show: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const InviteeList = () => {
  const { invitees, loading, updateInviteeStatus, deleteInvitee } = useInvitees();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const filteredInvitees = invitees.filter(invitee => {
    const statusMatch = filter === 'all' || invitee.status === filter;

    const searchTrimmed = searchTerm.trim().toLowerCase();
    if (!searchTrimmed) {
      return statusMatch;
    }

    const searchMatch =
      invitee.name.toLowerCase().includes(searchTrimmed) ||
      (invitee.email || '').toLowerCase().includes(searchTrimmed) ||
      (invitee.phone || '').toLowerCase().includes(searchTrimmed);

    return statusMatch && searchMatch;
  });

  const handleStatusChange = (inviteeId: string, newStatus: string) => {
    updateInviteeStatus(inviteeId, newStatus);
  };

  const handleDelete = (inviteeId: string) => {
    if (confirm('Are you sure you want to delete this invitee?')) {
      deleteInvitee(inviteeId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading invitees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitee Management</CardTitle>
          <CardDescription>
            View and manage all church invitees and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invitees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="joined_cell">Joined Cell</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground self-end sm:self-auto">
              Total: {filteredInvitees.length} invitees
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {filteredInvitees.map((invitee) => {
                const isOwner = invitee.invited_by === user?.id;
                const isAdmin = user?.role === 'admin';
                const isFellowshipLeader = user?.role === 'fellowship_leader';
                const canEditOrDelete = isAdmin || isFellowshipLeader || isOwner;

                return (
                  <InviteeListItemMobile
                    key={invitee.id}
                    invitee={invitee}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    canEditOrDelete={canEditOrDelete}
                  />
                );
              })}
              {filteredInvitees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground rounded-lg border border-dashed">
                  <p>No invitees found matching the current filter.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Team/Cell</TableHead>
                    <TableHead>Invite Date</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitees.map((invitee) => {
                    const isOwner = invitee.invited_by === user?.id;
                    const isAdmin = user?.role === 'admin';
                    const isFellowshipLeader = user?.role === 'fellowship_leader';
                    const canEditOrDelete = isAdmin || isFellowshipLeader || isOwner;

                    return (
                      <TableRow key={invitee.id}>
                        <TableCell className="font-medium">{invitee.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {invitee.email && (
                              <div className="text-sm">{invitee.email}</div>
                            )}
                            {invitee.phone && (
                              <div className="text-sm text-muted-foreground">{invitee.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {invitee.inviter?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {invitee.team?.name && (
                              <div className="text-sm">Team: {invitee.team.name}</div>
                            )}
                            {invitee.cell?.name && (
                              <div className="text-sm">Cell: {invitee.cell.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invitee.invite_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {invitee.service_date 
                            ? format(new Date(invitee.service_date), 'MMM dd, yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[invitee.status as keyof typeof statusColors] || statusColors.invited}>
                            {(invitee.status || 'invited').replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Select
                              value={invitee.status || 'invited'}
                              onValueChange={(value) => handleStatusChange(invitee.id, value)}
                              disabled={!canEditOrDelete}
                            >
                              <SelectTrigger className="w-36 h-9">
                                <SelectValue placeholder="Change status"/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="invited">Invited</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="attended">Attended</SelectItem>
                                <SelectItem value="joined_cell">Joined Cell</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(invitee.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                              disabled={!canEditOrDelete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredInvitees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invitees found matching the current filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredInvitees.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="font-medium">Invited:</span> {invitees.filter(i => i.status === 'invited').length}
                </div>
                <div>
                  <span className="font-medium">Confirmed:</span> {invitees.filter(i => i.status === 'confirmed').length}
                </div>
                <div>
                  <span className="font-medium">Attended:</span> {invitees.filter(i => i.status === 'attended').length}
                </div>
                <div>
                  <span className="font-medium">Joined Cell:</span> {invitees.filter(i => i.status === 'joined_cell').length}
                </div>
                <div>
                  <span className="font-medium">No Show:</span> {invitees.filter(i => i.status === 'no_show').length}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
