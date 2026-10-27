import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export interface RecordedAudioResult {
  uri: string;
  filename: string;
  durationSec: number;
  blob?: Blob;
}

class LiveAudioRecorderService {
  private nativeRecording: Audio.Recording | null = null;
  private webMediaRecorder: any = null;
  private webAudioChunks: Blob[] = [];
  private webStream: any = null;
  private startTime: number = 0;
  private _isRecording: boolean = false;

  get recordingActive(): boolean {
    return this._isRecording;
  }

  /**
   * Request microphone permission across Native Android/iOS and Web.
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('[AudioRecorder] Web getUserMedia is not supported in this browser context.');
          return false;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      }

      const response = await Audio.requestPermissionsAsync();
      return response.granted;
    } catch (err) {
      console.warn('[AudioRecorder] Permission request failed:', err);
      return false;
    }
  }

  /**
   * Starts live hardware microphone recording.
   */
  async start(): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error(
        'Microphone permission denied. Please grant microphone access in device settings to record live phonocardiograms.'
      );
    }

    this.startTime = Date.now();
    this._isRecording = true;

    if (Platform.OS === 'web') {
      this.webAudioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.webStream = stream;
      const mediaRecorder = new (window as any).MediaRecorder(stream);
      this.webMediaRecorder = mediaRecorder;

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          this.webAudioChunks.push(event.data);
        }
      };

      mediaRecorder.start(200);
      return;
    }

    // Native Android / iOS via expo-av
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const recording = new Audio.Recording();
    const recordingOptions: Audio.RecordingOptions = {
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

    await recording.prepareToRecordAsync(recordingOptions);
    await recording.startAsync();
    this.nativeRecording = recording;
  }

  /**
   * Stops live recording, saves the file, and returns the authentic audio URI and metadata.
   */
  async stop(): Promise<RecordedAudioResult> {
    const elapsedSec = Math.max(1.0, (Date.now() - this.startTime) / 1000);
    this._isRecording = false;
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(11, 19);

    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        if (!this.webMediaRecorder) {
          resolve({
            uri: '',
            filename: `live_auscultation_${timeStamp}.wav`,
            durationSec: elapsedSec,
          });
          return;
        }

        this.webMediaRecorder.onstop = () => {
          const blob = new Blob(this.webAudioChunks, { type: 'audio/wav' });
          const objectUrl = URL.createObjectURL(blob);
          if (this.webStream) {
            this.webStream.getTracks().forEach((track: any) => track.stop());
            this.webStream = null;
          }
          this.webMediaRecorder = null;
          resolve({
            uri: objectUrl,
            filename: `live_auscultation_${timeStamp}.wav`,
            durationSec: parseFloat(elapsedSec.toFixed(1)),
            blob,
          });
        };

        this.webMediaRecorder.stop();
      });
    }

    // Native stop
    if (!this.nativeRecording) {
      throw new Error('No active recording instance found.');
    }

    try {
      await this.nativeRecording.stopAndUnloadAsync();
      const uri = this.nativeRecording.getURI();
      this.nativeRecording = null;

      const ext = Platform.OS === 'android' ? 'm4a' : 'wav';
      const filename = `live_auscultation_${timeStamp}.${ext}`;

      return {
        uri: uri || '',
        filename,
        durationSec: parseFloat(elapsedSec.toFixed(1)),
      };
    } catch (err: any) {
      this.nativeRecording = null;
      throw new Error(`Failed to finalize live recording: ${err.message}`);
    }
  }
}

export const liveAudioRecorder = new LiveAudioRecorderService();

