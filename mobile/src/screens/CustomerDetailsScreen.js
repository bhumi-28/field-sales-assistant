import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/axiosClient';

import { COLORS } from '../theme';

const SENTIMENT_COLOR = {
  POSITIVE: COLORS.accent,
  NEUTRAL: COLORS.muted,
  NEGATIVE: COLORS.danger,
};

function Badge({ label, color }) {
  if (!label) return null;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export default function CustomerDetailsScreen({ navigation, route }) {
  const { customer } = route.params;

  const [visits, setVisits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadVisits = useCallback(async () => {
    try {
      const res = await axiosClient.get('/visits', { params: { customerId: customer.id } });
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.visitDate) - new Date(a.visitDate)
      );
      setVisits(sorted);
      setError('');
    } catch (err) {
      setError('Could not load visit history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customer.id]);

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [loadVisits])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadVisits();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{customer.name}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Contact card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View
              style={[
                styles.statusPill,
                { borderColor: customer.status === 'ACTIVE' ? COLORS.accent : COLORS.danger },
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: customer.status === 'ACTIVE' ? COLORS.accent : COLORS.danger,
                }}
              >
                {customer.status || '—'}
              </Text>
            </View>
          </View>

          {!!customer.phone && <Text style={styles.contactLine}>📞 {customer.phone}</Text>}
          {!!customer.email && <Text style={styles.contactLine}>✉️ {customer.email}</Text>}
          {!!customer.city && <Text style={styles.contactLine}>📍 {customer.city}{customer.address ? `, ${customer.address}` : ''}</Text>}
          {!!customer.assignedUserName && (
            <Text style={styles.contactLine}>👤 Assigned to {customer.assignedUserName}</Text>
          )}
        </View>

        {/* Log visit button */}
        <TouchableOpacity
          style={styles.logButton}
          onPress={() => navigation.navigate('LogVisit', { customer })}
        >
          <Text style={styles.logButtonText}>+ Log New Visit</Text>
        </TouchableOpacity>

        {/* Visit history */}
        <Text style={styles.sectionTitle}>Visit History</Text>

        {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />}

        {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && visits && visits.length === 0 && (
          <Text style={styles.emptyText}>No visits logged yet for this customer.</Text>
        )}

        {!loading && visits && visits.map((v) => (
          <View key={v.id} style={styles.visitCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.visitDate}>
                {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </Text>
              {!!v.purpose && <Text style={styles.visitPurpose}>{v.purpose}</Text>}
            </View>

            {!!v.discussion && (
              <Text style={styles.visitDiscussion} numberOfLines={3}>{v.discussion}</Text>
            )}

            {!!v.productInterest && (
              <Text style={styles.metaLine}>Interested in: {v.productInterest}</Text>
            )}
            {!!v.competitor && (
              <Text style={styles.metaLine}>Competitor mentioned: {v.competitor}</Text>
            )}

            {(v.sentiment || v.opportunity || v.competitiveRisk) && (
              <View style={styles.badgeRow}>
                <Badge label={v.sentiment} color={SENTIMENT_COLOR[v.sentiment] || COLORS.muted} />
                <Badge label={v.opportunity && `${v.opportunity} opportunity`} color={COLORS.warning} />
                <Badge label={v.competitiveRisk && `${v.competitiveRisk} risk`} color={COLORS.danger} />
              </View>
            )}

            {!!v.aiRecommendation && (
              <Text style={styles.recommendation}>→ {v.aiRecommendation}</Text>
            )}

            {!!v.followUpDate && (
              <Text style={styles.followUp}>
                Follow-up: {new Date(v.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
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
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customerName: { fontSize: 18, fontWeight: '700', color: COLORS.text, flexShrink: 1, marginRight: 8 },
  statusPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  contactLine: { fontSize: 13.5, color: COLORS.muted, marginTop: 8 },

  logButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 24,
  },
  logButtonText: { color: COLORS.onAccent, fontSize: 14.5, fontWeight: '700' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  error: { color: COLORS.danger, fontSize: 13.5 },
  emptyText: { color: COLORS.muted, fontSize: 13.5 },

  visitCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  visitDate: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  visitPurpose: { fontSize: 12.5, color: COLORS.muted },
  visitDiscussion: { fontSize: 13.5, color: COLORS.text, marginTop: 8, lineHeight: 19 },
  metaLine: { fontSize: 12.5, color: COLORS.muted, marginTop: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  recommendation: { fontSize: 12.5, color: COLORS.accent, marginTop: 8, fontStyle: 'italic' },
  followUp: { fontSize: 12, color: COLORS.warning, marginTop: 8, fontWeight: '600' },
});