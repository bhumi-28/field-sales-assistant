import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axiosClient from '../api/axiosClient';

import { COLORS } from '../theme';

const SENTIMENT_COLOR = {
  POSITIVE: COLORS.accent,
  NEUTRAL: COLORS.muted,
  NEGATIVE: COLORS.danger,
};

const PURPOSES = ['Introduction', 'Follow-up', 'Demo', 'Negotiation', 'Complaint', 'Other'];

function Badge({ label, color }) {
  if (!label) return null;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const pad = (n) => String(n).padStart(2, '0');
// local date-time without timezone, e.g. 2026-09-25T14:05:00 (what the backend expects)
function toLocalIso(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function formatDateTime(d) {
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function LogVisitScreen({ navigation, route }) {
  const { customer } = route.params;

  const [purpose, setPurpose] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [productInterest, setProductInterest] = useState('');
  const [competitor, setCompetitor] = useState('');
  const [requirement, setRequirement] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [step, setStep] = useState('form'); // 'form' -> 'summary' -> result
  const [visitStart] = useState(() => new Date()); // visit date/time is captured when the visit starts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // holds { id, message, insight } after a successful submit

  // Step 1: validate the form and show the summary
  const handleReview = () => {
    setError('');
    if (!discussion.trim()) {
      setError('Discussion is required');
      return;
    }
    if (followUpDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(followUpDate)) {
        setError('Follow-up date must be in YYYY-MM-DD format');
        return;
      }
      if (followUpDate < toLocalIso(visitStart).slice(0, 10)) {
        setError('Follow-up date cannot be earlier than the visit date');
        return;
      }
    }
    setStep('summary');
  };

  // Step 2: submit to the backend (which stores it and calls the AI service)
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/visits', {
        customerId: customer.id,
        visitDate: toLocalIso(visitStart),
        purpose: purpose || null,
        discussion,
        productInterest: productInterest || null,
        competitor: competitor || null,
        requirement: requirement || null,
        remarks: remarks || null,
        followUpDate: followUpDate || null,
      });

      // POST /visits already returns the AI insight (or null if the AI
      // service was down) — show it instead of throwing it away.
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Result screen: shown after a successful submit ---
  if (result) {
    const insight = result.insight;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={{ width: 50 }} />
            <Text style={styles.title}>Visit Logged</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Visit saved for {customer.name}</Text>
          </View>

          {insight ? (
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>AI Recommendation</Text>

              {!!insight.summary && <Text style={styles.insightSummary}>{insight.summary}</Text>}

              <View style={styles.badgeRow}>
                <Badge label={insight.sentiment} color={SENTIMENT_COLOR[insight.sentiment] || COLORS.muted} />
                <Badge label={insight.opportunity && `${insight.opportunity} opportunity`} color={COLORS.warning} />
                <Badge label={insight.competitiveRisk && `${insight.competitiveRisk} risk`} color={COLORS.danger} />
              </View>

              {!!insight.recommendation && (
                <Text style={styles.recommendation}>→ {insight.recommendation}</Text>
              )}
            </View>
          ) : (
            <View style={styles.pendingCard}>
              <Text style={styles.pendingText}>
                AI insight isn't ready yet (AI service may be unavailable). The visit is saved — the insight will appear on the web portal once it's processed.
              </Text>
            </View>
          )}

          {!!followUpDate && (
            <Text style={styles.followUpNote}>Follow-up task created for {followUpDate}.</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- Visit Summary: review what was captured before submitting ---
  if (step === 'summary') {
    const rows = [
      ['Customer', customer.name],
      ['Date and time', formatDateTime(visitStart)],
      ['Purpose', purpose],
      ['Discussion', discussion],
      ['Product interest', productInterest],
      ['Competitor', competitor],
      ['Requirement', requirement],
      ['Remarks', remarks],
      ['Follow-up date', followUpDate],
    ].filter(([, value]) => !!value);

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep('form')}>
              <Text style={styles.back}>← Edit</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Visit summary</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.summaryCard}>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
              </View>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.onAccent} />
            ) : (
              <Text style={styles.buttonText}>Submit visit</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('form')} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Edit details</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- Form screen ---
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Start visit</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Customer info */}
        <View style={styles.customerCard}>
          <Text style={styles.customerLabel}>Customer</Text>
          <Text style={styles.customerName}>{customer.name}</Text>
          {!!customer.city && <Text style={styles.customerMeta}>📍 {customer.city}</Text>}
        </View>

        {/* Purpose pills */}
        <Text style={styles.label}>Purpose</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {PURPOSES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.pill, purpose === p && styles.pillActive]}
              onPress={() => setPurpose(purpose === p ? '' : p)}
            >
              <Text style={[styles.pillText, purpose === p && styles.pillTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Discussion */}
        <Text style={styles.label}>Discussion <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={discussion}
          onChangeText={setDiscussion}
          placeholder="What was discussed during the visit?"
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Product Interest */}
        <Text style={styles.label}>Product Interest</Text>
        <TextInput
          style={styles.input}
          value={productInterest}
          onChangeText={setProductInterest}
          placeholder="e.g. Product A, Bundle B"
          placeholderTextColor={COLORS.muted}
        />

        {/* Competitor */}
        <Text style={styles.label}>Competitor Mentioned</Text>
        <TextInput
          style={styles.input}
          value={competitor}
          onChangeText={setCompetitor}
          placeholder="e.g. CompanyX"
          placeholderTextColor={COLORS.muted}
        />

        {/* Requirement */}
        <Text style={styles.label}>Requirement</Text>
        <TextInput
          style={styles.input}
          value={requirement}
          onChangeText={setRequirement}
          placeholder="Customer's requirement"
          placeholderTextColor={COLORS.muted}
        />

        {/* Remarks */}
        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={styles.input}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Any additional remarks"
          placeholderTextColor={COLORS.muted}
        />

        {/* Follow-up Date */}
        <Text style={styles.label}>Follow-up Date</Text>
        <TextInput
          style={styles.input}
          value={followUpDate}
          onChangeText={setFollowUpDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
          maxLength={10}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleReview}>
          {loading ? (
            <ActivityIndicator color={COLORS.onAccent} />
          ) : (
            <Text style={styles.buttonText}>Review visit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  summaryRow: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 3 },
  summaryValue: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, paddingTop: 56, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  back: { color: COLORS.accent, fontSize: 14, fontWeight: '600', width: 50 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  customerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  customerLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 4, fontWeight: '600' },
  customerName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  customerMeta: { fontSize: 13, color: COLORS.muted },

  label: { fontSize: 12, fontWeight: '600', color: COLORS.muted, marginBottom: 6, marginTop: 16 },
  required: { color: COLORS.danger },

  pillRow: { flexDirection: 'row', marginBottom: 4 },
  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: COLORS.card,
  },
  pillActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  pillText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: COLORS.accent },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: { height: 100, paddingTop: 12 },

  error: { color: COLORS.danger, fontSize: 13, marginTop: 16 },

  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: { color: COLORS.onAccent, fontSize: 15, fontWeight: '700' },

  // Result screen
  successBanner: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  successText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },

  insightCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  insightTitle: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  insightSummary: { fontSize: 14.5, color: COLORS.text, lineHeight: 21, marginBottom: 14 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11.5, fontWeight: '700' },
  recommendation: { fontSize: 13.5, color: COLORS.accent, fontStyle: 'italic', lineHeight: 19 },

  pendingCard: {
    backgroundColor: COLORS.warningSoft,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  pendingText: { color: COLORS.warning, fontSize: 13, lineHeight: 19 },

  followUpNote: { color: COLORS.muted, fontSize: 12.5, marginBottom: 8, textAlign: 'center' },
});