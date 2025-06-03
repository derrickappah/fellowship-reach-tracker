
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateMemberFormProps {
  onSuccess: () => void;
}

export const CreateMemberForm: React.FC<CreateMemberFormProps> = ({ onSuccess }) => {
  const { cells, fellowships, currentUser, createMember } = useChurch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cellId: '',
    fellowshipId: currentUser?.fellowshipId || '',
    role: 'member' as 'admin' | 'fellowship_leader' | 'member'
  });

  const availableCells = currentUser?.role === 'admin'
    ? cells.filter(c => formData.fellowshipId ? c.fellowshipId === formData.fellowshipId : true)
    : cells.filter(c => c.fellowshipId === currentUser?.fellowshipId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.cellId || !formData.fellowshipId) {
      toast({
        title: "Error",
        description: "Please select a cell and fellowship.",
        variant: "destructive"
      });
      return;
    }

    createMember({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      cellId: formData.cellId,
      fellowshipId: formData.fellowshipId,
      role: formData.role
    });

    toast({
      title: "Success",
      description: "Member added successfully!"
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter member name"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
        />
      </div>

      {currentUser?.role === 'admin' && (
        <div>
          <Label htmlFor="fellowship">Fellowship</Label>
          <Select
            value={formData.fellowshipId}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              fellowshipId: value,
              cellId: '' // Reset cell when fellowship changes
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fellowship" />
            </SelectTrigger>
            <SelectContent>
              {fellowships.map((fellowship) => (
                <SelectItem key={fellowship.id} value={fellowship.id}>
                  {fellowship.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="cell">Cell</Label>
        <Select
          value={formData.cellId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, cellId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cell" />
          </SelectTrigger>
          <SelectContent>
            {availableCells.map((cell) => (
              <SelectItem key={cell.id} value={cell.id}>
                {cell.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentUser?.role === 'admin' && (
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: 'admin' | 'fellowship_leader' | 'member') => 
              setFormData(prev => ({ ...prev, role: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="fellowship_leader">Fellowship Leader</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit">Add Member</Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
