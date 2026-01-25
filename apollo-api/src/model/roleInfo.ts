export type Team = 'good' | 'evil';

export interface PlayerInfo {
  id: number;
  name?: string;
}

export interface RoleInfo {
  team: Team;
  ability: string;
  knownEvil?: PlayerInfo[];
  possibleMerlins?: PlayerInfo[];
}
