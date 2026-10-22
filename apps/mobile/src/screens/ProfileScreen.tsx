import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CURRENT_USER, MOCK_RECENT_GAMES } from '../constants/mockData';

interface ProfileScreenProps {
  onOpenWatch: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenWatch }) => {
  const [mode, setMode] = useState<'player' | 'coach'>('player');
  const [isSyncingDupr, setIsSyncingDupr] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Synced 2h ago');
  const [duprDoubles, setDuprDoubles] = useState(3.842);
  const [duprSingles, setDuprSingles] = useState(3.615);

  const handleSyncDupr = () => {
    setIsSyncingDupr(true);
    setTimeout(() => {
      setIsSyncingDupr(false);
      setLastSyncText('Just now &bull; Verified via DUPR API');
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarLg}>
          <Text style={styles.avatarLgText}>{CURRENT_USER.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{CURRENT_USER.name}</Text>
          <Text style={styles.userLocation}>Austin, TX &bull; Member since Mar 2026</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.duprBadge}>{CURRENT_USER.dupr.toFixed(1)} DUPR</Text>
            <Text style={styles.syncedBadge}>✓ DUPR Synced</Text>
          </View>
        </View>
      </View>

      {/* Player Mode vs Coach Mode Toggle */}
      <View style={styles.segControl}>
        <TouchableOpacity
          style={[styles.segBtn, mode === 'player' && styles.segBtnActive]}
          onPress={() => setMode('player')}
        >
          <Text style={[styles.segText, mode === 'player' && styles.segTextActive]}>
            Player Mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segBtn, mode === 'coach' && styles.segBtnActive]}
          onPress={() => setMode('coach')}
        >
          <Text style={[styles.segText, mode === 'coach' && styles.segTextActive]}>
            Coach Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* KPI Stats */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Games</Text>
          <Text style={styles.kpiValue}>47</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Win Rate</Text>
          <Text style={styles.kpiValue}>62%</Text>
        </View>
      </View>

      {/* Official DUPR Verified Rating Card & 6-Month Trend (Priority #3) */}
      <View style={styles.duprVerifiedCard}>
        <View style={styles.duprCardHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.duprCardTitle}>Official DUPR Rating</Text>
              <View style={styles.duprVerifiedPill}>
                <Text style={styles.duprVerifiedPillText}>✓ Verified</Text>
              </View>
            </View>
            <Text style={styles.duprCardSub}>Linked to DUPR-8X92KP &bull; {lastSyncText}</Text>
          </View>
          <TouchableOpacity
            style={[styles.syncDuprBtn, isSyncingDupr && styles.syncDuprBtnActive]}
            onPress={handleSyncDupr}
            disabled={isSyncingDupr}
          >
            <Text style={styles.syncDuprBtnText}>
              {isSyncingDupr ? 'Syncing...' : '🔄 Sync DUPR'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rating Split: Doubles vs Singles */}
        <View style={styles.duprRatingGrid}>
          <View style={styles.duprRatingBox}>
            <Text style={styles.duprRatingType}>Doubles Rating</Text>
            <Text style={styles.duprRatingBig}>{duprDoubles.toFixed(3)}</Text>
            <Text style={styles.duprReliabilityText}>High Reliability &bull; 88%</Text>
          </View>
          <View style={styles.duprRatingBox}>
            <Text style={styles.duprRatingType}>Singles Rating</Text>
            <Text style={styles.duprRatingBig}>{duprSingles.toFixed(3)}</Text>
            <Text style={styles.duprReliabilityText}>Med Reliability &bull; 74%</Text>
          </View>
        </View>

        {/* 6-Month Rating Trend Bar Progression */}
        <View style={styles.duprTrendSection}>
          <View style={styles.trendHeaderRow}>
            <Text style={styles.trendTitle}>6-Month Rating Progression</Text>
            <Text style={styles.trendGrowthText}>📈 +0.64 DUPR</Text>
          </View>
          <View style={styles.trendBarsRow}>
            {[
              { month: 'Jun', rating: '3.20', height: 42 },
              { month: 'Jul', rating: '3.38', height: 54 },
              { month: 'Aug', rating: '3.52', height: 68 },
              { month: 'Sep', rating: '3.65', height: 80 },
              { month: 'Oct', rating: '3.74', height: 88 },
              { month: 'Nov', rating: '3.84', height: 100 },
            ].map((bar, i) => (
              <View key={i} style={styles.trendBarCol}>
                <Text style={styles.trendBarVal}>{bar.rating}</Text>
                <View style={styles.trendBarTrack}>
                  <View
                    style={[
                      styles.trendBarFill,
                      { height: `${bar.height}%` },
                      i === 5 ? styles.trendBarFillActive : {},
                    ]}
                  />
                </View>
                <Text style={styles.trendBarMonth}>{bar.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Permanent Dinkster ID Card */}
      <View style={styles.idCard}>
        <View>
          <Text style={styles.idCardLabel}>Permanent Dinkster ID</Text>
          <Text style={styles.idCardValue}>{CURRENT_USER.id}</Text>
        </View>
        <View style={styles.connectsBadge}>
          <Text style={styles.connectsBadgeText}>12 Connects</Text>
        </View>
      </View>

      {/* Coach Features if Coach Mode is selected */}
      {mode === 'coach' && (
        <View style={styles.coachSection}>
          <Text style={styles.sectionHeading}>Coaching Profile</Text>
          <View style={styles.coachRateCard}>
            <View>
              <Text style={styles.coachRateLabel}>Hourly Coaching Rate</Text>
              <Text style={styles.coachRateValue}>$65 / hr</Text>
            </View>
            <TouchableOpacity style={styles.editRateBtn}>
              <Text style={styles.editRateText}>Edit Rate</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subHeading}>Today's Client Sessions</Text>
          <View style={styles.sessionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionName}>Maya Rivera (3.8 DUPR)</Text>
              <Text style={styles.sessionDetails}>9:00 AM &bull; 1 hr &bull; Pickleland Court 3 &bull; Drills</Text>
            </View>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>Paid $65</Text>
            </View>
          </View>

          <View style={styles.sessionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionName}>Jordan Chen (4.0 DUPR)</Text>
              <Text style={styles.sessionDetails}>11:30 AM &bull; 1.5 hr &bull; East Side Court 2 &bull; Match Play</Text>
            </View>
            <View style={styles.unpaidBadge}>
              <Text style={styles.unpaidBadgeText}>Unpaid $97.50</Text>
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Sessions This Month</Text>
              <Text style={styles.kpiValue}>12</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Earned This Month</Text>
              <Text style={[styles.kpiValue, { color: '#0A5C43' }]}>$780</Text>
            </View>
          </View>
        </View>
      )}

      {/* Sports Cards */}
      <Text style={styles.sectionHeading}>Sports</Text>
      <View style={styles.sportsCard}>
        <View style={styles.sportRow}>
          <View>
            <Text style={styles.sportTitle}>Pickleball</Text>
            <Text style={styles.sportMeta}>3.5 DUPR Verified &bull; ID #12345678</Text>
          </View>
          <View style={styles.liveTag}>
            <Text style={styles.liveTagText}>Live</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.sportRow}>
          <View>
            <Text style={styles.sportTitle}>Tennis</Text>
            <Text style={styles.sportMeta}>4.0 NTRP, Self-Reported</Text>
          </View>
          <View style={styles.phaseTag}>
            <Text style={styles.phaseTagText}>Phase 2</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.sportRow}>
          <View>
            <Text style={styles.sportTitle}>Badminton</Text>
            <Text style={styles.sportMeta}>Court reservations & rating</Text>
          </View>
          <View style={styles.phaseTag}>
            <Text style={styles.phaseTagText}>Phase 3</Text>
          </View>
        </View>
      </View>

      {/* Memberships & Perks */}
      <Text style={styles.sectionHeading}>Memberships & Benefits</Text>
      <View style={styles.sportsCard}>
        {[
          { name: 'WellHub', desc: '8 check-ins remaining this month' },
          { name: 'ClassPass', desc: '14 credits remaining' },
          { name: 'Aetna Fitness', desc: 'Up to $1,200/yr reimbursement' },
          { name: 'SilverSneakers', desc: 'Free weekday venue access' },
          { name: 'Pickleland Club', desc: 'Unlimited play, 1 guest pass/mo' },
        ].map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.sportRow}>
              <View>
                <Text style={styles.sportTitle}>{item.name}</Text>
                <Text style={styles.sportMeta}>{item.desc}</Text>
              </View>
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>Linked</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Apple Watch & Companion Controls */}
      <Text style={styles.sectionHeading}>Apple Watch Companion</Text>
      <TouchableOpacity style={styles.watchLaunchCard} onPress={onOpenWatch}>
        <Text style={styles.watchIcon}>⌚</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.watchLaunchTitle}>Apple Watch Companion</Text>
          <Text style={styles.watchLaunchSub}>
            Tap-to-score, complications, and game notifications
          </Text>
        </View>
        <Text style={styles.watchLaunchArrow}>Open →</Text>
      </TouchableOpacity>

      {/* Match History */}
      <Text style={styles.sectionHeading}>Match History</Text>
      <View style={styles.historyList}>
        {MOCK_RECENT_GAMES.map((match, i) => (
          <View key={i} style={styles.historyCard}>
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
              <Text style={styles.historyVs}>{match.vs}</Text>
              <Text style={styles.historyMeta}>
                {match.when} &bull; {match.kind} &bull; {match.score}
              </Text>
            </View>
            <Text style={styles.historyStatus}>{match.duprStatus}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0A5C43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLgText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  userLocation: {
    fontSize: 12.5,
    color: '#666',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  duprBadge: {
    fontSize: 11.5,
    fontWeight: '800',
    backgroundColor: '#FEF3E2',
    color: '#7A4A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  syncedBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    backgroundColor: '#E8F7F1',
    color: '#0A5C43',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  segControl: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 3,
    marginBottom: 14,
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
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginTop: 4,
  },
  idCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  idCardLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  idCardValue: {
    fontFamily: 'Courier',
    fontSize: 22,
    fontWeight: '800',
    color: '#0A5C43',
    marginTop: 2,
    letterSpacing: 1,
  },
  connectsBadge: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  connectsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A5C43',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginVertical: 8,
  },
  sportsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    marginBottom: 18,
  },
  sportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sportTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111',
  },
  sportMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  liveTag: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5C43',
  },
  phaseTag: {
    backgroundColor: '#F2F1EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phaseTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },
  coachSection: {
    marginBottom: 14,
  },
  coachRateCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachRateLabel: {
    fontSize: 12,
    color: '#666',
  },
  coachRateValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  editRateBtn: {
    backgroundColor: '#F2F1EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editRateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  sessionDetails: {
    fontSize: 11.5,
    color: '#666',
    marginTop: 2,
  },
  paidBadge: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0A5C43',
  },
  unpaidBadge: {
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unpaidBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7A4A00',
  },
  watchLaunchCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  watchIcon: {
    fontSize: 26,
  },
  watchLaunchTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111',
  },
  watchLaunchSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  watchLaunchArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A5C43',
  },
  historyList: {
    gap: 8,
  },
  historyCard: {
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
  historyVs: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  historyMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyStatus: {
    fontSize: 11,
    color: '#0A5C43',
    fontWeight: '600',
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  duprVerifiedCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0A5C43',
    padding: 16,
    marginBottom: 18,
    shadowColor: '#0A5C43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  duprCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  duprCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A5C43',
  },
  duprVerifiedPill: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5DCAA5',
  },
  duprVerifiedPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0A5C43',
  },
  duprCardSub: {
    fontSize: 11.5,
    color: '#666',
    marginTop: 2,
  },
  syncDuprBtn: {
    backgroundColor: '#0A5C43',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  syncDuprBtnActive: {
    opacity: 0.6,
  },
  syncDuprBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  duprRatingGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  duprRatingBox: {
    flex: 1,
    backgroundColor: '#F7FBF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: 12,
    alignItems: 'center',
  },
  duprRatingType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  duprRatingBig: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A5C43',
    marginVertical: 4,
    fontFamily: 'Courier',
  },
  duprReliabilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1B5E20',
  },
  duprTrendSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
  },
  trendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#444',
  },
  trendGrowthText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0A5C43',
  },
  trendBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    paddingTop: 8,
  },
  trendBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendBarVal: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Courier',
  },
  trendBarTrack: {
    width: 14,
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    backgroundColor: '#5DCAA5',
    borderRadius: 6,
  },
  trendBarFillActive: {
    backgroundColor: '#0A5C43',
  },
  trendBarMonth: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#888',
    marginTop: 4,
  },
});
