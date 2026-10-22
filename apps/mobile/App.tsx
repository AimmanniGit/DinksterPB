import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { CourtsScreen } from './src/screens/CourtsScreen';
import { CrewScreen } from './src/screens/CrewScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WatchModal } from './src/components/WatchModal';
import { CopilotModal } from './src/components/CopilotModal';
import { PlayerProfile } from '@dinkster/shared';

type Tab = 'discover' | 'play' | 'courts' | 'crew' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('play');
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [selectedCrewChat, setSelectedCrewChat] = useState<string | null>(null);

  const handleStartLobbyWith = (player: PlayerProfile) => {
    setActiveTab('play');
  };

  const handleOpenChatWith = (playerName: string) => {
    setSelectedCrewChat(playerName);
    setActiveTab('crew');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F3" />

      {/* Top Bar with Floating Copilot Sparkle */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>
            dink<Text style={styles.brandAccent}>ster</Text>
          </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>DK-v1</Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.watchIconBtn}
            onPress={() => setShowWatchModal(true)}
          >
            <Text style={styles.watchIconText}>⌚</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.copilotSparkleBtn}
            onPress={() => setShowCopilotModal(true)}
          >
            <Text style={styles.copilotSparkleText}>✨ AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {activeTab === 'discover' && (
          <DiscoverScreen
            onStartLobbyWith={handleStartLobbyWith}
            onOpenChatWith={handleOpenChatWith}
          />
        )}
        {activeTab === 'play' && (
          <PlayScreen
            onOpenWatch={() => setShowWatchModal(true)}
            onNavigateCourts={() => setActiveTab('courts')}
          />
        )}
        {activeTab === 'courts' && (
          <CourtsScreen onStartLobby={() => setActiveTab('play')} />
        )}
        {activeTab === 'crew' && (
          <CrewScreen
            selectedCrewName={selectedCrewChat}
            onStartLobby={() => setActiveTab('play')}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen onOpenWatch={() => setShowWatchModal(true)} />
        )}
      </View>

      {/* Bottom 5-Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'discover', label: 'Discover', icon: '🎴' },
          { key: 'play', label: 'Play', icon: '🎾' },
          { key: 'courts', label: 'Courts', icon: '📍' },
          { key: 'crew', label: 'Crew', icon: '💬' },
          { key: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => {
                if (tab.key !== 'crew') setSelectedCrewChat(null);
                setActiveTab(tab.key as Tab);
              }}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modals */}
      <WatchModal visible={showWatchModal} onClose={() => setShowWatchModal(false)} />
      <CopilotModal
        visible={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAF8F3',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A5C43',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#EF9F27',
  },
  versionBadge: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  versionBadgeText: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '700',
    color: '#0A5C43',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchIconBtn: {
    padding: 6,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  watchIconText: {
    fontSize: 16,
  },
  copilotSparkleBtn: {
    backgroundColor: '#0A5C43',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  copilotSparkleText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  contentArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 6,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  tabLabelActive: {
    color: '#0A5C43',
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A5C43',
  },
});
