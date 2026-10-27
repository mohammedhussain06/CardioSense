import io
import os
import subprocess
import tempfile
from typing import List, Tuple, Union
import numpy as np
import scipy.signal
import soundfile as sf
import librosa

try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_EXE = None


class AudioCleaner:
    """
    CardioSense Digital Signal Processing (DSP) Pipeline:
    - Standardizes heart sound audio to 2,000 Hz (Nyquist 1,000 Hz covers all fundamental PCG bandwidth).
    - Applies a 4th-order Butterworth bandpass filter (20 Hz to 200 Hz) to eliminate ambient noise,
      speech, sensor friction, and baseline drift.
    - Zero-phase filtering via filtfilt ensures temporal integrity of S1, S2, S3, S4 heart sounds.
    - Normalizes amplitude to [-1.0, 1.0].
    - Segments audio into fixed-length windows with configurable overlap.
    """

    def __init__(
        self,
        target_sr: int = 2000,
        lowcut: float = 20.0,
        highcut: float = 200.0,
        filter_order: int = 4,
        window_duration: float = 4.0,
        hop_duration: float = 2.0,
    ):
        self.target_sr = target_sr
        self.lowcut = lowcut
        self.highcut = highcut
        self.filter_order = filter_order
        self.window_duration = window_duration
        self.hop_duration = hop_duration
        self.window_samples = int(window_duration * target_sr)
        self.hop_samples = int(hop_duration * target_sr)

    def _decode_via_ffmpeg(self, input_path: str) -> Tuple[np.ndarray, int]:
        """Decodes M4A/AAC/WebM/MP3 to standard 16-bit PCM WAV using bundled FFmpeg."""
        if not FFMPEG_EXE:
            raise RuntimeError("FFmpeg executable not available.")
        tmp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp_wav.close()
        try:
            cmd = [
                FFMPEG_EXE,
                "-y",
                "-i", input_path,
                "-ac", "1",
                "-ar", str(self.target_sr),
                tmp_wav.name,
            ]
            subprocess.run(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True,
            )
            data, sr = sf.read(tmp_wav.name, dtype="float32")
            return data, sr
        finally:
            if os.path.exists(tmp_wav.name):
                try:
                    os.remove(tmp_wav.name)
                except Exception:
                    pass

    def load_audio(self, audio_source: Union[str, bytes, io.BytesIO]) -> Tuple[np.ndarray, int]:
        """
        Robust audio loader that decodes ANY audio format (WAV, M4A, AAC, MP3, WebM, OGG, 3GP)
        from mobile phone microphones, web browsers, or files on disk.
        """
        # Case 1: Already a file path on disk
        if isinstance(audio_source, str) and os.path.isfile(audio_source):
            try:
                y, orig_sr = sf.read(audio_source)
            except Exception:
                try:
                    y, orig_sr = self._decode_via_ffmpeg(audio_source)
                except Exception:
                    y, orig_sr = librosa.load(audio_source, sr=None, mono=True)
        else:
            # Case 2: In-memory bytes or BytesIO
            if isinstance(audio_source, io.BytesIO):
                raw_bytes = audio_source.getvalue()
            elif isinstance(audio_source, bytes):
                raw_bytes = audio_source
            else:
                raise ValueError("Unsupported audio source format.")

            # Fast path: Try reading directly with soundfile (works for standard WAV/FLAC)
            try:
                y, orig_sr = sf.read(io.BytesIO(raw_bytes))
            except Exception:
                # Disk fallback: Save to temporary file so FFmpeg/librosa can decode M4A/AAC/WebM
                ext = ".m4a"
                if len(raw_bytes) > 16:
                    if raw_bytes[:4] == b"RIFF":
                        ext = ".wav"
                    elif b"ftyp" in raw_bytes[:16]:
                        ext = ".m4a"
                    elif raw_bytes[:4] in (b"\x1a\x45\xdf\xa3", b"OggS"):
                        ext = ".webm"
                    elif raw_bytes[:3] == b"ID3" or raw_bytes[:2] == b"\xff\xfb":
                        ext = ".mp3"

                with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                    tmp.write(raw_bytes)
                    tmp_path = tmp.name

                try:
                    try:
                        y, orig_sr = self._decode_via_ffmpeg(tmp_path)
                    except Exception:
                        y, orig_sr = librosa.load(tmp_path, sr=None, mono=True)
                finally:
                    if os.path.exists(tmp_path):
                        try:
                            os.remove(tmp_path)
                        except Exception:
                            pass

        # Convert stereo / multi-channel to mono
        if y.ndim > 1:
            y = np.mean(y, axis=1)

        # Resample if original sample rate doesn't match target
        if orig_sr != self.target_sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=self.target_sr)

        return y.astype(np.float32), self.target_sr

    def butter_bandpass_filter(self, data: np.ndarray) -> np.ndarray:
        """
        Applies a zero-phase 4th-order Butterworth bandpass filter (20 - 200 Hz).
        """
        nyq = 0.5 * self.target_sr
        low = self.lowcut / nyq
        high = self.highcut / nyq

        # Ensure frequencies are within valid normalized bounds (0, 1)
        low = max(0.001, min(low, 0.99))
        high = max(low + 0.01, min(high, 0.999))

        b, a = scipy.signal.butter(self.filter_order, [low, high], btype="bandpass")
        filtered_data = scipy.signal.filtfilt(b, a, data)
        return filtered_data.astype(np.float32)

    def normalize(self, data: np.ndarray) -> np.ndarray:
        """
        Normalizes waveform amplitude to [-1.0, 1.0] with robust outlier rejection
        to handle phone microphone handling friction and faint heart sounds.
        """
        abs_data = np.abs(data)
        if len(abs_data) == 0:
            return data.astype(np.float32)

        # 99.5th percentile scaling rejects isolated friction clicks/taps
        p99 = float(np.percentile(abs_data, 99.5))
        scale_ref = p99 if p99 > 1e-4 else float(np.max(abs_data))

        if scale_ref > 1e-6:
            scaled = data / scale_ref
            return np.clip(scaled, -1.0, 1.0).astype(np.float32)
        return data.astype(np.float32)

    def process(self, audio_source: Union[str, bytes, io.BytesIO]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Full DSP Pipeline: Load -> Resample -> Bandpass Filter -> Normalize.
        Returns:
            raw_audio: Resampled original signal (for visual comparisons).
            cleaned_audio: Bandpass-filtered & normalized signal.
        """
        raw_audio, _ = self.load_audio(audio_source)
        filtered = self.butter_bandpass_filter(raw_audio)
        cleaned_audio = self.normalize(filtered)
        return raw_audio, cleaned_audio

    def segment_audio(self, audio: np.ndarray) -> List[np.ndarray]:
        """
        Splits an audio array into fixed-length windows (e.g., 4s / 8000 samples).
        Pads the final segment with zeros if shorter than window_samples.
        """
        total_samples = len(audio)
        if total_samples <= self.window_samples:
            padded = np.pad(audio, (0, self.window_samples - total_samples), mode="constant")
            return [padded]

        segments = []
        start = 0
        while start < total_samples:
            end = start + self.window_samples
            if end <= total_samples:
                segments.append(audio[start:end])
            else:
                tail = audio[start:total_samples]
                padded_tail = np.pad(tail, (0, self.window_samples - len(tail)), mode="constant")
                segments.append(padded_tail)
                break
            start += self.hop_samples

        return segments
