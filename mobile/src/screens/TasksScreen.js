import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

import { COLORS } from '../theme';

const PRIORITY_COLOR = {
  HIGH: COLORS.danger,
  MEDIUM: COLORS.warning,
  LOW: COLORS.muted,
};

function formatDue(dateString) {
  if (!dateString) return 'No due date';
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due ${due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('OPEN'); // 'OPEN' | 'ALL'

  const load = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      // Server now filters by assignedUserId directly, so we only ever
      // fetch this rep's own tasks instead of the full list.
      const res = await axiosClient.get('/tasks', {
        params: userId ? { assignedUserId: userId } : undefined,
      });
      const sorted = [...res.data].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
      setTasks(sorted);
      setError('');
    } catch (err) {
      setError('Could not load tasks. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const markDone = async (id) => {
    const prev = tasks;
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, status: 'COMPLETED' } : task)));
    try {
      await axiosClient.put(`/tasks/${id}`, { status: 'COMPLETED' });
    } catch (err) {
      setTasks(prev);
      setError('Could not update task — try again.');
    }
  };

  const visibleTasks = (tasks || []).filter((t) =>
    filter === 'ALL' ? true : t.status === 'OPEN' || t.status === 'IN_PROGRESS'
  );

  const renderItem = ({ item }) => {
    const dueLabel = formatDue(item.dueDate);
    const overdue = dueLabel.startsWith('Overdue');
    const done = item.status === 'COMPLETED' || item.status === 'CANCELLED';

    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          onPress={() => !done && markDone(item.id)}
          style={[styles.checkbox, done && styles.checkboxDone]}
          disabled={done}
        >
          {done && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[styles.taskTitle, done && styles.taskTitleDone]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.dueLabel, { color: overdue && !done ? COLORS.danger : COLORS.muted }]}>
            {done ? 'Completed' : dueLabel}
          </Text>
        </View>

        <Text style={[styles.priority, { color: PRIORITY_COLOR[item.priority] || COLORS.muted }]}>
          {item.priority}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Follow-up Tasks</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, filter === 'OPEN' && styles.tabActive]}
          onPress={() => setFilter('OPEN')}
        >
          <Text style={[styles.tabText, filter === 'OPEN' && styles.tabTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'ALL' && styles.tabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.tabText, filter === 'ALL' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && (
        <FlatList
          data={visibleTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Nothing here. You're all caught up.</Text>}
        />
      )}
    </View>
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

  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  tabTextActive: { color: COLORS.onAccent },

  error: { color: COLORS.danger, fontSize: 13.5, textAlign: 'center', marginTop: 20 },
  emptyText: { color: COLORS.muted, fontSize: 13.5, textAlign: 'center', marginTop: 40 },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkmark: { color: COLORS.onAccent, fontSize: 13, fontWeight: '700' },
  taskTitle: { fontSize: 14.5, color: COLORS.text, fontWeight: '600' },
  taskTitleDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
  dueLabel: { fontSize: 12.5, marginTop: 3 },
  priority: { fontSize: 11.5, fontWeight: '700' },
});