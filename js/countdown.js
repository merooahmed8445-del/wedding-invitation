/* =================================================================
   COUNTDOWN & CALENDAR
   ================================================================= */

window.startCountdown = function(dateStr, timeStr, timezone) {
  console.log('⏰ startCountdown START:', dateStr, timeStr);

  if (window._countdownTimer) clearInterval(window._countdownTimer);

  const parts = (dateStr || '2027-01-30').split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const timeParts = (timeStr || '18:00').split(':');
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1] || '0', 10);

  const target = new Date(year, month, day, hour, minute, 0, 0).getTime();
  const now = Date.now();

  console.log('📅 Target:', new Date(target).toString());
  console.log('⏰ Now:', new Date(now).toString());
  console.log('📊 Diff (seconds):', Math.floor((target - now) / 1000));

  function tick() {
    const nowMs = Date.now();
    const diff = target - nowMs;

    const daysEl = document.getElementById('countdownDays');
    const hoursEl = document.getElementById('countdownHours');
    const minEl = document.getElementById('countdownMinutes');
    const secEl = document.getElementById('countdownSeconds');

    if (!daysEl) return;

    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minEl.textContent = String(minutes).padStart(2, '0');
      secEl.textContent = String(seconds).padStart(2, '0');
    } else {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minEl.textContent = '00';
      secEl.textContent = '00';
    }
  }

  tick();
  window._countdownTimer = setInterval(tick, 1000);
  console.log('✅ Countdown started successfully');
};

window.renderCalendarGrid = function(targetDateStr) {
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const dateObj = new Date(targetDateStr + 'T12:00:00');
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const weddingDay = dateObj.getDate();

  const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const englishMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const headerAr = document.getElementById('calendarMonthHeaderArabic');
  const headerEn = document.getElementById('calendarMonthHeaderEnglish');
  if (headerAr) headerAr.textContent = `${arabicMonths[month]} ${year}`;
  if (headerEn) headerEn.textContent = `${englishMonths[month]} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = (firstDayOfMonth + 1) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = offset - 1; i >= 0; i--) {
    const span = document.createElement('span');
    span.className = 'p-1.5 opacity-20';
    span.textContent = daysInPrevMonth - i;
    grid.appendChild(span);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    if (d === weddingDay) {
      const activeDiv = document.createElement('div');
      activeDiv.className = 'relative p-1.5 bg-gradient-to-tr from-maroon-900 to-maroon-700 text-gold-200 font-bold rounded-full shadow-md flex items-center justify-center animate-pulse';
      activeDiv.innerHTML = `<span>${d}</span><span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-400"></span>`;
      grid.appendChild(activeDiv);
    } else {
      const span = document.createElement('span');
      span.className = 'p-1.5';
      span.textContent = d;
      grid.appendChild(span);
    }
  }

  const totalCells = offset + daysInMonth;
  const nextDays = (7 - (totalCells % 7)) % 7;
  for (let n = 1; n <= nextDays; n++) {
    const span = document.createElement('span');
    span.className = 'p-1.5 opacity-20';
    span.textContent = n;
    grid.appendChild(span);
  }
};