
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

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Management Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your church community, fellowships, cells, and members
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

      <Tabs defaultValue="fellowships" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="fellowships" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Fellowships
          </TabsTrigger>
          <TabsTrigger value="cells" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Cells
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fellowships" className="space-y-6">
          <ManageFellowships />
        </TabsContent>

        <TabsContent value="cells" className="space-y-6">
          <ManageCells />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <ManageTeams />
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <ManageMembers />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Reports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
