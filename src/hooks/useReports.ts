import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  eachWeekOfInterval,
  endOfWeek,
  format,
  subDays,
} from 'date-fns';

interface ReportsData {
  totalInvitees: number;
  totalAttendees: number;
  conversionRate: number;
  averageWeeklyInvites: number;
  weeklyData: Array<{
    week: string;
    invitees: number;
    attendees: number;
    conversions: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  fellowshipData?: Array<{
    name: string;
    invitees: number;
    attendees: number;
    conversions: number;
  }>;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export const useReports = (dateRange?: DateRange) => {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReports = async () => {
    try {
      setLoading(true);

      const fromDate = dateRange?.from || subDays(new Date(), 29);
      const toDate = dateRange?.to || new Date();

      // Base query for invitees
      let inviteesQuery = supabase.from('invitees').select('*');
      
      inviteesQuery = inviteesQuery
        .gte('invite_date', fromDate.toISOString())
        .lte('invite_date', toDate.toISOString());
      
      // Filter based on user role
      if (user?.role === 'fellowship_leader' && user.fellowship_id) {
        // Fellowship leaders see only their fellowship data
        const { data: fellowshipCells } = await supabase
          .from('cells')
          .select('id')
          .eq('fellowship_id', user.fellowship_id);
        
        const cellIds = fellowshipCells?.map(cell => cell.id) || [];
        inviteesQuery = inviteesQuery.in('cell_id', cellIds);
      } else if (user?.role === 'member') {
        // Members see only their own invitations
        inviteesQuery = inviteesQuery.eq('invited_by', user.id);
      }

      const { data: invitees, error: inviteesError } = await inviteesQuery;
      if (inviteesError) throw inviteesError;

      const totalInvitees = invitees?.length || 0;
      const totalAttendees = invitees?.filter(i => i.status === 'attended' || i.status === 'joined_cell').length || 0;
      const totalConversions = invitees?.filter(i => i.status === 'joined_cell').length || 0;
      const conversionRate = totalInvitees > 0 ? Math.round((totalAttendees / totalInvitees) * 100) : 0;

      // Calculate weekly data
      const weeks = eachWeekOfInterval(
        {
          start: fromDate,
          end: toDate,
        },
        { weekStartsOn: 1 } // Monday
      );

      const weeklyData = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekInvitees =
          invitees?.filter((inv) => {
            const inviteDate = new Date(inv.invite_date);
            return inviteDate >= weekStart && inviteDate <= weekEnd;
          }) || [];

        return {
          week: format(weekStart, 'MMM d'),
          invitees: weekInvitees.length,
          attendees: weekInvitees.filter((i) => i.status === 'attended' || i.status === 'joined_cell').length,
          conversions: weekInvitees.filter((i) => i.status === 'joined_cell').length,
        };
      });

      const averageWeeklyInvites =
        weeklyData.length > 0 ? totalInvitees / weeklyData.length : 0;

      // Status distribution
      const statusCounts = {
        invited: invitees?.filter(i => i.status === 'invited').length || 0,
        attended: invitees?.filter(i => i.status === 'attended').length || 0,
        joined_cell: invitees?.filter(i => i.status === 'joined_cell').length || 0,
        no_show: invitees?.filter(i => i.status === 'no_show').length || 0,
      };

      const statusData = [
        { name: 'Invited', value: statusCounts.invited, color: '#8884d8' },
        { name: 'Attended', value: statusCounts.attended, color: '#82ca9d' },
        { name: 'Joined Cell', value: statusCounts.joined_cell, color: '#ffc658' },
        { name: 'No Show', value: statusCounts.no_show, color: '#ff7c7c' },
      ];

      // Fellowship data for admins
      let fellowshipData;
      if (user?.role === 'admin') {
        const { data: fellowships } = await supabase
          .from('fellowships')
          .select('id, name');

        if (fellowships) {
          fellowshipData = await Promise.all(
            fellowships.map(async (fellowship) => {
              const { data: fellowshipCells } = await supabase
                .from('cells')
                .select('id')
                .eq('fellowship_id', fellowship.id);

              const cellIds = fellowshipCells?.map(cell => cell.id) || [];
              
              const { data: fellowshipInvitees } = await supabase
                .from('invitees')
                .select('*')
                .in('cell_id', cellIds)
                .gte('invite_date', fromDate.toISOString())
                .lte('invite_date', toDate.toISOString());

              const inviteesCount = fellowshipInvitees?.length || 0;
              const attendeesCount = fellowshipInvitees?.filter(i => i.status === 'attended' || i.status === 'joined_cell').length || 0;
              const conversionsCount = fellowshipInvitees?.filter(i => i.status === 'joined_cell').length || 0;

              return {
                name: fellowship.name,
                invitees: inviteesCount,
                attendees: attendeesCount,
                conversions: conversionsCount,
              };
            })
          );
        }
      }

      setReportsData({
        totalInvitees,
        totalAttendees,
        conversionRate,
        averageWeeklyInvites: Math.round(averageWeeklyInvites * 10) / 10,
        weeklyData,
        statusData,
        fellowshipData,
      });

    } catch (error: any) {
      toast({
        title: "Error fetching reports data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, dateRange]);

  return {
    reportsData,
    loading,
    refetch: fetchReports,
  };
};
