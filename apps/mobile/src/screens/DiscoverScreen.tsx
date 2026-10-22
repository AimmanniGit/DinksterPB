import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { MOCK_PLAYERS, MOCK_OPEN_GAMES, CURRENT_USER } from '../constants/mockData';
import { PlayerProfile } from '@dinkster/shared';

interface DiscoverScreenProps {
  onStartLobbyWith?: (player: PlayerProfile) => void;
  onOpenChatWith?: (playerName: string) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onStartLobbyWith,
  onOpenChatWith,
}) => {
  const [mode, setMode] = useState<'people' | 'games'>('people');
  const [filter, setFilter] = useState<'all' | 'liked' | 'level' | 'weekends' | 'singles' | 'doubles'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedPlayer, setMatchedPlayer] = useState<PlayerProfile | null>(null);
  const [metCount, setMetCount] = useState(1);
  const [joinedGames, setJoinedGames] = useState<{ [id: string]: boolean }>({});

  const filteredPlayers = MOCK_PLAYERS.filter((p) => {
    if (filter === 'liked') return p.likesYou;
    if (filter === 'level') return Math.abs(p.dupr - CURRENT_USER.dupr) <= 0.5;
    if (filter === 'weekends') return p.whyMatch.toLowerCase().includes('weekend');
    if (filter === 'singles') return p.lookingFor.toLowerCase().includes('singles');
    if (filter === 'doubles') return p.lookingFor.toLowerCase().includes('doubles');
    return true;
  });

  const currentPlayer = filteredPlayers[currentIndex];
  const nextPlayer = filteredPlayers[currentIndex + 1];

  const handlePass = () => {
    if (currentIndex < filteredPlayers.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleLike = (isSuper = false) => {
    if (!currentPlayer) return;
    if (currentPlayer.likesYou || isSuper) {
      setMatchedPlayer(currentPlayer);
      setMetCount((prev) => Math.min(3, prev + 1));
    }
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Meet Players</Text>
        <Text style={styles.pageSubtitle}>Swipe to find your next regular game partner</Text>
      </View>

      {/* Mode Segment (People vs Open Games) */}
      <View style={styles.segControl}>
        <TouchableOpacity
          style={[styles.segBtn, mode === 'people' && styles.segBtnActive]}
          onPress={() => setMode('people')}
        >
          <Text style={[styles.segText, mode === 'people' && styles.segTextActive]}>People</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segBtn, mode === 'games' && styles.segBtnActive]}
          onPress={() => setMode('games')}
        >
          <Text style={[styles.segText, mode === 'games' && styles.segTextActive]}>Open Games</Text>
        </TouchableOpacity>
      </View>

      {mode === 'people' ? (
        <>
          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {[
              { key: 'all', label: 'All' },
              { key: 'liked', label: `Liked you (${MOCK_PLAYERS.filter((p) => p.likesYou).length})` },
              { key: 'level', label: 'My Level (±0.5)' },
              { key: 'weekends', label: 'Weekends' },
              { key: 'doubles', label: 'Doubles' },
              { key: 'singles', label: 'Singles' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, filter === f.key && styles.chipActive]}
                onPress={() => {
                  setFilter(f.key as any);
                  setCurrentIndex(0);
                }}
              >
                <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Swipe Card Deck */}
          {currentPlayer ? (
            <View style={styles.deckContainer}>
              {/* Back Card Preview */}
              {nextPlayer && (
                <View style={[styles.card, styles.backCard]}>
                  <Text style={styles.nameText}>{nextPlayer.name}</Text>
                  <Text style={styles.distanceText}>
                    {nextPlayer.dupr.toFixed(1)} DUPR &bull; {nextPlayer.distance}
                  </Text>
                </View>
              )}

              {/* Front Active Player Card */}
              <View style={[styles.card, styles.frontCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{currentPlayer.initials}</Text>
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.nameText}>{currentPlayer.name}</Text>
                      {currentPlayer.verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
                    </View>
                    <Text style={styles.distanceText}>
                      {currentPlayer.distance} away &bull; {currentPlayer.gamesPlayed} games
                    </Text>
                    <Text style={styles.dinksterId}>{currentPlayer.id}</Text>
                  </View>
                </View>

                {/* Vibe and Compatibility Tags */}
                <View style={styles.tagRow}>
                  <Text style={styles.duprTag}>{currentPlayer.dupr.toFixed(1)} DUPR</Text>
                  {currentPlayer.likesYou && <Text style={styles.likedTag}>Liked You</Text>}
                  {currentPlayer.vibeTags.map((vibe, idx) => (
                    <Text key={idx} style={styles.vibeTag}>
                      {vibe}
                    </Text>
                  ))}
                </View>

                {/* Looking For Card */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Looking for</Text>
                  <Text style={styles.infoValue}>{currentPlayer.lookingFor}</Text>
                </View>

                {/* Social Prompt */}
                <View style={[styles.infoBox, styles.promptBox]}>
                  <Text style={styles.infoLabel}>{currentPlayer.promptQuestion}</Text>
                  <Text style={styles.infoValue}>"{currentPlayer.promptAnswer}"</Text>
                </View>

                {/* Why You Match */}
                <View style={styles.matchReasonBox}>
                  <Text style={styles.matchReasonText}>
                    ⚡ <Text style={{ fontWeight: '700' }}>Why you match:</Text> {currentPlayer.whyMatch}
                  </Text>
                </View>

                {/* Swipe Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.passBtn} onPress={handlePass}>
                    <Text style={styles.actionIcon}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.superBtn} onPress={() => handleLike(true)}>
                    <Text style={[styles.actionIcon, { color: '#B45309' }]}>★</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(false)}>
                    <Text style={[styles.actionIcon, { color: '#FFF' }]}>♥</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>You're all caught up!</Text>
              <Text style={styles.emptySubtitle}>
                No more players matching this filter. Try switching filters or start an open game.
              </Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setCurrentIndex(0)}>
                <Text style={styles.resetText}>Review Profiles Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Weekly Meet Goal */}
          <View style={styles.goalCard}>
            <View>
              <Text style={styles.goalTitle}>Meet 3 new players this week</Text>
              <Text style={styles.goalSubtitle}>{metCount} of 3 connected so far</Text>
            </View>
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((dotIndex) => (
                <View
                  key={dotIndex}
                  style={[
                    styles.goalDot,
                    dotIndex < metCount ? styles.goalDotFilled : styles.goalDotEmpty,
                  ]}
                />
              ))}
            </View>
          </View>
        </>
      ) : (
        /* Open Games Mode */
        <View style={styles.gamesList}>
          <Text style={styles.sectionHeading}>Open Games Forming Near You</Text>
          {MOCK_OPEN_GAMES.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDetails}>
                  {game.when} &bull; {game.venue}
                </Text>
                <Text style={styles.gameHost}>
                  Hosted by {game.host} &bull; {game.joined} spots filled
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.joinGameBtn,
                  joinedGames[game.id] && styles.joinGameBtnActive,
                ]}
                onPress={() =>
                  setJoinedGames((prev) => ({ ...prev, [game.id]: !prev[game.id] }))
                }
              >
                <Text
                  style={[
                    styles.joinGameText,
                    joinedGames[game.id] && styles.joinGameTextActive,
                  ]}
                >
                  {joinedGames[game.id] ? 'Requested' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Match Celebration Modal */}
      {matchedPlayer && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeader}>It's a Match! 🎉</Text>
              <Text style={styles.modalSubtitle}>
                You and {matchedPlayer.name} both want to play.
              </Text>

              {/* Overlapping Avatars */}
              <View style={styles.avatarPairRow}>
                <View style={[styles.avatar, styles.matchAvatar]}>
                  <Text style={styles.avatarText}>{CURRENT_USER.initials}</Text>
                </View>
                <View style={[styles.avatar, styles.matchAvatar, styles.overlapAvatar]}>
                  <Text style={styles.avatarText}>{matchedPlayer.initials}</Text>
                </View>
              </View>

              <Text style={styles.matchWhyText}>{matchedPlayer.whyMatch}</Text>

              <TouchableOpacity
                style={styles.proposeBtn}
                onPress={() => {
                  const p = matchedPlayer;
                  setMatchedPlayer(null);
                  if (onStartLobbyWith) onStartLobbyWith(p);
                }}
              >
                <Text style={styles.proposeText}>Propose a Game (Lobby)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sayHiBtn}
                onPress={() => {
                  const name = matchedPlayer.name;
                  setMatchedPlayer(null);
                  if (onOpenChatWith) onOpenChatWith(name);
                }}
              >
                <Text style={styles.sayHiText}>Say Hi in Crew Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keepSwipingBtn}
                onPress={() => setMatchedPlayer(null)}
              >
                <Text style={styles.keepSwipingText}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  header: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A5C43',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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
    paddingVertical: 7,
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
  filterBar: {
    marginBottom: 14,
    maxHeight: 38,
  },
  chip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0A5C43',
    borderColor: '#0A5C43',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  chipTextActive: {
    color: '#FFF',
  },
  deckContainer: {
    position: 'relative',
    height: 480,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    padding: 18,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  backCard: {
    transform: [{ scale: 0.94 }, { translateY: 16 }],
    opacity: 0.6,
  },
  frontCard: {
    zIndex: 10,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0A5C43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#0A5C43',
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  dinksterId: {
    fontFamily: 'Courier',
    fontSize: 11.5,
    color: '#888',
    marginTop: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  duprTag: {
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: '#FEF3E2',
    color: '#7A4A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  likedTag: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#E8F7F1',
    color: '#0A5C43',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vibeTag: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#F2F1EC',
    color: '#444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoBox: {
    backgroundColor: '#F8F7F3',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  promptBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13.5,
    color: '#111',
    fontWeight: '600',
    marginTop: 2,
  },
  matchReasonBox: {
    paddingVertical: 4,
  },
  matchReasonText: {
    fontSize: 12.5,
    color: '#333',
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    marginTop: 6,
  },
  passBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E24B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  superBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3E2',
    borderWidth: 2,
    borderColor: '#FAC775',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A5C43',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A5C43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E24B4A',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 30,
    alignItems: 'center',
    marginVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  resetText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  goalCard: {
    backgroundColor: '#E8F7F1',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.2)',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A5C43',
  },
  goalSubtitle: {
    fontSize: 12,
    color: '#0A5C43',
    opacity: 0.8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalDotFilled: {
    backgroundColor: '#0A5C43',
  },
  goalDotEmpty: {
    backgroundColor: 'rgba(10, 92, 67, 0.2)',
  },
  gamesList: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  gameCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  gameDetails: {
    fontSize: 12.5,
    color: '#666',
    marginTop: 2,
  },
  gameHost: {
    fontSize: 12,
    color: '#0A5C43',
    fontWeight: '600',
    marginTop: 2,
  },
  joinGameBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  joinGameBtnActive: {
    backgroundColor: '#F2F1EC',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  joinGameText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  joinGameTextActive: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A5C43',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  avatarPairRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  matchAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  overlapAvatar: {
    marginLeft: -16,
    backgroundColor: '#EF9F27',
  },
  matchWhyText: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  proposeBtn: {
    backgroundColor: '#0A5C43',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  proposeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sayHiBtn: {
    backgroundColor: '#F2F1EC',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  sayHiText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
  keepSwipingBtn: {
    paddingVertical: 8,
  },
  keepSwipingText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
});
