
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ManageFellowships } from '@/components/fellowships/ManageFellowships';
import { ManageCells } from '@/components/cells/ManageCells';
import { ManageTeams } from '@/components/teams/ManageTeams';
import { ManageMembers } from '@/components/members/ManageMembers';
import { Reports } from '@/components/reports/Reports';
import { TeamPerformance } from '@/components/dashboard/TeamPerformance';
import { Users, Building, Users2, UserPlus, BarChart3, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();

  const tabsConfig = [
    { value: 'fellowships', label: 'Fellowships', icon: Building, roles: ['admin'], component: <ManageFellowships /> },
    { value: 'cells', label: 'Cells', icon: Users2, roles: ['admin'], component: <ManageCells /> },
    { value: 'teams', label: 'Teams', icon: UserPlus, roles: ['admin', 'fellowship_leader'], component: <ManageTeams /> },
    { value: 'members', label: 'Members', icon: Users, roles: ['admin', 'fellowship_leader'], component: <ManageMembers /> },
    { value: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'fellowship_leader', 'member'], component: <Reports /> },
  ];

  const availableTabs = user ? tabsConfig.filter(tab => tab.roles.includes(user.role)) : [];
  
  const defaultTab = availableTabs.length > 0 ? availableTabs[0].value : '';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Management Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'Manage your church community, fellowships, cells, and members' : 'Welcome to your dashboard'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Team Performance Overview */}
      <TeamPerformance selectedDate={selectedDate} />

      {availableTabs.length > 0 && (
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {availableTabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
