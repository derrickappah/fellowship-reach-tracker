
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InviteeForm } from '@/components/invitees/InviteeForm';
import { InviteeList } from '@/components/invitees/InviteeList';
import { Plus, Users } from 'lucide-react';

const Invitees = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invitee Management</h1>
          <p className="text-muted-foreground">
            Manage church invitees and track their journey
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invitee List
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Invitee
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <InviteeList />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <InviteeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invitees;
