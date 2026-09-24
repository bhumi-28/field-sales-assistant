import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { COLORS, RADIUS, RADIUS_LG, SHADOW, FONT } from '../theme';

// Expo draws under the status bar on Android, so keep content clear of it.
const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 50;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function isToday(dateString) {
  if (!dateString) return false;
  return new Date(dateString).toDateString() === new Date().toDateString();
}

function timeLabel(dateString) {
  return new Date(dateString).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function dueLabel(dateString) {
  if (!dateString) return 'No due date';
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `Due ${due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

function DashboardScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [todayVisits, setTodayVisits] = useState([]);
  const [pending, setPending] = useState([]);
  const [customerCount, setCustomerCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [uid, name] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('userName'),
      ]);
      setUserName(name || '');
      const mine = (id) => String(id) === String(uid);

      const [visitsRes, tasksRes, customersRes] = await Promise.all([
        axiosClient.get('/visits'),
        axiosClient.get('/tasks', { params: uid ? { assignedUserId: uid } : undefined }),
        axiosClient.get('/customers'),
      ]);

      setTodayVisits(
        visitsRes.data
          .filter((v) => mine(v.userId) && isToday(v.visitDate))
          .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
      );
      setPending(
        tasksRes.data
          .filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
          .sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'))
      );
      setCustomerCount(customersRes.data.filter((c) => mine(c.assignedUserId)).length);
      setError('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }
      if (status === 403) {
        setError('Access denied (403). Log out and log in again.');
      } else if (status) {
        setError(`Server error (${status}). Check the backend console for details.`);
      } else {
        setError('Cannot reach the server. Check that the backend is running and the URL in axiosClient.js is correct.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const stats = [
    { label: "Today's visits", value: todayVisits.length, color: COLORS.accent },
    { label: 'Pending follow-ups', value: pending.length, color: COLORS.warning },
    { label: 'My customers', value: customerCount, color: COLORS.success },
  ];

  const shortcuts = [
    { label: 'Customers', onPress: () => navigation.navigate('Customers') },
    { label: 'Follow-up tasks', onPress: () => navigation.navigate('Tasks') },
    { label: 'AI assistant', onPress: () => navigation.navigate('AiAssistant') },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {userName || 'Welcome'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />
        }
      >
        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Stats */}
            <View style={styles.statsRow}>
              {stats.map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <View style={[styles.statDot, { backgroundColor: s.color }]} />
                  <Text style={styles.statValue}>{s.value ?? '-'}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Primary action */}
            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Customers', { pickForVisit: true })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.startTitle}>Start a visit</Text>
                <Text style={styles.startHint}>Pick a customer and record the visit</Text>
              </View>
              <Text style={styles.startChevron}>›</Text>
            </TouchableOpacity>

            {/* Today's visits */}
            <Text style={styles.sectionTitle}>Today's visits</Text>
            {todayVisits.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No visits recorded today. Start a visit to see it here.</Text>
              </View>
            ) : (
              todayVisits.map((v) => (
                <View key={v.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {v.customerName}
                    </Text>
                    <Text style={styles.rowMeta}>{v.purpose || 'Visit'}</Text>
                  </View>
                  <Text style={styles.rowTime}>{timeLabel(v.visitDate)}</Text>
                </View>
              ))
            )}

            {/* Pending follow-ups */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Pending follow-ups</Text>
              {pending.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
            {pending.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>You're all caught up. No pending follow-ups.</Text>
              </View>
            ) : (
              pending.slice(0, 3).map((t) => {
                const label = dueLabel(t.dueDate);
                const overdue = label.startsWith('Overdue');
                return (
                  <View key={t.id} style={styles.rowCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {t.title}
                      </Text>
                      <Text style={[styles.rowMeta, overdue && { color: COLORS.danger }]}>{label}</Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Quick actions */}
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Quick actions</Text>
            <View style={styles.shortcutRow}>
              {shortcuts.map((s) => (
                <TouchableOpacity key={s.label} style={styles.shortcut} onPress={s.onPress} activeOpacity={0.8}>
                  <Text style={styles.shortcutText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: TOP_INSET + 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  name: { color: COLORS.text, fontSize: 26, marginTop: 2, ...FONT.display },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginLeft: 12,
  },
  logoutText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },

  content: { padding: 20, paddingBottom: 40 },

  errorBox: { backgroundColor: COLORS.dangerSoft, borderRadius: RADIUS, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS_LG,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    ...SHADOW,
  },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 10 },
  statValue: { color: COLORS.text, fontSize: 28, lineHeight: 32, ...FONT.display },
  statLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '500', marginTop: 3 },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS_LG,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 26,
    ...SHADOW,
  },
  startTitle: { color: COLORS.onAccent, fontSize: 17, fontWeight: '700' },
  startHint: { color: COLORS.onAccent, fontSize: 13, marginTop: 2, opacity: 0.85 },
  startChevron: { color: COLORS.onAccent, fontSize: 30, marginTop: -4 },

  sectionTitle: { color: COLORS.text, fontSize: 17, ...FONT.heading, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  seeAll: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS_LG,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 8,
  },
  emptyText: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS_LG,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  rowTitle: { color: COLORS.text, fontSize: 15, ...FONT.heading },
  rowMeta: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  rowTime: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginLeft: 10 },

  shortcutRow: { flexDirection: 'row', gap: 10 },
  shortcut: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS_LG,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  shortcutText: { color: COLORS.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});

export default DashboardScreen;