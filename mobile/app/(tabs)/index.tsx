import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../src/constants/theme';
import { CardioSenseLogo } from '../../src/components/CardioSenseLogo';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { BackendStatusPill } from '../../src/components/BackendStatusPill';
import {
  Heart,
  Clock,
  Shield,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Floating Pill Header matching Web */}
      <View style={styles.floatingHeader}>
        <CardioSenseLogo size={28} showText={true} />
        <BackendStatusPill compact />
      </View>

      {/* Hero Badge */}
      <View style={styles.heroBadge}>
        <View style={styles.heroBadgeDot} />
        <Text style={styles.heroBadgeText}>CardioSense AI — Clinical-Grade Auscultation Technology</Text>
      </View>

      {/* Hero Title */}
      <Text style={styles.heroItalic}>CardioSense AI /</Text>
      <Text style={styles.heroTitle}>Every heartbeat tells a story.</Text>
      <Text style={styles.heroSubtitle}>
        Clinical-grade heart sound intelligence powered by Acoustic AI. We help clinicians hear the murmurs and nuances that matter — catching early indicators of cardiovascular conditions with real-time confidence.
      </Text>

      {/* CTA Buttons Row */}
      <View style={styles.ctaRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/studio')}
          style={styles.primaryCta}
        >
          <Text style={styles.primaryCtaText}>Launch Studio</Text>
          <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/studio')}
          style={styles.secondaryCta}
        >
          <Text style={styles.secondaryCtaText}>Explore Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Card Graphic matching Web */}
      <View style={styles.heroGraphicCard}>
        <View style={styles.graphicIconBox}>
          <Heart size={44} color="#0284c7" />
          <Text style={styles.graphicBrandTitle}>CardioSense AI</Text>
          <View style={styles.graphicPillRow}>
            <Text style={styles.graphicSpecText}>PCG SPECTROGRAM</Text>
            <Text style={styles.graphicSpecDivider}>•</Text>
            <Text style={styles.graphicSpecAccent}>4.2 kHz SYNC</Text>
          </View>
        </View>

        <View style={styles.signalAcquiredBar}>
          <View style={styles.acquiredDot} />
          <Text style={styles.acquiredText}>Acoustic Signal Acquired</Text>
          <View style={styles.confBadge}>
            <Text style={styles.confText}>96.4% CONF</Text>
          </View>
        </View>
      </View>

      {/* Poetic Banner */}
      <View style={styles.poeticSection}>
        <Text style={styles.poeticTitle}>
          A heart doesn't ask for attention. It just keeps going —{' '}
          <Text style={styles.poeticAccent}>through long shifts, quiet mornings, and the people we love.</Text>
        </Text>
        <Text style={styles.poeticSub}>We built CardioSense to listen back.</Text>
      </View>

      {/* 6 Feature Value Props matching Web Grid */}
      <Text style={styles.sectionHeaderTitle}>Care That Listens Closer</Text>
      <Text style={styles.sectionHeaderSub}>
        We built CardioSense to give clinicians a quieter, kinder way to catch what often goes unheard.
      </Text>

      <View style={styles.featuresGrid}>
        <View style={styles.valueCard}>
          <View style={styles.valueIconBox}>
            <Heart size={20} color="#0284c7" />
          </View>
          <Text style={styles.valueStat}>Up to 96%+ ACCURACY</Text>
          <Text style={styles.valueTitle}>Hearing the Heart</Text>
          <Text style={styles.valueDesc}>
            Our models listen for the subtle murmurs and rhythms that can slip past a busy clinic visit.
          </Text>
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueIconBox}>
            <Clock size={20} color="#0284c7" />
          </View>
          <Text style={styles.valueTitle}>Earlier Answers</Text>
          <Text style={styles.valueDesc}>
            We help surface concerns long before symptoms speak up — when there's still room to act gently.
          </Text>
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueIconBox}>
            <Shield size={20} color="#0284c7" />
          </View>
          <Text style={styles.valueTitle}>A Wider Lens</Text>
          <Text style={styles.valueDesc}>
            From the irregular flutter of arrhythmia to the soft hush of a valve in trouble — we recognize the patterns worth a second look.
          </Text>
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueIconBox}>
            <TrendingUp size={20} color="#0284c7" />
          </View>
          <Text style={styles.valueTitle}>Built For Clinicians</Text>
          <Text style={styles.valueDesc}>
            Slips into existing workflows and EHRs, so the focus stays on the patient — not the software.
          </Text>
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueIconBox}>
            <Activity size={20} color="#0284c7" />
          </View>
          <Text style={styles.valueTitle}>Insights Worth Reading</Text>
          <Text style={styles.valueDesc}>
            Clear, human visualizations that make the data feel like a conversation, not a chart dump.
          </Text>
        </View>

        <View style={styles.valueCard}>
          <View style={styles.valueIconBox}>
            <Layers size={20} color="#0284c7" />
          </View>
          <Text style={styles.valueTitle}>A Heart Over Time</Text>
          <Text style={styles.valueDesc}>
            Track trends across months and years — because health is a story, not a snapshot.
          </Text>
        </View>
      </View>

      <DisclaimerBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 60,
  },
  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Theme.spacing.md,
  },
  headerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
    gap: 4,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  pillDivider: {
    fontSize: 11,
    color: '#94a3b8',
  },
  pillId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radius.full,
    marginBottom: Theme.spacing.sm,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284c7',
    marginRight: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
  },
  heroItalic: {
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
    marginBottom: Theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Theme.radius.full,
  },
  primaryCtaText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryCta: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Theme.radius.full,
  },
  secondaryCtaText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  heroGraphicCard: {
    backgroundColor: '#ffffff',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginVertical: Theme.spacing.md,
  },
  graphicIconBox: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  graphicBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284c7',
    marginTop: 6,
  },
  graphicPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  graphicSpecText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  graphicSpecDivider: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  graphicSpecAccent: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700',
  },
  signalAcquiredBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  acquiredDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284c7',
  },
  acquiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginLeft: 8,
  },
  confBadge: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  confText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  poeticSection: {
    marginVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.sm,
    alignItems: 'center',
    textAlign: 'center',
  },
  poeticTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 28,
  },
  poeticAccent: {
    color: '#0284c7',
  },
  poeticSub: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  featuresGrid: {
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  valueCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
  },
  valueIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  valueStat: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
