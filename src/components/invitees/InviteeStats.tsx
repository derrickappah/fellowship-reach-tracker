
import React from 'react';
import { Bar, BarChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { InviteeWithInviter } from '@/hooks/useInvitees';

interface InviteeStatsProps {
  data: InviteeWithInviter[];
}

const statusLabels: { [key: string]: string } = {
  invited: 'Invited',
  confirmed: 'Confirmed',
  attended: 'Attended',
  joined_cell: 'Joined Cell',
  no_show: 'No Show',
};

const statusColors: { [key:string]: string } = {
  invited: '#3b82f6',
  confirmed: '#facc15',
  attended: '#22c55e',
  joined_cell: '#a855f7',
  no_show: '#ef4444',
};

const chartConfig = {
  count: {
    label: "Count",
  },
  ...Object.fromEntries(Object.entries(statusLabels).map(([key, label]) => [key, { label, color: statusColors[key] }]))
} satisfies ChartConfig

export const InviteeStats: React.FC<InviteeStatsProps> = ({ data }) => {
  const stats = React.useMemo(() => {
    const statusCounts: { [key: string]: number } = {
      invited: 0,
      confirmed: 0,
      attended: 0,
      joined_cell: 0,
      no_show: 0,
    };

    (data || []).forEach(invitee => {
      const status = invitee.status || 'invited';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || 'Unknown',
      status: status,
      count: count,
      fill: statusColors[status]
    }));
  }, [data]);

  if ((data || []).length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invitee Status Overview</CardTitle>
                <CardDescription>
                  Distribution of invitee statuses for the current filters.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[250px] w-full items-center justify-center">
                <p className="text-muted-foreground">No invitees found for the current filters.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitee Status Overview</CardTitle>
        <CardDescription>
          Distribution of invitee statuses for the current filters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={stats} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="count" radius={4}>
              {stats.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
