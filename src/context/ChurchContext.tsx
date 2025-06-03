
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChurchData, Fellowship, Cell, Member, Group, Invitee, User } from '@/types/church';

interface ChurchContextType extends ChurchData {
  // Fellowship actions
  createFellowship: (fellowship: Omit<Fellowship, 'id' | 'createdAt'>) => void;
  updateFellowship: (id: string, updates: Partial<Fellowship>) => void;
  deleteFellowship: (id: string) => void;
  
  // Cell actions
  createCell: (cell: Omit<Cell, 'id' | 'createdAt'>) => void;
  updateCell: (id: string, updates: Partial<Cell>) => void;
  deleteCell: (id: string) => void;
  
  // Member actions
  createMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  // Group actions
  createGroup: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  // Invitee actions
  createInvitee: (invitee: Omit<Invitee, 'id' | 'inviteDate'>) => void;
  updateInvitee: (id: string, updates: Partial<Invitee>) => void;
  deleteInvitee: (id: string) => void;
  
  // Auth actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

// Mock data for development
const mockData: ChurchData = {
  fellowships: [
    {
      id: '1',
      name: 'Victory Fellowship',
      leaderId: '1',
      description: 'Main fellowship for young adults',
      cellCount: 3,
      memberCount: 12,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Grace Fellowship',
      leaderId: '2',
      description: 'Family-oriented fellowship',
      cellCount: 2,
      memberCount: 8,
      createdAt: new Date('2024-01-15')
    }
  ],
  cells: [
    {
      id: '1',
      name: 'Cell Alpha',
      fellowshipId: '1',
      leaderId: '3',
      memberCount: 4,
      createdAt: new Date('2024-01-05')
    },
    {
      id: '2',
      name: 'Cell Beta',
      fellowshipId: '1',
      leaderId: '4',
      memberCount: 4,
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Cell Gamma',
      fellowshipId: '1',
      leaderId: '5',
      memberCount: 4,
      createdAt: new Date('2024-01-12')
    }
  ],
  members: [
    {
      id: '1',
      name: 'Pastor John',
      email: 'john@church.com',
      phone: '+1234567890',
      cellId: '1',
      fellowshipId: '1',
      role: 'admin',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Leader Mary',
      email: 'mary@church.com',
      phone: '+1234567891',
      cellId: '2',
      fellowshipId: '2',
      role: 'fellowship_leader',
      createdAt: new Date('2024-01-01')
    }
  ],
  groups: [
    {
      id: '1',
      name: 'Outreach Team Alpha',
      fellowshipId: '1',
      memberIds: ['3', '4', '5'],
      leaderId: '1',
      createdAt: new Date('2024-02-01'),
      isActive: true
    }
  ],
  invitees: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+1234567892',
      groupId: '1',
      invitedBy: '3',
      attendedService: true,
      cellId: '1',
      inviteDate: new Date('2024-02-15'),
      serviceDate: new Date('2024-02-18'),
      status: 'joined_cell',
      notes: 'Very interested in joining cell group'
    }
  ],
  currentUser: null
};

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ChurchData>(mockData);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Fellowship actions
  const createFellowship = (fellowship: Omit<Fellowship, 'id' | 'createdAt'>) => {
    const newFellowship: Fellowship = {
      ...fellowship,
      id: generateId(),
      createdAt: new Date()
    };
    setData(prev => ({
      ...prev,
      fellowships: [...prev.fellowships, newFellowship]
    }));
  };

  const updateFellowship = (id: string, updates: Partial<Fellowship>) => {
    setData(prev => ({
      ...prev,
      fellowships: prev.fellowships.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const deleteFellowship = (id: string) => {
    setData(prev => ({
      ...prev,
      fellowships: prev.fellowships.filter(f => f.id !== id)
    }));
  };

  // Cell actions
  const createCell = (cell: Omit<Cell, 'id' | 'createdAt'>) => {
    const newCell: Cell = {
      ...cell,
      id: generateId(),
      createdAt: new Date()
    };
    setData(prev => ({
      ...prev,
      cells: [...prev.cells, newCell]
    }));
  };

  const updateCell = (id: string, updates: Partial<Cell>) => {
    setData(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCell = (id: string) => {
    setData(prev => ({
      ...prev,
      cells: prev.cells.filter(c => c.id !== id)
    }));
  };

  // Member actions
  const createMember = (member: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...member,
      id: generateId(),
      createdAt: new Date()
    };
    setData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMember = (id: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  // Group actions
  const createGroup = (group: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...group,
      id: generateId(),
      createdAt: new Date()
    };
    setData(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteGroup = (id: string) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== id)
    }));
  };

  // Invitee actions
  const createInvitee = (invitee: Omit<Invitee, 'id' | 'inviteDate'>) => {
    const newInvitee: Invitee = {
      ...invitee,
      id: generateId(),
      inviteDate: new Date()
    };
    setData(prev => ({
      ...prev,
      invitees: [...prev.invitees, newInvitee]
    }));
  };

  const updateInvitee = (id: string, updates: Partial<Invitee>) => {
    setData(prev => ({
      ...prev,
      invitees: prev.invitees.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const deleteInvitee = (id: string) => {
    setData(prev => ({
      ...prev,
      invitees: prev.invitees.filter(i => i.id !== id)
    }));
  };

  // Auth actions
  const login = (email: string, password: string): boolean => {
    // Mock login - in real app, this would validate credentials
    const user = data.members.find(m => m.email === email);
    if (user && password === 'password') {
      setData(prev => ({
        ...prev,
        currentUser: {
          id: user.id,
          name: user.name,
          email: user.email!,
          role: user.role,
          fellowshipId: user.fellowshipId,
          cellId: user.cellId
        }
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setData(prev => ({
      ...prev,
      currentUser: null
    }));
  };

  const setCurrentUser = (user: User | null) => {
    setData(prev => ({
      ...prev,
      currentUser: user
    }));
  };

  return (
    <ChurchContext.Provider value={{
      ...data,
      createFellowship,
      updateFellowship,
      deleteFellowship,
      createCell,
      updateCell,
      deleteCell,
      createMember,
      updateMember,
      deleteMember,
      createGroup,
      updateGroup,
      deleteGroup,
      createInvitee,
      updateInvitee,
      deleteInvitee,
      login,
      logout,
      setCurrentUser
    }}>
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (context === undefined) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
