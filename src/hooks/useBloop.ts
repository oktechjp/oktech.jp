import { useCallback, useRef } from "react";

interface BloopOptions {
  minPitch?: number;
  maxPitch?: number;
  duration?: number;
  volume?: number;
  preset?: number;
}

interface SoundConfig {
  minPitch: number;
  maxPitch: number;
  duration: number;
  volume: number;
  waveType?: OscillatorType;
  filterType?: BiquadFilterType;
  filterFreq?: number;
  filterQ?: number;
  pitchDecay?: number; // How much pitch drops (0-1, where 1 = drops to 0)
  harmonics?: number[]; // Additional harmonic frequencies as multipliers
  noiseAmount?: number; // Mix in white noise (0-1)
  attack?: number; // Attack time in ms
  decay?: number; // Decay time as fraction of duration
}

// Preset sound configurations
const SOUND_PRESETS: SoundConfig[] = [
  // Original experimental sounds (0-9) - now with varied synthesis
  {
    minPitch: 200,
    maxPitch: 250,
    duration: 300,
    volume: 0.4,
    waveType: "sine",
    pitchDecay: 0.8,
    filterType: "lowpass",
    filterFreq: 800,
  }, // 0: Water drop
  {
    minPitch: 800,
    maxPitch: 800,
    duration: 30,
    volume: 0.3,
    waveType: "square",
    attack: 1,
    decay: 0.2,
    filterType: "highpass",
    filterFreq: 600,
  }, // 1: Click/pop
  {
    minPitch: 1000,
    maxPitch: 200,
    duration: 200,
    volume: 0.25,
    waveType: "sine",
    pitchDecay: 1,
    filterType: "bandpass",
    filterFreq: 600,
    filterQ: 10,
  }, // 2: Slide down
  {
    minPitch: 1500,
    maxPitch: 1500,
    duration: 150,
    volume: 0.2,
    waveType: "sine",
    harmonics: [1, 2, 3],
    attack: 5,
    decay: 0.8,
  }, // 3: Ping
  {
    minPitch: 100,
    maxPitch: 2000,
    duration: 400,
    volume: 0.3,
    waveType: "sawtooth",
    pitchDecay: 0.5,
    filterType: "lowpass",
    filterFreq: 3000,
  }, // 4: Laser
  {
    minPitch: 300,
    maxPitch: 1200,
    duration: 100,
    volume: 0.35,
    waveType: "triangle",
    pitchDecay: 0.3,
    harmonics: [1, 1.5],
  }, // 5: Spring boing
  {
    minPitch: 50,
    maxPitch: 50,
    duration: 500,
    volume: 0.5,
    waveType: "sawtooth",
    noiseAmount: 0.3,
    filterType: "lowpass",
    filterFreq: 200,
  }, // 6: Rumble
  {
    minPitch: 440,
    maxPitch: 880,
    duration: 80,
    volume: 0.25,
    waveType: "square",
    filterType: "bandpass",
    filterFreq: 660,
    filterQ: 20,
  }, // 7: 8-bit jump
  {
    minPitch: 2000,
    maxPitch: 100,
    duration: 300,
    volume: 0.3,
    waveType: "sine",
    pitchDecay: 0.9,
    harmonics: [1, 0.5],
  }, // 8: Bomb drop
  {
    minPitch: 600,
    maxPitch: 600,
    duration: 40,
    volume: 0.4,
    waveType: "triangle",
    noiseAmount: 0.5,
    attack: 1,
    decay: 0.1,
  }, // 9: Hihat

  // Low/Sad/Prod sounds (10-19) - heavy bass and atmospheric
  {
    minPitch: 40,
    maxPitch: 40,
    duration: 800,
    volume: 0.6,
    waveType: "sine",
    harmonics: [1, 0.5, 0.25],
    filterType: "lowpass",
    filterFreq: 100,
  }, // 10: Sub bass hit
  {
    minPitch: 80,
    maxPitch: 60,
    duration: 600,
    volume: 0.4,
    waveType: "sawtooth",
    pitchDecay: 0.3,
    filterType: "lowpass",
    filterFreq: 300,
    noiseAmount: 0.1,
  }, // 11: Kick drum
  {
    minPitch: 110,
    maxPitch: 55,
    duration: 400,
    volume: 0.45,
    waveType: "square",
    pitchDecay: 0.5,
    filterType: "lowpass",
    filterFreq: 400,
  }, // 12: Tom drum
  {
    minPitch: 200,
    maxPitch: 30,
    duration: 1000,
    volume: 0.5,
    waveType: "sine",
    pitchDecay: 0.95,
    harmonics: [1, 2, 3],
  }, // 13: 808 drop
  {
    minPitch: 150,
    maxPitch: 150,
    duration: 100,
    volume: 0.35,
    waveType: "sine",
    noiseAmount: 0.7,
    attack: 1,
    decay: 0.2,
  }, // 14: Knock
  {
    minPitch: 60,
    maxPitch: 120,
    duration: 300,
    volume: 0.4,
    waveType: "triangle",
    pitchDecay: -0.5,
    filterType: "bandpass",
    filterFreq: 90,
    filterQ: 5,
  }, // 15: Reverse bass
  {
    minPitch: 90,
    maxPitch: 45,
    duration: 500,
    volume: 0.5,
    waveType: "sawtooth",
    pitchDecay: 0.5,
    harmonics: [1, 0.7, 0.5],
    filterType: "lowpass",
    filterFreq: 250,
  }, // 16: Trap bass
  {
    minPitch: 35,
    maxPitch: 35,
    duration: 2000,
    volume: 0.3,
    waveType: "sine",
    noiseAmount: 0.2,
    filterType: "lowpass",
    filterFreq: 80,
  }, // 17: Earthquake
  {
    minPitch: 100,
    maxPitch: 80,
    duration: 250,
    volume: 0.4,
    waveType: "square",
    pitchDecay: 0.2,
    harmonics: [1, 0.3],
    filterType: "lowpass",
    filterFreq: 200,
  }, // 18: Thud
  {
    minPitch: 70,
    maxPitch: 50,
    duration: 400,
    volume: 0.45,
    waveType: "triangle",
    pitchDecay: 0.3,
    noiseAmount: 0.4,
    filterType: "lowpass",
    filterFreq: 150,
  }, // 19: Impact

  // Happy/Kawaii/Poke sounds (20-29) - bright and playful
  {
    minPitch: 800,
    maxPitch: 1600,
    duration: 80,
    volume: 0.2,
    waveType: "sine",
    pitchDecay: -1,
    harmonics: [1, 2, 4],
    attack: 2,
  }, // 20: Coin
  {
    minPitch: 2000,
    maxPitch: 2000,
    duration: 30,
    volume: 0.15,
    waveType: "triangle",
    harmonics: [1, 3, 5],
    filterType: "highpass",
    filterFreq: 1500,
  }, // 21: Ting
  {
    minPitch: 600,
    maxPitch: 1200,
    duration: 60,
    volume: 0.25,
    waveType: "square",
    pitchDecay: -0.5,
    filterType: "bandpass",
    filterFreq: 900,
    filterQ: 10,
  }, // 22: Power up
  {
    minPitch: 1500,
    maxPitch: 3000,
    duration: 100,
    volume: 0.2,
    waveType: "sine",
    pitchDecay: -1,
    harmonics: [1, 1.5, 2],
    noiseAmount: 0.1,
  }, // 23: Sparkle
  {
    minPitch: 1000,
    maxPitch: 500,
    duration: 120,
    volume: 0.3,
    waveType: "triangle",
    pitchDecay: 0.5,
    harmonics: [1, 2],
    attack: 5,
    decay: 0.7,
  }, // 24: Pluck
  {
    minPitch: 400,
    maxPitch: 1600,
    duration: 150,
    volume: 0.25,
    waveType: "square",
    pitchDecay: -2,
    filterType: "highpass",
    filterFreq: 500,
  }, // 25: Jump
  {
    minPitch: 1200,
    maxPitch: 1200,
    duration: 40,
    volume: 0.2,
    waveType: "sine",
    noiseAmount: 0.3,
    harmonics: [1, 4, 7],
    attack: 1,
  }, // 26: Blip
  {
    minPitch: 300,
    maxPitch: 2400,
    duration: 200,
    volume: 0.3,
    waveType: "sawtooth",
    pitchDecay: -3,
    filterType: "bandpass",
    filterFreq: 1200,
    filterQ: 15,
  }, // 27: Zap
  {
    minPitch: 880,
    maxPitch: 440,
    duration: 100,
    volume: 0.25,
    waveType: "square",
    pitchDecay: 0.5,
    harmonics: [1, 0.5],
    filterType: "lowpass",
    filterFreq: 2000,
  }, // 28: Menu select
  {
    minPitch: 1760,
    maxPitch: 1760,
    duration: 50,
    volume: 0.18,
    waveType: "triangle",
    harmonics: [1, 2, 3, 4],
    attack: 2,
    decay: 0.5,
  }, // 29: Notification
];

