export const API_VERSION = 'v1';

export const API_BASE_PATH = `/api/${API_VERSION}`;

export const API_ROUTES = {
  ROOMS: '/rooms',
  ROOM_BY_ID: '/rooms/:roomId',
  JOIN_ROOM: '/rooms/join',
  LEAVE_ROOM: '/rooms/leave',
  HEARTBEAT: '/rooms/heartbeat',
  DELETE_ROOM: '/rooms/delete',
  GET_ROLE_INFO: '/players/role-info',
  START_GAME: '/game/start',
  PLAYER_READY: '/game/ready',
  PROPOSE_TEAM: '/game/propose-team',
  VOTE_TEAM: '/game/vote-team',
  VOTE_QUEST: '/game/vote-quest',
  ASSASSINATE_TARGET: '/game/assassinate',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROOM_STATUS = {
  LOBBY: 'lobby',
  IN_PROGRESS: 'in_progress',
  ASSASSIN_PHASE: 'assassin_phase',
  FINISHED: 'finished',
} as const;

export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: 'Room not found',
  NO_AVAILABLE_ROOMS: 'No available rooms found',
  PLAYER_ID_REQUIRED: 'playerId is required',
  ROOM_FULL: 'Room is full',
  PLAYER_ALREADY_IN_ROOM: 'Player is already in this room',
  GAME_ALREADY_STARTED: 'Cannot join room - game has already started',
  PLAYER_NOT_IN_ROOM: 'Player is not in this room',
  MAX_ROOMS_REACHED: 'Maximum number of rooms reached',
  HOST_ID_REQUIRED: 'hostId is required and must be a non-empty string',
  PLAYERS_MUST_BE_INTEGER: 'numberOfPlayers must be an integer',
  PERCIVAL_REQUIRES_BALANCE: 'When playing with Percival at 5 players, you must add Mordred or Morgana for balance',
  NOT_HOST: 'Only the host can delete the room',
  CANNOT_DELETE_IN_PROGRESS: 'Cannot delete room while game is in progress',
  NOT_ENOUGH_PLAYERS: 'Not enough players to start the game',
  TOO_MANY_PLAYERS: 'Too many players for the room configuration',
  NOT_ALL_PLAYERS_READY: 'Not all players are ready',
  GAME_NOT_IN_LOBBY: 'Game is not in lobby status',
  NOT_LEADER: 'Only the current leader can propose a team',
  INVALID_TEAM_SIZE: 'Invalid team size for current quest',
  LEADER_NOT_IN_TEAM: 'Leader can be on the team but it is optional',
  INVALID_TEAM_MEMBERS: 'Invalid team member selection',
  DUPLICATE_TEAM_MEMBERS: 'Cannot select the same player multiple times',
  TEAM_NOT_PROPOSED: 'No team has been proposed yet',
  VOTE_ALREADY_CAST: 'You have already voted',
  ALL_VOTES_NOT_CAST: 'Not all players have voted yet',
  GAME_NOT_FOUND: 'Game not found',
} as const;

