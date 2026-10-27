import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStudioStore } from '../../src/features/studio/useStudioStore';
import { Theme } from '../../src/constants/theme';
import { ProbabilityGauge } from '../../src/components/ProbabilityGauge';
import { SignalViewer } from '../../src/components/SignalViewer';
import { SegmentTimeline } from '../../src/components/SegmentTimeline';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ShieldCheck, Share2 } from 'lucide-react-native';

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lastAnalysisResult } = useStudioStore();

  const handleShare = async () => {
    if (!lastAnalysisResult) return;
    try {
      await Share.share({
        title: `CardioSense Report — ${lastAnalysisResult.session_id}`,
        message: `${lastAnalysisResult.clinical_report.full_report_markdown}`,
      });
    } catch {
      // Ignored
    }
  };

  if (!lastAnalysisResult) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No analysis result found for Session {id}.</Text>
      </View>
    );
  }

  const { inference, clinical_report, session_id, filename } = lastAnalysisResult;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Session Metadata Banner */}
      <View style={styles.metaBanner}>
        <View>
          <Text style={styles.sessionId}>Session ID: {session_id}</Text>
          <Text style={styles.filenameText}>Recording: {filename}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={18} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Decision Boundary & Probability Gauge */}
      <ProbabilityGauge
        pAbnormal={inference.abnormal_probability}
        confidenceScore={inference.confidence_score}
      />

      {/* Executive Summary */}
      <View style={styles.reportCard}>
        <View style={styles.cardHeaderRow}>
          <ShieldCheck size={20} color={Theme.colors.primary} />
          <Text style={styles.cardHeaderTitle}>Clinical Acoustic Summary</Text>
        </View>
        <Text style={styles.summaryBody}>{clinical_report.summary}</Text>
      </View>

      {/* Signal Visuals (Waveform + Mel Spectrogram returned from backend) */}
      <SignalViewer
        waveformBase64={inference.waveform_image}
        spectrogramBase64={inference.spectrogram_image}
        isAbnormal={inference.classification === 'Abnormal'}
      />

      {/* Per-Segment Murmur Timeline */}
      <SegmentTimeline segments={inference.segments} />

      {/* Suggested Next Steps */}
      <View style={styles.reportCard}>
        <Text style={styles.cardHeaderTitle}>Suggested Clinical Follow-up</Text>
        {clinical_report.recommendations.map((rec, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{rec}</Text>
          </View>
        ))}
      </View>

      <DisclaimerBanner />

      <PrimaryButton title="Share Clinical Summary" onPress={handleShare} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.typography.sm,
    color: Theme.colors.textSecondary,
  },
  metaBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  sessionId: {
    fontSize: Theme.typography.sm,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  filenameText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.primaryMuted,
  },
  reportCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginVertical: Theme.spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginLeft: 6,
  },
  summaryBody: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: Theme.colors.primary,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