export default function useBloop({
  minPitch = 200,
  maxPitch = 600,
  duration = 150,
  volume = 0.3,
  preset,
}: BloopOptions = {}) {
  // Use preset values if preset index is provided
  const config =
    preset !== undefined && preset >= 0 && preset < SOUND_PRESETS.length
      ? SOUND_PRESETS[preset]
      : { minPitch, maxPitch, duration, volume };
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const throttleMs = 200;

  const playBloop = useCallback(async () => {
    const now = Date.now();

    // Throttle: if we played within the last throttleMs, don't play again
    if (now - lastPlayedRef.current < throttleMs) {
      return;
    }

    lastPlayedRef.current = now;

    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      // Resume AudioContext if suspended (required for iOS)
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      const currentTime = audioContext.currentTime;

      // Generate base frequency
      const baseFrequency =
        config.minPitch === config.maxPitch
          ? config.minPitch
          : Math.random() * (config.maxPitch - config.minPitch) + config.minPitch;

      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      // Create main oscillator
      const oscillator = audioContext.createOscillator();
      oscillator.type = config.waveType || "sine";
      oscillator.frequency.setValueAtTime(baseFrequency, currentTime);

      // Apply pitch modulation
      if (config.pitchDecay !== undefined) {
        const targetFreq =
          config.pitchDecay > 0
            ? baseFrequency * (1 - config.pitchDecay)
            : baseFrequency * (1 + Math.abs(config.pitchDecay) * 2);

        if (Math.abs(config.pitchDecay) > 1) {
          // Extreme pitch sweep
          oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(20, targetFreq),
            currentTime + config.duration / 1000,
          );
        } else {
          oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(20, targetFreq),
            currentTime + config.duration / 1000,
          );
        }
      }

      // Create main gain node
      const mainGain = audioContext.createGain();
      const attackTime = (config.attack || 1) / 1000;
      const decayTime =
        config.decay !== undefined
          ? (config.duration * config.decay) / 1000
          : config.duration / 1000;

      mainGain.gain.setValueAtTime(0, currentTime);
      mainGain.gain.linearRampToValueAtTime(config.volume, currentTime + attackTime);
      mainGain.gain.exponentialRampToValueAtTime(0.001, currentTime + decayTime);

      oscillator.connect(mainGain);
      oscillators.push(oscillator);
      gains.push(mainGain);

      // Add harmonics
      if (config.harmonics && config.harmonics.length > 0) {
        config.harmonics.forEach((harmonic) => {
          const harmonicOsc = audioContext.createOscillator();
          harmonicOsc.type = config.waveType || "sine";
          harmonicOsc.frequency.setValueAtTime(baseFrequency * harmonic, currentTime);

          if (config.pitchDecay !== undefined) {
            const targetFreq =
              config.pitchDecay > 0
                ? baseFrequency * harmonic * (1 - config.pitchDecay)
                : baseFrequency * harmonic * (1 + Math.abs(config.pitchDecay) * 2);
            harmonicOsc.frequency.exponentialRampToValueAtTime(
              Math.max(20, targetFreq),
              currentTime + config.duration / 1000,
            );
          }

          const harmonicGain = audioContext.createGain();
          harmonicGain.gain.setValueAtTime(0, currentTime);
          harmonicGain.gain.linearRampToValueAtTime(
            (config.volume * 0.3) / config.harmonics!.length,
            currentTime + attackTime,
          );
          harmonicGain.gain.exponentialRampToValueAtTime(0.001, currentTime + decayTime);

          harmonicOsc.connect(harmonicGain);
          oscillators.push(harmonicOsc);
          gains.push(harmonicGain);
        });
      }

      // Add noise if specified
      let noiseGain: GainNode | null = null;
      if (config.noiseAmount && config.noiseAmount > 0) {
        const bufferSize = (audioContext.sampleRate * config.duration) / 1000;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }

        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0, currentTime);
        noiseGain.gain.linearRampToValueAtTime(
          config.volume * config.noiseAmount,
          currentTime + attackTime,
        );
        noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + decayTime);

        noiseSource.connect(noiseGain);
        noiseSource.start(currentTime);
        noiseSource.stop(currentTime + config.duration / 1000 + 0.1);
      }

      // Create filter if specified
      let filter: BiquadFilterNode | null = null;
      if (config.filterType) {
        filter = audioContext.createBiquadFilter();
        filter.type = config.filterType;
        filter.frequency.setValueAtTime(config.filterFreq || baseFrequency * 2, currentTime);
        if (config.filterQ) {
          filter.Q.setValueAtTime(config.filterQ, currentTime);
        }

        // Connect all gains to filter
        gains.forEach((gain) => gain.connect(filter!));
        if (noiseGain) noiseGain.connect(filter);
        filter.connect(audioContext.destination);
      } else {
        // Connect directly to destination
        gains.forEach((gain) => gain.connect(audioContext.destination));
        if (noiseGain) noiseGain.connect(audioContext.destination);
      }

      // Start and stop oscillators
      oscillators.forEach((osc) => {
        osc.start(currentTime);
        osc.stop(currentTime + config.duration / 1000 + 0.1);
      });

      // Cleanup
      oscillators[0].onended = () => {
        oscillators.forEach((osc) => osc.disconnect());
        gains.forEach((gain) => gain.disconnect());
        if (filter) filter.disconnect();
        if (noiseGain) noiseGain.disconnect();
      };
    } catch (error) {
      console.debug("Audio playback failed:", error);
    }
  }, [config]);

  return playBloop;
}
