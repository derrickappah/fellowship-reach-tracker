
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInvitees } from '@/hooks/useInvitees';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

const statusColors = {
  invited: 'bg-blue-100 text-blue-800',
  attended: 'bg-green-100 text-green-800',
  joined_cell: 'bg-purple-100 text-purple-800',
  no_show: 'bg-red-100 text-red-800',
};

export const InviteeList = () => {
  const { invitees, loading, updateInviteeStatus, deleteInvitee } = useInvitees();
  const [filter, setFilter] = useState('all');

  const filteredInvitees = invitees.filter(invitee => {
    if (filter === 'all') return true;
    return invitee.status === filter;
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filter by status:</span>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="joined_cell">Joined Cell</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {filteredInvitees.length} invitees
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Group/Cell</TableHead>
                  <TableHead>Invite Date</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitees.map((invitee) => (
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
                        {invitee.group?.name && (
                          <div className="text-sm">Group: {invitee.group.name}</div>
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
                      <Select
                        value={invitee.status || 'invited'}
                        onValueChange={(value) => handleStatusChange(invitee.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invited">
                            <Badge className={statusColors.invited}>Invited</Badge>
                          </SelectItem>
                          <SelectItem value="attended">
                            <Badge className={statusColors.attended}>Attended</Badge>
                          </SelectItem>
                          <SelectItem value="joined_cell">
                            <Badge className={statusColors.joined_cell}>Joined Cell</Badge>
                          </SelectItem>
                          <SelectItem value="no_show">
                            <Badge className={statusColors.no_show}>No Show</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(invitee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

          {filteredInvitees.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Invited:</span> {invitees.filter(i => i.status === 'invited').length}
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
