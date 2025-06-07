
import React, { useState, useEffect } from 'react';
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
  const [teams, setTeams] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    teamId: '',
    cellId: '',
    notes: '',
    serviceDate: '',
    attendedService: false,
    status: 'invited' as const
  });

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('teams')
        .select('id, name, fellowship:fellowships(name)')
        .eq('is_active', true);
      setTeams(data || []);
    };

    const fetchCells = async () => {
      const { data } = await supabase
        .from('cells')
        .select('id, name, fellowship:fellowships(name)');
      setCells(data || []);
    };

    fetchTeams();
    fetchCells();
  }, []);

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
          team_id: formData.teamId || null,
          cell_id: formData.cellId || null,
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
        teamId: '',
        cellId: '',
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
                <Label htmlFor="team">Outreach Team</Label>
                <Select value={formData.teamId} onValueChange={(value) => handleInputChange('teamId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outreach team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} {team.fellowship?.name && `(${team.fellowship.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cell">Cell Group</Label>
                <Select value={formData.cellId} onValueChange={(value) => handleInputChange('cellId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cell group" />
                  </SelectTrigger>
                  <SelectContent>
                    {cells.map((cell) => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name} {cell.fellowship?.name && `(${cell.fellowship.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                />
              </div>
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
