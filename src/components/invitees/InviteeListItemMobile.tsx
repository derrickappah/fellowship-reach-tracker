
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Mail, Phone, User, Users, Calendar, HelpingHand } from 'lucide-react';
import { format } from 'date-fns';
import { InviteeWithInviter } from '@/hooks/useInvitees';
import { cn } from '@/lib/utils';

interface InviteeListItemMobileProps {
  invitee: InviteeWithInviter;
  onStatusChange: (inviteeId: string, newStatus: string) => void;
  onDelete: (inviteeId: string) => void;
  canEditOrDelete: boolean;
}

const statusColors = {
  invited: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  attended: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  joined_cell: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  no_show: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const InviteeListItemMobile = ({ invitee, onStatusChange, onDelete, canEditOrDelete }: InviteeListItemMobileProps) => {
  const status = invitee.status || 'invited';
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in">
      <CardHeader className="flex flex-row justify-between items-start gap-4">
        <div>
          <CardTitle className="text-lg">{invitee.name}</CardTitle>
          {invitee.inviter?.name && (
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <User className="h-3 w-3" /> 
              <span>Invited by {invitee.inviter.name}</span>
            </div>
          )}
        </div>
        <Badge className={cn("whitespace-nowrap transition-colors duration-200", statusColors[status as keyof typeof statusColors])}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="border-t pt-3 space-y-3">
            {(invitee.email || invitee.phone) && (
                <div className="space-y-1">
                    {invitee.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" /><span>{invitee.email}</span></div>}
                    {invitee.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" /><span>{invitee.phone}</span></div>}
                </div>
            )}
            {(invitee.team?.name || invitee.cell?.name) && (
                <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex flex-wrap items-center gap-x-2">
                      {invitee.team?.name && <span>Team: {invitee.team.name}</span>}
                      {invitee.cell?.name && <span>Cell: {invitee.cell.name}</span>}
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>Invited: {invitee.invite_date ? format(new Date(invitee.invite_date), 'MMM dd, yyyy') : '-'}</span>
            </div>
            {invitee.service_date && (
                <div className="flex items-center gap-2 text-sm">
                    <HelpingHand className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span>Service: {format(new Date(invitee.service_date), 'MMM dd, yyyy')}</span>
                </div>
            )}
        </div>
      </CardContent>
      {canEditOrDelete && (
        <CardFooter className="flex justify-between items-center bg-muted/20 p-3">
          <Select
              value={status}
              onValueChange={(value) => onStatusChange(invitee.id, value)}
              disabled={!canEditOrDelete}
          >
              <SelectTrigger className="w-[150px] h-9 transition-all duration-200 hover:bg-muted/50">
                  <SelectValue placeholder="Change status" />
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
              onClick={() => onDelete(invitee.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200"
              disabled={!canEditOrDelete}
          >
              <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
