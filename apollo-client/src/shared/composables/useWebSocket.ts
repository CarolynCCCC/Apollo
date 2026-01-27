import {useWebSocket as useWebSocketCore} from '@vueuse/core';
import {useRoomStore} from '@/stores/roomStore';
import {WS_MESSAGE_TYPES} from '@/constant/websocket';
import {ROOM_STATUS} from '@/constant/api.ts';
import {useGameStore} from '@/stores/gameStore.ts';

let wsControls: ReturnType<typeof useWebSocketCore> | null = null;
let heartbeatInterval: number | null = null;

function getWsUrl() {
    if (import.meta.env.VITE_WS_BASE_URL) {
        return `${import.meta.env.VITE_WS_BASE_URL}/ws`;
    }

    const base = import.meta.env.VITE_API_BASE_URL || globalThis.location.origin;
    const wsBase = base.replace(/^http/, 'ws');
    return `${wsBase}/ws`;
}

const messageHandlers: Record<string, (message: any) => void> = {
    [WS_MESSAGE_TYPES.PLAYER_JOINED]: (message) => {
        if (message.room) {
            const roomStore = useRoomStore();
            roomStore.currentRoom = message.room;
        }
        const playerName = message.playerName || 'Someone';
        globalThis.dispatchEvent(new CustomEvent('ws:notification', {
            detail: {message: `${playerName} joined!`}
        }));
    },
    [WS_MESSAGE_TYPES.PLAYER_LEFT]: (message) => {
        if (message.room) {
            const roomStore = useRoomStore();
            roomStore.currentRoom = message.room;
        }
        const playerName = message.playerName || `Player ${message.playerId}`;
        globalThis.dispatchEvent(new CustomEvent('ws:notification', {
            detail: {message: `${playerName} left!`}
        }));
    },
    [WS_MESSAGE_TYPES.PLAYER_READY]: (message) => {
        if (message.room) {
            const roomStore = useRoomStore();
            roomStore.currentRoom = message.room;
        }
    },
    [WS_MESSAGE_TYPES.GAME_STARTED]: (message) => {
        const roomStore = useRoomStore();
        roomStore.setCurrentRoomStatus(ROOM_STATUS.IN_PROGRESS);

        const gameStore = useGameStore();

        gameStore.setGameStarted(
            message.leaderId,
            message.currentRound,
            message.missions,
            message.questNumber,
            message.teamSize
        );
    },
    [WS_MESSAGE_TYPES.TEAM_PROPOSED]: (message) => {
        const gameStore = useGameStore();
        gameStore.setTeamProposed(
            message.leaderId,
            message.teamMemberIds,
            message.teamMembers,
            message.questNumber,
            message.proposalNumber
        );
    },
    [WS_MESSAGE_TYPES.REQUEST_TEAM_VOTE]: (message) => {
    },
    [WS_MESSAGE_TYPES.TEAM_VOTE_CAST]: (message) => {
        const gameStore = useGameStore();
        gameStore.addVoteCast(
            message.playerId,
            message.playerName,
            message.approve,
            message.votesCount,
            message.totalPlayers
        );
    },
    [WS_MESSAGE_TYPES.TEAM_VOTE_RESULT]: (message) => {
        const gameStore = useGameStore();
        gameStore.setVoteResult(
            message.approved,
            message.approveCount,
            message.rejectCount,
            message.votes,
            message.nextLeaderId,
            message.nextLeaderIndex
        );
    },
    [WS_MESSAGE_TYPES.REQUEST_QUEST_VOTE]: (message) => {
        const gameStore = useGameStore();
        gameStore.setQuestVoteRequest(
            message.questNumber,
            message.canFail,
            message.message
        );
    },
    [WS_MESSAGE_TYPES.QUEST_VOTE_CAST]: (message) => {
        console.log('Handling QUEST_VOTE_CAST:', message);
    },
    [WS_MESSAGE_TYPES.QUEST_RESULT]: (message) => {
        console.log('Handling QUEST_RESULT:', message);

        const gameStore = useGameStore();
        gameStore.setQuestResult(
            message.questNumber,
            message.result,
            message.successCount,
            message.failCount,
            message.votes,
            message.requiredFails
        );
    },
    [WS_MESSAGE_TYPES.NEXT_ROUND_STARTED]: (message) => {
        const gameStore = useGameStore();
        gameStore.setNextRound(
            message.questNumber,
            message.leaderId,
            message.leaderName,
            message.teamSize,
            message.completedQuests,
            message.failedQuests
        );

        globalThis.dispatchEvent(new CustomEvent('ws:nextRound', {
            detail: {
                questNumber: message.questNumber,
                leaderName: message.leaderName,
            }
        }));
    },
    [WS_MESSAGE_TYPES.GAME_ENDED]: (message) => {
        console.log('Handling GAME_ENDED:', message);

        const gameStore = useGameStore();
        gameStore.setGameEnded(
            message.winner,
            message.reason,
            message.message,
            message.playersRole,
        );

        globalThis.dispatchEvent(new CustomEvent('ws:gameEnded', {
            detail: message
        }));
    },
    [WS_MESSAGE_TYPES.ASSASSIN_PHASE_STARTED]: (message) => {
        console.log('Handling ASSASSIN_PHASE_STARTED:', message);

        const roomStore = useRoomStore();
        roomStore.setCurrentRoomStatus(ROOM_STATUS.ASSASSIN_PHASE);

        globalThis.dispatchEvent(new CustomEvent('ws:notification', {
            detail: {message: message.message}
        }));

        const gameStore = useGameStore();
        gameStore.setAssassinPhaseStarted();
    },
    [WS_MESSAGE_TYPES.REQUEST_ASSASSIN_TARGET]: (message) => {
        console.log('Handling REQUEST_ASSASSIN_TARGET:', message);

        const gameStore = useGameStore();
        gameStore.setAssassinTargetRequest(
            message.eligibleTargets,
            message.message
        );
    },
};

