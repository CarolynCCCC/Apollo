import {defineStore} from 'pinia';
import {roomApi} from '@/api/room';
import {CreateRoomRequest, JoinRoomRequest, Room, RoomStatus} from '@/shared/model/room';
import {useWebSocket} from '@/shared/composables/useWebSocket';
import {usePlayerStore} from '@/stores/playerStore';
import {useGameStore} from '@/stores/gameStore.ts';

export const useRoomStore = defineStore('room', {
        state: () => ({
            currentRoom: null as Room | null,
            availableRooms: [] as Room[],
            isLoading: false,
            error: null as string | null,
            lastCreatedRoomId: null as string | null,
            joinRoomSuccess: false as boolean,
            playerId: 0 as number,
            roomIdToJoin: '' as string,
        }),
        persist: true,

        getters: {
            allPlayersReady: (state) => {
                return state.currentRoom?.players.every(player => player.ready);
            },
            hasCurrentRoom: (state) => state.currentRoom !== null,
            currentRoomId: (state) => state.currentRoom?.id,
            isRoomHost: (state) => (id: number) => state.currentRoom?.hostId === id,
            getPlayerNameById: (state) => (id: number | null) => {
                return state.currentRoom?.players.find(player => player.id === id)?.name || null;
            }
        },

        actions: {
            setRoomIdToJoin(roomId: string) {
                this.roomIdToJoin = roomId;
            },

            setCurrentRoom(room: Room | null) {
                this.currentRoom = room;
            },

            setPlayerId(id: number) {
                this.playerId = id;
            },

            setCurrentRoomStatus(status: RoomStatus) {
                if (this.currentRoom) {
                    this.currentRoom.status = status;
                }
            },

            setJoinRoomSuccess(flag: boolean) {
                this.joinRoomSuccess = flag;
            },

            async createRoomAndJoin(createRequest: CreateRoomRequest, playerName: string) {
                this.isLoading = true;
                this.error = null;
                this.joinRoomSuccess = false;

                try {
                    const createResponse = await roomApi.createRoom(createRequest);
                    this.lastCreatedRoomId = createResponse.room.id;

                    const joinResponse = await roomApi.joinRoom({
                        playerName,
                        roomId: createResponse.room.id,
                    });

                    this.setCurrentRoom(joinResponse.room);
                    this.setPlayerId(joinResponse.playerId);
                    this.setJoinRoomSuccess(!!joinResponse.playerId);

                    const playerStore = usePlayerStore();
                    playerStore.setPlayer(joinResponse.playerId);

                    const {connect} = useWebSocket();
                    if (joinResponse.playerId && joinResponse.room?.id) {
                        await connect(joinResponse.room.id, joinResponse.playerId);
                    }

                    this.isLoading = false;
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to create and join room';
                    this.isLoading = false;
                }
            },

            async joinRoom(request: JoinRoomRequest) {
                this.isLoading = true;
                this.joinRoomSuccess = false;
                this.error = null;

                try {
                    const response = await roomApi.joinRoom(request);

                    this.setPlayerId(response.playerId);
                    this.setCurrentRoom(response.room);
                    this.setJoinRoomSuccess(!!response.playerId);

                    const playerStore = usePlayerStore();
                    playerStore.setPlayer(response.playerId);

                    const {connect} = useWebSocket();
                    if (response.playerId && response.room?.id) {
                        await connect(response.room.id, response.playerId);
                    }

                    this.isLoading = false;
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to join room';
                    this.isLoading = false;
                }
            },

            async leaveRoom() {
                if (!this.currentRoom?.id || !this.playerId) return;

                this.isLoading = true;
                this.error = null;

                const {disconnect} = useWebSocket();
                disconnect();

                try {
                    await roomApi.leaveRoom({roomId: this.currentRoom.id, playerId: this.playerId});
                    this.currentRoom = null;
                    this.isLoading = false;

                    const playerStore = usePlayerStore();
                    playerStore.clearPlayer();
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to leave room';
                    this.isLoading = false;
                }
            },

            async fetchAvailableRooms() {
                this.isLoading = true;
                this.error = null;

                try {
                    this.availableRooms = await roomApi.getAvailableRooms();
                    this.isLoading = false;
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to fetch rooms';
                    this.availableRooms = [];
                    this.isLoading = false;
                }
            },

            async deleteRoom() {
                if (!this.currentRoom?.id || !this.currentRoom?.hostId) return;

                this.isLoading = true;
                this.error = null;

                const {disconnect} = useWebSocket();
                disconnect();

                try {
                    await roomApi.deleteRoom({roomId: this.currentRoom.id, hostId: this.currentRoom.hostId});
                    this.currentRoom = null;
                    this.isLoading = false;

                    const playerStore = usePlayerStore();
                    playerStore.clearPlayer();
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to delete room';
                    this.isLoading = false;
                }
            },

            clearError() {
                this.error = null;
            },

            async togglePlayerReady() {
                console.log(this.currentRoom);
                if (!this.playerId || !this.currentRoom?.id) return;

                const currentPlayer = this.currentRoom.players.find(p => p.id === this.playerId);
                const newReadyState = currentPlayer ? !currentPlayer.ready : true;

                try {
                    const {gameApi} = await import('@/api/game');
                    this.currentRoom = await gameApi.setPlayerReady({
                        playerId: this.playerId,
                        roomId: this.currentRoom.id,
                        ready: newReadyState,
                    });
                    this.isLoading = false;
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to set player ready status';
                    this.isLoading = false;
                }
            },

            async startGame() {
                if (!this.currentRoom?.id || !this.currentRoom?.hostId) return;

                const roomId = this.currentRoom.id;
                const hostId = this.currentRoom.hostId;

                this.isLoading = true;
                this.error = null;

                try {
                    const {gameApi} = await import('@/api/game');

                    const hostPlayer = this.currentRoom.players.find(p => p.id === hostId);
                    if (hostPlayer && !hostPlayer.ready) {
                        await this.togglePlayerReady();
                    }

                    console.log('Starting game for room:', roomId);
                    console.log(this.currentRoom);

                    await gameApi.startGame({
                        hostId,
                        roomId,
                    });
                    this.isLoading = false;
                } catch (err: any) {
                    this.error = err.response?.data?.error || err.message || 'Failed to start game';
                    this.isLoading = false;
                }
            },

            clearState() {
                const {disconnect} = useWebSocket();
                disconnect();

                this.currentRoom = null;
                this.availableRooms = [];
                this.isLoading = false;
                this.error = null;
                this.lastCreatedRoomId = null;
                this.joinRoomSuccess = false;

                const playerStore = usePlayerStore();
                playerStore.clearPlayer();

                const gameStore = useGameStore();
                gameStore.clearGameState();
            },

            inactiveAllPlayers() {
                if (!this.currentRoom) return;
                this.currentRoom.players =
                    this.currentRoom?.players.map(player => ({
                        ...player,
                        ready: false,
                    })) ?? []
            }
        },
    })
;

