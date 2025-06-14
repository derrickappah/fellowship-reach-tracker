
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvitees } from '@/hooks/useInvitees';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Users, Mail, Phone } from 'lucide-react';

interface TeamInvitesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
}

const statusColors = {
  invited: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  attended: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  joined_cell: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  no_show: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const TeamInvitesDialog = ({ open, onOpenChange, team }: TeamInvitesDialogProps) => {
  const { invitees, loading } = useInvitees();
  
  // Get current week dates
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  // Filter invitees for this team and current week
  const teamInvitees = invitees.filter(invitee => {
    const isTeamMatch = invitee.team_id === team.id;
    const inviteDate = new Date(invitee.invite_date);
    const isCurrentWeek = inviteDate >= weekStart && inviteDate <= weekEnd;
    return isTeamMatch && isCurrentWeek;
  });

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.invited;
    return (
      <Badge className={colorClass}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {team.name} - Weekly Invites
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {teamInvitees.length}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Total Invites</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {teamInvitees.filter(i => i.status === 'attended').length}
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">Attended</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {teamInvitees.filter(i => i.status === 'joined_cell').length}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">Joined Cell</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {teamInvitees.length > 0 ? Math.round((teamInvitees.filter(i => i.status === 'attended').length / teamInvitees.length) * 100) : 0}%
              </div>
              <div className="text-sm text-orange-800 dark:text-orange-200">Attendance Rate</div>
            </div>
          </div>

          {/* Invitees Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : teamInvitees.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Invite Date</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamInvitees.map((invitee) => (
                    <TableRow key={invitee.id}>
                      <TableCell className="font-medium">{invitee.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {invitee.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {invitee.email}
                            </div>
                          )}
                          {invitee.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {invitee.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invitee.inviter?.name || 'Unknown'}
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
                        {getStatusBadge(invitee.status || 'invited')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No invites this week</h3>
              <p>This team hasn't made any invites for the current week yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
