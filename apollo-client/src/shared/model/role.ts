export type Role =
  | 'Merlin'
  | 'Assassin'
  | 'Percival'
  | 'Morgana'
  | 'Mordred'
  | 'Oberon'
  | 'Servant'
  | 'Minion';

export type OptionalCharacter = 'Percival' | 'Morgana' | 'Mordred' | 'Oberon';

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

