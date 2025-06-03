
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateCellFormProps {
  onSuccess: () => void;
}

export const CreateCellForm: React.FC<CreateCellFormProps> = ({ onSuccess }) => {
  const { members, fellowships, currentUser, createCell } = useChurch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    fellowshipId: currentUser?.fellowshipId || '',
    leaderId: ''
  });

  const availableLeaders = currentUser?.role === 'admin'
    ? members.filter(m => formData.fellowshipId ? m.fellowshipId === formData.fellowshipId : true)
    : members.filter(m => m.fellowshipId === currentUser?.fellowshipId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.fellowshipId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createCell({
      name: formData.name,
      fellowshipId: formData.fellowshipId,
      leaderId: formData.leaderId || undefined,
      memberCount: 0
    });

    toast({
      title: "Success",
      description: "Cell created successfully!"
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Cell Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter cell name"
          required
        />
      </div>

      {currentUser?.role === 'admin' && (
        <div>
          <Label htmlFor="fellowship">Fellowship *</Label>
          <Select
            value={formData.fellowshipId}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              fellowshipId: value,
              leaderId: '' // Reset leader when fellowship changes
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
        <Label htmlFor="leader">Cell Leader (Optional)</Label>
        <Select
          value={formData.leaderId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, leaderId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a leader (optional)" />
          </SelectTrigger>
          <SelectContent>
            {availableLeaders.map((leader) => (
              <SelectItem key={leader.id} value={leader.id}>
                {leader.name} - {leader.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Create Cell</Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
