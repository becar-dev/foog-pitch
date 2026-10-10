// FOOG Pitch — navigatsiya, reveal animatsiyasi, progress barlar, oldindan tayyor javobli chatbot (API kalitsiz).
(function () {
  var nav = document.querySelector('.nav');
  var links = document.querySelector('.nav-links');
  var btn = document.querySelector('.menu-btn');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var fill = function (el) {
    el.querySelectorAll('.progress i[data-w]').forEach(function (i) { i.style.width = i.dataset.w + '%'; });
  };
  var targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); fill(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); fill(t); });
  }

  // ---------- Chatbot: faqat oldindan yozilgan javoblar, tarmoq so'rovi yo'q ----------
  var QA = [
    { q: 'FOOG nima?', a: 'FOOG — Toshkent uchun futbol ilovasi: stadion topish, bo‘sh vaqtni ko‘rish va bron qilish, o‘yinlar, jamoalar, lenta va chat. Kirish — faqat Telegram orqali.' },
    { q: 'Bron qanday ishlaydi?', a: 'Stadion → sana → bo‘sh slot → “Bron qilish”. Slot 10 daqiqaga ushlab turiladi (HELD), so‘ng so‘rov stadion egasiga boradi (PENDING). Egasi tasdiqlaydi — bron CONFIRMED. To‘lov v1 da stadionda.' },
    { q: 'Ikki kishi bir vaqtni bron qilsa?', a: 'Bo‘lmaydi. PostgreSQL darajasida EXCLUDE constraint va advisory lock bor: 10 ta parallel so‘rovdan faqat bittasi o‘tadi, qolganlari 409 SLOT_TAKEN oladi. Bu testlar bilan isbotlangan.' },
    { q: 'Hozir nima tayyor?', a: 'v1-APK rejasidagi 101 ticketdan 70 tasi merge qilingan (≈69%). Audit tuzatishlari va monorepo/dizayn tizimi 100%, backend endpointlari 75%. Mobil ekranlar — 25 tadan 2 tasi to‘liq (Welcome, Profil); qolganlari ishlab chiqilmoqda.' },
    { q: 'Qaysi texnologiyalar?', a: 'Expo (React Native) universal ilova — Android + Web; Node.js/Express + Prisma backend; PostgreSQL 16; Redis; Socket.IO; zod kontraktlari; pnpm + Turborepo monorepo; 4 til (uz/ru/en/zh).' },
    { q: 'AI qanday ishlatiladi?', a: 'Ishlab chiqishda: Claude Code Tech Lead sifatida ticketlarni rejalashtiradi, implementer agentlar alohida git worktree’da kod yozadi, reviewer agent har ticketni lint/typecheck/test bilan tekshiradi. APPROVED bo‘lmaguncha merge yo‘q.' },
    { q: 'Prototipni qayerda ko‘raman?', a: 'Yuqoridagi “Prototip” tugmasi — haqiqiy ilova kodi (mock rejim): Telegram kirish, rol, onboarding, Home. “Bron demo” — bron oqimining statik interaktiv konsepti.' },
    { q: 'Qachon ishga tushadi?', a: 'Keyingi qadamlar: qolgan mobil ekranlar (W21–W26), PWA/EAS (091), production deploy (092). Aniq sana jamoa tomonidan e’lon qilinadi.' }
  ];
  var fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.setAttribute('aria-label', 'FOOG yordamchisi');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  var panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'FOOG yordamchisi');
  var base = document.documentElement.dataset.base || './';
  panel.innerHTML =
    '<div class="chat-head"><img src="' + base + 'assets/symbol.svg" alt="" width="36" height="18"><div><b style="font-size:14px">FOOG yordamchisi</b><div class="small muted" style="font-size:12px">Tayyor javoblar · AI emas</div></div><button class="x" aria-label="Yopish">×</button></div>' +
    '<div class="chat-body" aria-live="polite"></div><div class="chips"></div>';
  document.body.appendChild(fab);
  document.body.appendChild(panel);
  var body = panel.querySelector('.chat-body');
  var chips = panel.querySelector('.chips');
  var say = function (text, who) {
    var m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  };
  say('Salom! Men FOOG haqida tez-tez beriladigan savollarga tayyor javob beraman. Savolni tanlang:', 'bot');
  QA.forEach(function (item) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.q;
    b.addEventListener('click', function () {
      say(item.q, 'me');
      setTimeout(function () { say(item.a, 'bot'); }, 350);
    });
    chips.appendChild(b);
  });
  var toggle = function (open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
  };
  fab.addEventListener('click', function () { toggle(panel.hidden); });
  panel.querySelector('.x').addEventListener('click', function () { toggle(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { toggle(false); fab.focus(); } });
})();
