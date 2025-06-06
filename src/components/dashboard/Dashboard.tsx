
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManageFellowships } from '@/components/fellowships/ManageFellowships';
import { ManageCells } from '@/components/cells/ManageCells';
import { ManageGroups } from '@/components/groups/ManageGroups';
import { ManageMembers } from '@/components/members/ManageMembers';
import { Reports } from '@/components/reports/Reports';
import { Users, Building, Users2, UserPlus, BarChart3 } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Management Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your church community, fellowships, cells, and members
          </p>
        </div>
      </div>

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
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Groups
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

        <TabsContent value="groups" className="space-y-6">
          <ManageGroups />
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
