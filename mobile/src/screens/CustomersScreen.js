import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { COLORS, RADIUS, RADIUS_LG, FONT } from '../theme';

// Expo draws under the status bar on Android, so keep content clear of it.
const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 50;

export default function CustomersScreen({ navigation, route }) {
  // Opened from the dashboard's "Start a visit" -> tapping a customer goes straight to the visit form
  const pickForVisit = !!route?.params?.pickForVisit;
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async () => {
    setError('');
    try {
      const uid = await AsyncStorage.getItem('userId');
      const res = await axiosClient.get('/customers');
      // a sales rep only sees the customers assigned to them
      setCustomers(res.data.filter((c) => String(c.assignedUserId) === String(uid)));
    } catch {
      setError('Could not load customers. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
    );
  }, [search, customers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const renderItem = ({ item }) => {
    const active = item.status === 'ACTIVE';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          pickForVisit
            ? navigation.navigate('LogVisit', { customer: item })
            : navigation.navigate('CustomerDetails', { customer: item })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.city && <Text style={styles.meta}>{item.city}</Text>}
          {!!item.phone && <Text style={styles.meta}>{item.phone}</Text>}
        </View>

        <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, { color: active ? COLORS.success : COLORS.muted }]}>
            {active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCustomers} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>{search ? 'No matches' : 'No customers yet'}</Text>
        <Text style={styles.emptyText}>
          {search
            ? 'Try a different name, city or phone number.'
            : 'Customers your admin assigns to you will show up here.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{pickForVisit ? 'Select customer' : 'My customers'}</Text>
        {!loading && !error && (
          <Text style={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
          </Text>
        )}
      </View>

      {/* Search */}
      <TextInput
        style={[styles.search, focused && styles.searchFocused]}
        value={search}
        onChangeText={setSearch}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search by name, city or phone"
        placeholderTextColor={COLORS.muted}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={error ? [] : filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: { paddingTop: TOP_INSET + 12, paddingHorizontal: 20, paddingBottom: 14 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 8 },
  backText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
  title: { color: COLORS.text, fontSize: 28, ...FONT.display },
  count: { color: COLORS.muted, fontSize: 14, marginTop: 2 },

  search: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  searchFocused: { borderColor: COLORS.accent },

  list: { paddingHorizontal: 20, paddingBottom: 30, flexGrow: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS_LG,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: COLORS.accent, fontSize: 18, fontWeight: '700' },
  info: { flex: 1, marginRight: 8 },
  name: { color: COLORS.text, fontSize: 16, ...FONT.heading, marginBottom: 3 },
  meta: { color: COLORS.muted, fontSize: 13, marginTop: 1 },

  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: COLORS.successSoft },
  badgeInactive: { backgroundColor: COLORS.surface2 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyTitle: { color: COLORS.text, fontSize: 18, ...FONT.heading, marginBottom: 6 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 18,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryText: { color: COLORS.onAccent, fontSize: 14, fontWeight: '700' },
});