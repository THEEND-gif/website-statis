(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- DATA ---------------- */

  // Galeri: gambar dibuat dari emoji + warna latar (tanpa file gambar eksternal)
  const galleryItems = [
    { cat: 'kicau',    images: 'img/muraibatu.jpg', title: 'Murai batu sedang berkicau' },
    { cat: 'kicau',    images: 'img/kenaripagi.jpg', title: 'Kenari pagi hari' },
    { cat: 'hias',     images: 'img/lovebird.jpg', title: 'Lovebird berpasangan' },
    { cat: 'hias',     images: 'img/merakhijau.jpg', title: 'Merak hijau koleksi anggota' },
    { cat: 'kegiatan', emoji: '🤝', title: 'Kopdar bulanan di sekretariat',     bg: ['#3a7ca5', '#9cc9e4'] },
    { cat: 'kegiatan', emoji: '🏆', title: 'Lomba kicau persahabatan',          bg: ['#8a5a9e', '#d3b0e2'] },
    { cat: 'kicau',    images: 'img/perkutut.jpg', title: 'Perkutut dengan suara khas' },
    { cat: 'kegiatan', images: 'img/bersih2.jpg', title: 'Bersih-bersih dan tanam pohon' },
    { cat: 'hias',     images: 'img/burunghantu.jpg', title: 'Burung hantu di kandang edukasi' },
  ];

  // Jadwal: tanggal dihitung relatif dari hari ini agar countdown selalu aktif
  const eventTemplates = [
    { title: 'Kopdar Bulanan',                   days: -21, h: 8,  m: 0,  place: 'Sekretariat, Jl. Merpati No. 12',   desc: 'Ngobrol santai dan tukar cerita antaranggota.' },
    { title: 'Workshop Perawatan Pemula',        days: -7,  h: 9,  m: 0,  place: 'Balai Warga',                       desc: 'Dasar pakan, kandang, dan kesehatan burung.' },
    { title: 'Kopdar Akhir Pekan',               days: 3,   h: 7,  m: 30, place: 'Taman Kota',                        desc: 'Gantangan santai dan jemur bersama.' },
    { title: 'Seminar Penangkaran Burung',       days: 12,  h: 10, m: 0,  place: 'Aula Desa',                         desc: 'Belajar dari penangkar tentang burung hasil tangkaran.' },
    { title: 'Lomba Kicau Persahabatan',         days: 26,  h: 7,  m: 0,  place: 'Lapangan Serbaguna',                desc: 'Lomba ramah untuk semua kelas, hadiah dari anggota.' }
  ];

  const tips = [
    'Ganti air minum burung setiap pagi, dan cuci tempatnya agar tidak berlendir.',
    'Jemur burung pukul 07.00–09.00 selama 30–60 menit, dengan sisi teduh tersedia.',
    'Variasikan pakan dengan buah dan serangga agar nutrisi burung seimbang.',
    'Bersihkan dasar kandang setiap hari untuk mencegah jamur dan bakteri.',
    'Perhatikan perubahan kecil: bulu mengembang atau nafsu makan turun bisa jadi tanda sakit.',
    'Tutup sebagian kandang di malam hari agar burung cukup beristirahat.',
    'Pilih burung hasil penangkaran, dan pastikan bukan satwa dilindungi.'
  ];

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

  const events = eventTemplates.map(t => {
    const d = new Date();
    d.setDate(d.getDate() + t.days);
    d.setHours(t.h, t.m, 0, 0);
    return { ...t, date: d };
  }).sort((a, b) => a.date - b.date);

  const pad = n => String(n).padStart(2, '0');
  const timeText = d => `${pad(d.getHours())}.${pad(d.getMinutes())} WIB`;
  const dateText = d => `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

  /* ---------------- NAVBAR ---------------- */
  const header = $('#header');
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');

  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
  $$('a', navMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Header berubah saat di-scroll + tombol kembali ke atas
  const toTop = $('#toTop');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    toTop.hidden = window.scrollY < 600;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  );

  // Tandai menu aktif sesuai bagian yang sedang dilihat
  const navLinks = $$('.nav-link');
  const sections = navLinks
    .map(l => $(l.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => {
            const active = l.getAttribute('href') === '#' + entry.target.id;
            l.classList.toggle('active', active);
            if (active) l.setAttribute('aria-current', 'true');
            else l.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------------- REVEAL SAAT SCROLL ---------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------------- STATISTIK (COUNT-UP) ---------------- */
  const statNums = $$('.stat-num');

  function animateCount(el) {
    const target = Number(el.dataset.target) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    const statObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statNums.forEach(el => statObs.observe(el));
  } else {
    statNums.forEach(el => { el.textContent = el.dataset.target; });
  }

  /* ---------------- KEGIATAN TERDEKAT + COUNTDOWN ---------------- */
  const nextTitle = $('#nextTitle');
  const nextMeta = $('#nextMeta');
  const cd = {
    d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMins'), s: $('#cdSecs')
  };
  let countdownTimer = null;

  function renderNextEvent() {
    const now = new Date();
    const next = events.find(e => e.date > now);

    if (!next) {
      nextTitle.textContent = 'Belum ada kegiatan terjadwal';
      nextMeta.textContent = 'Pantau terus halaman ini untuk jadwal berikutnya.';
      Object.values(cd).forEach(el => { el.textContent = '0'; });
      return;
    }

    nextTitle.textContent = next.title;
    nextMeta.textContent = `${dateText(next.date)} • ${timeText(next.date)} • ${next.place}`;

    function tick() {
      const diff = next.date - new Date();
      if (diff <= 0) {
        clearInterval(countdownTimer);
        renderNextEvent();
        renderSchedule();
        return;
      }
      const sec = Math.floor(diff / 1000);
      cd.d.textContent = Math.floor(sec / 86400);
      cd.h.textContent = pad(Math.floor((sec % 86400) / 3600));
      cd.m.textContent = pad(Math.floor((sec % 3600) / 60));
      cd.s.textContent = pad(sec % 60);
    }

    clearInterval(countdownTimer);
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* ---------------- JADWAL KEGIATAN ---------------- */
  const scheduleEl = $('#schedule');
  const scheduleEmpty = $('#scheduleEmpty');
  let scheduleFilter = 'semua';

  function renderSchedule() {
    const now = new Date();
    const list = events.filter(e => {
      const upcoming = e.date > now;
      if (scheduleFilter === 'akan') return upcoming;
      if (scheduleFilter === 'selesai') return !upcoming;
      return true;
    });

    scheduleEl.innerHTML = '';
    scheduleEmpty.hidden = list.length > 0;

    list.forEach(e => {
      const upcoming = e.date > now;
      const item = document.createElement('article');
      item.className = 'event reveal visible' + (upcoming ? '' : ' past');
      item.innerHTML = `
        <div class="event-date" aria-hidden="true">
          <span class="ev-day">${e.date.getDate()}</span>
          <span class="ev-month">${monthNames[e.date.getMonth()].slice(0, 3)}</span>
        </div>
        <div class="event-body">
          <h3>${e.title}</h3>
          <p class="event-meta">${dateText(e.date)}, ${timeText(e.date)}</p>
          <p class="event-meta">📍 ${e.place}</p>
          <p>${e.desc}</p>
        </div>
        <span class="badge ${upcoming ? 'badge-soon' : 'badge-done'}">${upcoming ? 'Akan datang' : 'Selesai'}</span>
      `;
      scheduleEl.appendChild(item);
    });
  }

  function setupChips(container, onChange) {
    container.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', container).forEach(c => {
        const active = c === chip;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      onChange(chip.dataset.filter);
    });
    $$('.chip', container).forEach(c =>
      c.setAttribute('aria-pressed', String(c.classList.contains('active')))
    );
  }

  setupChips($('#scheduleFilters'), f => { scheduleFilter = f; renderSchedule(); });

  /* ---------------- GALERI + LIGHTBOX ---------------- */
  const galleryEl = $('#gallery');
  let galleryFilter = 'semua';
  let visibleItems = [];

  function renderGallery() {
    visibleItems = galleryItems.filter(g => galleryFilter === 'semua' || g.cat === galleryFilter);
    galleryEl.innerHTML = '';

    visibleItems.forEach((g, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item';

      if (g.images) {
        btn.style.background = 'none';
        btn.innerHTML = `
          <img src="${g.images}" alt="${g.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">
          <span class="g-cap">${g.title}</span>
        `;
      } else {
        btn.style.background = `linear-gradient(135deg, ${g.bg[0]}, ${g.bg[1]})`;
        btn.innerHTML = `
          <span class="g-emoji" aria-hidden="true">${g.emoji}</span>
          <span class="g-cap">${g.title}</span>
        `;
      }
      
      btn.addEventListener('click', () => openLightbox(i, btn));
      galleryEl.appendChild(btn);
    });
  }

  setupChips($('#galleryFilters'), f => { galleryFilter = f; renderGallery(); });

  const lightbox = $('#lightbox');
  const lbArt = $('#lbArt');
  const lbCaption = $('#lbCaption');
  let lbIndex = 0;
  let lastFocused = null;

  function showLightboxItem() {
    const g = visibleItems[lbIndex];
    if (!g) return;

    if (g.images) {
      lbArt.style.background = 'none';
      lbArt.innerHTML = `<img src="${g.images}" alt="${g.title}" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;">`;
    } else {
      lbArt.style.background = `linear-gradient(135deg, ${g.bg[0]}, ${g.bg[1]})`;
      lbArt.textContent = g.emoji;
    }
    lbCaption.textContent = `${g.title} (${lbIndex + 1} dari ${visibleItems.length})`;
  }

  function openLightbox(index, trigger) {
    lbIndex = index;
    lastFocused = trigger || document.activeElement;
    showLightboxItem();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function stepLightbox(dir) {
    lbIndex = (lbIndex + dir + visibleItems.length) % visibleItems.length;
    showLightboxItem();
  }

  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => stepLightbox(-1));
  $('#lbNext').addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
    else if (e.key === 'ArrowRight') stepLightbox(1);
    else if (e.key === 'Tab') {
      // Jaga fokus tetap di dalam lightbox
      const focusable = $$('button', lightbox);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- AKORDION TIPS ---------------- */
  const accButtons = $$('.acc-btn');

  function toggleAccordion(btn, open) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    btn.closest('.acc-item').classList.toggle('open', open);
    // Alternatif jika CSS tidak memakai kelas .open
    if (panel) panel.style.maxHeight = open ? panel.scrollHeight + 'px' : null;
  }

  accButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      // Satu panel terbuka dalam satu waktu
      accButtons.forEach(b => { if (b !== btn) toggleAccordion(b, false); });
      toggleAccordion(btn, willOpen);
    });

    // Navigasi keyboard: panah atas/bawah, Home, End
    btn.addEventListener('keydown', e => {
      let target = null;
      if (e.key === 'ArrowDown') target = accButtons[(i + 1) % accButtons.length];
      else if (e.key === 'ArrowUp') target = accButtons[(i - 1 + accButtons.length) % accButtons.length];
      else if (e.key === 'Home') target = accButtons[0];
      else if (e.key === 'End') target = accButtons[accButtons.length - 1];
      if (target) { e.preventDefault(); target.focus(); }
    });
  });

  // Tips hari ini: berganti otomatis setiap hari
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  $('#tipOfDay').textContent = tips[dayOfYear % tips.length];

  /* ---------------- FORMULIR PENDAFTARAN ---------------- */
  const form = $('#joinForm');
  const namaInput = $('#nama');
  const kontakInput = $('#kontak');
  const formSuccess = $('#formSuccess');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

  function setError(input, errorId, message) {
    const err = document.getElementById(errorId);
    err.textContent = message;
    input.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) input.setAttribute('aria-describedby', errorId);
    else input.removeAttribute('aria-describedby');
    return !message;
  }

  function validateNama() {
    const v = namaInput.value.trim();
    if (!v) return setError(namaInput, 'namaError', 'Nama lengkap wajib diisi.');
    if (v.length < 3) return setError(namaInput, 'namaError', 'Nama minimal 3 karakter.');
    return setError(namaInput, 'namaError', '');
  }

  function validateKontak() {
    const v = kontakInput.value.trim();
    const phone = v.replace(/[\s-]/g, '');
    if (!v) return setError(kontakInput, 'kontakError', 'Email atau nomor WhatsApp wajib diisi.');
    if (!emailRe.test(v) && !phoneRe.test(phone)) {
      return setError(kontakInput, 'kontakError', 'Gunakan format email yang benar atau nomor HP, contoh 0812-3456-7890.');
    }
    return setError(kontakInput, 'kontakError', '');
  }

  namaInput.addEventListener('blur', validateNama);
  kontakInput.addEventListener('blur', validateKontak);
  namaInput.addEventListener('input', () => { if (namaInput.classList.contains('invalid')) validateNama(); });
  kontakInput.addEventListener('input', () => { if (kontakInput.classList.contains('invalid')) validateKontak(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    formSuccess.hidden = true;

    const okNama = validateNama();
    const okKontak = validateKontak();
    if (!okNama) return namaInput.focus();
    if (!okKontak) return kontakInput.focus();

    // Di sini data bisa dikirim ke server (fetch / Google Form / WhatsApp).
    const nama = namaInput.value.trim().split(' ')[0];
    formSuccess.textContent = `Terima kasih, ${nama}! Pendaftaran Anda sudah kami terima. Pengurus akan segera menghubungi Anda.`;
    formSuccess.hidden = false;
    form.reset();
  });

  /* ---------------- FOOTER ---------------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------------- INISIALISASI ---------------- */
  renderNextEvent();
  renderSchedule();
  renderGallery();
})();