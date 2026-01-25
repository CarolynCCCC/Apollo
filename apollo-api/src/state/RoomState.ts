import { produce } from 'immer';
import { Room } from '../model/room';

class RoomState {
  private rooms = new Map<string, Room>();
  private static instance: RoomState;

  private constructor() {}

  static getInstance(): RoomState {
    if (!RoomState.instance) {
      RoomState.instance = new RoomState();
    }
    return RoomState.instance;
  }

  getTotalRooms(): number {
    return this.rooms.size;
  }

  addRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  updateRoom(roomId: string, updater: (draft: Room) => void): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const nextRoom = produce(room, updater);
    this.rooms.set(roomId, nextRoom);

    return nextRoom;
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

export default RoomState.getInstance();
