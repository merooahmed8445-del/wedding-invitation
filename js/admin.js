/* =================================================================
   ADMIN — Authentication, drawer, settings
   ================================================================= */

let isAdminUnlocked = false;
let currentAdminPinHash = null;

async function initAdminPin() {
  const stored = localStorage.getItem(PIN_STORAGE_KEY);
  if (stored) {
    currentAdminPinHash = stored;
  } else {
    currentAdminPinHash = await sha256('1234');
    localStorage.setItem(PIN_STORAGE_KEY, currentAdminPinHash);
  }
}

function showPinModal() {
  const modal = document.getElementById('adminPinModal');
  const input = document.getElementById('adminPinInput');
  const err = document.getElementById('pinErrorMsg');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  input.value = '';
  input.focus();
  err.classList.add('hidden');
}

function hidePinModal() {
  const modal = document.getElementById('adminPinModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openAdminDrawer() {
  document.getElementById('adminControlDrawer')?.classList.remove('translate-x-full');
}

function closeAdminDrawer() {
  document.getElementById('adminControlDrawer')?.classList.add('translate-x-full');
}

function initAdmin() {
  initAdminPin();

  const secretAdminTrigger = document.getElementById('secretAdminTrigger');
  const footerSecretTrigger = document.getElementById('footerSecretTrigger');
  const adminQuickBtn = document.getElementById('adminQuickBtn');
  const closePinModalBtn = document.getElementById('closePinModalBtn');
  const submitPinBtn = document.getElementById('submitPinBtn');
  const adminPinInput = document.getElementById('adminPinInput');
  const pinErrorMsg = document.getElementById('pinErrorMsg');
  const closeAdminDrawerBtn = document.getElementById('closeAdminDrawerBtn');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('admin') || urlParams.has('edit')) showPinModal();

  let secretClicks = 0;
  let secretClickTimer = null;
  function handleSecretTrigger() {
    secretClicks++;
    clearTimeout(secretClickTimer);
    secretClickTimer = setTimeout(() => { secretClicks = 0; }, 1200);
    if (secretClicks >= 3) {
      secretClicks = 0;
      if (isAdminUnlocked) openAdminDrawer();
      else showPinModal();
    }
  }
  secretAdminTrigger?.addEventListener('click', handleSecretTrigger);
  footerSecretTrigger?.addEventListener('click', handleSecretTrigger);

  closePinModalBtn?.addEventListener('click', hidePinModal);

  submitPinBtn?.addEventListener('click', async () => {
    const entered = adminPinInput.value.trim();
    const enteredHash = await sha256(entered);
    if (enteredHash === currentAdminPinHash) {
      isAdminUnlocked = true;
      hidePinModal();
      adminQuickBtn.classList.remove('hidden');
      openAdminDrawer();
    } else {
      pinErrorMsg.classList.remove('hidden');
    }
  });

  adminPinInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') submitPinBtn.click();
  });

  adminQuickBtn?.addEventListener('click', openAdminDrawer);
  closeAdminDrawerBtn?.addEventListener('click', closeAdminDrawer);

  // Tabs
  const tabs = [
    { btn: 'tabBtnAudio', sec: 'tabAudioSection' },
    { btn: 'tabBtnContent', sec: 'tabContentSection' },
    { btn: 'tabBtnSettings', sec: 'tabSettingsSection' },
  ];
  tabs.forEach(({ btn, sec }) => {
    const btnEl = document.getElementById(btn);
    btnEl?.addEventListener('click', () => {
      tabs.forEach(t => {
        const b = document.getElementById(t.btn);
        const s = document.getElementById(t.sec);
        b.classList.remove('border-b-2', 'border-gold-500', 'text-gold-400', 'bg-white/5');
        b.classList.add('text-slate-300');
        s.classList.add('hidden');
      });
      btnEl.classList.add('border-b-2', 'border-gold-500', 'text-gold-400', 'bg-white/5');
      btnEl.classList.remove('text-slate-300');
      document.getElementById(sec).classList.remove('hidden');
    });
  });

  // Preview controls
  document.getElementById('adminPreviewPlayBtn')?.addEventListener('click', () => {
    appData.audioType = document.getElementById('audioPresetSelect').value;
    appData.customAudioUrl = document.getElementById('customAudioUrlInput').value.trim();
    startWeddingAudio();
  });
  document.getElementById('adminPreviewPauseBtn')?.addEventListener('click', pauseWeddingAudio);

  document.getElementById('audioVolumeSlider')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    appData.audioVolume = val;
    document.getElementById('volumePercentText').textContent = Math.round(val * 100) + '%';
    if (audioElement) audioElement.volume = val;
  });

  // Audio file upload
  document.getElementById('audioFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('حجم الملف كبير (الحد الأقصى 3MB)', 'error');
      return;
    }
    const badge = document.getElementById('audioFileNameBadge');
    badge.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      appData.uploadedAudioBase64 = evt.target.result;
      appData.audioType = 'custom_file';
      showToast('تم تحميل الملف الصوتي بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  });

  // Photo upload with compression
  document.getElementById('photoFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showLoading();
      const compressed = await compressImage(file, 900, 0.82);
      document.getElementById('inputPhotoUrl').value = compressed;
      document.getElementById('displayCoupleImg').src = compressed;
      showToast('تم رفع الصورة وضغطها بنجاح', 'success');
    } catch (err) {
      showToast('فشل رفع الصورة', 'error');
    } finally {
      hideLoading();
    }
  });

  // Save all
  document.getElementById('saveAdminConfigBtn')?.addEventListener('click', () => {
    appData.groom = document.getElementById('inputGroom').value.trim() || defaultData.groom;
    appData.bride = document.getElementById('inputBride').value.trim() || defaultData.bride;
    appData.sealLetters = document.getElementById('inputSealLetters').value.trim() || defaultData.sealLetters;
    appData.groomFather = document.getElementById('inputGroomFather').value.trim() || defaultData.groomFather;
    appData.brideFather = document.getElementById('inputBrideFather').value.trim() || defaultData.brideFather;
    appData.date = document.getElementById('inputDate').value || defaultData.date;
    appData.startTime = document.getElementById('inputStartTime').value || defaultData.startTime;
    appData.receptionTime = document.getElementById('inputReceptionTime').value || defaultData.receptionTime;
    appData.timezone = document.getElementById('inputTimezone').value || 'Africa/Cairo';
    appData.venue = document.getElementById('inputVenue').value.trim();
    appData.address = document.getElementById('inputAddress').value.trim();
    appData.mapsUrl = document.getElementById('inputMapsUrl').value.trim();
    appData.whatsappNumber = document.getElementById('inputWhatsappNumber').value.trim();
    appData.photoUrl = document.getElementById('inputPhotoUrl').value.trim();
    if (appData.audioType !== 'custom_file') {
      appData.audioType = document.getElementById('audioPresetSelect').value;
    }
    appData.customAudioUrl = document.getElementById('customAudioUrlInput').value.trim();
    appData.audioVolume = parseFloat(document.getElementById('audioVolumeSlider').value);

    saveAppDataToStorage();
    closeAdminDrawer();
    showToast('تم حفظ وتطبيق جميع التعديلات', 'success');
  });

  // Update PIN
  document.getElementById('updatePinBtn')?.addEventListener('click', async () => {
    const newPin = document.getElementById('inputNewPin').value.trim();
    if (newPin.length < 4) {
      showToast('الرمز يجب أن يكون 4 خانات على الأقل', 'error');
      return;
    }
    currentAdminPinHash = await sha256(newPin);
    localStorage.setItem(PIN_STORAGE_KEY, currentAdminPinHash);
    document.getElementById('inputNewPin').value = '';
    showToast('تم تغيير رمز المرور بنجاح', 'success');
  });

  // Reset
  document.getElementById('resetDefaultsBtn')?.addEventListener('click', () => {
    if (!confirm('هل أنت متأكد من استعادة الإعدادات الأصلية؟')) return;
    localStorage.removeItem(STORAGE_KEY);
    appData = { ...defaultData };
    renderAllDataToDOM();
    closeAdminDrawer();
    showToast('تمت استعادة الإعدادات الافتراضية', 'info');
  });

  // Export JSON
  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'wedding_invitation_config.json');
    a.click();
    showToast('تم تصدير الإعدادات', 'success');
  });

  // Import JSON
  const importBtn = document.getElementById('importDataBtn');
  const importInput = document.getElementById('importFileInput');
  importBtn?.addEventListener('click', () => importInput.click());
  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        appData = { ...defaultData, ...parsed };
        saveAppDataToStorage();
        closeAdminDrawer();
        showToast('تم استيراد الإعدادات بنجاح', 'success');
      } catch (err) {
        showToast('ملف غير صالح', 'error');
      }
    };
    reader.readAsText(file);
  });
}

