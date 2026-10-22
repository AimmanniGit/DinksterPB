import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface CopilotModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSelfReport?: (match: any) => void;
}

interface ParsedResult {
  sets: [number, number][];
  court?: string;
  opponent: string;
  result: 'W' | 'L';
  invalidSets: string[];
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  visible,
  onClose,
  onSubmitSelfReport,
}) => {
  const [messages, setMessages] = useState<Array<{ fromBot: boolean; text: string; parsed?: ParsedResult }>>([
    {
      fromBot: true,
      text: 'I can log a score from a message, find a game, or match you with a partner.\n\nTry: "We beat JC and SK on court 4, 11-9, 8-11, 12-10"',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const parseScoreText = (text: string): ParsedResult | null => {
    // Regex for score patterns like 11-9, 8:11, 12-10
    const setMatches = [...text.matchAll(/(\d{1,2})\s*[-:]\s*(\d{1,2})/g)];
    if (setMatches.length === 0) return null;

    const sets = setMatches.map((m) => [parseInt(m[1], 10), parseInt(m[2], 10)] as [number, number]);
    const courtMatch = text.match(/court\s*(\d+)/i);
    const oppMatch = text.match(/(?:beat|defeated|lost to|vs\.?|against)\s+([A-Za-z0-9 &.']+?)(?:\s+on\s+court|\s+at\s+|,|\s+\d)/i);

    const wins = sets.filter((s) => s[0] > s[1]).length;
    const losses = sets.length - wins;

    const invalidSets = sets
      .filter((s) => Math.max(...s) < 11 || Math.abs(s[0] - s[1]) < 2)
      .map((s) => `${s[0]}-${s[1]}`);

    return {
      sets,
      court: courtMatch ? courtMatch[1] : undefined,
      opponent: oppMatch ? oppMatch[1].trim() : 'Opponent',
      result: wins > losses ? 'W' : 'L',
      invalidSets,
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const newMsgs = [...messages, { fromBot: false, text: query }];
    setInputText('');

    const parsed = parseScoreText(query);
    if (parsed) {
      newMsgs.push({
        fromBot: true,
        text: `Recognized match result:\n• ${parsed.result === 'W' ? 'Won' : 'Lost'} vs ${parsed.opponent}\n• Sets: ${parsed.sets.map((s) => `${s[0]}-${s[1]}`).join(', ')}${parsed.court ? `\n• Court ${parsed.court}` : ''}`,
        parsed,
      });
    } else if (/dink/i.test(query)) {
      newMsgs.push({
        fromBot: true,
        text: 'Dink Battle is a pilot variation! After the 5th shot of a rally, the court shrinks to half-court. Dinks decide the point, and lobs or hard drives land out.',
      });
    } else if (/partner|find me/i.test(query)) {
      newMsgs.push({
        fromBot: true,
        text: 'Recommended fits: Maya Rivera (3.8 DUPR, free weekday mornings) liked you! Dana Cruz (3.6 DUPR) has 3 mutual connections.',
      });
    } else if (/find|game|tonight/i.test(query)) {
      newMsgs.push({
        fromBot: true,
        text: 'Upcoming games: Open play at Barton Springs at 6:30 PM (3 of 4 joined). Pickleland session at 7:00 PM eligible for WellHub.',
      });
    } else {
      newMsgs.push({
        fromBot: true,
        text: 'I can log match scores, find nearby open play, or recommend players based on DUPR compatibility.',
      });
    }

    setMessages(newMsgs);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Dinkster Copilot</Text>
              <Text style={styles.subtitle}>AI Score Logger & Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {messages.map((m, idx) => (
              <View
                key={idx}
                style={[
                  styles.msgBubble,
                  m.fromBot ? styles.botBubble : styles.userBubble,
                ]}
              >
                <Text style={[styles.msgText, m.fromBot ? styles.botText : styles.userText]}>
                  {m.text}
                </Text>

                {m.parsed && (
                  <View style={styles.parsedCard}>
                    {m.parsed.invalidSets.length > 0 && (
                      <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                          ⚠️ Note: {m.parsed.invalidSets.join(', ')} is not a standard 11 win-by-2 score.
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.submitScoreBtn}
                      onPress={() => {
                        if (onSubmitSelfReport) onSubmitSelfReport(m.parsed);
                        onClose();
                      }}
                    >
                      <Text style={styles.submitScoreText}>Submit as Self-Reported Match</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Quick Prompts */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPrompts}>
            {[
              'We beat JC and SK on court 4, 11-9, 8-11, 12-10',
              'Find a game tonight',
              'Find me a 3.5 partner for Thursday evening',
              'What is Dink Battle?',
            ].map((q, i) => (
              <TouchableOpacity key={i} style={styles.promptChip} onPress={() => handleSend(q)}>
                <Text style={styles.promptChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a score or question..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF8F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A5C43',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '700',
  },
  chatScroll: {
    maxHeight: 280,
    marginBottom: 10,
  },
  chatContent: {
    gap: 10,
  },
  msgBubble: {
    maxWidth: '86%',
    padding: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#0A5C43',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  botText: {
    color: '#111',
  },
  userText: {
    color: '#FFF',
  },
  parsedCard: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  warningBox: {
    backgroundColor: '#FEF3E2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#7A4A00',
    fontWeight: '600',
  },
  submitScoreBtn: {
    backgroundColor: '#EF9F27',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitScoreText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 13,
  },
  quickPrompts: {
    maxHeight: 40,
    marginBottom: 12,
  },
  promptChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
  },
  sendBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  sendText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
