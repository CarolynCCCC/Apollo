export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;

export const TEAM = {
  GOOD: 'good',
  EVIL: 'evil',
} as const;

export const ROLES = {
  MERLIN: 'Merlin',
  ASSASSIN: 'Assassin',
  PERCIVAL: 'Percival',
  MORGANA: 'Morgana',
  MORDRED: 'Mordred',
  OBERON: 'Oberon',
  SERVANT: 'Servant',
  MINION: 'Minion',
} as const;

export const PLAYER_ALIGNMENT_COUNT: Record<number, { good: number; evil: number }> = {
  5: { good: 3, evil: 2 },
  6: { good: 4, evil: 2 },
  7: { good: 4, evil: 3 },
  8: { good: 5, evil: 3 },
  9: { good: 6, evil: 3 },
  10: { good: 6, evil: 4 },
};

export const QUEST_TEAM_SIZES: Record<number, number[]> = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
};

export const BASE_MANDATORY_ROLES = [ROLES.MERLIN, ROLES.ASSASSIN];

export const OPTIONAL_CHARACTERS = [
  ROLES.PERCIVAL,
  ROLES.MORGANA,
  ROLES.MORDRED,
  ROLES.OBERON,
];

export const GOOD_ROLES: string[] = [ROLES.MERLIN, ROLES.PERCIVAL, ROLES.SERVANT];

export const EVIL_ROLES: string[] = [
  ROLES.ASSASSIN,
  ROLES.MORGANA,
  ROLES.MORDRED,
  ROLES.OBERON,
  ROLES.MINION,
];

export const ROLE_ABILITIES = {
  [ROLES.MERLIN]: 'Knows all Evil players except Mordred',
  [ROLES.ASSASSIN]: 'Can assassinate Merlin at the end of the game if Good wins',
  [ROLES.PERCIVAL]: 'Knows Merlin, but Morgana appears as Merlin',
  [ROLES.MORGANA]: 'Appears as Merlin to Percival',
  [ROLES.MORDRED]: 'Hidden from Merlin',
  [ROLES.OBERON]: 'Isolated from other Evil players and unknown to them',
  [ROLES.SERVANT]: 'Loyal servant of Arthur with no special abilities',
  [ROLES.MINION]: 'Minion of Mordred with no special abilities',
} as const;

