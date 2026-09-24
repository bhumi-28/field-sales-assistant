import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import axiosClient from '../api/axiosClient';

import { COLORS } from '../theme';

const SUGGESTIONS = [
  "What are my pending follow-ups?",
  "Which customers have high opportunity?",
  "Any competitor mentions this week?",
];

export default function AiAssistantScreen({ navigation }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // { id, role: 'user' | 'assistant' | 'error', text }
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async (text) => {
    const q = (text ?? question).trim();
    if (!q || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/ai/assistant', { question: q });
      const answer = res.data?.answer || "I couldn't find an answer to that.";
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: answer }]);
    } catch (err) {
      const msg =
        err.response?.status === 502
          ? 'AI service is unavailable right now. Try again in a bit.'
          : 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'error', text: msg }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderItem = ({ item }) => {
    if (item.role === 'user') {
      return (
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{item.text}</Text>
        </View>
      );
    }
    const isError = item.role === 'error';
    return (
      <View style={[styles.bubble, styles.assistantBubble, isError && styles.errorBubble]}>
        <Text style={[styles.assistantText, isError && styles.errorText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Assistant</Text>
        <View style={{ width: 50 }} />
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ask about your customers, visits or tasks</Text>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => send(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.accent} size="small" />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask a question..."
          placeholderTextColor={COLORS.muted}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!question.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => send()}
          disabled={!question.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
  },
  back: { color: COLORS.accent, fontSize: 14, fontWeight: '600', width: 50 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  emptyState: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  emptyTitle: { color: COLORS.muted, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  suggestionChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  suggestionText: { color: COLORS.text, fontSize: 13.5 },

  list: { paddingHorizontal: 16, paddingVertical: 12 },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: COLORS.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  userText: { color: COLORS.onAccent, fontSize: 14, lineHeight: 20 },
  assistantBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  assistantText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  errorBubble: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  loadingText: { color: COLORS.muted, fontSize: 12.5 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonDisabled: { backgroundColor: COLORS.border },
  sendButtonText: { color: COLORS.onAccent, fontSize: 13.5, fontWeight: '700' },
});