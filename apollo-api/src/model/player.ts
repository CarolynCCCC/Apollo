import { Role } from './role';

export interface Player {
  id: number;
  name?: string;
  role?: Role;
  isConnected: boolean;
  lastActivity: Date;
  ready: boolean;
}