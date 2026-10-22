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
import { MOCK_PROPOSALS } from '../constants/mockData';

interface Message {
  fromMe: boolean;
  text: string;
}

interface CrewItem {
  name: string;
  initials: string;
  dupr: number;
  status: 'new' | 'proposed' | 'planned' | 'played';
  unread?: boolean;
  lastMessage: string;
  messages: Message[];
  proposal?: {
    when: string;
    venue: string;
    proposedByMe: boolean;
    accepted: boolean;
  };
}

interface CrewScreenProps {
  onStartLobby?: (crewName: string) => void;
  selectedCrewName?: string | null;
}

export const CrewScreen: React.FC<CrewScreenProps> = ({
  onStartLobby,
  selectedCrewName,
}) => {
  const [crew, setCrew] = useState<CrewItem[]>([
    {
      name: 'Priya Nair',
      initials: 'PN',
      dupr: 4.2,
      status: 'proposed',
      unread: false,
      lastMessage: 'Great to match! Thursday 6:30 PM at Zilker work for you?',
      proposal: {
        when: 'Thu 6:30 PM',
        venue: 'Zilker Park Courts',
        proposedByMe: false,
        accepted: false,
      },
      messages: [
        { fromMe: false, text: 'Great to match! Thursday 6:30 PM at Zilker work for you?' },
      ],
    },
    {
      name: 'Sam Kim',
      initials: 'SK',
      dupr: 3.5,
      status: 'played',
      unread: false,
      lastMessage: 'Same time next week?',
      messages: [
        { fromMe: false, text: 'Good games Tuesday!' },
        { fromMe: true, text: 'Same time next week?' },
      ],
    },
    {
      name: 'Carlos Mendez',
      initials: 'CM',
      dupr: 3.7,
      status: 'new',
      unread: true,
      lastMessage: 'Say hi to start the conversation',
      messages: [],
    },
  ]);

  const [activeChatName, setActiveChatName] = useState<string | null>(selectedCrewName || null);
  const [inputText, setInputText] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);

  const activeMember = crew.find((c) => c.name === activeChatName);

  const handleSendMessage = (msgToSend?: string) => {
    const text = (msgToSend || inputText).trim();
    if (!text || !activeMember) return;

    const newMsg: Message = { fromMe: true, text };
    const updated = crew.map((c) => {
      if (c.name === activeMember.name) {
        return {
          ...c,
          lastMessage: text,
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });

    setCrew(updated);
    setInputText('');

    // Simulate quick reply
    setTimeout(() => {
      const replyText = /free|when|time/i.test(text)
        ? 'Thursday evening works great for me!'
        : /dink/i.test(text)
        ? 'Dinks all day. Soft game wins points.'
        : 'Sounds good to me!';

      setCrew((prev) =>
        prev.map((c) => {
          if (c.name === activeMember.name) {
            return {
              ...c,
              lastMessage: replyText,
              messages: [...c.messages, { fromMe: false, text: replyText }],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const handleAcceptProposal = () => {
    if (!activeMember) return;
    setCrew((prev) =>
      prev.map((c) => {
        if (c.name === activeMember.name && c.proposal) {
          return {
            ...c,
            status: 'planned',
            proposal: { ...c.proposal, accepted: true },
            messages: [...c.messages, { fromMe: true, text: 'Count me in! Lobby D-7741 is ready.' }],
          };
        }
        return c;
      })
    );
  };

  const handleSendProposal = (prop: { when: string; venue: string }) => {
    if (!activeMember) return;
    setCrew((prev) =>
      prev.map((c) => {
        if (c.name === activeMember.name) {
          return {
            ...c,
            status: 'proposed',
            proposal: {
              when: prop.when,
              venue: prop.venue,
              proposedByMe: true,
              accepted: false,
            },
            messages: [
              ...c.messages,
              { fromMe: true, text: `Want to play ${prop.when} at ${prop.venue}? Code D-7741.` },
            ],
          };
        }
        return c;
      })
    );
    setShowProposeModal(false);
  };

  // ==========================================
  // VIEW: 1-ON-1 CHAT
  // ==========================================
  if (activeMember) {
    const pr = activeMember.proposal;
    return (
      <View style={styles.chatContainer}>
        {/* Chat Nav Header */}
        <View style={styles.chatNavHeader}>
          <TouchableOpacity onPress={() => setActiveChatName(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Crew</Text>
          </TouchableOpacity>
          <View style={styles.chatNavInfo}>
            <Text style={styles.chatNavTitle}>{activeMember.name}</Text>
            <Text style={styles.chatNavSubtitle}>{activeMember.dupr.toFixed(1)} DUPR</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Messages Scroll */}
        <ScrollView style={styles.messagesScroll} contentContainerStyle={styles.messagesContent}>
          {/* Active Proposal Card (if present) */}
          {pr && (
            <View style={styles.proposalCard}>
              <Text style={styles.proposalTag}>
                {pr.accepted ? 'Match Planned' : pr.proposedByMe ? 'Proposal Sent' : 'Game Proposed to You'}
              </Text>
              <Text style={styles.proposalTimeVenue}>{pr.when} &bull; {pr.venue}</Text>
              <Text style={styles.proposalCode}>Game Code: D-7741</Text>

              {pr.accepted ? (
                <TouchableOpacity
                  style={styles.openLobbyBtn}
                  onPress={() => onStartLobby && onStartLobby(activeMember.name)}
                >
                  <Text style={styles.openLobbyText}>Open Match Lobby</Text>
                </TouchableOpacity>
              ) : !pr.proposedByMe ? (
                <View style={styles.proposalActionRow}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptProposal}>
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn}>
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.waitingReplyText}>Waiting for reply...</Text>
              )}
            </View>
          )}

          {activeMember.messages.map((m, idx) => (
            <View
              key={idx}
              style={[
                styles.bubble,
                m.fromMe ? styles.myBubble : styles.theirBubble,
              ]}
            >
              <Text style={[styles.bubbleText, m.fromMe ? styles.myBubbleText : styles.theirBubbleText]}>
                {m.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Icebreaker Prompts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.icebreakerBar}>
          {[
            'Dinks or drives?',
            'Free this week?',
            'Which courts do you like?',
            'Let us play mixed doubles',
          ].map((prompt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.iceChip}
              onPress={() => handleSendMessage(prompt)}
            >
              <Text style={styles.iceChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder={`Message ${activeMember.name.split(' ')[0]}...`}
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity style={styles.chatSendBtn} onPress={() => handleSendMessage()}>
            <Text style={styles.chatSendText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Propose Game Button */}
        {(!pr || activeMember.status === 'played') && (
          <TouchableOpacity
            style={styles.proposeBottomBtn}
            onPress={() => setShowProposeModal(true)}
          >
            <Text style={styles.proposeBottomText}>
              {activeMember.status === 'played' ? 'Play Again (Propose)' : 'Propose a Game'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Proposal Selection Sheet */}
        {showProposeModal && (
          <Modal visible transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.proposalSheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Propose Match with {activeMember.name}</Text>
                  <TouchableOpacity onPress={() => setShowProposeModal(false)}>
                    <Text style={styles.sheetClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.sheetSub}>Pick a suggested time and venue:</Text>

                {MOCK_PROPOSALS.map((prop, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.proposalOptionCard}
                    onPress={() => handleSendProposal(prop)}
                  >
                    <Text style={styles.propOptTime}>{prop.when}</Text>
                    <Text style={styles.propOptVenue}>{prop.venue} &bull; {prop.cost}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // ==========================================
  // VIEW: CREW LIST
  // ==========================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Your Crew</Text>
        <Text style={styles.pageSubtitle}>Matches turn into games. Say hi, pick a time, and hit the kitchen.</Text>
      </View>

      <View style={styles.crewList}>
        {crew.map((member, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.crewCard}
            onPress={() => {
              // mark read
              setCrew((prev) =>
                prev.map((c) => (c.name === member.name ? { ...c, unread: false } : c))
              );
              setActiveChatName(member.name);
            }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.crewCardTop}>
                <Text style={styles.crewName}>{member.name}</Text>
                <View
                  style={[
                    styles.statusTag,
                    member.status === 'planned' || member.status === 'new'
                      ? styles.statusTagGreen
                      : styles.statusTagGray,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      member.status === 'planned' || member.status === 'new'
                        ? styles.statusTagTextGreen
                        : styles.statusTagTextGray,
                    ]}
                  >
                    {member.status === 'new'
                      ? 'New Match'
                      : member.status === 'proposed'
                      ? 'Game Proposed'
                      : member.status === 'planned'
                      ? 'Game Planned'
                      : 'Played Together'}
                  </Text>
                </View>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {member.lastMessage}
              </Text>
            </View>
            {member.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
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
  header: {
    marginBottom: 16,
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
  crewList: {
    gap: 10,
  },
  crewCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 16,
    fontWeight: '800',
  },
  crewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crewName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#111',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagGreen: {
    backgroundColor: '#E8F7F1',
  },
  statusTagGray: {
    backgroundColor: '#F2F1EC',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTagTextGreen: {
    color: '#0A5C43',
  },
  statusTagTextGray: {
    color: '#666',
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF9F27',
  },

  // 1-on-1 Chat Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  chatNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFF',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#0A5C43',
    fontSize: 14,
    fontWeight: '700',
  },
  chatNavInfo: {
    alignItems: 'center',
  },
  chatNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  chatNavSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  messagesScroll: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    gap: 10,
    paddingBottom: 16,
  },
  proposalCard: {
    backgroundColor: '#E8F7F1',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.3)',
    marginBottom: 8,
  },
  proposalTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5C43',
    textTransform: 'uppercase',
  },
  proposalTimeVenue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    marginTop: 2,
  },
  proposalCode: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#0A5C43',
    marginTop: 2,
  },
  openLobbyBtn: {
    backgroundColor: '#0A5C43',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  openLobbyText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  proposalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#0A5C43',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  declineText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 13,
  },
  waitingReplyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#0A5C43',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 18,
  },
  myBubbleText: {
    color: '#FFF',
  },
  theirBubbleText: {
    color: '#111',
  },
  icebreakerBar: {
    maxHeight: 38,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  iceChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 6,
  },
  iceChipText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
  },
  chatInputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8F7F3',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  chatSendBtn: {
    backgroundColor: '#0A5C43',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  chatSendText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  proposeBottomBtn: {
    margin: 16,
    marginTop: 4,
    backgroundColor: '#0A5C43',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  proposeBottomText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  proposalSheet: {
    backgroundColor: '#FAF8F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  sheetClose: {
    fontSize: 18,
    color: '#888',
    fontWeight: '700',
  },
  sheetSub: {
    fontSize: 13,
    color: '#666',
    marginVertical: 10,
  },
  proposalOptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    marginBottom: 8,
  },
  propOptTime: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111',
  },
  propOptVenue: {
    fontSize: 12.5,
    color: '#666',
    marginTop: 2,
  },
});
