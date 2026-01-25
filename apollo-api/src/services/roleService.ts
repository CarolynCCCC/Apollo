import { Room } from '../model/room';
import { Role } from '../model/role';
import { RoleInfo, PlayerInfo } from '../model/roleInfo';
import {
  EVIL_ROLES,
  PLAYER_ALIGNMENT_COUNT,
  ROLES,
  ROLE_ABILITIES,
  TEAM,
} from '../constant/roles';

class RoleService {
  private static instance: RoleService;

  private constructor() {}

  static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }
    return RoleService.instance;
  }

  assignRoles(room: Room): Role[] {
    const playerCount = room.players.length;
    const alignment = PLAYER_ALIGNMENT_COUNT[playerCount];

    if (!alignment) {
      throw new Error('Invalid player count for role assignment');
    }

    const roles: Role[] = [];

    roles.push(ROLES.MERLIN as Role);
    roles.push(ROLES.ASSASSIN as Role);

    const optionalGood: Role[] = [];
    const optionalEvil: Role[] = [];

    room.config.optionalCharacters.forEach((char) => {
      if (char === ROLES.PERCIVAL) {
        optionalGood.push(ROLES.PERCIVAL as Role);
      } else if (char === ROLES.MORGANA) {
        optionalEvil.push(ROLES.MORGANA as Role);
      } else if (char === ROLES.MORDRED) {
        optionalEvil.push(ROLES.MORDRED as Role);
      } else if (char === ROLES.OBERON) {
        optionalEvil.push(ROLES.OBERON as Role);
      }
    });

    roles.push(...optionalGood);
    roles.push(...optionalEvil);

    const goodRolesNeeded = alignment.good - 1 - optionalGood.length;
    const evilRolesNeeded = alignment.evil - 1 - optionalEvil.length;

    for (let i = 0; i < goodRolesNeeded; i++) {
      roles.push(ROLES.SERVANT as Role);
    }

    for (let i = 0; i < evilRolesNeeded; i++) {
      roles.push(ROLES.MINION as Role);
    }

    return this.shuffleArray(roles);
  }

  getRoleInfo(role: Role, room: Room): RoleInfo {
    const evilPlayers: PlayerInfo[] = room.players
      .filter((p) => p.role && (EVIL_ROLES as readonly Role[]).includes(p.role))
      .map((p) => ({ id: p.id, name: p.name }));

    const merlinPlayer = room.players.find((p) => p.role === ROLES.MERLIN);
    const morganaPlayer = room.players.find((p) => p.role === ROLES.MORGANA);

    if (role === ROLES.MERLIN) {
      const visibleEvil = evilPlayers.filter((p) => {
        const player = room.players.find((rp) => rp.id === p.id);
        return player?.role !== ROLES.MORDRED;
      });
      return {
        team: TEAM.GOOD,
        ability: ROLE_ABILITIES[ROLES.MERLIN],
        knownEvil: visibleEvil,
      };
    }

    if (role === ROLES.PERCIVAL) {
      const merlinAndMorgana: PlayerInfo[] = [];
      if (merlinPlayer) {
        merlinAndMorgana.push({ id: merlinPlayer.id, name: merlinPlayer.name });
      }
      if (morganaPlayer) {
        merlinAndMorgana.push({ id: morganaPlayer.id, name: morganaPlayer.name });
      }
      return {
        team: TEAM.GOOD,
        ability: ROLE_ABILITIES[ROLES.PERCIVAL],
        possibleMerlins: this.shuffleArray(merlinAndMorgana),
      };
    }

    if (role === ROLES.OBERON) {
      return {
        team: TEAM.EVIL,
        ability: ROLE_ABILITIES[ROLES.OBERON],
        knownEvil: [],
      };
    }

    if ((EVIL_ROLES as readonly Role[]).includes(role)) {
      const knownEvil = evilPlayers.filter((p) => {
        const player = room.players.find((rp) => rp.id === p.id);
        return player?.role !== ROLES.OBERON;
      });
      return {
        team: TEAM.EVIL,
        ability: ROLE_ABILITIES[role],
        knownEvil,
      };
    }

    return {
      team: TEAM.GOOD,
      ability: ROLE_ABILITIES[role] || ROLE_ABILITIES[ROLES.SERVANT],
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default RoleService.getInstance();
