export const WS_MESSAGE_TYPES = {
  REGISTER: 'register',
  ROOM_DELETED: 'room_deleted',
  PLAYER_LEFT: 'player_left',
  PLAYER_JOINED: 'player_joined',
  HEARTBEAT: 'heartbeat',
  INACTIVITY_WARNING: 'inactivity_warning',
  PLAYER_READY: 'player_ready',
  GAME_STARTED: 'game_started',
  ROLE_ASSIGNED: 'role_assigned',
  LEADER_ASSIGNED: 'leader_assigned',
  REQUEST_TEAM_SELECTION: 'request_team_selection',
  TEAM_PROPOSED: 'team_proposed',
  REQUEST_TEAM_VOTE: 'request_team_vote',
  TEAM_VOTE_CAST: 'team_vote_cast',
  TEAM_VOTE_RESULT: 'team_vote_result',
  REQUEST_QUEST_VOTE: 'request_quest_vote',
  QUEST_VOTE_CAST: 'quest_vote_cast',
  QUEST_RESULT: 'quest_result',
  NEXT_ROUND_STARTED: 'next_round_started',
  ASSASSIN_PHASE_STARTED: 'assassin_phase_started',
  REQUEST_ASSASSIN_TARGET: 'request_assassin_target',
  ASSASSIN_RESULT: 'assassin_result',
  GAME_ENDED: 'game_ended',
} as const;

export const WS_SOCKET_EVENTS = {
  MESSAGE: 'message',
  CLOSE: 'close',
} as const;

export const WS_ERROR_MESSAGES = {
  INVALID_MESSAGE_FORMAT: 'Invalid message format',
} as const;

export const WS_CONNECTION_KEY_SEPARATOR = '-';
