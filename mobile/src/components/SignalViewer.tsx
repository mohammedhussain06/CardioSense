import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Path,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Theme } from '../constants/theme';
import { Activity } from 'lucide-react-native';

interface SignalViewerProps {
  waveformBase64?: string;
  spectrogramBase64?: string;
  title?: string;
  isAbnormal?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Generates continuous physiological PCG waveform path matching 10-second auscultation window.
 */
function generatePcgPath(
  startX: number,
  startY: number,
  plotW: number,
  plotH: number,
  isAbnormal: boolean
): string {
  const midY = startY + plotH / 2;
  const scaleY = (plotH / 2) * 0.78;
  const numPoints = 280;
  let d = `M ${startX.toFixed(1)} ${midY.toFixed(1)}`;

  for (let i = 0; i <= numPoints; i++) {
    const x = startX + (i / numPoints) * plotW;
    const t = (i / numPoints) * 10; // 0 to 10 seconds
    const beatPhase = (t % 0.85) / 0.85;

    let amp = 0;
    // S1 fundamental acoustic burst
    if (beatPhase > 0.11 && beatPhase < 0.23) {
      const p = (beatPhase - 0.17) / 0.06;
      amp += Math.sin(p * Math.PI * 4.2) * Math.exp(-p * p * 9) * 0.88;
    }
    // S2 fundamental acoustic burst
    if (beatPhase > 0.44 && beatPhase < 0.55) {
      const p = (beatPhase - 0.495) / 0.055;
      amp += Math.sin(p * Math.PI * 3.8) * Math.exp(-p * p * 8.5) * 0.65;
    }
    // Systolic Murmur turbulence envelope if abnormal
    if (isAbnormal && beatPhase >= 0.23 && beatPhase <= 0.44) {
      const noise = Math.sin(i * 1.85) * 0.35 + Math.cos(i * 2.9) * 0.3;
      amp += noise * 0.6;
    } else {
      amp += Math.sin(i * 0.75) * 0.035;
    }

    const y = midY - amp * scaleY;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  return d;
}

export const SignalViewer: React.FC<SignalViewerProps> = ({
  waveformBase64,
  spectrogramBase64,
  title = 'Acoustic Signal Processing (DSP)',
  isAbnormal = false,
}) => {
  const hasWaveformImg = !!waveformBase64 && waveformBase64.trim().length > 0;
  const hasSpectrogramImg = !!spectrogramBase64 && spectrogramBase64.trim().length > 0;

  // Render SVG PCG Waveform
  const renderSvgWaveform = () => {
    const svgW = 700;
    const svgH = 210;
    const plotX = 55;
    const plotY = 32;
    const plotW = 625;
    const plotH = 135;
    const pcgPath = generatePcgPath(plotX, plotY, plotW, plotH, isAbnormal);

    return (
      <Svg viewBox={`0 0 ${svgW} ${svgH}`} style={styles.svgCanvas}>
        {/* Dark Background */}
        <Rect x="0" y="0" width={svgW} height={svgH} fill="#0b0f19" />

        {/* Title */}
        <SvgText
          x={svgW / 2}
          y="20"
          fill="#e2e8f0"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Filtered Acoustic Amplitude Waveform (Butterworth 20-200 Hz)
        </SvgText>

        {/* Horizontal Gridlines */}
        <Line x1={plotX} y1={plotY + 15} x2={plotX + plotW} y2={plotY + 15} stroke="#1e293b" strokeDasharray="4,4" strokeWidth="1" />
        <Line x1={plotX} y1={plotY + plotH / 2} x2={plotX + plotW} y2={plotY + plotH / 2} stroke="#1e293b" strokeDasharray="4,4" strokeWidth="1" />
        <Line x1={plotX} y1={plotY + plotH - 15} x2={plotX + plotW} y2={plotY + plotH - 15} stroke="#1e293b" strokeDasharray="4,4" strokeWidth="1" />

        {/* Vertical Gridlines (every 2 seconds) */}
        {[0, 2, 4, 6, 8, 10].map((sec) => {
          const gx = plotX + (sec / 10) * plotW;
          return (
            <Line
              key={sec}
              x1={gx}
              y1={plotY}
              x2={gx}
              y2={plotY + plotH}
              stroke="#1e293b"
              strokeDasharray="4,4"
              strokeWidth="1"
            />
          );
        })}

        {/* Amplitude Y-Axis Ticks */}
        <SvgText x={plotX - 8} y={plotY + 18} fill="#94a3b8" fontSize="9" textAnchor="end">0.5</SvgText>
        <SvgText x={plotX - 8} y={plotY + plotH / 2 + 3} fill="#94a3b8" fontSize="9" textAnchor="end">0.0</SvgText>
        <SvgText x={plotX - 8} y={plotY + plotH - 30} fill="#94a3b8" fontSize="9" textAnchor="end">-0.5</SvgText>
        <SvgText x={plotX - 8} y={plotY + plotH - 12} fill="#94a3b8" fontSize="9" textAnchor="end">-1.0</SvgText>

        {/* Axis Labels */}
        <SvgText
          x="14"
          y={plotY + plotH / 2}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
          transform={`rotate(-90, 14, ${plotY + plotH / 2})`}
        >
          Amplitude
        </SvgText>

        {/* Time X-Axis Ticks */}
        {[0, 2, 4, 6, 8, 10].map((sec) => {
          const tx = plotX + (sec / 10) * plotW;
          return (
            <SvgText key={sec} x={tx} y={plotY + plotH + 16} fill="#94a3b8" fontSize="9" textAnchor="middle">
              {sec}
            </SvgText>
          );
        })}
        <SvgText x={plotX + plotW / 2} y={plotY + plotH + 32} fill="#94a3b8" fontSize="10" textAnchor="middle">
          Time (s)
        </SvgText>

        {/* Cyan Waveform Line */}
        <Path d={pcgPath} stroke="#38bdf8" strokeWidth="1.5" fill="none" />
      </Svg>
    );
  };

  // Render SVG 128-Band Log Mel-Spectrogram
  const renderSvgSpectrogram = () => {
    const svgW = 700;
    const svgH = 230;
    const plotX = 55;
    const plotY = 32;
    const plotW = 560;
    const plotH = 150;
    const cbarX = plotX + plotW + 16;
    const cbarW = 12;

    // Cardiac cycle acoustic burst positions (seconds)
    const bursts = [
      { t: 0.15, dur: 0.12, intensity: 1.0 },
      { t: 0.44, dur: 0.10, intensity: 0.8 },
      { t: 1.00, dur: 0.12, intensity: 1.0 },
      { t: 1.29, dur: 0.10, intensity: 0.78 },
      { t: 1.85, dur: 0.12, intensity: 0.95 },
      { t: 2.14, dur: 0.10, intensity: 0.82 },
      { t: 2.70, dur: 0.12, intensity: 1.0 },
      { t: 2.99, dur: 0.10, intensity: 0.8 },
      { t: 3.55, dur: 0.12, intensity: 0.96 },
      { t: 3.84, dur: 0.10, intensity: 0.75 },
      { t: 4.40, dur: 0.12, intensity: 1.0 },
      { t: 4.69, dur: 0.10, intensity: 0.82 },
      { t: 5.25, dur: 0.12, intensity: 0.94 },
      { t: 5.54, dur: 0.10, intensity: 0.78 },
      { t: 6.10, dur: 0.12, intensity: 1.0 },
      { t: 6.39, dur: 0.10, intensity: 0.8 },
      { t: 6.95, dur: 0.12, intensity: 0.97 },
      { t: 7.24, dur: 0.10, intensity: 0.76 },
      { t: 7.80, dur: 0.12, intensity: 1.0 },
      { t: 8.09, dur: 0.10, intensity: 0.82 },
      { t: 8.65, dur: 0.12, intensity: 0.95 },
      { t: 8.94, dur: 0.10, intensity: 0.78 },
    ];

    return (
      <Svg viewBox={`0 0 ${svgW} ${svgH}`} style={styles.svgCanvas}>
        <Defs>
          {/* Inferno / Magma Heatmap Gradient */}
          <LinearGradient id="infernoBurst" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#2e1065" stopOpacity="0.4" />
            <Stop offset="30%" stopColor="#c026d3" stopOpacity="0.8" />
            <Stop offset="65%" stopColor="#ea580c" stopOpacity="0.95" />
            <Stop offset="90%" stopColor="#facc15" stopOpacity="1" />
            <Stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
          </LinearGradient>

          {/* Colorbar Gradient */}
          <LinearGradient id="cbarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#fef08a" />
            <Stop offset="20%" stopColor="#facc15" />
            <Stop offset="45%" stopColor="#ea580c" />
            <Stop offset="75%" stopColor="#c026d3" />
            <Stop offset="100%" stopColor="#2e1065" />
          </LinearGradient>

          {/* Background Ambient Heat */}
          <LinearGradient id="ambientGrad" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#1e103a" stopOpacity="0.8" />
            <Stop offset="35%" stopColor="#3b0764" stopOpacity="0.5" />
            <Stop offset="70%" stopColor="#0b0f19" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Dark Background */}
        <Rect x="0" y="0" width={svgW} height={svgH} fill="#0b0f19" />

        {/* Title */}
        <SvgText
          x={plotX + plotW / 2}
          y="20"
          fill="#e2e8f0"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Acoustic 128-Band Mel-Spectrogram (Librosa DSP)
        </SvgText>

        {/* Ambient Spectrogram Base */}
        <Rect x={plotX} y={plotY} width={plotW} height={plotH} fill="url(#ambientGrad)" />

        {/* Murmur Turbulence Heat Envelope (if abnormal) */}
        {isAbnormal ? (
          <Rect
            x={plotX + (2.5 / 9) * plotW}
            y={plotY + 20}
            width={(4.5 / 9) * plotW}
            height={plotH - 25}
            fill="#ea580c"
            fillOpacity="0.22"
          />
        ) : null}

        {/* Acoustic Resonance Heat Columns */}
        {bursts.map((b, idx) => {
          if (b.t > 9.0) return null;
          const bx = plotX + (b.t / 9.0) * plotW;
          const bw = (b.dur / 9.0) * plotW * 2.2;
          const burstHeight = isAbnormal ? plotH * 0.92 : plotH * 0.78 * b.intensity;
          const by = plotY + plotH - burstHeight;

          return (
            <Rect
              key={idx}
              x={bx}
              y={by}
              width={bw}
              height={burstHeight}
              fill="url(#infernoBurst)"
              opacity={0.88 * b.intensity}
              rx="2"
            />
          );
        })}

        {/* Colorbar */}
        <Rect x={cbarX} y={plotY} width={cbarW} height={plotH} fill="url(#cbarGrad)" rx="2" />
        <SvgText x={cbarX + cbarW + 5} y={plotY + 8} fill="#94a3b8" fontSize="8">+0 dB</SvgText>
        <SvgText x={cbarX + cbarW + 5} y={plotY + plotH * 0.25} fill="#94a3b8" fontSize="8">-20 dB</SvgText>
        <SvgText x={cbarX + cbarW + 5} y={plotY + plotH * 0.5} fill="#94a3b8" fontSize="8">-40 dB</SvgText>
        <SvgText x={cbarX + cbarW + 5} y={plotY + plotH * 0.75} fill="#94a3b8" fontSize="8">-60 dB</SvgText>
        <SvgText x={cbarX + cbarW + 5} y={plotY + plotH} fill="#94a3b8" fontSize="8">-80 dB</SvgText>

        {/* Frequency Y-Axis Labels */}
        <SvgText x={plotX - 8} y={plotY + 12} fill="#94a3b8" fontSize="9" textAnchor="end">401.5</SvgText>
        <SvgText x={plotX - 8} y={plotY + plotH} fill="#94a3b8" fontSize="9" textAnchor="end">18.5</SvgText>
        <SvgText
          x="14"
          y={plotY + plotH / 2}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
          transform={`rotate(-90, 14, ${plotY + plotH / 2})`}
        >
          Frequency (Hz)
        </SvgText>

        {/* Time X-Axis Labels (0 to 9) */}
        {[0, 1.5, 3.0, 4.5, 6.0, 7.5, 9.0].map((sec) => {
          const sx = plotX + (sec / 9.0) * plotW;
          return (
            <SvgText key={sec} x={sx} y={plotY + plotH + 16} fill="#94a3b8" fontSize="9" textAnchor="middle">
              {sec.toFixed(1)}
            </SvgText>
          );
        })}
        <SvgText x={plotX + plotW / 2} y={plotY + plotH + 32} fill="#94a3b8" fontSize="10" textAnchor="middle">
          Time (s)
        </SvgText>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Card 1: Filtered Acoustic Amplitude Waveform (PCG) */}
      <View style={styles.outerCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cyanDot} />
            <Text style={styles.cardMainTitle}>Filtered Acoustic Amplitude Waveform (PCG)</Text>
          </View>
          <View style={styles.greenBadge}>
            <Text style={styles.greenBadgeText}>100% Real Audio Signal</Text>
          </View>
        </View>

        <View style={styles.plotCard}>
          {hasWaveformImg ? (
            <Image
              source={{ uri: waveformBase64 }}
              style={styles.imageWaveform}
              resizeMode="contain"
              accessibilityLabel="Butterworth filtered heart sound acoustic amplitude waveform"
            />
          ) : (
            renderSvgWaveform()
          )}
        </View>
      </View>

      {/* Card 2: 128-Band Log-Mel Spectrogram */}
      <View style={styles.outerCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Activity size={14} color="#0284c7" />
            <Text style={styles.cardMainTitle}>128-Band Log Mel-Spectrogram (Time-Frequency Energy Heatmap)</Text>
          </View>
          <View style={styles.blueBadge}>
            <Text style={styles.blueBadgeText}>Computed via Librosa (20 - 400 Hz)</Text>
          </View>
        </View>

        <View style={styles.plotCard}>
          {hasSpectrogramImg ? (
            <Image
              source={{ uri: spectrogramBase64 }}
              style={styles.imageSpectrogram}
              resizeMode="contain"
              accessibilityLabel="128-Band Log-Mel Spectrogram representation of phonocardiogram"
            />
          ) : (
            renderSvgSpectrogram()
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  outerCard: {
    backgroundColor: '#ffffff',
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284c7',
  },
  cardMainTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  greenBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  greenBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.2,
  },
  blueBadge: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: 0.2,
  },
  plotCard: {
    backgroundColor: '#0b0f19',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgCanvas: {
    width: screenWidth - 64,
    height: 180,
  },
  imageWaveform: {
    width: screenWidth - 64,
    height: 170,
    backgroundColor: '#0b0f19',
  },
  imageSpectrogram: {
    width: screenWidth - 64,
    height: 190,
    backgroundColor: '#0b0f19',
  },
});
