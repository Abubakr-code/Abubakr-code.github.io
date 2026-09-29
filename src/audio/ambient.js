// Procedural ambient track, synthesised with the Web Audio API.
// No audio files and no network: fits the "air-gapped" idea of the site.
//
// Am7 → Fmaj7 → Cmaj7 → Em7, 84 BPM, two bars per chord:
// detuned-saw pad through a breathing low-pass, sine sub-bass, a sparse
// triangle arpeggio into a dotted-eighth delay, soft kick and noise hats.

const BPM = 84;
const SIXTEENTH = 60 / BPM / 4;
const STEPS_PER_CHORD = 32;
const LOOKAHEAD = 0.15;
const TICK_MS = 25;
const VOLUME = 0.42;

const CHORDS = [
  { root: 45, pad: [57, 60, 64, 67, 71] }, // Am9
  { root: 41, pad: [57, 60, 64, 65, 69] }, // Fmaj7
  { root: 48, pad: [55, 59, 60, 64, 67] }, // Cmaj7
  { root: 40, pad: [55, 59, 62, 64, 66] }, // Em7(9)
];
// Arp walks chord tones an octave up; -1 is a rest.
const ARP = [0, 2, 4, 2, 1, 3, 4, -1, 0, 2, 4, 3, 1, 2, -1, 4];
const HAT_VEL = [0, 0.25, 0.6, 0.25, 0, 0.25, 0.6, 0.35];

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const makeImpulse = (ctx, seconds, decay) => {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
};

const makeNoise = (ctx) => {
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
};

export const createAmbient = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();

  // master ← compressor ← { dry bus, reverb }
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  comp.connect(master).connect(ctx.destination);

  const bus = ctx.createGain();
  bus.connect(comp);
  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 3.2, 2.6);
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.55;
  reverbSend.connect(reverb).connect(comp);

  // Pad filter slowly opens and closes (~19 s cycle).
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.7;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.052;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 520;
  lfo.connect(lfoDepth).connect(padFilter.frequency);
  lfo.start();
  const padGain = ctx.createGain();
  padGain.gain.value = 0.11;
  padFilter.connect(padGain);
  padGain.connect(bus);
  padGain.connect(reverbSend);

  // Dotted-eighth feedback delay for the arp.
  const delay = ctx.createDelay(2);
  delay.delayTime.value = SIXTEENTH * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = "lowpass";
  delayTone.frequency.value = 2400;
  delay.connect(delayTone).connect(feedback).connect(delay);
  delayTone.connect(bus);
  delayTone.connect(reverbSend);

  const noise = makeNoise(ctx);

  const env = (param, t, peak, attack, hold, release) => {
    param.cancelScheduledValues(t);
    param.setValueAtTime(0.0001, t);
    param.linearRampToValueAtTime(peak, t + attack);
    param.setValueAtTime(peak, t + attack + hold);
    param.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  };

  const pad = (notes, t, length) => {
    notes.forEach((n) => {
      [-7, 7].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = hz(n);
        o.detune.value = cents + (Math.random() - 0.5) * 4;
        const g = ctx.createGain();
        env(g.gain, t, 0.09, 1.8, length - 1.8, 2.4);
        o.connect(g).connect(padFilter);
        o.start(t);
        o.stop(t + length + 2.6);
      });
    });
  };

  const bass = (midi, t, length) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = hz(midi - 12);
    const g = ctx.createGain();
    env(g.gain, t, 0.3, 0.04, length * 0.6, length * 0.4);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + length + 0.1);
  };

  const pluck = (midi, t, vel) => {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = hz(midi);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(3200, t);
    f.frequency.exponentialRampToValueAtTime(500, t + 0.35);
    const g = ctx.createGain();
    env(g.gain, t, 0.085 * vel, 0.005, 0.02, 0.45);
    o.connect(f).connect(g);
    g.connect(bus);
    g.connect(delay);
    o.start(t);
    o.stop(t + 0.6);
  };

  const kick = (t) => {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    const g = ctx.createGain();
    env(g.gain, t, 0.34, 0.004, 0.03, 0.32);
    o.connect(g).connect(comp);
    o.start(t);
    o.stop(t + 0.45);
  };

  const hat = (t, vel) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7500;
    const g = ctx.createGain();
    env(g.gain, t, 0.035 * vel, 0.002, 0.005, 0.05);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random() * 0.5);
    s.stop(t + 0.08);
  };

  let step = 0;
  let nextTime = 0;
  let timer = null;

  const schedule = (i, t) => {
    const chord = CHORDS[Math.floor(i / STEPS_PER_CHORD) % CHORDS.length];
    const s = i % STEPS_PER_CHORD;
    const bar = Math.floor(i / 16);
    const drums = bar >= 4; // 4-bar intro: pad, bass and arp only

    if (s === 0) pad(chord.pad, t, SIXTEENTH * STEPS_PER_CHORD);
    if (s % 16 === 0 || s % 16 === 10) bass(chord.root, t, SIXTEENTH * (s % 16 === 0 ? 8 : 5));

    if (s % 2 === 0) {
      const a = ARP[(s / 2) % ARP.length];
      // Skip a few notes at random so the loop never sounds mechanical.
      if (a >= 0 && Math.random() > 0.12) pluck(chord.pad[a] + 12, t, 0.7 + Math.random() * 0.3);
    }

    if (drums) {
      if (s % 8 === 0) kick(t);
      const v = HAT_VEL[s % 8];
      if (v > 0) hat(t, v * (0.8 + Math.random() * 0.4));
    }
  };

  const tick = () => {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      schedule(step, nextTime);
      step++;
      nextTime += SIXTEENTH;
    }
  };

  const onVisibility = () => {
    if (!timer) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    async start() {
      await ctx.resume();
      if (timer) return;
      nextTime = ctx.currentTime + 0.08;
      step = 0;
      timer = setInterval(tick, TICK_MS);
      tick();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 2.5);
    },
    stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      setTimeout(() => {
        if (!timer) ctx.suspend();
      }, 900);
    },
  };
};
