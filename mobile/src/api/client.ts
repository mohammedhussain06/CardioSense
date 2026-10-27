import axios, { AxiosError } from 'axios';
import * as FileSystem from 'expo-file-system';

const DEFAULT_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.106:8000';
const CONFIG_FILE = `${FileSystem.documentDirectory}cardiosense_api_url.txt`;

export let API_BASE_URL = DEFAULT_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Loads any persisted custom server URL saved by the user.
 */
export async function loadSavedApiBaseUrl(): Promise<string> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CONFIG_FILE);
    if (fileInfo.exists) {
      const saved = await FileSystem.readAsStringAsync(CONFIG_FILE);
      if (saved && saved.trim()) {
        const cleaned = sanitizeUrl(saved.trim());
        API_BASE_URL = cleaned;
        apiClient.defaults.baseURL = cleaned;
        return cleaned;
      }
    }
  } catch {
    // Fall back to default
  }
  return API_BASE_URL;
}

function sanitizeUrl(newUrl: string): string {
  let cleaned = newUrl.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  return cleaned;
}

export function updateApiBaseUrl(newUrl: string): string {
  const cleaned = sanitizeUrl(newUrl);
  API_BASE_URL = cleaned;
  apiClient.defaults.baseURL = cleaned;

  // Persist asynchronously
  FileSystem.writeAsStringAsync(CONFIG_FILE, cleaned).catch(() => {});
  return cleaned;
}

export interface ServerHealthCheck {
  ok: boolean;
  url: string;
  latencyMs?: number;
  computeDevice?: string;
  service?: string;
  error?: string;
}

/**
 * Pings /health on any target URL to verify connectivity.
 */
export async function testServerConnection(targetUrl?: string): Promise<ServerHealthCheck> {
  const testUrl = sanitizeUrl(targetUrl || API_BASE_URL);
  const startTime = Date.now();
  try {
    const response = await axios.get(`${testUrl}/health`, {
      timeout: 7000,
      headers: { Accept: 'application/json' },
    });
    const latencyMs = Date.now() - startTime;
    if (response.status === 200 && response.data?.status === 'online') {
      return {
        ok: true,
        url: testUrl,
        latencyMs,
        computeDevice: response.data?.compute_device || 'CPU',
        service: response.data?.service || 'CardioSense AI',
      };
    }
    return {
      ok: false,
      url: testUrl,
      error: `Server responded with HTTP ${response.status}`,
    };
  } catch (err: any) {
    let message = 'Cannot reach server';
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      message = 'Connection timed out (7s). Server may be offline or blocked by firewall.';
    } else if (err.message) {
      message = err.message;
    }
    return {
      ok: false,
      url: testUrl,
      error: message,
    };
  }
}

export interface ApiError {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
  targetUrl: string;
  raw?: unknown;
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    if (!axiosError.response) {
      return {
        message: `Cannot connect to CardioSense server at ${API_BASE_URL}. Ensure your backend is running with host 0.0.0.0, your phone is on the same Wi-Fi, or configure your server address.`,
        isNetworkError: true,
        targetUrl: API_BASE_URL,
        raw: axiosError,
      };
    }

    const detail = axiosError.response.data?.detail || axiosError.message;
    return {
      message: typeof detail === 'string' ? detail : 'Server returned an error.',
      statusCode: axiosError.response.status,
      isNetworkError: false,
      targetUrl: API_BASE_URL,
      raw: axiosError.response.data,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    isNetworkError: false,
    targetUrl: API_BASE_URL,
    raw: error,
  };
}

// Automatically load saved URL on startup
loadSavedApiBaseUrl();
