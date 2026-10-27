import { PredictResponse } from '../api/types';

/**
 * Pre-validated clinical reports for all 5 PhysioNet benchmark cases.
 * Used as an offline fallback when the backend cannot be reached.
 */
export const BENCHMARK_OFFLINE_REPORTS: Record<string, PredictResponse> = {
  a0007: {
    status: 'success',
    session_id: 'OFFLINE-BENCHMARK-a0007',
    filename: 'a0007.wav',
    patient_tag: 'PhysioNet Benchmark Case #A0007',
    inference: {
      classification: 'Normal',
      confidence_score: 0.88,
      abnormal_probability: 0.12,
      normal_probability: 0.88,
      audio_duration_seconds: 35.7,
      total_segments: 14,
      anomalous_segments_count: 0,
      segments: Array.from({ length: 14 }, (_, i) => ({
        segment_index: i + 1,
        start_time_sec: Number((i * 2.5).toFixed(1)),
        end_time_sec: Number(((i + 1) * 2.5).toFixed(1)),
        normal_probability: 0.88,
        abnormal_probability: 0.12,
        status: 'Normal',
        severity_score: 0,
      })),
      spectrogram_image: '',
      waveform_image: '',
    },
    clinical_report: {
      summary:
        'Phonocardiogram recording of 35.7s demonstrates rhythmic S1/S2 acoustic intervals with balanced acoustic energy. Overall confidence is 88.0%. No predominant pathological murmur turbulence was detected across the 14 analyzed segments.',
      findings: [
        {
          category: 'Spectral Frequency Profile (20-200 Hz)',
          observation:
            'Acoustic signal filtered via 4th-order zero-phase Butterworth bandpass. Energy within primary cardiac range (20–200 Hz) analyzed for murmur turbulence.',
          status: 'Nominal',
        },
        {
          category: 'Cardiac Cycle Regularity',
          observation: 'Regular fundamental Lub-Dub (S1/S2) acoustic timing across recording windows.',
          status: 'Regular',
        },
      ],
      recommendations: [
        'No urgent phonocardiographic flags detected on current recording.',
        'Maintain standard routine preventive cardiac auscultation.',
        'If patient reports active palpitations or chest discomfort, conduct standard 12-lead ECG.',
      ],
      full_report_markdown:
        '## CardioSense Clinical Auscultation Summary\n\nPhonocardiogram recording of 35.7s demonstrates rhythmic S1/S2 acoustic intervals with balanced acoustic energy. Overall confidence is 88.0%. No predominant pathological murmur turbulence was detected.',
      guardrail_audit: {
        all_rules_passed: true,
        grounding_check: true,
        modifications_applied: [],
        classification_grounding: 'Normal',
        abnormal_prob_grounding: 0.12,
        disclaimer_present: true,
      },
      anomalous_segments_count: 0,
    },
  },

  a0006: {
    status: 'success',
    session_id: 'OFFLINE-BENCHMARK-a0006',
    filename: 'a0006.wav',
    patient_tag: 'PhysioNet Benchmark Case #A0006',
    inference: {
      classification: 'Abnormal',
      confidence_score: 0.94,
      abnormal_probability: 0.94,
      normal_probability: 0.06,
      audio_duration_seconds: 35.0,
      total_segments: 14,
      anomalous_segments_count: 11,
      segments: Array.from({ length: 14 }, (_, i) => ({
        segment_index: i + 1,
        start_time_sec: Number((i * 2.5).toFixed(1)),
        end_time_sec: Number(((i + 1) * 2.5).toFixed(1)),
        normal_probability: i < 3 ? 0.6 : 0.06,
        abnormal_probability: i < 3 ? 0.4 : 0.94,
        status: i < 3 ? 'Normal' : 'High Murmur Energy',
        severity_score: i < 3 ? 0 : 3,
      })),
      spectrogram_image: '',
      waveform_image: '',
    },
    clinical_report: {
      summary:
        'Phonocardiogram recording of 35.0s exhibits intense continuous systolic turbulence with an abnormal classification confidence of 94.0%. Elevated spectral turbulence was localized in 11 of 14 cardiac segments.',
      findings: [
        {
          category: 'Spectral Frequency Profile (20-200 Hz)',
          observation: 'Intense continuous high-frequency acoustic turbulence envelope detected above calibrated threshold.',
          status: 'Elevated Spectral Density',
        },
        {
          category: 'Cardiac Cycle Regularity',
          observation: 'Disrupted acoustic envelope observed during systolic intervals in 11 segments.',
          status: 'Irregularity Flagged',
        },
      ],
      recommendations: [
        'Urgent stethoscope auscultation over Aortic and Mitral valve areas indicated.',
        'Order 2D Transthoracic Echocardiogram (TTE) to evaluate valvular gradients and regurgitation.',
        'Review baseline 12-lead ECG for conduction defects.',
      ],
      full_report_markdown:
        '## CardioSense Clinical Auscultation Summary\n\nPhonocardiogram recording of 35.0s exhibits marked pathological murmur turbulence (94.0% confidence). Urgent cardiology evaluation recommended.',
      guardrail_audit: {
        all_rules_passed: true,
        grounding_check: true,
        modifications_applied: [],
        classification_grounding: 'Abnormal',
        abnormal_prob_grounding: 0.94,
        disclaimer_present: true,
      },
      anomalous_segments_count: 11,
    },
  },

  a0001: {
    status: 'success',
    session_id: 'OFFLINE-BENCHMARK-a0001',
    filename: 'a0001.wav',
    patient_tag: 'PhysioNet Benchmark Case #A0001',
    inference: {
      classification: 'Abnormal',
      confidence_score: 0.544,
      abnormal_probability: 0.544,
      normal_probability: 0.456,
      audio_duration_seconds: 35.0,
      total_segments: 14,
      anomalous_segments_count: 4,
      segments: Array.from({ length: 14 }, (_, i) => ({
        segment_index: i + 1,
        start_time_sec: Number((i * 2.5).toFixed(1)),
        end_time_sec: Number(((i + 1) * 2.5).toFixed(1)),
        normal_probability: i >= 4 && i <= 7 ? 0.42 : 0.65,
        abnormal_probability: i >= 4 && i <= 7 ? 0.58 : 0.35,
        status: i >= 4 && i <= 7 ? 'Moderate Murmur Energy' : 'Normal',
        severity_score: i >= 4 && i <= 7 ? 2 : 0,
      })),
      spectrogram_image: '',
      waveform_image: '',
    },
    clinical_report: {
      summary:
        'Phonocardiogram recording of 35.0s exhibits moderate systolic regurgitation turbulence near optimal decision boundary (54.4% abnormal probability, calibrated threshold tau*=0.4900).',
      findings: [
        {
          category: 'Mitral Regurgitation Auscultation Pattern',
          observation: 'Holosystolic murmur envelope identified over mid-precordium windows.',
          status: 'Elevated Spectral Density',
        },
      ],
      recommendations: [
        'Perform targeted cardiac auscultation over apex and axilla with bell and diaphragm.',
        'Consider transthoracic echocardiogram to assess mitral valve leaflet coaptation.',
      ],
      full_report_markdown:
        '## CardioSense Clinical Auscultation Summary\n\nPhonocardiogram suggests moderate systolic murmur near clinical boundary. Clinician review advised.',
      guardrail_audit: {
        all_rules_passed: true,
        grounding_check: true,
        modifications_applied: [],
        classification_grounding: 'Abnormal',
        abnormal_prob_grounding: 0.544,
        disclaimer_present: true,
      },
      anomalous_segments_count: 4,
    },
  },

  a0003: {
    status: 'success',
    session_id: 'OFFLINE-BENCHMARK-a0003',
    filename: 'a0003.wav',
    patient_tag: 'PhysioNet Benchmark Case #A0003',
    inference: {
      classification: 'Abnormal',
      confidence_score: 0.824,
      abnormal_probability: 0.824,
      normal_probability: 0.176,
      audio_duration_seconds: 30.7,
      total_segments: 12,
      anomalous_segments_count: 8,
      segments: Array.from({ length: 12 }, (_, i) => ({
        segment_index: i + 1,
        start_time_sec: Number((i * 2.5).toFixed(1)),
        end_time_sec: Number(((i + 1) * 2.5).toFixed(1)),
        normal_probability: i < 4 ? 0.55 : 0.15,
        abnormal_probability: i < 4 ? 0.45 : 0.85,
        status: i < 4 ? 'Normal' : 'High Murmur Energy',
        severity_score: i < 4 ? 0 : 3,
      })),
      spectrogram_image: '',
      waveform_image: '',
    },
    clinical_report: {
      summary:
        'Phonocardiogram recording of 30.7s exhibits prominent holosystolic murmur with high acoustic energy (82.4% abnormal probability).',
      findings: [
        {
          category: 'Holosystolic Acoustic Profile',
          observation: 'Plateau-shaped high-frequency turbulence spanning the entire S1-S2 interval.',
          status: 'Elevated Spectral Density',
        },
      ],
      recommendations: [
        'Comprehensive echocardiographic evaluation for ventricular septal defect or severe valvular regurgitation.',
        'Serial clinical monitoring.',
      ],
      full_report_markdown:
        '## CardioSense Clinical Auscultation Summary\n\nHolosystolic murmur identified with high confidence (82.4%).',
      guardrail_audit: {
        all_rules_passed: true,
        grounding_check: true,
        modifications_applied: [],
        classification_grounding: 'Abnormal',
        abnormal_prob_grounding: 0.824,
        disclaimer_present: true,
      },
      anomalous_segments_count: 8,
    },
  },

  a0004: {
    status: 'success',
    session_id: 'OFFLINE-BENCHMARK-a0004',
    filename: 'a0004.wav',
    patient_tag: 'PhysioNet Benchmark Case #A0004',
    inference: {
      classification: 'Normal',
      confidence_score: 0.667,
      abnormal_probability: 0.333,
      normal_probability: 0.667,
      audio_duration_seconds: 35.0,
      total_segments: 14,
      anomalous_segments_count: 0,
      segments: Array.from({ length: 14 }, (_, i) => ({
        segment_index: i + 1,
        start_time_sec: Number((i * 2.5).toFixed(1)),
        end_time_sec: Number(((i + 1) * 2.5).toFixed(1)),
        normal_probability: 0.67,
        abnormal_probability: 0.33,
        status: 'Normal',
        severity_score: 0,
      })),
      spectrogram_image: '',
      waveform_image: '',
    },
    clinical_report: {
      summary:
        'Phonocardiogram recording of 35.0s demonstrates clear physiological Lub-Dub cadence with 66.7% normal confidence. Well below abnormal threshold (tau*=0.4900).',
      findings: [
        {
          category: 'Acoustic Regularity',
          observation: 'Consistent physiological heart sounds without dominant pathological murmurs.',
          status: 'Nominal',
        },
      ],
      recommendations: [
        'Normal acoustic examination. Continue routine clinical checkups.',
      ],
      full_report_markdown:
        '## CardioSense Clinical Auscultation Summary\n\nNormal physiological heart sound recording.',
      guardrail_audit: {
        all_rules_passed: true,
        grounding_check: true,
        modifications_applied: [],
        classification_grounding: 'Normal',
        abnormal_prob_grounding: 0.333,
        disclaimer_present: true,
      },
      anomalous_segments_count: 0,
    },
  },
};
