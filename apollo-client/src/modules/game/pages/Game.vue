<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { useDialog } from '@/shared/composables/useDialog';
import AvalonDialog from '@/shared/components/AvalonDialog.vue';
import AvalonButton from '@/shared/components/AvalonButton.vue';
import VoteHistoryDialog from '@/modules/game/components/VoteHistoryDialog.vue';
import QuestHistoryDialog from '@/modules/game/components/QuestHistoryDialog.vue';
import GameEndedDialog from '@/modules/game/components/GameEndedDialog.vue';

const route = useRoute();
const { open, close } = useDialog();
const gameStore = useGameStore();
const playerStore = usePlayerStore();
const roomStore = useRoomStore();

const showRoleDialog = ref(true);
const leaderMessageVisible = ref(false);
const dialogOpened = ref(false);
const selectedPlayerIds = ref<number[]>([]);
const isSubmitting = ref(false);
const newLeaderMessageVisible = ref(false);
const nextRoundHighlight = ref(false);
const selectedAssassinTarget = ref<number | null>(null);
const isAssassinating = ref(false);

const roomId = computed(() => route.params.roomId as string);
const isLeader = computed(() => gameStore.isLeader(playerStore.playerId || 0));
const isEvil = computed(() => gameStore.roleInfo?.team === 'evil');
const isGood = computed(() => gameStore.roleInfo?.team === 'good');
const requiredTeamSize = computed(() => gameStore.currentTeamSize || 0);
const canSubmitTeam = computed(() => selectedPlayerIds.value.length === requiredTeamSize.value);
const allPlayers = computed(() => roomStore.currentRoom?.players || []);
const isAssassinPhase = computed(() => roomStore.currentRoom?.status === 'assassin_phase');

watch(() => gameStore.voteResult, (result) => {
  console.log('Watch triggered - voteResult changed:', result);
  console.log('Current playerId:', playerStore.playerId);

  if (result && !result.approved && result.nextLeaderId === playerStore.playerId) {
    console.log('Showing new leader message for player:', playerStore.playerId);
    newLeaderMessageVisible.value = true;
    setTimeout(() => {
      newLeaderMessageVisible.value = false;
    }, 4000);
  }
}, { deep: true });

function handleNextRound(event: Event) {
  const customEvent = event as CustomEvent;
  const { questNumber, leaderName } = customEvent.detail;

  console.log('Next round started:', { questNumber, leaderName });

  // Background animation
  nextRoundHighlight.value = true;
  setTimeout(() => {
    nextRoundHighlight.value = false;
  }, 2000);

  // Show leader notification if current player is the new leader
  if (gameStore.leaderId === playerStore.playerId) {
    leaderMessageVisible.value = true;
    setTimeout(() => {
      leaderMessageVisible.value = false;
    }, 4000);
  }
}

