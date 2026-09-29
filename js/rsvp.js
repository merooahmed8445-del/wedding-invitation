/* =================================================================
   RSVP & GUESTBOOK
   ================================================================= */

let wishesList = [];

function loadWishes() {
  const stored = localStorage.getItem(GUEST_WISHES_KEY);
  if (stored) {
    try { wishesList = JSON.parse(stored); return; } catch (e) {}
  }
  wishesList = [
    { name: 'أ. طارق عبد الرحمن', time: 'منذ ساعتين', text: 'ألف مبروك لأجمل عروسين، نسأل الله لكما حياة عامرة بالسعادة والبركة.' },
    { name: 'م. نهى الشريف', time: 'منذ 5 ساعات', text: 'مبارك من القلب! دعوة راقية وفخمة جداً، سنكون حاضرين بإذن الله.' }
  ];
}

function saveWishes() {
  localStorage.setItem(GUEST_WISHES_KEY, JSON.stringify(wishesList));
}

function renderWishes() {
  const container = document.getElementById('wishesContainer');
  const count = document.getElementById('wishesCount');
  if (!container) return;
  container.innerHTML = '';
  count.textContent = `${wishesList.length} تهاني`;
  wishesList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'p-2.5 bg-parchment-50 rounded-xl border border-gold-300/40 text-xs';
    card.innerHTML = `
      <div class="flex justify-between items-center mb-1">
        <span class="font-bold text-maroon-900">${escapeHtml(item.name)}</span>
        <span class="text-[10px] text-slate-400">${escapeHtml(item.time)}</span>
      </div>
      <p class="text-slate-600 text-[11px]">${escapeHtml(item.text)}</p>
    `;
    container.appendChild(card);
  });
}

function initRSVP() {
  loadWishes();
  renderWishes();

  const form = document.getElementById('rsvpForm');
  const successMsg = document.getElementById('rsvpSuccessMsg');
  const whatsappBtn = document.getElementById('whatsappRsvpBtn');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const wishes = document.getElementById('guestWishes').value.trim();
    const status = document.querySelector('input[name="attendanceStatus"]:checked').value;

    if (!name || !phone) {
      showToast('يرجى إدخال الاسم ورقم الهاتف', 'error');
      return;
    }

    successMsg.classList.remove('hidden');

    if (wishes) {
      wishesList.unshift({ name, time: 'الآن', text: wishes });
      saveWishes();
      renderWishes();
    }

    if (typeof confetti === 'function' && status === 'attending') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#dfbe5d', '#7a1225', '#f7ecc4']
      });
    }

    form.reset();
    setTimeout(() => successMsg.classList.add('hidden'), 5000);
  });

  whatsappBtn?.addEventListener('click', () => {
    const name = document.getElementById('guestName').value.trim() || 'ضيف كريم';
    const count = document.getElementById('guestCount').value;
    const targetPhone = appData.whatsappNumber || '';
    const message = `السلام عليكم،%0Aأتشرف بتأكيد حضوري لحفل زفاف العروسين (${appData.groom} %26 ${appData.bride})%0Aالاسم: ${encodeURIComponent(name)}%0Aعدد الحضور: ${count}%0Aألف مبروك!`;
    const url = targetPhone
      ? `https://wa.me/${targetPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  });

  // Google Calendar
  document.getElementById('addToCalBtn')?.addEventListener('click', () => {
    const title = encodeURIComponent(`حفل زفاف ${appData.groom} & ${appData.bride}`);
    const details = encodeURIComponent(`نتشرف بحضوركم لمشاركتنا فرحة حفل الزفاف في ${appData.venue}`);
    const location = encodeURIComponent(appData.address || appData.venue);
    const dClean = appData.date.replace(/-/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dClean}T160000Z/${dClean}T220000Z&details=${details}&location=${location}`;
    window.open(gCalUrl, '_blank');
  });
}