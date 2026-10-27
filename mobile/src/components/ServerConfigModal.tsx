import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  API_BASE_URL,
  updateApiBaseUrl,
  testServerConnection,
  ServerHealthCheck,
} from '../api/client';
import { Theme } from '../constants/theme';
import { Server, CheckCircle2, AlertTriangle, Wifi, X, RefreshCw } from 'lucide-react-native';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
  initialMessage?: string;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
  onSaved,
  initialMessage,
}) => {
  const [urlInput, setUrlInput] = useState<string>(API_BASE_URL);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ServerHealthCheck | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testServerConnection(urlInput);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const savedUrl = updateApiBaseUrl(urlInput);
    if (onSaved) {
      onSaved(savedUrl);
    }
    onClose();
  };

  const applyPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    setTestResult(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Server size={20} color={Theme.colors.primary} />
              <Text style={styles.headerTitle}>CardioSense Server Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {initialMessage ? (
              <View style={styles.alertBanner}>
                <AlertTriangle size={16} color="#dc2626" />
                <Text style={styles.alertBannerText}>{initialMessage}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Backend Server URL / Host:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={urlInput}
                onChangeText={(text) => {
                  setUrlInput(text);
                  setTestResult(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="http://192.168.1.106:8000"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Test Connection Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTest}
              disabled={isTesting}
              style={styles.testBtn}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#0284c7" />
              ) : (
                <>
                  <RefreshCw size={14} color="#0284c7" />
                  <Text style={styles.testBtnText}>Test Server Connection</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Test Results Display */}
            {testResult ? (
              <View
                style={[
                  styles.resultBox,
                  testResult.ok ? styles.resultSuccess : styles.resultError,
                ]}
              >
                {testResult.ok ? (
                  <>
                    <View style={styles.resultTitleRow}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <Text style={styles.successTitle}>Server Online & Connected!</Text>
                    </View>
                    <Text style={styles.resultDetails}>
                      • Device: {testResult.computeDevice?.toUpperCase() || 'CPU'}
                      {'\n'}• Latency: {testResult.latencyMs} ms
                      {'\n'}• Status: 100% Operational
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.resultTitleRow}>
                      <AlertTriangle size={16} color="#dc2626" />
                      <Text style={styles.errorTitle}>Cannot Connect</Text>
                    </View>
                    <Text style={styles.errorDetails}>{testResult.error}</Text>
                  </>
                )}
              </View>
            ) : null}

            {/* Presets & Help */}
            <Text style={styles.presetLabel}>Quick Presets:</Text>
            <View style={styles.presetsRow}>
              <TouchableOpacity
                onPress={() => applyPreset('http://192.168.1.106:8000')}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>Local PC (192.168.1.106)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => applyPreset('http://10.0.2.2:8000')}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>Android Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tipBox}>
              <Wifi size={14} color="#0284c7" />
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Phone Connection Tip:</Text> Ensure your phone and PC are on the same Wi-Fi, and your backend was launched with host 0.0.0.0. You can also paste your Cloudflare Tunnel or Railway URL here.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save & Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 18,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c',
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    height: 42,
    fontSize: 13,
    color: '#0f172a',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 6,
    marginBottom: 12,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
  },
  resultBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  resultError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  resultDetails: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  errorDetails: {
    fontSize: 11,
    color: '#991b1b',
    lineHeight: 15,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  presetChipText: {
    fontSize: 11,
    color: '#334155',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
});
