import torch
from typing import Tuple, Dict, Any

class AudioDuration:

    @classmethod
    def INPUT_TYPES(cls) -> Dict[str, Dict[str, Any]]:
        return {
            "required": {
                "audio": ("AUDIO",),
            },
        }

    RETURN_TYPES = ("FLOAT", "STRING", "INT")
    RETURN_NAMES = ("duration_seconds", "formatted_time", "duration_ms")
    FUNCTION = "calculate_audio_duration"
    CATEGORY = "audio/utils"
    DESCRIPTION = "Calculates the duration of the audio."
    OUTPUT_NODE = False

    def calculate_audio_duration(self, audio) -> Tuple[float, str, int]:

        if audio is None:
            raise ValueError("Audio input cannot be empty / 音频输入不能为空")

        audio_tensor, sample_rate = self._extract_audio_info(audio)

        if audio_tensor is None:
            raise ValueError("Cannot extract valid audio tensor from AUDIO input / 无法从AUDIO输入中提取有效的音频张量")

        original_shape = audio_tensor.shape

        if len(original_shape) == 1:
            num_samples = original_shape[0]
        elif len(original_shape) == 2:
            num_samples = original_shape[1]
        elif len(original_shape) == 3:
            num_samples = original_shape[2]
        else:
            raise ValueError(f"Unsupported audio tensor dimensions: {len(original_shape)} / 不支持的音频张量维度: {len(original_shape)}")

        duration_seconds = num_samples / sample_rate

        hours = int(duration_seconds // 3600)
        minutes = int((duration_seconds % 3600) // 60)
        seconds = int(duration_seconds % 60)
        milliseconds = int((duration_seconds - int(duration_seconds)) * 1000)

        formatted_time = f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"
        duration_ms = int(duration_seconds * 1000)

        print(f"Audio Duration Calculation - Samples: {num_samples}, Sample Rate: {sample_rate}Hz / 音频时长计算 - 采样数: {num_samples}, 采样率: {sample_rate}Hz")
        print(f"Duration: {formatted_time} ({duration_seconds:.3f}s) / 时长: {formatted_time} ({duration_seconds:.3f}秒)")

        return (duration_seconds, formatted_time, duration_ms)

    def _extract_audio_info(self, audio):
        audio_tensor = None
        sample_rate = 44100

        if isinstance(audio, torch.Tensor):
            audio_tensor = audio

        elif isinstance(audio, dict):
            possible_tensor_keys = ['samples', 'audio', 'data', 'waveform', 'tensor']

            for key in possible_tensor_keys:
                if key in audio and isinstance(audio[key], torch.Tensor):
                    audio_tensor = audio[key]
                    break

            if audio_tensor is None:
                for value in audio.values():
                    if isinstance(value, torch.Tensor):
                        audio_tensor = value
                        break

            possible_sr_keys = ['sample_rate', 'sampling_rate', 'sr', 'rate']
            for key in possible_sr_keys:
                if key in audio and isinstance(audio[key], (int, float)):
                    sample_rate = audio[key]
                    break

        return audio_tensor, sample_rate
