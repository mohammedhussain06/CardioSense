import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Endpoints } from '../api/endpoints';
import { API_BASE_URL } from '../api/client';
import { Theme } from '../constants/theme';
import { ServerConfigModal } from './ServerConfigModal';
import { Settings } from 'lucide-react-native';

interface BackendStatusPillProps {
  compact?: boolean;
}

export const BackendStatusPill: React.FC<BackendStatusPillProps> = ({ compact = false }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['server-health', API_BASE_URL],
    queryFn: () => Endpoints.getHealth(),
    refetchInterval: 12000,
    retry: 1,
  });

  const isOnline = !isError && data?.status === 'online';

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[styles.pill, isOnline ? styles.pillOnline : styles.pillOffline]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#0284c7" style={styles.indicator} />
        ) : (
          <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        )}
        <Text style={[styles.text, isOnline ? styles.textOnline : styles.textOffline]}>
          {isLoading
            ? 'Checking Server...'
            : isOnline
            ? compact
              ? 'Server Live'
              : `Server Live (${data?.compute_device?.toUpperCase() || 'CPU'})`
            : 'Server Offline'}
        </Text>
        <Settings size={11} color={isOnline ? '#15803d' : '#b91c1c'} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      <ServerConfigModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaved={() => refetch()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillOnline: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  pillOffline: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  dotOnline: {
    backgroundColor: '#22c55e',
  },
  dotOffline: {
    backgroundColor: '#ef4444',
  },
  indicator: {
    marginRight: 5,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textOnline: {
    color: '#15803d',
  },
  textOffline: {
    color: '#b91c1c',
  },
});
