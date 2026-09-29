/* =================================================================
   APP CONFIG — Default data + Storage Keys
   ================================================================= */

const STORAGE_KEY = 'royal_maroon_wedding_data_v3';
const PIN_STORAGE_KEY = 'royal_maroon_admin_pin_hash_v3';
const GUEST_WISHES_KEY = 'royal_maroon_guest_wishes_v3';

const defaultData = {
  groom: 'مُصْطَفَى',
  bride: 'يَارَا',
  sealLetters: 'M & Y',
  groomFather: 'محمد كامل',
  brideFather: 'أحمد ياسر',
  date: '2026-12-19',
  startTime: '18:00',
  receptionTime: '19:30',
  ceremonyTime: '20:00',
  timezone: 'Africa/Cairo',   // ← جديد لدعم التوقيت الصحيح
  venue: 'فندق فورسيزونز نايل بلازا - قاعة بلازا',
  address: 'كورنيش النيل، جاردن سيتي، القاهرة، مصر',
  mapsUrl: 'https://maps.google.com/?q=Four+Seasons+Hotel+Cairo+at+Nile+Plaza',
  whatsappNumber: '201000000000',
  photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  audioType: 'preset_harp',
  customAudioUrl: 'assets/audio/music.mp3',
  uploadedAudioBase64: '',
  audioVolume: 0.8
};

let appData = { ...defaultData };

/* =================================================================
   UTILITIES
   ================================================================= */

// HTML escape to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Toast notifications (بديل لـ alert/confirm)
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="text-base">${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Loading overlay
function showLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) { el.classList.remove('hidden'); el.classList.add('flex'); }
}
function hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) { el.classList.add('hidden'); el.classList.remove('flex'); }
}

// Copy to clipboard (with fallback)
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(temp);
    return ok;
  } catch (e) {
    console.warn('Copy failed:', e);
    return false;
  }
}

// Compress image using canvas (لتفادي حجم الرابط الكبير)
function compressImage(file, maxWidth = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// SHA-256 hash (لتشفير الـ PIN)
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}