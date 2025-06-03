
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useChurch } from '@/context/ChurchContext';
import { useToast } from '@/hooks/use-toast';

export const InviteeForm: React.FC = () => {
  const { groups, cells, members, currentUser, createInvitee } = useChurch();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    groupId: '',
    attendedService: false,
    cellId: '',
    notes: ''
  });

  // Filter groups based on user role
  const availableGroups = currentUser?.role === 'admin' ? groups :
    currentUser?.role === 'fellowship_leader' ? 
      groups.filter(g => g.fellowshipId === currentUser.fellowshipId) :
      groups.filter(g => g.memberIds.includes(currentUser?.id || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.groupId) {
      toast({
        title: "Required fields missing",
        description: "Please fill in name and select a group",
        variant: "destructive"
      });
      return;
    }

    const status = formData.cellId ? 'joined_cell' : 
                  formData.attendedService ? 'attended' : 'invited';

    createInvitee({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      groupId: formData.groupId,
      invitedBy: currentUser?.id || '',
      attendedService: formData.attendedService,
      cellId: formData.cellId || undefined,
      notes: formData.notes || undefined,
      status,
      serviceDate: formData.attendedService ? new Date() : undefined
    });

    toast({
      title: "Invitee registered successfully",
      description: `${formData.name} has been added to the system`,
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      groupId: '',
      attendedService: false,
      cellId: '',
      notes: ''
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Invitee</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label>Inviting Group *</Label>
            <Select value={formData.groupId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, groupId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select the group that invited them" />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="attended"
              checked={formData.attendedService}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, attendedService: !!checked }))}
            />
            <Label htmlFor="attended">Has attended a service</Label>
          </div>

          {formData.attendedService && (
            <div>
              <Label>Cell to Join (Optional)</Label>
              <Select value={formData.cellId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, cellId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cell they want to join" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No cell selected</SelectItem>
                  {cells.map((cell) => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about the invitee..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Register Invitee
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
