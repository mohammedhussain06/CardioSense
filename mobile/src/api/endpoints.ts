import { apiClient, handleApiError, API_BASE_URL } from './client';
import {
  HealthResponse,
  SamplesResponse,
  PredictResponse,
  HistoryResponse,
  AuditTrailResponse,
  EvaluationMetricsResponse,
} from './types';
import { Platform } from 'react-native';

import * as FileSystem from 'expo-file-system';
import { CURATED_BENCHMARKS } from '../constants/benchmarks';
import { BENCHMARK_OFFLINE_REPORTS } from '../constants/benchmarkReports';

function getAudioMimeType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.m4a') || lower.endsWith('.mp4')) return 'audio/m4a';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.webm')) return 'audio/webm';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  if (lower.endsWith('.flac')) return 'audio/flac';
  return 'audio/wav';
}

export const Endpoints = {
  /**
   * Health & connectivity ping
   */
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await apiClient.get<HealthResponse>('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Fetch curated PhysioNet benchmark samples catalog
   */
  async getSamples(): Promise<SamplesResponse> {
    try {
      const response = await apiClient.get<SamplesResponse>('/api/sample-audios');
      if (response.data && response.data.samples && response.data.samples.length > 0) {
        return response.data;
      }
      return { samples: CURATED_BENCHMARKS };
    } catch {
      return { samples: CURATED_BENCHMARKS };
    }
  },

  /**
   * Constructs streamable audio URL for sample playback
   */
  getSampleAudioStreamUrl(fileId: string): string {
    return `${API_BASE_URL}/api/sample-audios/${fileId}`;
  },

  /**
   * Upload audio file for DSP filtering, CNN prediction, and Clinical Guardrail generation.
   * Handles native mobile File URIs, remote sample URLs (cached locally), and Web Blobs.
   */
  async predictHeartSound(
    fileSource: string | Blob,
    filename = 'recording.wav',
    patientTag = 'Mobile Screening Session'
  ): Promise<PredictResponse> {
    try {
      const formData = new FormData();
      const mimeType = getAudioMimeType(filename);

      if (typeof fileSource === 'string') {
        if (Platform.OS === 'web' && fileSource.startsWith('http')) {
          const res = await fetch(fileSource);
          const blob = await res.blob();
          formData.append('file', blob, filename);
        } else if (fileSource.startsWith('http://') || fileSource.startsWith('https://')) {
          // Native Android / iOS requires a local file URI for FormData
          const localTarget = `${FileSystem.cacheDirectory}${filename}`;
          const downloadRes = await FileSystem.downloadAsync(fileSource, localTarget);
          const audioFile = {
            uri: downloadRes.uri,
            type: mimeType,
            name: filename,
          } as unknown as Blob;
          formData.append('file', audioFile);
        } else {
          // Local file URI
          const audioFile = {
            uri: fileSource,
            type: mimeType,
            name: filename,
          } as unknown as Blob;
          formData.append('file', audioFile);
        }
      } else {
        formData.append('file', fileSource, filename);
      }

      formData.append('patient_tag', patientTag);

      const response = await apiClient.post<PredictResponse>('/api/predict', formData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Fetches real-time DSP preview (Waveform + Mel-Spectrogram)
   */
  async getDspPreview(
    fileSource: string,
    filename = 'recording.wav'
  ): Promise<{ waveform_image?: string; spectrogram_image?: string } | null> {
    try {
      const formData = new FormData();
      const mimeType = getAudioMimeType(filename);

      if (Platform.OS === 'web' && fileSource.startsWith('http')) {
        const res = await fetch(fileSource);
        const blob = await res.blob();
        formData.append('file', blob, filename);
      } else if (fileSource.startsWith('http://') || fileSource.startsWith('https://')) {
        const localTarget = `${FileSystem.cacheDirectory}dsp_${filename}`;
        const downloadRes = await FileSystem.downloadAsync(fileSource, localTarget);
        const audioFile = {
          uri: downloadRes.uri,
          type: mimeType,
          name: filename,
        } as unknown as Blob;
        formData.append('file', audioFile);
      } else {
        const audioFile = {
          uri: fileSource,
          type: mimeType,
          name: filename,
        } as unknown as Blob;
        formData.append('file', audioFile);
      }

      const response = await apiClient.post<{ waveform_image: string; spectrogram_image: string }>(
        '/api/dsp-preview',
        formData
      );
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Fast server-side direct benchmark prediction without uploading audio files
   * Gracefully falls back to pre-validated benchmark report if backend is offline.
   */
  async predictBenchmarkSample(
    sampleId: string,
    patientTag?: string
  ): Promise<PredictResponse> {
    try {
      const formData = new FormData();
      if (patientTag) {
        formData.append('patient_tag', patientTag);
      }
      const response = await apiClient.post<PredictResponse>(`/api/predict-sample/${sampleId}`, formData);
      return response.data;
    } catch (error) {
      const cleanId = sampleId.replace('.wav', '').trim();
      if (BENCHMARK_OFFLINE_REPORTS[cleanId]) {
        return BENCHMARK_OFFLINE_REPORTS[cleanId];
      }
      throw handleApiError(error);
    }
  },

  /**
   * Fast server-side direct benchmark DSP preview
   */
  async getDspPreviewSample(
    sampleId: string
  ): Promise<{ waveform_image?: string; spectrogram_image?: string } | null> {
    try {
      const response = await apiClient.get<{ waveform_image: string; spectrogram_image: string }>(
        `/api/dsp-preview-sample/${sampleId}`
      );
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Fetch patient history records from SQLite
   */
  async getHistory(limit = 30): Promise<HistoryResponse> {
    try {
      const response = await apiClient.get<HistoryResponse>(`/api/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Fetch tamper-evident cryptographic audit trail
   */
  async getAuditTrail(sessionId: string): Promise<AuditTrailResponse> {
    try {
      const response = await apiClient.get<AuditTrailResponse>(`/api/audit-logs/${sessionId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Fetch model evaluation test-set performance metrics
   */
  async getEvaluationMetrics(): Promise<EvaluationMetricsResponse> {
    try {
      const response = await apiClient.get<EvaluationMetricsResponse>('/api/evaluation-metrics');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
