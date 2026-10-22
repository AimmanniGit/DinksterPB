import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useGameStore } from '../stores/gameStore';

interface WatchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WatchModal: React.FC<WatchModalProps> = ({ visible, onClose }) => {
  const [watchView, setWatchView] = useState<'score' | 'comp' | 'note'>('score');
  const { game, recordRally, undo } = useGameStore();

  const team1 = game?.teamNames[0] || 'AJ & MR';
  const team2 = game?.teamNames[1] || 'JC & SK';
  const score1 = game?.currentScore[0] ?? 4;
  const score2 = game?.currentScore[1] ?? 3;
  const servingTeam = game?.servingTeam ?? 0;
  const serverNumber = game?.serverNumber ?? 2;
  const servingName = servingTeam === 0 ? team1 : team2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Apple Watch Companion</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Physical Apple Watch Enclosure */}
          <View style={styles.watchBezel}>
            <View style={styles.watchScreen}>
              {watchView === 'score' && (
                <>
                  <Text style={styles.matchupText}>
                    {team1} vs {team2}
                  </Text>
                  <Text style={styles.scoreText}>
                    {score1} - {score2}
                  </Text>
                  <Text style={styles.serverText}>
                    {servingName} serving, S{serverNumber}
                  </Text>

                  {/* Tap to Score Target Buttons */}
                  <View style={styles.watchButtonRow}>
                    <TouchableOpacity
                      style={styles.watchActionBtn}
                      onPress={() => recordRally(0)}
                    >
                      <Text style={styles.watchActionText}>+{team1.slice(0, 5)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.watchActionBtn, styles.watchActionSecondary]}
                      onPress={() => recordRally(1)}
                    >
                      <Text style={styles.watchActionTextSecondary}>+{team2.slice(0, 5)}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {watchView === 'comp' && (
                <>
                  <Text style={styles.matchupText}>Dinkster Live</Text>
                  <Text style={[styles.scoreText, { fontSize: 34 }]}>
                    {score1} - {score2}
                  </Text>
                  <Text style={styles.complicationCallout}>
                    {score1}-{score2}-{serverNumber}
                  </Text>
                </>
              )}

              {watchView === 'note' && (
                <>
                  <Text style={styles.matchupText}>Game Invite</Text>
                  <Text style={styles.inviteTitle}>Maya R. is hosting</Text>
                  <Text style={styles.inviteSubtitle}>D-7741 &bull; Starts in 10m</Text>
                  <View style={styles.watchButtonRow}>
                    <TouchableOpacity style={styles.watchActionBtn}>
                      <Text style={styles.watchActionText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.watchActionBtn, styles.watchActionSecondary]}
                      onPress={() => setWatchView('score')}
                    >
                      <Text style={styles.watchActionTextSecondary}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Digital Crown Undo */}
          {watchView === 'score' && (
            <TouchableOpacity style={styles.crownUndoBtn} onPress={undo}>
              <Text style={styles.crownUndoText}>↺ Turn Digital Crown to Undo</Text>
            </TouchableOpacity>
          )}

          {/* Face View Tabs */}
          <View style={styles.segTabs}>
            {(['score', 'comp', 'note'] as const).map((view) => (
              <TouchableOpacity
                key={view}
                style={[styles.segBtn, watchView === view && styles.segBtnActive]}
                onPress={() => setWatchView(view)}
              >
                <Text style={[styles.segBtnText, watchView === view && styles.segBtnTextActive]}>
                  {view === 'score' ? 'Score' : view === 'comp' ? 'Complication' : 'Notification'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF8F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '700',
  },
  watchBezel: {
    width: 220,
    height: 250,
    borderRadius: 48,
    backgroundColor: '#000',
    borderWidth: 8,
    borderColor: '#2B2B2B',
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  watchScreen: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchupText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '800',
    fontFamily: 'Courier',
    letterSpacing: -1,
  },
  serverText: {
    color: '#EF9F27',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 10,
  },
  watchButtonRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  watchActionBtn: {
    backgroundColor: '#0A5C43',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  watchActionSecondary: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#444',
  },
  watchActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  watchActionTextSecondary: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '600',
  },
  complicationCallout: {
    color: '#5DCAA5',
    fontFamily: 'Courier',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  inviteTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  inviteSubtitle: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 12,
  },
  crownUndoBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  crownUndoText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  segTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 3,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    width: '100%',
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
  segBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  segBtnTextActive: {
    color: '#FFF',
  },
});
