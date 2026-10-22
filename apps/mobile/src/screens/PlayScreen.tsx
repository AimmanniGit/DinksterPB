import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { CURRENT_USER, MOCK_RECENT_GAMES, MOCK_PLAYERS } from '../constants/mockData';
import { useGameStore } from '../stores/gameStore';
import { CourtDiagram } from '../components/CourtDiagram';
import { MatchFormat, GameMode } from '@dinkster/shared';

interface PlayScreenProps {
  onOpenWatch: () => void;
  onNavigateCourts: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  onOpenWatch,
  onNavigateCourts,
}) => {
  const [flow, setFlow] = useState<'main' | 'lobby' | 'join' | 'toss' | 'score'>('main');

  // Lobby Configuration State
  const [format, setFormat] = useState<MatchFormat>('doubles');
  const [mode, setMode] = useState<GameMode>('classic');
  const [targetScore, setTargetScore] = useState<number>(11);
  const [bestOf, setBestOf] = useState<number>(1);
  const [team1Name, setTeam1Name] = useState('AJ & MR');
  const [team2Name, setTeam2Name] = useState('JC & SK');
  const [lobbySlots, setLobbySlots] = useState<Array<{ name: string; dupr: number; isHost?: boolean; isGuest?: boolean } | null>>([
    { name: CURRENT_USER.name, dupr: CURRENT_USER.dupr, isHost: true },
    { name: 'Maya Rivera', dupr: 3.8 },
    { name: 'Jordan Chen', dupr: 4.0 },
    null,
  ]);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Join Code State
  const [joinInput, setJoinInput] = useState('');

  // Coin Toss State
  const [tossPick, setTossPick] = useState<'Heads' | 'Tails' | null>(null);
  const [tossResult, setTossResult] = useState<'Heads' | 'Tails' | null>(null);
  const [tossWinnerTeam, setTossWinnerTeam] = useState<0 | 1 | null>(null);

  // Silent Host Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Finished Match Modal State
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  // Store hook
  const {
    game,
    gameCode,
    startNewGame,
    recordRally,
    sideOut,
    overrideScore,
    undo,
    addShot,
    recordOutBy,
    dismissSwitchNotice,
    dismissSetNotice,
    callout,
  } = useGameStore();

  const handleStartGame = (skipToss = false) => {
    startNewGame({
      format,
      mode,
      targetScore,
      bestOf,
      teamNames: [team1Name, team2Name],
      isHost: true,
      code: 'D-7741',
    });

    if (skipToss) {
      setFlow('score');
    } else {
      setTossPick(null);
      setTossResult(null);
      setTossWinnerTeam(null);
      setFlow('toss');
    }
  };

  const handleFlipCoin = () => {
    if (!tossPick) return;
    const res: 'Heads' | 'Tails' = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setTossResult(res);
    setTossWinnerTeam(tossPick === res ? 0 : 1);
  };

  const handleTossChoice = (choice: 'serve' | 'receive' | 'side') => {
    // Winner chose
    setFlow('score');
  };

  const handleRallyClick = (teamIndex: 0 | 1) => {
    recordRally(teamIndex);
    if (game?.isGameOver) {
      setShowFinishedModal(true);
    }
  };

  const handleAddGuest = () => {
    if (!guestName.trim()) return;
    const emptyIndex = lobbySlots.findIndex((s, i) => !s && i < (format === 'doubles' ? 4 : 2));
    if (emptyIndex !== -1) {
      const updated = [...lobbySlots];
      updated[emptyIndex] = { name: guestName.trim(), dupr: 3.0, isGuest: true };
      setLobbySlots(updated);
      setGuestName('');
      setShowGuestInput(false);
    }
  };

  const handleSimulateJoin = (index: number) => {
    const unjoined = MOCK_PLAYERS.find((p) => !lobbySlots.some((s) => s && s.name === p.name)) || MOCK_PLAYERS[2];
    const updated = [...lobbySlots];
    updated[index] = { name: unjoined.name, dupr: unjoined.dupr };
    setLobbySlots(updated);
  };

  // Check if enough players to start
  const requiredCount = format === 'doubles' ? 4 : 2;
  const readyToStart = lobbySlots.slice(0, requiredCount).every(Boolean);

  // ==========================================
  // VIEW: SCORE SCREEN
  // ==========================================
  if (flow === 'score' && game) {
    const setsWonTeam0 = game.sets.filter((s) => s[0] > s[1]).length;
    const setsWonTeam1 = game.sets.filter((s) => s[1] > s[0]).length;
    const isMultiSet = game.bestOf > 1;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Match Header */}
        <View style={styles.scoreHeaderRow}>
          <View>
            <Text style={styles.scoreHeaderTitle}>
              {game.mode === 'dink' ? 'Dink Battle ' : ''}
              {game.format === 'doubles' ? 'Doubles' : 'Singles'} to {game.targetScore}
              {isMultiSet ? ' (Best of 3)' : ''}
            </Text>
            <Text style={styles.scoreHeaderCode}>
              {gameCode} &bull; {game.isHost ? 'Host' : 'Player'}
            </Text>
          </View>
          <TouchableOpacity style={styles.watchBadgeBtn} onPress={onOpenWatch}>
            <Text style={styles.watchBadgeText}>⌚ Watch</Text>
          </TouchableOpacity>
        </View>

        {/* Set Pills for Best of 3 */}
        {isMultiSet && (
          <View style={styles.setsRow}>
            {[0, 1, 2].map((setIdx) => {
              const completedSet = game.sets[setIdx];
              const isCurrent = setIdx === game.sets.length;
              return (
                <View
                  key={setIdx}
                  style={[styles.setPill, isCurrent && styles.setPillActive]}
                >
                  <Text style={[styles.setPillText, isCurrent && styles.setPillTextActive]}>
                    Set {setIdx + 1}
                    {completedSet ? ` (${completedSet[0]}-${completedSet[1]})` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Switch Ends Prompt */}
        {game.switchEndsNotice && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>🔄 Switch ends! First team reached 6 points.</Text>
            <TouchableOpacity onPress={dismissSwitchNotice}>
              <Text style={styles.dismissBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Next Set Notice */}
        {game.nextSetNotice && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>
              🎾 Set complete! {game.teamNames[game.servingTeam]} serves first in Set {game.sets.length + 1}.
            </Text>
            <TouchableOpacity onPress={dismissSetNotice}>
              <Text style={styles.dismissBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Big Scoreboard */}
        <View style={styles.scoreboardContainer}>
          {[0, 1].map((teamIdx) => {
            const isServing = game.servingTeam === teamIdx;
            const teamName = game.teamNames[teamIdx];
            const teamScore = game.currentScore[teamIdx];
            const setsWon = teamIdx === 0 ? setsWonTeam0 : setsWonTeam1;

            return (
              <View
                key={teamIdx}
                style={[
                  styles.teamScoreCard,
                  isServing && styles.teamScoreCardServing,
                ]}
              >
                <View style={styles.teamNameRow}>
                  {isServing && <View style={styles.servingDot} />}
                  <Text style={styles.teamScoreName} numberOfLines={1}>
                    {teamName}
                  </Text>
                </View>
                <Text style={styles.bigScoreNumber}>{teamScore}</Text>
                {isMultiSet && (
                  <Text style={styles.setsWonText}>Sets: {setsWon}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Audible / Visual Callout Display */}
        <View style={styles.calloutBox}>
          <Text style={styles.calloutString}>{callout()}</Text>
          <Text style={styles.servingInfo}>
            {game.teamNames[game.servingTeam]} serving
            {game.format === 'doubles' ? `, Server ${game.serverNumber}` : ''}
          </Text>
        </View>

        {/* Big Rally Outcome Buttons */}
        <View style={styles.rallyButtonsRow}>
          <TouchableOpacity
            style={[styles.rallyBtn, styles.rallyBtnTeam1]}
            onPress={() => handleRallyClick(0)}
          >
            <Text style={styles.rallyBtnText}>{game.teamNames[0]} won rally</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rallyBtn, styles.rallyBtnTeam2]}
            onPress={() => handleRallyClick(1)}
          >
            <Text style={styles.rallyBtnTextSecondary}>{game.teamNames[1]} won rally</Text>
          </TouchableOpacity>
        </View>

        {/* Dink Battle Half-Court Panel */}
        {game.mode === 'dink' && (
          <View style={styles.dinkCard}>
            <View style={styles.dinkCardHeader}>
              <Text style={styles.dinkCardTitle}>
                {game.shots >= 5 ? '⚡ Half Court Active' : 'Full Court Play'}
              </Text>
              <View style={[styles.shotBadge, game.shots >= 5 && styles.shotBadgeActive]}>
                <Text style={styles.shotBadgeText}>Shot {game.shots}</Text>
              </View>
            </View>

            <CourtDiagram isHalfCourt={game.shots >= 5} />

            <View style={styles.shotControlsRow}>
              <TouchableOpacity style={styles.shotBtn} onPress={addShot}>
                <Text style={styles.shotBtnText}>+ Shot Rally</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shotBtnSecondary} onPress={() => {}}>
                <Text style={styles.shotBtnSecondaryText}>Reset Rally</Text>
              </TouchableOpacity>
            </View>

            {game.shots >= 5 && (
              <View style={styles.outByRow}>
                <TouchableOpacity
                  style={styles.outByBtn}
                  onPress={() => recordOutBy(0)}
                >
                  <Text style={styles.outByText}>Out by {game.teamNames[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.outByBtn}
                  onPress={() => recordOutBy(1)}
                >
                  <Text style={styles.outByText}>Out by {game.teamNames[1]}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tactical Game Actions (Undo & Side Out) */}
        <View style={styles.tacticalActionsRow}>
          <TouchableOpacity style={styles.secondaryActionBtn} onPress={undo}>
            <Text style={styles.secondaryActionText}>↺ Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionBtn} onPress={sideOut}>
            <Text style={styles.secondaryActionText}>Side Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => setShowOverrideModal(true)}
          >
            <Text style={styles.secondaryActionText}>Host Override</Text>
          </TouchableOpacity>
        </View>

        {/* Match Statistics */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{game.ralliesCount}</Text>
            <Text style={styles.statLbl}>Rallies</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{game.sideOutsCount}</Text>
            <Text style={styles.statLbl}>Side Outs</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{game.format === 'doubles' ? '2v2' : '1v1'}</Text>
            <Text style={styles.statLbl}>Format</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.leaveGameBtn} onPress={() => setFlow('main')}>
          <Text style={styles.leaveGameText}>Return Home &bull; Keep Game Live</Text>
        </TouchableOpacity>

        {/* Silent Host Override Modal */}
        <Modal visible={showOverrideModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeader}>Silent Host Override</Text>
              <Text style={styles.modalSubtitle}>
                Adjust scores instantly without sending broadcast alerts to opponents.
              </Text>

              {[0, 1].map((teamIdx) => (
                <View key={teamIdx} style={styles.overrideRow}>
                  <Text style={styles.overrideTeamName}>{game.teamNames[teamIdx]}</Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => overrideScore(teamIdx as 0 | 1, Math.max(0, game.currentScore[teamIdx] - 1))}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepVal}>{game.currentScore[teamIdx]}</Text>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => overrideScore(teamIdx as 0 | 1, game.currentScore[teamIdx] + 1)}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.proposeBtn}
                onPress={() => setShowOverrideModal(false)}
              >
                <Text style={styles.proposeText}>Save Silent Adjustment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Match Finished Modal */}
        <Modal visible={showFinishedModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeader}>Match Completed! 🏆</Text>
              <Text style={styles.modalSubtitle}>
                Result saved to match history. DUPR sync is automatically queued.
              </Text>
              <TouchableOpacity
                style={styles.proposeBtn}
                onPress={() => {
                  setShowFinishedModal(false);
                  setFlow('main');
                }}
              >
                <Text style={styles.proposeText}>Done & Return Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  // ==========================================
  // VIEW: LOBBY SCREEN
  // ==========================================
  if (flow === 'lobby') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.navBackRow}>
          <TouchableOpacity onPress={() => setFlow('main')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.navBackTitle}>Game Lobby</Text>
        </View>

        {/* Match Format Toggle */}
        <View style={styles.segControl}>
          <TouchableOpacity
            style={[styles.segBtn, format === 'doubles' && styles.segBtnActive]}
            onPress={() => setFormat('doubles')}
          >
            <Text style={[styles.segText, format === 'doubles' && styles.segTextActive]}>
              Doubles 2v2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, format === 'singles' && styles.segBtnActive]}
            onPress={() => setFormat('singles')}
          >
            <Text style={[styles.segText, format === 'singles' && styles.segTextActive]}>
              Singles 1v1
            </Text>
          </TouchableOpacity>
        </View>

        {/* Join Code Display */}
        <View style={styles.joinCodeCard}>
          <View>
            <Text style={styles.joinCodeLabel}>Game Join Code</Text>
            <Text style={styles.joinCodeText}>D-7741</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn}>
            <Text style={styles.copyBtnText}>Copy Code</Text>
          </TouchableOpacity>
        </View>

        {/* Player Slots */}
        <Text style={styles.sectionHeading}>
          Players ({lobbySlots.filter(Boolean).length}/{requiredCount})
        </Text>
        <View style={styles.slotsList}>
          {lobbySlots.slice(0, requiredCount).map((slot, idx) =>
            slot ? (
              <View key={idx} style={styles.slotCard}>
                <View style={styles.avatarSm}>
                  <Text style={styles.avatarSmText}>{slot.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotName}>
                    {slot.name} {slot.isHost ? '(Host)' : ''}
                  </Text>
                  <Text style={styles.slotMeta}>
                    {slot.dupr.toFixed(1)} DUPR {slot.isGuest ? '• Guest (No app)' : ''}
                  </Text>
                </View>
                <View style={styles.readyBadge}>
                  <Text style={styles.readyBadgeText}>
                    {slot.isHost ? 'Host' : 'Ready'}
                  </Text>
                </View>
              </View>
            ) : (
              <View key={idx} style={[styles.slotCard, styles.emptySlotCard]}>
                <View style={styles.emptyAvatar}>
                  <Text style={styles.emptyAvatarText}>?</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emptySlotName}>Waiting for player...</Text>
                  <Text style={styles.emptySlotMeta}>Share join code D-7741</Text>
                </View>
                <TouchableOpacity
                  style={styles.simJoinBtn}
                  onPress={() => handleSimulateJoin(idx)}
                >
                  <Text style={styles.simJoinText}>Simulate Join</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        {/* Add Guest Player Form */}
        {showGuestInput ? (
          <View style={styles.guestInputRow}>
            <TextInput
              style={styles.guestTextInput}
              placeholder="Guest Player Name"
              placeholderTextColor="#999"
              value={guestName}
              onChangeText={setGuestName}
            />
            <TouchableOpacity style={styles.addGuestBtn} onPress={handleAddGuest}>
              <Text style={styles.addGuestText}>Add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.showGuestBtn}
            onPress={() => setShowGuestInput(true)}
          >
            <Text style={styles.showGuestText}>+ Add Guest Player (No App Needed)</Text>
          </TouchableOpacity>
        )}

        {/* Team Names Inputs */}
        <Text style={styles.inputLabel}>Team Names (Default to Initials, Editable)</Text>
        <View style={styles.teamInputsRow}>
          <TextInput
            style={styles.teamInput}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Team 1"
          />
          <TextInput
            style={styles.teamInput}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Team 2"
          />
        </View>

        {/* Play Variation Mode */}
        <Text style={styles.inputLabel}>Game Mode</Text>
        <View style={styles.segControl}>
          <TouchableOpacity
            style={[styles.segBtn, mode === 'classic' && styles.segBtnActive]}
            onPress={() => setMode('classic')}
          >
            <Text style={[styles.segText, mode === 'classic' && styles.segTextActive]}>
              Classic Pickleball
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, mode === 'dink' && styles.segBtnActive]}
            onPress={() => setMode('dink')}
          >
            <Text style={[styles.segText, mode === 'dink' && styles.segTextActive]}>
              Dink Battle (Pilot)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Target Score & Match Format */}
        <View style={styles.twoColOptions}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Game To</Text>
            <View style={styles.segControl}>
              <TouchableOpacity
                style={[styles.segBtn, targetScore === 11 && styles.segBtnActive]}
                onPress={() => setTargetScore(11)}
              >
                <Text style={[styles.segText, targetScore === 11 && styles.segTextActive]}>11</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segBtn, targetScore === 15 && styles.segBtnActive]}
                onPress={() => setTargetScore(15)}
              >
                <Text style={[styles.segText, targetScore === 15 && styles.segTextActive]}>15</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Match</Text>
            <View style={styles.segControl}>
              <TouchableOpacity
                style={[styles.segBtn, bestOf === 1 && styles.segBtnActive]}
                onPress={() => setBestOf(1)}
              >
                <Text style={[styles.segText, bestOf === 1 && styles.segTextActive]}>1 Game</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segBtn, bestOf === 3 && styles.segBtnActive]}
                onPress={() => setBestOf(3)}
              >
                <Text style={[styles.segText, bestOf === 3 && styles.segTextActive]}>Best of 3</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Start Game Action */}
        <TouchableOpacity
          style={[styles.primaryActionBtn, !readyToStart && styles.btnDisabled]}
          disabled={!readyToStart}
          onPress={() => handleStartGame(false)}
        >
          <Text style={styles.primaryActionText}>
            {readyToStart ? 'Start Game & Go to Toss' : 'Waiting for Players...'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ghostActionBtn, !readyToStart && styles.btnDisabled]}
          disabled={!readyToStart}
          onPress={() => handleStartGame(true)}
        >
          <Text style={styles.ghostActionText}>Skip Toss & Start Scoring</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ==========================================
  // VIEW: JOIN SCREEN
  // ==========================================
  if (flow === 'join') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.navBackRow}>
          <TouchableOpacity onPress={() => setFlow('main')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.navBackTitle}>Join Game</Text>
        </View>

        <Text style={styles.joinInstructions}>
          Got a D code from a friend? Enter it below. Your uppercase keyboard opens automatically.
        </Text>

        <View style={styles.dCodeInputContainer}>
          <View style={styles.dCodePrefix}>
            <Text style={styles.dCodePrefixText}>D-</Text>
          </View>
          <TextInput
            style={styles.dCodeInputField}
            placeholder="7741"
            placeholderTextColor="#AAA"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            value={joinInput}
            onChangeText={(text) => {
              const cleaned = text.toUpperCase().replace(/^D-?/, '').replace(/[^A-Z0-9]/g, '');
              setJoinInput(cleaned);
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryActionBtn, joinInput.length < 4 && styles.btnDisabled]}
          disabled={joinInput.length < 4}
          onPress={() => {
            startNewGame({
              format: 'doubles',
              mode: 'classic',
              teamNames: ['AJ & MR', 'JC & SK'],
              code: `D-${joinInput}`,
              isHost: false,
            });
            setFlow('score');
          }}
        >
          <Text style={styles.primaryActionText}>Join Lobby</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostActionBtn}>
          <Text style={styles.ghostActionText}>📷 Scan QR Code Instead</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ==========================================
  // VIEW: TOSS SCREEN
  // ==========================================
  if (flow === 'toss') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.navBackRow}>
          <TouchableOpacity onPress={() => setFlow('lobby')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Lobby</Text>
          </TouchableOpacity>
          <Text style={styles.navBackTitle}>Coin Toss</Text>
        </View>

        <Text style={styles.joinInstructions}>
          {team1Name} calls the toss. Winner picks Serve, Receive, or Side.
        </Text>

        {!tossResult ? (
          <>
            <View style={styles.segControl}>
              <TouchableOpacity
                style={[styles.segBtn, tossPick === 'Heads' && styles.segBtnActive]}
                onPress={() => setTossPick('Heads')}
              >
                <Text style={[styles.segText, tossPick === 'Heads' && styles.segTextActive]}>
                  Heads
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segBtn, tossPick === 'Tails' && styles.segBtnActive]}
                onPress={() => setTossPick('Tails')}
              >
                <Text style={[styles.segText, tossPick === 'Tails' && styles.segTextActive]}>
                  Tails
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coinGraphic}>
              <Text style={styles.coinGraphicText}>🪙</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryActionBtn, !tossPick && styles.btnDisabled]}
              disabled={!tossPick}
              onPress={handleFlipCoin}
            >
              <Text style={styles.primaryActionText}>
                {tossPick ? 'Flip Coin' : 'Pick Heads or Tails'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.tossResultCard}>
              <Text style={styles.tossResultTitle}>
                {tossWinnerTeam === 0 ? team1Name : team2Name} Won the Toss!
              </Text>
              <Text style={styles.tossResultSubtitle}>
                Coin landed on <Text style={{ fontWeight: '800' }}>{tossResult}</Text>.
              </Text>
            </View>

            <Text style={styles.inputLabel}>
              {tossWinnerTeam === 0 ? team1Name : team2Name}, choose your advantage:
            </Text>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => handleTossChoice('serve')}
            >
              <Text style={styles.primaryActionText}>Serve First</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostActionBtn}
              onPress={() => handleTossChoice('receive')}
            >
              <Text style={styles.ghostActionText}>Receive First</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostActionBtn}
              onPress={() => handleTossChoice('side')}
            >
              <Text style={styles.ghostActionText}>Pick Side (Opponent Serves)</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  }

  // ==========================================
  // VIEW: MAIN HOME SCREEN (PLAY TAB)
  // ==========================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Status Bar */}
      <View style={styles.userGreetingRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{CURRENT_USER.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingTitle}>gm, {CURRENT_USER.name.split(' ')[0]}</Text>
          <Text style={styles.userPermanentId}>{CURRENT_USER.id} &bull; 3.5 DUPR</Text>
        </View>
      </View>

      {/* Sport Selector Pills */}
      <View style={styles.sportsRow}>
        <View style={styles.sportPillActive}>
          <Text style={styles.sportPillActiveText}>Pickleball</Text>
        </View>
        <View style={styles.sportPillDisabled}>
          <Text style={styles.sportPillDisabledText}>Tennis (Phase 2)</Text>
        </View>
        <View style={styles.sportPillDisabled}>
          <Text style={styles.sportPillDisabledText}>Badminton (Phase 3)</Text>
        </View>
      </View>

      {/* Live Resume Banner (if game active) */}
      {game && !game.isGameOver && (
        <TouchableOpacity
          style={styles.liveResumePill}
          onPress={() => setFlow('score')}
        >
          <View>
            <Text style={styles.liveResumeTitle}>
              Live Game {gameCode} ({game.currentScore[0]}-{game.currentScore[1]})
            </Text>
            <Text style={styles.liveResumeSubtitle}>Tap to resume scoring</Text>
          </View>
          <Text style={styles.liveResumeArrow}>Resume →</Text>
        </TouchableOpacity>
      )}

      {/* Next Planned Match Card */}
      <View style={styles.plannedMatchCard}>
        <Text style={styles.plannedTag}>Upcoming Match</Text>
        <View style={styles.plannedDetailsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plannedTitle}>Open Play @ Barton Springs</Text>
            <Text style={styles.plannedSubtitle}>6:30 PM &bull; Maya & Jordan confirmed</Text>
          </View>
          <TouchableOpacity style={styles.plannedLobbyBtn} onPress={() => setFlow('lobby')}>
            <Text style={styles.plannedLobbyBtnText}>Open Lobby</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action 2x2 Grid */}
      <Text style={styles.sectionHeading}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => setFlow('lobby')}>
          <Text style={styles.quickIcon}>➕</Text>
          <Text style={styles.quickTitle}>New Game</Text>
          <Text style={styles.quickDesc}>Create 2v2 lobby & code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => setFlow('join')}>
          <Text style={styles.quickIcon}>🔑</Text>
          <Text style={styles.quickTitle}>Join with D Code</Text>
          <Text style={styles.quickDesc}>Enter code like D-7741</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => setFlow('toss')}>
          <Text style={styles.quickIcon}>🪙</Text>
          <Text style={styles.quickTitle}>Coin Toss</Text>
          <Text style={styles.quickDesc}>Decide who serves first</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={onNavigateCourts}>
          <Text style={styles.quickIcon}>📍</Text>
          <Text style={styles.quickTitle}>Find a Court</Text>
          <Text style={styles.quickDesc}>Free & bookable spots</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Games */}
      <Text style={styles.sectionHeading}>Recent Matches</Text>
      <View style={styles.recentList}>
        {MOCK_RECENT_GAMES.map((match, i) => (
          <View key={i} style={styles.recentMatchCard}>
            <View
              style={[
                styles.resultTag,
                match.result === 'W' ? styles.resultTagWin : styles.resultTagLoss,
              ]}
            >
              <Text
                style={[
                  styles.resultTagText,
                  match.result === 'W' ? styles.resultTagTextWin : styles.resultTagTextLoss,
                ]}
              >
                {match.result}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentVsText}>{match.vs}</Text>
              <Text style={styles.recentMetaText}>
                {match.when} &bull; {match.kind} &bull; {match.score}
              </Text>
            </View>
            <Text style={styles.duprSyncedBadge}>{match.duprStatus}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  userGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A5C43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  userPermanentId: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sportsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sportPillActive: {
    backgroundColor: '#0A5C43',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  sportPillActiveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sportPillDisabled: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  sportPillDisabledText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
  liveResumePill: {
    backgroundColor: '#0A5C43',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveResumeTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  liveResumeSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  liveResumeArrow: {
    color: '#EF9F27',
    fontSize: 14,
    fontWeight: '800',
  },
  plannedMatchCard: {
    backgroundColor: '#E8F7F1',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.2)',
    marginBottom: 18,
  },
  plannedTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5C43',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  plannedDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plannedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  plannedSubtitle: {
    fontSize: 12.5,
    color: '#0A5C43',
    marginTop: 2,
  },
  plannedLobbyBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  plannedLobbyBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  quickCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    width: '48%',
  },
  quickIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111',
  },
  quickDesc: {
    fontSize: 11.5,
    color: '#666',
    marginTop: 2,
  },
  recentList: {
    gap: 8,
  },
  recentMatchCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultTag: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTagWin: {
    backgroundColor: '#E8F7F1',
  },
  resultTagLoss: {
    backgroundColor: '#F2F1EC',
  },
  resultTagText: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultTagTextWin: {
    color: '#0A5C43',
  },
  resultTagTextLoss: {
    color: '#666',
  },
  recentVsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  recentMetaText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  duprSyncedBadge: {
    fontSize: 11,
    color: '#0A5C43',
    fontWeight: '600',
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  // Scoring View Specific Styles
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  scoreHeaderCode: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  watchBadgeBtn: {
    backgroundColor: '#111',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  watchBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  setsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  setPill: {
    backgroundColor: '#FFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  setPillActive: {
    backgroundColor: '#0A5C43',
    borderColor: '#0A5C43',
  },
  setPillText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  setPillTextActive: {
    color: '#FFF',
  },
  alertBanner: {
    backgroundColor: '#FEF3E2',
    borderWidth: 1,
    borderColor: '#FAC775',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertBannerText: {
    fontSize: 12.5,
    color: '#7A4A00',
    fontWeight: '600',
    flex: 1,
  },
  dismissBtnText: {
    fontSize: 14,
    color: '#7A4A00',
    fontWeight: '700',
    paddingLeft: 8,
  },
  scoreboardContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  teamScoreCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
    alignItems: 'center',
  },
  teamScoreCardServing: {
    borderColor: '#0A5C43',
    backgroundColor: '#FAFDFB',
    shadowColor: '#0A5C43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  servingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF9F27',
  },
  teamScoreName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  bigScoreNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -2,
  },
  setsWonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
  },
  calloutBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  calloutString: {
    fontFamily: 'Courier',
    fontSize: 32,
    fontWeight: '700',
    color: '#0A5C43',
    letterSpacing: 2,
  },
  servingInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  rallyButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  rallyBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rallyBtnTeam1: {
    backgroundColor: '#0A5C43',
  },
  rallyBtnTeam2: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#0A5C43',
  },
  rallyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  rallyBtnTextSecondary: {
    color: '#0A5C43',
    fontSize: 15,
    fontWeight: '800',
  },
  dinkCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    marginBottom: 14,
  },
  dinkCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dinkCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },
  shotBadge: {
    backgroundColor: '#F2F1EC',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  shotBadgeActive: {
    backgroundColor: '#EF9F27',
  },
  shotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111',
  },
  shotControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  shotBtn: {
    flex: 1,
    backgroundColor: '#E8F7F1',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  shotBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A5C43',
  },
  shotBtnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F2F1EC',
  },
  shotBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  outByRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  outByBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  outByText: {
    color: '#B91C1C',
    fontSize: 12.5,
    fontWeight: '700',
  },
  tacticalActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontFamily: 'Courier',
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  statLbl: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  leaveGameBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  leaveGameText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },

  // Lobby & Join Styles
  navBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: '#0A5C43',
    fontWeight: '700',
  },
  navBackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  segControl: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 3,
    marginBottom: 12,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  segBtnActive: {
    backgroundColor: '#0A5C43',
  },
  segText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  segTextActive: {
    color: '#FFF',
  },
  joinCodeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  joinCodeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  joinCodeText: {
    fontFamily: 'Courier',
    fontSize: 32,
    fontWeight: '800',
    color: '#0A5C43',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: '#F2F1EC',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  slotsList: {
    gap: 8,
    marginBottom: 12,
  },
  slotCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptySlotCard: {
    borderStyle: 'dashed',
    backgroundColor: '#FAF8F3',
  },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A5C43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE8E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAvatarText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '700',
  },
  slotName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  slotMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  emptySlotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  emptySlotMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  readyBadge: {
    backgroundColor: '#E8F7F1',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  readyBadgeText: {
    fontSize: 11,
    color: '#0A5C43',
    fontWeight: '700',
  },
  simJoinBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  simJoinText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  showGuestBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  showGuestText: {
    fontSize: 13,
    color: '#0A5C43',
    fontWeight: '700',
  },
  guestInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  guestTextInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addGuestBtn: {
    backgroundColor: '#0A5C43',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addGuestText: {
    color: '#FFF',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 6,
    marginTop: 6,
  },
  teamInputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  teamInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  twoColOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  primaryActionBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ghostActionBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  ghostActionText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  joinInstructions: {
    fontSize: 13.5,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  dCodeInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0A5C43',
    overflow: 'hidden',
    marginBottom: 16,
  },
  dCodePrefix: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#0A5C43',
  },
  dCodePrefixText: {
    fontFamily: 'Courier',
    fontSize: 24,
    fontWeight: '800',
    color: '#0A5C43',
  },
  dCodeInputField: {
    flex: 1,
    fontFamily: 'Courier',
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    paddingHorizontal: 14,
    paddingVertical: 12,
    letterSpacing: 4,
  },
  coinGraphic: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  coinGraphicText: {
    fontSize: 72,
  },
  tossResultCard: {
    backgroundColor: '#E8F7F1',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#5DCAA5',
  },
  tossResultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A5C43',
    marginBottom: 4,
  },
  tossResultSubtitle: {
    fontSize: 14,
    color: '#111',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  overrideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  overrideTeamName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F2F1EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepVal: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  proposeBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  proposeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
