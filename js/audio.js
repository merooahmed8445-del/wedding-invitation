/* =================================================================
   AUDIO ENGINE — Synthesized presets + Custom files/URLs
   ================================================================= */

let audioCtx = null;
let isPlaying = false;
let synthInterval = null;
const audioElement = document.getElementById('invitationAudio');

function initWebAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSynthesizedChord(frequencies, type = 'sine', duration = 3.2) {
  if (!audioCtx) return;
  frequencies.forEach((freq, idx) => {
    setTimeout(() => {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06 * appData.audioVolume, audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) { console.warn(e); }
    }, idx * 100);
  });
}

function playOpeningFanfare() {
  initWebAudio();
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
  playSynthesizedChord(notes, 'triangle', 4.0);
}

function startWeddingAudio() {
  initWebAudio();
  isPlaying = true;
  updateAudioControlsUI(true);

  const type = appData.audioType;

  if (type === 'custom_file' && appData.uploadedAudioBase64) {
    audioElement.src = appData.uploadedAudioBase64;
    audioElement.volume = appData.audioVolume;
    audioElement.play().catch(e => console.log('Autoplay prevented:', e));
    return;
  }
  if (type === 'custom_url' && appData.customAudioUrl) {
    audioElement.src = appData.customAudioUrl;
    audioElement.volume = appData.audioVolume;
    audioElement.play().catch(e => console.log('Autoplay prevented:', e));
    return;
  }

  // Synthesized presets
  let chordSet = [];
  let soundType = 'sine';

  if (type === 'preset_strings') {
    soundType = 'triangle';
    chordSet = [
      [293.66, 369.99, 440.00, 587.33],
      [246.94, 311.13, 369.99, 493.88],
      [220.00, 277.18, 329.63, 440.00],
      [196.00, 246.94, 293.66, 392.00],
      [174.61, 220.00, 261.63, 349.23],
      [196.00, 246.94, 293.66, 392.00],
    ];
  } else if (type === 'preset_arabian') {
    soundType = 'sine';
    chordSet = [
      [220.00, 261.63, 329.63, 415.30],
      [196.00, 246.94, 293.66, 369.99],
      [174.61, 220.00, 261.63, 329.63],
      [220.00, 277.18, 329.63, 440.00],
      [196.00, 233.08, 293.66, 349.23],
      [174.61, 207.65, 261.63, 329.63],
    ];
  } else {
    soundType = 'sine';
    chordSet = [
      [220.00, 277.18, 329.63, 440.00],
      [246.94, 311.13, 369.99, 493.88],
      [196.00, 246.94, 293.66, 392.00],
      [220.00, 277.18, 329.63, 554.37],
      [174.61, 220.00, 261.63, 349.23],
      [196.00, 246.94, 293.66, 392.00],
    ];
  }

  let idx = 0;
  playSynthesizedChord(chordSet[idx], soundType);

  if (synthInterval) clearInterval(synthInterval);
  synthInterval = setInterval(() => {
    if (!isPlaying) return;
    idx = (idx + 1) % chordSet.length;
    playSynthesizedChord(chordSet[idx], soundType);
  }, 3600);
}

function pauseWeddingAudio() {
  isPlaying = false;
  updateAudioControlsUI(false);
  if (synthInterval) clearInterval(synthInterval);
  if (audioElement) audioElement.pause();
}

function toggleAudio() {
  if (isPlaying) pauseWeddingAudio();
  else startWeddingAudio();
}

function updateAudioControlsUI(playing) {
  const disc = document.getElementById('discGraphic');
  const icon = document.getElementById('audioIcon');
  const badge = document.getElementById('adminAudioStatusBadge');

  if (playing) {
    disc?.classList.add('spin-music');
    icon?.setAttribute('data-lucide', 'volume-2');
    if (badge) {
      badge.textContent = 'يعمل الآن';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/40';
    }
  } else {
    disc?.classList.remove('spin-music');
    icon?.setAttribute('data-lucide', 'volume-x');
    if (badge) {
      badge.textContent = 'متوقف';
      badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300';
    }
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}