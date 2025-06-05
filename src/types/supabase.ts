
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  fellowship_id?: string;
  cell_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'fellowship_leader' | 'member';
  created_at: string;
}

export interface Fellowship {
  id: string;
  name: string;
  leader_id?: string;
  description?: string;
  cell_count: number;
  member_count: number;
  created_at: string;
  // Joined data from queries
  leader?: { name: string };
}

export interface Cell {
  id: string;
  name: string;
  fellowship_id?: string;
  leader_id?: string;
  member_count: number;
  created_at: string;
  // Joined data from queries
  fellowship?: { name: string };
  leader?: { name: string };
}

export interface Group {
  id: string;
  name: string;
  fellowship_id?: string;
  leader_id?: string;
  is_active: boolean;
  created_at: string;
  // Joined data from queries
  fellowship?: { name: string };
  leader?: { name: string };
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  created_at: string;
}

export interface Invitee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group_id?: string;
  invited_by?: string;
  attended_service: boolean;
  cell_id?: string;
  invite_date: string;
  service_date?: string;
  notes?: string;
  status: 'invited' | 'attended' | 'joined_cell' | 'no_show';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'fellowship_leader' | 'member';
  fellowship_id?: string;
  cell_id?: string;
}

// Create specific types for inserts that only include required fields
export interface FellowshipInsert {
  name: string;
  description?: string;
  leader_id?: string;
}

export interface CellInsert {
  name: string;
  fellowship_id?: string;
  leader_id?: string;
}

export interface GroupInsert {
  name: string;
  fellowship_id?: string;
  leader_id?: string;
  is_active?: boolean;
}
