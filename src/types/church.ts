
export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cellId: string;
  fellowshipId: string;
  role: 'admin' | 'fellowship_leader' | 'member';
  createdAt: Date;
}

export interface Cell {
  id: string;
  name: string;
  fellowshipId: string;
  leaderId?: string;
  memberCount: number;
  createdAt: Date;
}

export interface Fellowship {
  id: string;
  name: string;
  leaderId: string;
  description?: string;
  cellCount: number;
  memberCount: number;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  fellowshipId: string;
  memberIds: string[]; // exactly 3 members
  leaderId: string; // fellowship leader who created it
  createdAt: Date;
  isActive: boolean;
}

export interface Invitee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  groupId: string;
  invitedBy: string; // member ID
  attendedService: boolean;
  cellId?: string; // cell they decided to join
  inviteDate: Date;
  serviceDate?: Date;
  notes?: string;
  status: 'invited' | 'attended' | 'joined_cell' | 'no_show';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'fellowship_leader' | 'member';
  fellowshipId?: string;
  cellId?: string;
}

export interface ChurchData {
  fellowships: Fellowship[];
  cells: Cell[];
  members: Member[];
  groups: Group[];
  invitees: Invitee[];
  currentUser: User | null;
}