onMounted(async () => {
  if (playerStore.playerId && roomId.value) {
    await gameStore.fetchRoleInfo(playerStore.playerId, roomId.value);
  }
  window.addEventListener('ws:nextRound', handleNextRound as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('ws:nextRound', handleNextRound as EventListener);
  close();
});

function closeRoleDialog() {
  showRoleDialog.value = false;

  if (isLeader.value && !dialogOpened.value) {
    dialogOpened.value = true;

    leaderMessageVisible.value = true;
    setTimeout(() => {
      leaderMessageVisible.value = false;
    }, 4000);
  }
}

function togglePlayerSelection(playerId: number) {
  const index = selectedPlayerIds.value.indexOf(playerId);

  if (index > -1) {
    selectedPlayerIds.value.splice(index, 1);
  } else {
    if (selectedPlayerIds.value.length >= requiredTeamSize.value) {
      selectedPlayerIds.value.shift();
    }
    selectedPlayerIds.value.push(playerId);
  }
}

function isPlayerSelected(playerId: number): boolean {
  return selectedPlayerIds.value.includes(playerId);
}

async function submitTeamProposal() {
  if (!canSubmitTeam.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    await gameStore.proposeTeam(
      playerStore.playerId!,
      roomId.value,
      selectedPlayerIds.value,
    );

    selectedPlayerIds.value = [];
  } catch (error: any) {
    console.error('Failed to propose team:', error);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleVote(approve: boolean) {
  try {
    await gameStore.voteOnTeam(
      approve
    );
  } catch (error) {
    console.error('Failed to vote:', error);
  }
}

async function handleAssassinate() {
  if (!selectedAssassinTarget.value || isAssassinating.value) return;

  isAssassinating.value = true;

  try {
    await gameStore.assassinateTarget(
      playerStore.playerId!,
      selectedAssassinTarget.value,
      roomId.value
    );
    selectedAssassinTarget.value = null;
  } catch (error) {
    console.error('Failed to assassinate target:', error);
  } finally {
    isAssassinating.value = false;
  }
}

function selectAssassinTarget(targetId: number) {
  selectedAssassinTarget.value = targetId;
}

async function handleQuestVote(success: boolean) {
  try {
    await gameStore.voteOnQuest(
      success,
    );
  } catch (error) {
    console.error('Failed to vote on quest:', error);
  }
}

function openVoteHistory() {
  open(VoteHistoryDialog, {
    props: {
      onClose: close
    }
  });
}

function openQuestHistory() {
  open(QuestHistoryDialog, {
    props: {
      onClose: close
    }
  });
}

watch(() => gameStore.gameEnded, (gameEndedData) => {
  if (gameEndedData) {
    console.log('Game ended, showing dialog:', gameEndedData);
    open(GameEndedDialog, {
      props: {
        winner: gameEndedData.winner,
        reason: gameEndedData.reason,
        message: gameEndedData.message,
        onClose: close
      }
    });
  }
});

</script>

<template>
  <div class="min-h-screen text-medieval-parchment p-8 transition-colors duration-1000"
       :class="{
         'bg-gradient-to-b from-gold-900/20 to-stone-800': nextRoundHighlight,
         'bg-gradient-to-b from-red-950 to-stone-900': isAssassinPhase,
         'bg-gradient-to-b from-stone-900 to-stone-800': !nextRoundHighlight && !isAssassinPhase
       }">
    <AvalonDialog :open="showRoleDialog" @close="closeRoleDialog" :closeable="false">
      <div class="text-center space-y-6">
        <h2 class="text-3xl font-bold font-cinzel" :class="{
          'text-evil-600': isEvil,
          'text-good-400': isGood
        }">
          You Are
        </h2>

        <div>
          <div class="text-5xl font-bold font-cinzel" :class="{
            'text-evil-500': isEvil,
            'text-good-500': isGood
          }">
            {{ gameStore.currentRole }}
          </div>

          <div class="text-lg text-medieval-parchment">
            <p class="font-semibold mb-2">Team: <span :class="{
              'text-evil-400': isEvil,
              'text-good-400': isGood
            }">{{ gameStore.roleInfo?.team === 'good' ? 'Good' : 'Evil' }}</span></p>
            <p class="text-sm text-stone-400">{{ gameStore.roleInfo?.ability }}</p>
          </div>

          <div v-if="gameStore.roleInfo?.knownEvil && gameStore.roleInfo.knownEvil.length > 0" class="mt-6 space-y-2">
            <h3 class="text-lg font-semibold text-evil-400">Known Evil Players:</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <div v-for="player in gameStore.roleInfo.knownEvil" :key="player.id"
                   class="px-4 py-2 bg-evil-900/30 border border-evil-600 rounded text-evil-300">
                {{ player.name || `Player ${player.id}` }}
              </div>
            </div>
          </div>

          <div v-if="gameStore.roleInfo?.possibleMerlins && gameStore.roleInfo.possibleMerlins.length > 0"
               class="mt-6 space-y-2">
            <h3 class="text-lg font-semibold text-good-400">Possible Merlins:</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <div v-for="player in gameStore.roleInfo.possibleMerlins" :key="player.id"
                   class="px-4 py-2 bg-good-900/30 border border-good-600 rounded text-good-300">
                {{ player.name || `Player ${player.id}` }}
              </div>
            </div>
          </div>
        </div>

        <avalon-button @click="closeRoleDialog" class="mt-6">
          I Understand
        </avalon-button>
      </div>
    </AvalonDialog>

    <Transition name="slide-down">
      <div v-if="leaderMessageVisible" class="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
        <div class="bg-gold-600 text-stone-900 px-8 py-4 rounded-lg shadow-2xl border-2 border-gold-400">
          <p class="text-xl font-bold font-cinzel">You are the Leader</p>
          <p class="text-sm">Please select {{ gameStore.currentTeamSize }} players for Quest
            {{ gameStore.currentRound }}</p>
        </div>
      </div>
    </Transition>

    <Transition name="slide-down">
      <div v-if="newLeaderMessageVisible" class="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
        <div class="bg-gold-600 text-stone-900 px-8 py-4 rounded-lg shadow-2xl border-2 border-gold-400">
          <p class="text-xl font-bold font-cinzel">You are the New Leader!</p>
          <p class="text-sm">The previous team was rejected. Select a new team.</p>
        </div>
      </div>
    </Transition>

    <div>
      <div class="mx-auto">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-gold-400 font-cinzel mb-2">Quest {{ gameStore.currentRound }}</h1>
          <p class="text-medieval-parchment">Round {{ gameStore.currentRound }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-stone-800/50 backdrop-blur rounded-lg border border-stone-600 p-6">
              <h2 class="text-2xl font-bold text-gold-400 font-cinzel mb-4 text-center">Quest Progress</h2>
              <div class="flex justify-center items-center gap-4">
                <div
                  v-for="mission in gameStore.missions"
                  :key="mission.questNumber"
                  class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 transition-all"
                  :class="{
                    'border-gold-500 bg-gold-900/20 text-gold-400 shadow-lg shadow-gold-500/50': mission.questNumber === gameStore.currentRound,
                    'border-stone-600 bg-stone-700/20 text-stone-400': mission.questNumber !== gameStore.currentRound
                  }"
                >
                  {{ mission.questNumber }}
                </div>
              </div>
            </div>

            <div v-if="gameStore.isQuestVotingPhase"
                 class="bg-stone-800/50 backdrop-blur rounded-lg border border-gold-600 p-6">
              <h2 class="text-2xl font-bold text-gold-400 font-cinzel mb-4 text-center">Quest Vote</h2>

              <div class="space-y-4">
                <div class="text-center mb-4">
                  <p class="text-medieval-parchment text-sm mb-2">
                    {{ gameStore.questVoteMessage }}
                  </p>
                  <p class="text-stone-400 text-xs">Quest {{ gameStore.currentRound }}</p>
                </div>

                <div v-if="!gameStore.hasVotedOnQuest" class="flex gap-4 justify-center">
                  <avalon-button
                    @click="handleQuestVote(true)"
                    class="bg-good-600 hover:bg-good-700 border-good-500"
                  >
                    ✓ Success
                  </avalon-button>
                  <avalon-button
                    v-if="gameStore.canFailQuest"
                    @click="handleQuestVote(false)"
                    class="bg-evil-600 hover:bg-evil-700 border-evil-500"
                  >
                    ✗ Fail
                  </avalon-button>
                </div>

                <div v-else class="text-center">
                  <p class="text-gold-400 font-semibold">You have voted! Waiting for others...</p>
                </div>
              </div>
            </div>


            <div class="bg-stone-800/50 backdrop-blur rounded-lg border border-stone-600 p-6">
              <h2 class="text-2xl font-bold text-gold-400 font-cinzel mb-4">
                {{ 'Team Vote' }}
              </h2>

              <!-- Leader selecting team -->
              <div v-if="isLeader && !gameStore.isVotingPhase" class="space-y-4">
                <div class="text-center mb-4">
                  <p class="text-medieval-parchment text-sm mb-2">
                    Select {{ requiredTeamSize }} players to go on Quest {{ gameStore.currentRound }}
                  </p>
                  <p class="text-gold-400 font-semibold">
                    {{ selectedPlayerIds.length }} / {{ requiredTeamSize }} selected
                  </p>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    v-for="player in allPlayers"
                    :key="player.id"
                    @click="togglePlayerSelection(player.id)"
                    class="p-4 rounded-lg border-2 transition-all font-semibold"
                    :class="{
                      'border-gold-500 bg-gold-900/30 text-gold-300 shadow-lg shadow-gold-500/30': isPlayerSelected(player.id),
                      'border-stone-600 bg-stone-700/20 text-stone-300 hover:border-stone-500 hover:bg-stone-700/40': !isPlayerSelected(player.id)
                    }"
                  >
                    <span class="flex items-center justify-center gap-2">
                      <span v-if="isPlayerSelected(player.id)" class="text-gold-400">✓</span>
                      <span>{{ player.name }}</span>
                    </span>
                  </button>
                </div>

                <div class="flex justify-center mt-6">
                  <avalon-button
                    @click="submitTeamProposal"
                    :disabled="!canSubmitTeam || isSubmitting"
                    :class="{ 'opacity-50 cursor-not-allowed': !canSubmitTeam || isSubmitting }"
                  >
                    {{ isSubmitting ? 'Submitting...' : 'Propose Team' }}
                  </avalon-button>
                </div>
              </div>

              <!-- Voting phase -->
              <div v-else-if="gameStore.isVotingPhase" class="space-y-4">
                <div class="text-center mb-4">
                  <p class="text-medieval-parchment text-sm mb-2">
                    The leader has proposed a team. Vote to approve or reject.
                  </p>
                  <p class="text-stone-400 text-xs">Proposal #{{ gameStore.proposalNumber }}</p>
                </div>

                <div class="bg-stone-700/30 rounded-lg p-4 mb-4">
                  <h3 class="text-lg font-semibold text-gold-300 mb-3 text-center">Proposed Team</h3>
                  <div class="flex flex-wrap justify-center gap-2">
                    <div
                      v-for="member in gameStore.proposedTeamMembers"
                      :key="member.id"
                      class="px-4 py-2 bg-gold-900/30 border border-gold-600 rounded text-gold-300 font-semibold"
                    >
                      {{ member.name || `Player ${member.id}` }}
                    </div>
                  </div>
                </div>

                <div v-if="gameStore.votesCount > 0" class="bg-stone-700/30 rounded-lg p-4 mb-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-medieval-parchment">Voting Progress</h3>
                    <div class="text-gold-400 font-bold">
                      {{ gameStore.votesCount }} / {{ gameStore.totalPlayers }}
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="voter in gameStore.votedPlayers"
                      :key="voter.id"
                      class="px-3 py-1 rounded text-sm flex items-center gap-1"
                      :class="{
                        'bg-good-900/30 border border-good-600 text-good-300': voter.approve,
                        'bg-evil-900/30 border border-evil-600 text-evil-300': !voter.approve
                      }"
                    >
                      <span>{{ voter.approve ? '✓' : '✗' }}</span>
                      <span>{{ voter.name || `Player ${voter.id}` }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="!gameStore.hasVoted" class="flex gap-4 justify-center">
                  <avalon-button
                    @click="handleVote(true)"
                    class="bg-good-600 hover:bg-good-700 border-good-500"
                  >
                    ✓ Approve
                  </avalon-button>
                  <avalon-button
                    @click="handleVote(false)"
                    class="bg-evil-600 hover:bg-evil-700 border-evil-500"
                  >
                    ✗ Reject
                  </avalon-button>
                </div>

                <div v-else class="text-center">
                  <p class="text-gold-400 font-semibold">You have voted! Waiting for others...</p>
                </div>
              </div>

              <!-- Team already selected -->
              <div v-else-if="gameStore.missions[gameStore.currentRound - 1]?.teamMembers?.length" class="text-center">
                <p class="text-medieval-parchment text-sm mb-4">
                  The leader has selected the team for this quest.
                </p>
                <div class="flex flex-wrap justify-center gap-2">
                  <div v-for="playerId in gameStore.missions[gameStore.currentRound - 1].teamMembers"
                       :key="playerId"
                       class="px-4 py-2 bg-gold-900/30 border border-gold-600 rounded text-gold-300 font-semibold">
                    {{ allPlayers.find(p => p.id === playerId)?.name || `Player ${playerId}` }}
                  </div>
                </div>
              </div>

              <!-- Waiting for leader -->
              <div v-else class="text-center text-stone-400">
                <p class="mb-2">Waiting for the leader to select the team...</p>
                <p class="text-sm text-gold-400">Leader: {{ allPlayers.find(p => p.id === gameStore.leaderId)?.name
                  }}</p>
              </div>
            </div>

            <div v-if="gameStore.voteResult" class="bg-stone-800/50 backdrop-blur rounded-lg border p-6"
                 :class="{
                   'border-good-600': gameStore.voteResult.approved,
                   'border-evil-600': !gameStore.voteResult.approved
                 }">
              <h2 class="text-2xl font-bold font-cinzel mb-4 text-center"
                  :class="{
                    'text-good-400': gameStore.voteResult.approved,
                    'text-evil-400': !gameStore.voteResult.approved
                  }">
                Vote Result: {{ gameStore.voteResult.approved ? 'APPROVED' : 'REJECTED' }}
              </h2>

              <div class="space-y-4">
                <div class="flex justify-center gap-8 mb-4">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-good-400">{{ gameStore.voteResult.approveCount }}</div>
                    <div class="text-sm text-stone-400">Approve</div>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-evil-400">{{ gameStore.voteResult.rejectCount }}</div>
                    <div class="text-sm text-stone-400">Reject</div>
                  </div>
                </div>

                <div class="bg-stone-700/30 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-medieval-parchment mb-4 text-center">Vote Details</h3>
                  <div class="flex flex-wrap justify-center gap-4">
                    <div
                      v-for="vote in gameStore.voteResult.votes"
                      :key="vote.playerId"
                      class="flex flex-col items-center gap-2"
                    >
                      <div
                        class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-all"
                        :class="{
                          'bg-good-900/30 border-good-500 text-good-300': vote.approve,
                          'bg-evil-900/30 border-evil-500 text-evil-300': !vote.approve
                        }"
                      >
                        {{ vote.approve ? '✓' : '✗' }}
                      </div>
                      <div class="text-xs text-center text-stone-300 max-w-[80px] truncate">
                        {{ vote.playerName || `Player ${vote.playerId}` }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="gameStore.voteResult.approved" class="text-center mt-4">
                  <p class="text-good-400 font-semibold text-lg">
                    Team approved! Waiting for quest votes...
                  </p>
                </div>

                <div v-else class="text-center mt-4">
                  <p class="text-evil-400 font-semibold text-lg mb-2">
                    Team rejected. Moving to next proposal.
                  </p>
                  <p class="text-stone-400 text-sm">
                    New Leader: {{ allPlayers.find(p => p.id === gameStore.voteResult?.nextLeaderId)?.name }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="gameStore.currentQuestResult" class="bg-stone-800/50 backdrop-blur rounded-lg border p-6"
                 :class="{
                   'border-good-600': gameStore.currentQuestResult.result === 'success',
                   'border-evil-600': gameStore.currentQuestResult.result === 'fail'
                 }">
              <h2 class="text-2xl font-bold font-cinzel mb-4 text-center"
                  :class="{
                    'text-good-400': gameStore.currentQuestResult.result === 'success',
                    'text-evil-400': gameStore.currentQuestResult.result === 'fail'
                  }">
                Quest {{ gameStore.currentQuestResult.questNumber }} Result:
                {{ gameStore.currentQuestResult.result === 'success' ? 'SUCCESS' : 'FAILED' }}
              </h2>

              <div class="space-y-4">
                <div class="flex justify-center gap-8 mb-4">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-good-400">{{ gameStore.currentQuestResult.successCount }}</div>
                    <div class="text-sm text-stone-400">Success</div>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-evil-400">{{ gameStore.currentQuestResult.failCount }}</div>
                    <div class="text-sm text-stone-400">Fail</div>
                  </div>
                </div>

                <div class="bg-stone-700/30 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-medieval-parchment mb-4 text-center">Vote Cards</h3>
                  <div class="flex justify-center gap-2">
                    <div
                      v-for="(vote, index) in gameStore.currentQuestResult.votes"
                      :key="index"
                      class="w-16 h-20 rounded-lg flex items-center justify-center text-2xl font-bold border-4 shadow-lg"
                      :class="{
                        'bg-good-900/30 border-good-500 text-good-300': vote.vote === 'success',
                        'bg-evil-900/30 border-evil-500 text-evil-300': vote.vote === 'fail'
                      }"
                    >
                      {{ vote.vote === 'success' ? '✓' : '✗' }}
                    </div>
                  </div>
                  <p class="text-xs text-stone-400 text-center mt-3">
                    (Votes are shuffled and anonymous)
                  </p>
                </div>

                <div class="bg-stone-700/30 rounded-lg p-4">
                  <p class="text-sm text-stone-400 text-center">
                    Required Fails: {{ gameStore.currentQuestResult.requiredFails }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="gameStore.isQuestVotingPhase" class="bg-stone-800/50 backdrop-blur rounded-lg border border-gold-600 p-6">
              <h2 class="text-2xl font-bold text-gold-400 font-cinzel mb-4 text-center">Quest Vote</h2>

              <div class="space-y-4">
                <div class="text-center mb-4">
                  <p class="text-medieval-parchment text-sm mb-2">
                    {{ gameStore.questVoteMessage }}
                  </p>
                  <p class="text-stone-400 text-xs">Quest {{ gameStore.currentRound }}</p>
                </div>

                <div v-if="!gameStore.hasVotedOnQuest" class="flex gap-4 justify-center">
                  <avalon-button
                    @click="handleQuestVote(true)"
                    class="bg-good-600 hover:bg-good-700 border-good-500"
                  >
                    ✓ Success
                  </avalon-button>
                  <avalon-button
                    v-if="gameStore.canFailQuest"
                    @click="handleQuestVote(false)"
                    class="bg-evil-600 hover:bg-evil-700 border-evil-500"
                  >
                    ✗ Fail
                  </avalon-button>
                </div>

                <div v-else class="text-center">
                  <p class="text-gold-400 font-semibold">You have voted! Waiting for others...</p>
                </div>
              </div>
            </div>

            <div class="flex justify-center gap-4 mt-8">
              <avalon-button @click="showRoleDialog = true">
                Your Identity
              </avalon-button>
              <avalon-button @click="openVoteHistory" class="bg-stone-700 hover:bg-stone-600">
                View Vote History
              </avalon-button>
              <avalon-button @click="openQuestHistory" class="bg-stone-700 hover:bg-stone-600">
                View Quest History
              </avalon-button>
              <avalon-button
                v-if="gameStore.isAssassinPhase"
                @click="openAssassinDialog"
                class="bg-red-700 hover:bg-red-800 border-red-600"
              >
                💀 Assassinate Target
              </avalon-button>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.slide-down-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-down-leave-active {
  animation: fadeUp 0.3s ease-in forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeUp {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
  }
}
</style>

