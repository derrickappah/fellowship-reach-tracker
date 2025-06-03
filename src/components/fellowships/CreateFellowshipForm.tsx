
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateFellowshipFormProps {
  onSuccess: () => void;
}

export const CreateFellowshipForm: React.FC<CreateFellowshipFormProps> = ({ onSuccess }) => {
  const { members, createFellowship } = useChurch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    leaderId: '',
    description: ''
  });

  // Filter members who can be fellowship leaders (admin or fellowship_leader role)
  const potentialLeaders = members.filter(m => 
    m.role === 'fellowship_leader' || m.role === 'admin'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.leaderId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createFellowship({
      name: formData.name,
      leaderId: formData.leaderId,
      description: formData.description || undefined,
      cellCount: 0,
      memberCount: 0
    });

    toast({
      title: "Success",
      description: "Fellowship created successfully!"
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Fellowship Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter fellowship name"
          required
        />
      </div>

      <div>
        <Label htmlFor="leader">Fellowship Leader *</Label>
        <Select
          value={formData.leaderId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, leaderId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a leader" />
          </SelectTrigger>
          <SelectContent>
            {potentialLeaders.map((leader) => (
              <SelectItem key={leader.id} value={leader.id}>
                {leader.name} - {leader.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter fellowship description (optional)"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Create Fellowship</Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
