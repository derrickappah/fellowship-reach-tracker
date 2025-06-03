
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupFormProps {
  onSuccess: () => void;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSuccess }) => {
  const { members, fellowships, currentUser, createGroup } = useChurch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    fellowshipId: currentUser?.fellowshipId || '',
    selectedMemberIds: [] as string[]
  });

  const availableMembers = currentUser?.role === 'admin'
    ? members.filter(m => formData.fellowshipId ? m.fellowshipId === formData.fellowshipId : true)
    : members.filter(m => m.fellowshipId === currentUser?.fellowshipId);

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMemberIds: prev.selectedMemberIds.includes(memberId)
        ? prev.selectedMemberIds.filter(id => id !== memberId)
        : prev.selectedMemberIds.length < 3
        ? [...prev.selectedMemberIds, memberId]
        : prev.selectedMemberIds
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name.",
        variant: "destructive"
      });
      return;
    }

    if (formData.selectedMemberIds.length !== 3) {
      toast({
        title: "Error",
        description: "Please select exactly 3 members for the group.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.fellowshipId) {
      toast({
        title: "Error",
        description: "Please select a fellowship.",
        variant: "destructive"
      });
      return;
    }

    createGroup({
      name: formData.name,
      fellowshipId: formData.fellowshipId,
      memberIds: formData.selectedMemberIds,
      leaderId: currentUser!.id,
      isActive: true
    });

    toast({
      title: "Success",
      description: "Group created successfully!"
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter group name"
          required
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
              selectedMemberIds: [] // Reset selected members when fellowship changes
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
        <Label>Select Members (exactly 3 required)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Selected: {formData.selectedMemberIds.length}/3
        </p>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
          {availableMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <Checkbox
                id={member.id}
                checked={formData.selectedMemberIds.includes(member.id)}
                onCheckedChange={() => handleMemberToggle(member.id)}
                disabled={!formData.selectedMemberIds.includes(member.id) && formData.selectedMemberIds.length >= 3}
              />
              <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Create Group</Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
