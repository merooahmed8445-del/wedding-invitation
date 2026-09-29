/* =================================================================
   MAIN — Envelope, event wiring, bootstrap
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadSavedData();        // ← ⚠️ مهمة جداً
  initAdmin();
  initRSVP();

  const envelopeCover = document.getElementById('envelopeCover');
  const envelopeFlap = document.getElementById('envelopeFlap');
  const sealButton = document.getElementById('sealButton');
  const lightBurst = document.getElementById('lightBurst');
  const mainContent = document.getElementById('mainContent');
  const reopenEnvelopeBtn = document.getElementById('reopenEnvelopeBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');

  let isOpened = false;

  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    playOpeningFanfare();
    startWeddingAudio();
    if (navigator.vibrate) navigator.vibrate(50);

    sealButton.style.transform = 'scale(1.22)';
    sealButton.style.filter = 'brightness(1.5)';

    setTimeout(() => envelopeFlap.classList.add('open'), 200);
    setTimeout(() => lightBurst.classList.add('light-burst-anim'), 500);

    setTimeout(() => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#dfbe5d', '#ffffff', '#7a1225', '#f7ecc4']
        });
      }
    }, 800);

    setTimeout(() => {
      envelopeCover.classList.add('opacity-0', 'pointer-events-none', 'scale-105');
      mainContent.classList.remove('opacity-0', 'pointer-events-none');
      mainContent.classList.add('opacity-100');
      reopenEnvelopeBtn.classList.remove('hidden');
      reopenEnvelopeBtn.classList.add('flex');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  function closeEnvelope() {
    isOpened = false;
    mainContent.classList.add('opacity-0', 'pointer-events-none');
    envelopeCover.classList.remove('opacity-0', 'pointer-events-none', 'scale-105');
    envelopeFlap.classList.remove('open');
    lightBurst.classList.remove('light-burst-anim');
    sealButton.style.transform = '';
    sealButton.style.filter = '';
    reopenEnvelopeBtn.classList.add('hidden');
    reopenEnvelopeBtn.classList.remove('flex');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sealButton?.addEventListener('click', openEnvelope);
  reopenEnvelopeBtn?.addEventListener('click', closeEnvelope);
  audioToggleBtn?.addEventListener('click', toggleAudio);

  // Share button (main page)
  document.getElementById('shareGuestLinkBtn')?.addEventListener('click', async () => {
    const link = generateCleanGuestUrl();
    const ok = await copyToClipboard(link);
    showToast(ok ? 'تم نسخ رابط الدعوة للضيوف' : 'تعذر النسخ', ok ? 'success' : 'error');
  });

  // Copy from admin drawer
  document.getElementById('copyGuestCleanUrlBtn')?.addEventListener('click', async () => {
    const link = generateCleanGuestUrl();
    const ok = await copyToClipboard(link);
    showToast(ok ? 'تم نسخ الرابط بنجاح' : 'تعذر النسخ', ok ? 'success' : 'error');
  });
    // تشخيص
  setTimeout(() => {
    console.log('=== تشخيص ===');
    console.log('startCountdown:', typeof startCountdown);
    console.log('appData.date:', typeof appData !== 'undefined' ? appData.date : 'NOT DEFINED');
    console.log('renderAllDataToDOM:', typeof renderAllDataToDOM);
    console.log('countdownDays el:', !!document.getElementById('countdownDays'));
  }, 1500);
});