function handleMessage(message: any) {
    const handler = messageHandlers[message.type];
    if (handler) {
        handler(message);
    } else {
        console.warn('Unhandled WebSocket message type:', message.type);
    }
}

export function useWebSocket() {
    function connect(roomId: string, playerId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!roomId || !playerId) {
                reject(new Error('roomId and playerId are required'));
                return;
            }

            if (wsControls?.status.value === 'OPEN') {
                console.log('WebSocket already connected:', {playerId, roomId});
                resolve();
                return;
            }

            const url = getWsUrl();

            wsControls = useWebSocketCore(url, {
                autoReconnect: true,
                onConnected() {
                    const register = {type: WS_MESSAGE_TYPES.REGISTER, playerId, roomId};
                    wsControls?.send(JSON.stringify(register));

                    if (heartbeatInterval) {
                        clearInterval(heartbeatInterval);
                    }
                    heartbeatInterval = globalThis.setInterval(() => {
                        if (wsControls?.status.value === 'OPEN') {
                            const heartbeat = JSON.stringify({type: WS_MESSAGE_TYPES.HEARTBEAT, playerId, roomId});
                            wsControls.send(heartbeat);
                        }
                    }, 30000);

                    resolve();
                },
                onMessage(_ws, event) {
                    try {
                        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : JSON.parse(String(event.data));
                        handleMessage(msg);
                    } catch (err) {
                        console.warn('Invalid WS message', err);
                    }
                },
                onDisconnected() {
                    if (heartbeatInterval) {
                        clearInterval(heartbeatInterval);
                        heartbeatInterval = null;
                    }
                    wsControls = null;
                },
                onError(_ws, error) {
                    reject(error);
                },
            });
        });
    }

    function disconnect() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
        if (wsControls) {
            try {
                wsControls.close();
            } catch (e) {

            }
            wsControls = null;
        }
    }


    return {connect, disconnect};
}
