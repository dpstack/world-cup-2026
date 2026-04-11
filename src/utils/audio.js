// Web Audio API Synthesizer Helper

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Helper to quickly build an oscillator
function playTone({ freq = 440, type = 'sine', duration = 0.1, vol = 0.1, slide = null }) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) {
      osc.frequency.exponentialRampToValueAtTime(slide, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    console.error("Audio block");
  }
}

export function playDing() {
  playTone({ freq: 880, type: 'sine', duration: 0.15, vol: 0.2 });
  setTimeout(() => playTone({ freq: 1760, type: 'sine', duration: 0.3, vol: 0.15 }), 50);
}

export function playBuzzer() {
  playTone({ freq: 150, type: 'sawtooth', duration: 0.3, vol: 0.2, slide: 100 });
}

export function playWhistle() {
  // Short sharp burst
  playTone({ freq: 2800, type: 'sine', duration: 0.1, vol: 0.15 });
  // Second slightly longer burst
  setTimeout(() => playTone({ freq: 2800, type: 'sine', duration: 0.3, vol: 0.15, slide: 2600 }), 100);
}

export function playStadiumRoar(durationSeconds = 3) {
  try {
    const ctx = getContext();
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate brown-ish noise
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // (compensate gain)
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Create a lowpass filter to make it sound muffled like a stadium
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    const gain = ctx.createGain();
    // Fade in
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);
    // Fade out
    gain.gain.setValueAtTime(0.3, ctx.currentTime + durationSeconds - 1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSeconds);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
  } catch {
    console.error("Audio block");
  }
}