/* =================================================================
   DATA PERSISTENCE + SHARE LINK
   ================================================================= */

function saveAppDataToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  renderAllDataToDOM();
}

function generateCleanGuestUrl() {
  const shareObj = { ...appData };
  if (shareObj.uploadedAudioBase64 && shareObj.uploadedAudioBase64.length > 5000) {
    shareObj.uploadedAudioBase64 = '';
    if (shareObj.audioType === 'custom_file') shareObj.audioType = 'preset_harp';
  }
  const jsonStr = JSON.stringify(shareObj);
  const compressed = LZString.compressToEncodedURIComponent(jsonStr);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?d=${compressed}`;
}

function loadSavedData() {
  const urlParams = new URLSearchParams(window.location.search);
  const shared = urlParams.get('d');

  if (shared) {
    try {
      const json = LZString.decompressFromEncodedURIComponent(shared);
      if (json) {
        appData = { ...defaultData, ...JSON.parse(json) };
        renderAllDataToDOM();
        return;
      }
    } catch (e) {
      console.error('Failed to parse shared config:', e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { appData = { ...defaultData, ...JSON.parse(local) }; }
    catch (e) { appData = { ...defaultData }; }
  }
  renderAllDataToDOM();
}

/* =================================================================
   RENDER ALL DATA
   ================================================================= */

function renderAllDataToDOM() {
  const $ = (id) => document.getElementById(id);

  if ($('displayGroom')) $('displayGroom').textContent = appData.groom;
  if ($('displayBride')) $('displayBride').textContent = appData.bride;
  if ($('displayGroomBadge')) $('displayGroomBadge').textContent = appData.groom;
  if ($('displayBrideBadge')) $('displayBrideBadge').textContent = appData.bride;
  if ($('displaySealLetters')) $('displaySealLetters').textContent = appData.sealLetters || 'M & Y';
  if ($('displayGroomFather')) $('displayGroomFather').textContent = appData.groomFather;
  if ($('displayBrideFather')) $('displayBrideFather').textContent = appData.brideFather;
  if (appData.photoUrl && $('displayCoupleImg')) $('displayCoupleImg').src = appData.photoUrl;

  const dObj = new Date(appData.date + 'T12:00:00');
  const arabicDays = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const englishDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const englishMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  if ($('displayDayName')) $('displayDayName').textContent = arabicDays[dObj.getDay()];
  if ($('displayMonthYear')) $('displayMonthYear').textContent = `${arabicMonths[dObj.getMonth()]} ${dObj.getFullYear()}`;
  if ($('displayDayNumber')) $('displayDayNumber').textContent = dObj.getDate();
  if ($('displayMonthShort')) $('displayMonthShort').textContent = englishMonths[dObj.getMonth()].substring(0, 3).toUpperCase();
  if ($('displayDateEnglish')) $('displayDateEnglish').textContent = `on ${englishDays[dObj.getDay()]}, ${dObj.getDate()} ${englishMonths[dObj.getMonth()]} ${dObj.getFullYear()}`;
  if ($('displayStartTime')) $('displayStartTime').textContent = appData.startTime;
  if ($('displayTimeEnglish')) $('displayTimeEnglish').textContent = `Starting at ${appData.startTime}`;
  if ($('displayReceptionTime')) $('displayReceptionTime').textContent = appData.receptionTime;
  if ($('displayCeremonyTime')) $('displayCeremonyTime').textContent = appData.ceremonyTime;
  if ($('displayVenueName')) $('displayVenueName').textContent = appData.venue;
  if ($('displayAddress')) $('displayAddress').textContent = appData.address;
  if ($('mapsLink')) $('mapsLink').href = appData.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(appData.venue)}`;

  if (typeof renderCalendarGrid === 'function') renderCalendarGrid(appData.date);
  if (typeof startCountdown === 'function') startCountdown(appData.date, appData.startTime, appData.timezone);

  // Populate inputs
  if ($('inputGroom')) $('inputGroom').value = appData.groom;
  if ($('inputBride')) $('inputBride').value = appData.bride;
  if ($('inputSealLetters')) $('inputSealLetters').value = appData.sealLetters;
  if ($('inputGroomFather')) $('inputGroomFather').value = appData.groomFather;
  if ($('inputBrideFather')) $('inputBrideFather').value = appData.brideFather;
  if ($('inputDate')) $('inputDate').value = appData.date;
  if ($('inputStartTime')) $('inputStartTime').value = appData.startTime;
  if ($('inputReceptionTime')) $('inputReceptionTime').value = appData.receptionTime;
  if ($('inputTimezone')) $('inputTimezone').value = appData.timezone || 'Africa/Cairo';
  if ($('inputVenue')) $('inputVenue').value = appData.venue;
  if ($('inputAddress')) $('inputAddress').value = appData.address;
  if ($('inputMapsUrl')) $('inputMapsUrl').value = appData.mapsUrl;
  if ($('inputWhatsappNumber')) $('inputWhatsappNumber').value = appData.whatsappNumber || '';
  if ($('inputPhotoUrl')) $('inputPhotoUrl').value = appData.photoUrl;
  if ($('audioPresetSelect')) $('audioPresetSelect').value = appData.audioType;
  if ($('customAudioUrlInput')) $('customAudioUrlInput').value = appData.customAudioUrl || '';
  if ($('audioVolumeSlider')) $('audioVolumeSlider').value = appData.audioVolume || 0.8;
  if ($('volumePercentText')) $('volumePercentText').textContent = Math.round((appData.audioVolume || 0.8) * 100) + '%';
    // تحديث نص "موعدنا السعيد" في الكالندر
  if ($('displayCalendarFooterDate')) {
    const arDays = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    $('displayCalendarFooterDate').textContent = `موعدنا السعيد: ${arDays[dObj.getDay()]} ${dObj.getDate()} ${arabicMonths[dObj.getMonth()]} ${dObj.getFullYear()}`;
  }
}