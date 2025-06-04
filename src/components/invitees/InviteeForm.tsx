
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const InviteeForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    groupId: '',
    notes: '',
    serviceDate: '',
    attendedService: false,
    status: 'invited' as const
  });

  // Mock data - replace with real Supabase queries later
  const mockGroups = [
    { id: '1', name: 'Outreach Team Alpha' },
    { id: '2', name: 'Youth Ministry' },
    { id: '3', name: 'Community Service' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register invitees",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('invitees')
        .insert({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          group_id: formData.groupId || null,
          invited_by: user.id,
          attended_service: formData.attendedService,
          service_date: formData.serviceDate || null,
          notes: formData.notes || null,
          status: formData.status
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Invitee has been registered successfully.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        groupId: '',
        notes: '',
        serviceDate: '',
        attendedService: false,
        status: 'invited'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register invitee",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register New Invitee</CardTitle>
          <CardDescription>
            Add a new person who has been invited to our church services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="group">Outreach Group</Label>
                <Select value={formData.groupId} onValueChange={(value) => handleInputChange('groupId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outreach group" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="joined_cell">Joined Cell</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this invitee..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Register Invitee
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
