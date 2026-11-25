/* myB — публичная страница записи на встречу (book.html).
   Работает с Edge Function «book». Без сборки и библиотек. Идентификаторы живут только в #хэше,
   поэтому не уходят на сервер GitHub Pages. Весь текст с сервера выводится через textContent. */
(function () {
  'use strict';

  var API = 'https://crrqausxktmmvwcpofgn.supabase.co/functions/v1/book';
  var KEY = 'sb_publishable_f6P6uC80xLOLplNAwdD92A_l0HOkCZa';
  var LS_LANG = 'myb.book.lang';
  var LINK_RE = /^[A-Za-z0-9]{12,40}$/;
  var MANAGE_RE = /^m=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([A-Za-z0-9_-]{20,64})$/i;
  // то же правило, что на сервере: @ник / ник, почта, телефон или ссылка
  var CONTACT_RE = /^(@?[A-Za-z0-9_]{3,40}|[^\s@]+@[^\s@]+\.[^\s@]+|\+?[\d\s()-]{6,24}|https?:\/\/\S+)$/;
  var URL_RE = /^https?:\/\/\S+$/i;

  var T = {
    ru: {
      docTitle: 'Запись на встречу', loading: 'Загрузка…', meeting: 'Встреча', min: '{n} мин',
      dur: 'Длительность', day: 'Выберите день', days: 'Дни', times: 'Время',
      tz: 'Время указано по вашему часовому поясу:', earlier: 'Раньше', later: 'Позже',
      hostAt: '{host}: {when} по местному времени', hostAtAnon: 'У организатора: {when}',
      empty: 'Свободного времени в ближайшие дни нет', emptySub: 'Загляните позже или напишите организатору.',
      details: 'Ваши данные', name: 'Имя', nameErr: 'Напишите, как вас зовут',
      contact: 'Контакт', contactPh: '@username, почта или телефон', contactErr: 'Telegram @username, почта или телефон',
      note: 'Комментарий', optional: 'необязательно', notePh: 'О чём хотите поговорить',
      book: 'Записаться на {date}, {time}', booking: 'Записываем…',
      taken: 'Это время только что заняли — выберите другое',
      tooMany: 'Слишком много записей из этой сети. Попробуйте позже.',
      tooManyMoves: 'Встречу переносили уже слишком много раз — напишите организатору.',
      badReq: 'Проверьте имя и контакт и попробуйте ещё раз.',
      server: 'Что-то пошло не так. Попробуйте ещё раз.',
      offline: 'Нет соединения. Попробуйте ещё раз.', retry: 'Повторить',
      offlineT: 'Нет соединения', serverT: 'Что-то пошло не так', againSub: 'Проверьте интернет и попробуйте ещё раз.',
      notFound: 'Ссылка не найдена', notFoundSub: 'Проверьте адрес или попросите организатора прислать ссылку ещё раз.',
      gone: 'Ссылка больше не действует', goneSub: 'Организатор выключил её, или время по ней уже занято. Попросите новую ссылку.',
      bkNotFound: 'Запись не найдена', bkNotFoundSub: 'Ссылка неполная или устарела — проверьте, что она скопирована целиком.',
      booked: 'Вы записаны', addCal: 'Добавить в календарь', ics: 'Apple, Outlook (.ics)', gcal: 'Google Календарь',
      save: 'Сохраните эту ссылку — по ней можно перенести или отменить встречу', copy: 'Скопировать', copied: 'Скопировано',
      yours: 'Ваша встреча', confirmed: 'Подтверждена', cancelledTag: 'Отменена', pastTag: 'Прошла',
      cancelled: 'Встреча отменена', cancelledOwner: 'Встреча отменена организатором', past: 'Встреча уже прошла',
      reschedule: 'Перенести', cancel: 'Отменить встречу', cancelAsk: 'Отменить эту встречу?',
      cancelYes: 'Да, отменить', cancelNo: 'Не отменять', cancelling: 'Отменяем…',
      another: 'Записаться на другое время', pickNew: 'Перенос встречи',
      moveTo: 'Перенести на {date}, {time}', moving: 'Переносим…', moved: 'Встреча перенесена на {date}, {time}',
      back: 'Назад', current: 'текущее время встречи',
      moveGone: 'Ссылка больше не действует — перенести встречу нельзя.',
      icsManage: 'Перенести или отменить', icsJoin: 'Ссылка на встречу', made: 'Сделано в'
    },
    en: {
      docTitle: 'Book a meeting', loading: 'Loading…', meeting: 'Meeting', min: '{n} min',
      dur: 'Duration', day: 'Pick a day', days: 'Days', times: 'Times',
      tz: 'Times are in your time zone:', earlier: 'Earlier days', later: 'Later days',
      hostAt: 'That’s {when} for {host}', hostAtAnon: 'That’s {when} for the organizer',
      empty: 'No free time in the next days', emptySub: 'Check back later or contact the organizer.',
      details: 'Your details', name: 'Name', nameErr: 'Please enter your name',
      contact: 'Contact', contactPh: '@username, email or phone', contactErr: 'Telegram @username, email or phone',
      note: 'Comment', optional: 'optional', notePh: 'What would you like to talk about',
      book: 'Book {time}, {date}', booking: 'Booking…',
      taken: 'Someone just took this time — please pick another one',
      tooMany: 'Too many bookings from this network, try later.',
      tooManyMoves: 'This meeting has been rescheduled too many times — please contact the organizer.',
      badReq: 'Please check your name and contact and try again.',
      server: 'Something went wrong. Try again.',
      offline: 'No connection. Try again.', retry: 'Try again',
      offlineT: 'No connection', serverT: 'Something went wrong', againSub: 'Check your internet connection and try again.',
      notFound: 'Link not found', notFoundSub: 'Check the address or ask the organizer to send the link again.',
      gone: 'This link no longer works', goneSub: 'The organizer turned it off, or its time has already been booked. Ask for a new link.',
      bkNotFound: 'Booking not found', bkNotFoundSub: 'The link is incomplete or outdated — make sure you copied all of it.',
      booked: 'You’re booked', addCal: 'Add to calendar', ics: 'Apple, Outlook (.ics)', gcal: 'Google Calendar',
      save: 'Save this link to reschedule or cancel', copy: 'Copy', copied: 'Copied',
      yours: 'Your meeting', confirmed: 'Confirmed', cancelledTag: 'Cancelled', pastTag: 'Past',
      cancelled: 'This meeting was cancelled', cancelledOwner: 'This meeting was cancelled by the organizer', past: 'This meeting has already taken place',
      reschedule: 'Reschedule', cancel: 'Cancel booking', cancelAsk: 'Cancel this meeting?',
      cancelYes: 'Yes, cancel', cancelNo: 'Keep it', cancelling: 'Cancelling…',
      another: 'Book another time', pickNew: 'Reschedule',
      moveTo: 'Move to {time}, {date}', moving: 'Moving…', moved: 'Moved to {time}, {date}',
      back: 'Back', current: 'current meeting time',
      moveGone: 'This link no longer works, so the meeting can’t be moved.',
      icsManage: 'Reschedule or cancel', icsJoin: 'Join', made: 'Made with'
    }
  };
  // Русские названия частых поясов; остальные — город из IANA
  var RU_CITY = {
    'Europe/Moscow': 'Москва', 'Europe/Kaliningrad': 'Калининград', 'Europe/Samara': 'Самара', 'Europe/Volgograd': 'Волгоград',
    'Asia/Yekaterinburg': 'Екатеринбург', 'Asia/Omsk': 'Омск', 'Asia/Novosibirsk': 'Новосибирск', 'Asia/Krasnoyarsk': 'Красноярск',
    'Asia/Irkutsk': 'Иркутск', 'Asia/Yakutsk': 'Якутск', 'Asia/Vladivostok': 'Владивосток', 'Asia/Magadan': 'Магадан',
    'Asia/Kamchatka': 'Камчатка', 'Europe/Minsk': 'Минск', 'Europe/Kiev': 'Киев', 'Europe/Kyiv': 'Киев', 'Asia/Almaty': 'Алматы',
    'Asia/Tashkent': 'Ташкент', 'Asia/Bishkek': 'Бишкек', 'Asia/Tbilisi': 'Тбилиси', 'Asia/Yerevan': 'Ереван', 'Asia/Baku': 'Баку',
    'Europe/Istanbul': 'Стамбул', 'Asia/Dubai': 'Дубай', 'Asia/Ho_Chi_Minh': 'Хошимин', 'Asia/Saigon': 'Хошимин',
    'Asia/Bangkok': 'Бангкок', 'Asia/Shanghai': 'Шанхай', 'Asia/Hong_Kong': 'Гонконг', 'Asia/Singapore': 'Сингапур',
    'Asia/Seoul': 'Сеул', 'Asia/Tokyo': 'Токио', 'Asia/Bali': 'Бали', 'Asia/Makassar': 'Бали', 'Asia/Jakarta': 'Джакарта',
    'Asia/Kolkata': 'Индия', 'Europe/London': 'Лондон', 'Europe/Berlin': 'Берлин', 'Europe/Paris': 'Париж',
    'Europe/Madrid': 'Мадрид', 'Europe/Rome': 'Рим', 'Europe/Warsaw': 'Варшава', 'Europe/Riga': 'Рига', 'Europe/Vilnius': 'Вильнюс',
    'Europe/Tallinn': 'Таллин', 'Europe/Helsinki': 'Хельсинки', 'Europe/Belgrade': 'Белград', 'Asia/Jerusalem': 'Израиль',
    'Asia/Tel_Aviv': 'Израиль', 'America/New_York': 'Нью-Йорк', 'America/Los_Angeles': 'Лос-Анджелес', 'America/Chicago': 'Чикаго'
  };

  /* ---------- состояние ---------- */
  function newPick() { return { slots: [], day: null, slot: null, busy: false, msg: null, link: null, sending: false, loading: false }; }
  var S = {
    lang: 'ru', gtz: 'UTC', route: null, phase: 'loading', seq: 0, retry: null,
    link: null, dur: 0, pick: newPick(),
    form: { name: '', contact: '', note: '' }, errs: {}, formMsg: null, sending: false,
    done: null, bk: null, mmode: 'view', mmsg: null, mbusy: false, mv: null,
    focus: null, reveal: null
  };

  /* ---------- утилиты ---------- */
  var app = document.getElementById('app');
  var live = document.getElementById('live');
  function t(k, v) {
    var s = (T[S.lang] && T[S.lang][k]) || T.en[k] || k;
    return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return v[n] == null ? '' : String(v[n]); }) : s;
  }
  function str(v, max) { return typeof v === 'string' ? v.slice(0, max || 300) : ''; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function say(s) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = s; }, 30); } }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  // h('tag.class', {attr}, children…) — только textContent и атрибуты, никакого innerHTML
  function h(sel, props) {
    var m = sel.split('.'), e = document.createElement(m[0] || 'div');
    if (m.length > 1) e.className = m.slice(1).join(' ');
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'value') e.value = v;
      else e.setAttribute(k, v === true ? '' : String(v));
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; }
    e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }

  /* ---------- время и пояса ---------- */
  var FC = {};
  function F(loc, o) { var k = loc + JSON.stringify(o); return FC[k] || (FC[k] = new Intl.DateTimeFormat(loc, o)); }
  function okTz(tz) { if (typeof tz !== 'string' || !tz) return false; try { F('en-US', { timeZone: tz }); return true; } catch (e) { return false; } }
  function guestTz() { try { var z = Intl.DateTimeFormat().resolvedOptions().timeZone; return okTz(z) ? z : 'UTC'; } catch (e) { return 'UTC'; } }
  function parts(ms, tz) {
    var o = {};
    F('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    if (o.hour === '24') o.hour = '00';
    return o;
  }
  function dayKey(ms, tz) { var o = parts(ms, tz); return o.year + '-' + o.month + '-' + o.day; }
  function offMin(ms, tz) {
    var o = parts(ms, tz), base = ms - (ms % 60000);
    return Math.round((Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute) - base) / 60000);
  }
  function gmt(off) {
    if (!off) return 'GMT';
    var a = Math.abs(off);
    return 'GMT' + (off > 0 ? '+' : '−') + Math.floor(a / 60) + (a % 60 ? ':' + pad(a % 60) : '');
  }
  function tzLabel(tz, ms) {
    if (tz === 'UTC' || /^Etc\//.test(tz)) return 'UTC' + (offMin(ms, tz) ? ' (' + gmt(offMin(ms, tz)) + ')' : '');
    var city = (S.lang === 'ru' && RU_CITY[tz]) || tz.split('/').pop().replace(/_/g, ' ');
    return city + ', ' + gmt(offMin(ms, tz));
  }
  function loc() { return S.lang === 'ru' ? 'ru' : 'en-GB'; }
  function fTime(ms, tz) {
    return S.lang === 'ru'
      ? F('ru', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(ms))
      : F('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(ms));
  }
  function fDay(ms, tz) { return F(loc(), { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(ms)); }
  function fLong(ms, tz) {
    var o = { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' };
    if (parts(ms, tz).year !== parts(Date.now(), tz).year) o.year = 'numeric';
    return cap(F(loc(), o).format(new Date(ms)));
  }
  function fWd(ms, tz) { return F(loc(), { timeZone: tz, weekday: 'short' }).format(new Date(ms)).replace(/\.$/, ''); }
  function fMon(ms, tz) { return F(loc(), { timeZone: tz, month: 'short' }).format(new Date(ms)); }
  function fRange(a, b, tz) { return fTime(a, tz) + (S.lang === 'ru' ? '–' : ' – ') + fTime(b, tz); }
  function whenVars(ms) { return { date: fDay(ms, S.gtz), time: fTime(ms, S.gtz) }; }
  function minLabel(n) { return t('min', { n: n }); }

  /* ---------- сеть ---------- */
  function api(body) {
    return new Promise(function (resolve, reject) {
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); reject({ net: true }); }, 20000);
      fetch(API, {
        method: 'POST', mode: 'cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
        headers: { 'content-type': 'application/json', apikey: KEY },
        body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        return res.text().then(function (txt) {
          clearTimeout(timer);
          var data = null;
          try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = null; }
          if (res.ok && data && typeof data === 'object') resolve(data);
          else reject({ status: res.status || 0, error: data && data.error, data: (data && typeof data === 'object') ? data : {} });
        });
      }).catch(function () { clearTimeout(timer); reject({ net: true }); });
    });
  }

  function cleanLink(L) {
    L = L && typeof L === 'object' ? L : {};
    var durs = (Array.isArray(L.durs) ? L.durs : []).map(Number).filter(function (n) { return n > 0 && n <= 1440 && Math.floor(n) === n; });
    var dur = Number(L.dur);
    if (!durs.length) durs = [dur > 0 ? dur : 30];
    if (durs.indexOf(dur) < 0) dur = durs[0];
    return { title: str(L.title, 120), host: str(L.host, 80), durs: durs, dur: dur, place: str(L.place, 200), tz: okTz(L.tz) ? L.tz : 'UTC', kind: str(L.kind, 20) };
  }
  function cleanSlots(a) {
    var seen = {};
    return (Array.isArray(a) ? a : []).map(Number).filter(function (n) {
      if (!isFinite(n) || seen[n]) return false; seen[n] = 1; return true;
    }).sort(function (x, y) { return x - y; });
  }
  function groupDays(slots) {
    var out = [], idx = {};
    slots.forEach(function (ms) {
      var k = dayKey(ms, S.gtz);
      if (!(k in idx)) { idx[k] = out.length; out.push({ key: k, first: ms, list: [] }); }
      out[idx[k]].list.push(ms);
    });
    return out;
  }
  function setSlots(P, arr, preferDay) {
    P.slots = cleanSlots(arr);
    var days = groupDays(P.slots), has = function (k) { return days.some(function (d) { return d.key === k; }); };
    if (preferDay && has(preferDay)) P.day = preferDay;
    else if (!P.day || !has(P.day)) P.day = days.length ? days[0].key : null;
    if (P.slot != null && P.slots.indexOf(P.slot) < 0) P.slot = null;
  }

  /* ---------- маршрут ---------- */
  function parseHash() {
    var raw = (location.hash || '').replace(/^#/, '');
    try { raw = decodeURIComponent(raw); } catch (e) { /* как есть */ }
    raw = raw.trim();
    var m = MANAGE_RE.exec(raw);
    if (m) return { kind: 'manage', id: m[1].toLowerCase(), t: m[2] };
    if (LINK_RE.test(raw)) return { kind: 'book', l: raw };
    return { kind: 'none' };
  }
  function route() {
    S.seq++;
    S.route = parseHash();
    S.link = null; S.pick = newPick(); S.errs = {}; S.formMsg = null; S.sending = false;
    S.done = null; S.bk = null; S.mmode = 'view'; S.mmsg = null; S.mbusy = false; S.mv = null; S.retry = null;
    if (S.route.kind === 'book') loadBook(0);
    else if (S.route.kind === 'manage') loadManage();
    else { S.phase = 'notfound'; render(); }
    setTitle();
  }
  function setTitle() {
    var host = '', title = '';
    if (S.phase === 'pick' && S.link) { host = S.link.host; title = S.link.title; }
    else if (S.phase === 'success' && S.done) { host = S.done.host; title = S.done.title; }
    else if (S.phase === 'manage' && S.bk) { host = S.bk.host; title = S.bk.title; }
    var s = [host, title].filter(Boolean).join(' · ');
    document.title = s || t('docTitle');
  }

  /* ---------- запись ---------- */
  function loadBook(dur) {
    var seq = ++S.seq, P = S.pick, prevDur = S.dur;
    if (!S.link) { S.phase = 'loading'; }
    else { P.busy = true; P.msg = null; if (dur) S.dur = dur; }
    render();
    var body = { a: 'get', l: S.route.l };
    if (dur) body.dur = dur;
    api(body).then(function (r) {
      if (seq !== S.seq) return;
      S.link = cleanLink(r.link); S.dur = S.link.dur;
      P.busy = false; P.msg = null;
      setSlots(P, r.slots);
      S.phase = 'pick'; S.retry = null;
      setTitle(); render();
    }, function (e) {
      if (seq !== S.seq) return;
      P.busy = false;
      var again = function () { loadBook(dur); };
      if (e.status === 410 || e.status === 404) { S.phase = 'gone'; setTitle(); }
      else if (!S.link) { S.phase = e.net ? 'neterr' : 'err'; S.retry = again; }
      else { S.dur = prevDur; P.msg = { key: e.net ? 'offline' : 'server', retry: again }; }
      render();
    });
  }

  function pickDay(P, key) { if (P.day === key) return; P.day = key; P.slot = null; P.msg = null; render(); }
  function pickSlot(P, ms) {
    var first = P.slot == null;
    P.slot = ms; P.msg = null;
    if (P === S.pick) { S.formMsg = null; if (first) S.reveal = { sel: '.bk-form', top: true }; }
    else S.reveal = { sel: '[data-k="m:back"]', top: false };
    render();
  }

  function readForm() {
    var f = app.querySelector('form.bk-form');
    if (!f) return;
    S.form.name = f.elements.name.value; S.form.contact = f.elements.contact.value; S.form.note = f.elements.note.value;
  }
  function validate() {
    var e = {}, n = S.form.name.trim(), c = S.form.contact.trim();
    if (!n || n.length > 80) e.name = 'nameErr';
    if (!CONTACT_RE.test(c) || c.length > 120) e.contact = 'contactErr';
    return e;
  }
  function submitBook(ev) {
    if (ev) ev.preventDefault();
    if (S.sending || S.pick.slot == null) return;
    readForm();
    var hp = app.querySelector('input[name="web"]'), web = hp ? hp.value : '';
    S.errs = validate(); S.formMsg = null;
    if (S.errs.name || S.errs.contact) {
      S.focus = S.errs.name ? '#bk-name' : '#bk-contact';
      render(); say(t(S.errs.name || S.errs.contact));
      return;
    }
    var P = S.pick, start = P.slot, dur = S.dur, seq = S.seq;
    // одна попытка записи = один токен: если ответ потерялся, повтор с ним же вернёт уже созданную запись
    var key = S.route.l + '|' + start + '|' + dur;
    if (!S.bookKey || S.bookKey.k !== key) S.bookKey = { k: key, token: newToken() };
    S.sending = true; render();
    api({
      a: 'book', l: S.route.l, start: start, dur: dur, token: S.bookKey.token,
      name: S.form.name.trim(), contact: S.form.contact.trim(), note: S.form.note.trim().slice(0, 600),
      tz: S.gtz, lang: S.lang, web: web
    }).then(function (r) {
      if (seq !== S.seq) return;
      S.sending = false; S.bookKey = null;
      var id = str(r.id, 64), token = str(r.token, 64);
      var s = Number(r.start), en = Number(r.end);
      if (!isFinite(s)) s = start;
      if (!isFinite(en) || en <= s) en = s + dur * 60000;
      S.done = {
        id: id, token: token, start: s, end: en,
        title: str(r.title, 120) || S.link.title, host: str(r.host, 80) || S.link.host,
        place: str(r.place, 500), tz: okTz(r.tz) ? r.tz : S.link.tz, label: S.link.place
      };
      if (/^[0-9a-f-]{36}$/i.test(id) && /^[A-Za-z0-9_-]{20,64}$/.test(token)) {
        S.route = { kind: 'manage', id: id.toLowerCase(), t: token };
        try { history.replaceState(null, '', '#m=' + id + '.' + token); } catch (e) { /* без истории */ }
      }
      S.phase = 'success'; S.focus = '.bk-title';
      setTitle(); render();
      window.scrollTo(0, 0);
      say(t('booked') + '. ' + fLong(s, S.gtz) + ', ' + fRange(s, en, S.gtz));
    }, function (e) {
      if (seq !== S.seq) return;
      S.sending = false;
      if (e.status === 409 && e.error === 'taken') {
        setSlots(P, e.data.slots || P.slots.filter(function (x) { return x !== start; }));
        P.slot = null; P.msg = { key: 'taken' };
        S.focus = '.bk-picknote'; render(); say(t('taken'));
        var n = app.querySelector('.bk-picknote');
        if (n && n.scrollIntoView) n.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
        return;
      }
      if (e.status === 410) { S.phase = 'gone'; setTitle(); render(); window.scrollTo(0, 0); return; }
      var k = e.net ? 'offline' : e.status === 429 ? 'tooMany' : e.status === 400 ? 'badReq' : 'server';
      S.formMsg = { key: k, retry: (e.net || e.status >= 500) ? function () { submitBook(); } : null };
      S.focus = '.bk-formnote'; render(); say(t(k));
    });
  }

  /* ---------- своя запись ---------- */
  function cleanBooking(b) {
    b = b && typeof b === 'object' ? b : {};
    var s = Number(b.start), e = Number(b.end);
    return {
      start: s, end: isFinite(e) && e > s ? e : s + (Number(b.dur) || 30) * 60000,
      status: b.status === 'cancelled' ? 'cancelled' : 'confirmed', by: b.by === 'owner' ? 'owner' : b.by === 'guest' ? 'guest' : null,
      title: str(b.title, 120), host: str(b.host, 80), place: str(b.place, 500), name: str(b.name, 80),
      link: typeof b.link === 'string' && LINK_RE.test(b.link) ? b.link : null,
      dur: Number(b.dur) || Math.round((e - s) / 60000) || 30, tz: okTz(b.tz) ? b.tz : 'UTC'
    };
  }
  function loadManage(note) {
    var seq = ++S.seq;
    if (!S.bk) S.phase = 'loading';
    render();
    api({ a: 'manage', id: S.route.id, t: S.route.t }).then(function (r) {
      if (seq !== S.seq) return;
      S.bk = cleanBooking(r.booking);
      if (!isFinite(S.bk.start)) { S.phase = 'bknf'; setTitle(); render(); return; }
      S.phase = 'manage'; S.mmode = 'view'; S.mbusy = false; S.mv = null; S.retry = null;
      S.mmsg = note ? { key: note } : null;
      setTitle(); render();
    }, function (e) {
      if (seq !== S.seq) return;
      S.mbusy = false;
      if (e.status === 404 || e.status === 400) { S.phase = 'bknf'; S.bk = null; }
      else if (!S.bk) { S.phase = e.net ? 'neterr' : 'err'; S.retry = function () { loadManage(note); }; }
      else { S.mmsg = { key: e.net ? 'offline' : 'server', retry: function () { loadManage(note); } }; }
      setTitle(); render();
    });
  }
  function isFuture(b) { return b.end > Date.now(); }

  function askCancel() { S.mmode = 'ask'; S.mmsg = null; S.focus = '[data-k="m:no"]'; render(); }
  function keepIt() { S.mmode = 'view'; S.focus = '[data-k="m:cancel"]'; render(); }
  function doCancel() {
    if (S.mbusy) return;
    var seq = S.seq;
    S.mbusy = 'cancel'; render();
    api({ a: 'cancel', id: S.route.id, t: S.route.t }).then(function () {
      if (seq !== S.seq) return;
      S.mbusy = false; S.bk.status = 'cancelled'; S.bk.by = 'guest'; S.mmode = 'view'; S.mmsg = null;
      S.focus = '.bk-title'; render(); say(t('cancelled'));
    }, function (e) {
      if (seq !== S.seq) return;
      S.mbusy = false;
      if (e.status === 410 || e.status === 404) { loadManage(); return; }
      S.mmode = 'view';
      var k = e.status === 409 ? 'past' : e.net ? 'offline' : 'server';
      S.mmsg = { key: k, retry: (e.net || e.status >= 500) ? doCancel : null };
      S.focus = '.bk-mnote'; render(); say(t(k));
    });
  }

  function startMove() {
    var b = S.bk, seq = ++S.seq;
    S.mmode = 'move'; S.mmsg = null;
    var P = S.mv = newPick();
    P.loading = true; P.busy = true;
    render();
    api({ a: 'get', l: b.link, dur: b.dur, m: { id: S.route.id, t: S.route.t } }).then(function (r) {
      if (seq !== S.seq || S.mv !== P) return;
      P.link = cleanLink(r.link); P.loading = false; P.busy = false;
      setSlots(P, r.slots, dayKey(b.start, S.gtz));
      S.focus = '.bk-movehead'; render();
    }, function (e) {
      if (seq !== S.seq || S.mv !== P) return;
      P.loading = false; P.busy = false;
      if (e.status === 410 || e.status === 404) {
        S.mmode = 'view'; S.mv = null; S.bk.link = null; S.mmsg = { key: 'moveGone' };
        S.focus = '.bk-mnote'; render(); say(t('moveGone'));
        return;
      }
      P.msg = { key: e.net ? 'offline' : 'server', retry: startMove };
      render();
    });
  }
  function stopMove() { S.mmode = 'view'; S.mv = null; S.focus = '[data-k="m:move"]'; render(); }
  function doMove() {
    var P = S.mv;
    if (!P || P.sending || P.slot == null) return;
    var start = P.slot, seq = S.seq;
    P.sending = true; P.msg = null; render();
    api({ a: 'move', id: S.route.id, t: S.route.t, start: start }).then(function (r) {
      if (seq !== S.seq) return;
      var s = Number(r.start), e = Number(r.end);
      S.bk.start = isFinite(s) ? s : start;
      S.bk.end = isFinite(e) && e > S.bk.start ? e : S.bk.start + S.bk.dur * 60000;
      S.mmode = 'view'; S.mv = null;
      S.mmsg = { key: 'moved', ms: S.bk.start }; S.focus = '.bk-mnote';
      var txt = msgText(S.mmsg);
      render(); say(txt);
      window.scrollTo(0, 0);
    }, function (e) {
      if (seq !== S.seq) return;
      P.sending = false;
      if (e.status === 409 && e.error === 'taken') {
        setSlots(P, e.data.slots || P.slots.filter(function (x) { return x !== start; }));
        P.slot = null; P.msg = { key: 'taken' }; S.focus = '.bk-picknote'; render(); say(t('taken'));
        return;
      }
      if (e.status === 410 || e.status === 404) { loadManage('moveGone'); return; }
      if (e.status === 409) { loadManage('past'); return; }
      P.msg = { key: e.net ? 'offline' : e.status === 429 ? 'tooManyMoves' : 'server', retry: (e.net || e.status >= 500) ? doMove : null };
      S.focus = '.bk-picknote'; render(); say(t(P.msg.key));
    });
  }

  /* ---------- календарь ---------- */
  function icsDate(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n'); }
  function u8(ch) { var c = ch.codePointAt(0); return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; }
  // RFC 5545: строки не длиннее 75 октетов, продолжение начинается с пробела
  function fold(line) {
    var out = '', n = 0, limit = 75;
    Array.from(line).forEach(function (ch) {
      var l = u8(ch);
      if (n + l > limit) { out += '\r\n '; n = 1; }
      out += ch; n += l;
    });
    return out;
  }
  function manageUrl(id, token) { return location.href.split('#')[0] + '#m=' + id + '.' + token; }
  function newToken() {
    var b = new Uint8Array(24), a = '';
    (window.crypto || window.msCrypto).getRandomValues(b);
    for (var i = 0; i < b.length; i++) a += String.fromCharCode(b[i]);
    return btoa(a).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function calInfo(m, noManage) {
    var summary = m.title && m.host ? m.title + ' — ' + m.host : (m.title || m.host || t('meeting'));
    var desc = [];
    if (URL_RE.test(m.place)) desc.push(t('icsJoin') + ': ' + m.place);
    if (m.manage && !noManage) desc.push(t('icsManage') + ': ' + m.manage);
    return { summary: summary, desc: desc.join('\n') };
  }
  function buildIcs(m) {
    var c = calInfo(m), L = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//myB//Booking//' + S.lang.toUpperCase(), 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:' + m.id + '@myb', 'DTSTAMP:' + icsDate(Date.now()),
      'DTSTART:' + icsDate(m.start), 'DTEND:' + icsDate(m.end), 'SUMMARY:' + icsEsc(c.summary)
    ];
    if (m.place) L.push('LOCATION:' + icsEsc(m.place));
    if (URL_RE.test(m.place)) L.push('URL:' + m.place);
    if (c.desc) L.push('DESCRIPTION:' + icsEsc(c.desc));
    L.push('STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }
  function downloadIcs(m) {
    var blob = new Blob([buildIcs(m)], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = (S.lang === 'ru' ? 'vstrecha' : 'meeting') + '-' + icsDate(m.start).slice(0, 8) + '.ics';
    a.rel = 'noopener'; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 15000);
  }
  function googleUrl(m) {
    var c = calInfo(m, true), q = [
      'action=TEMPLATE', 'text=' + encodeURIComponent(c.summary), 'dates=' + icsDate(m.start) + '/' + icsDate(m.end)
    ];
    if (c.desc) q.push('details=' + encodeURIComponent(c.desc));
    if (m.place) q.push('location=' + encodeURIComponent(m.place));
    return 'https://calendar.google.com/calendar/render?' + q.join('&');
  }

  function copy(text, btn, codeEl) {
    var done = function () {
      btn.textContent = t('copied'); say(t('copied'));
      setTimeout(function () { if (btn.isConnected) btn.textContent = t('copy'); }, 1800);
    };
    var select = function () {
      try { var r = document.createRange(); r.selectNodeContents(codeEl); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) { /* ничего */ }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, select);
      else select();
    } catch (e) { select(); }
  }

  /* ---------- отрисовка ---------- */
  function render() {
    var ae = document.activeElement, fk = ae && ae.getAttribute ? ae.getAttribute('data-k') : null;
    var old = app.querySelector('.bk-strip'), sl = old ? old.scrollLeft : 0;
    var frag = document.createDocumentFragment();
    add(frag, build());
    while (app.firstChild) app.removeChild(app.firstChild);
    app.appendChild(frag);
    app.setAttribute('aria-busy', S.phase === 'loading' ? 'true' : 'false');
    var strip = app.querySelector('.bk-strip');
    if (strip) { strip.scrollLeft = sl; showDay(strip); stripState(strip); }
    var target = null, explicit = !!S.focus;
    if (S.focus) { target = app.querySelector(S.focus); S.focus = null; }
    else if (fk) target = app.querySelector('[data-k="' + fk + '"]');
    if (target) { try { target.focus({ preventScroll: !explicit }); } catch (e) { target.focus(); } }
    if (S.reveal) {
      var rv = S.reveal, el = app.querySelector(rv.sel);
      S.reveal = null;
      if (el) {
        var r = el.getBoundingClientRect(), dy = 0;
        if (rv.top && r.top > innerHeight * 0.72) dy = r.top - Math.max(80, innerHeight * 0.3);
        else if (!rv.top && r.bottom > innerHeight - 16) dy = r.bottom - innerHeight + 24;
        if (dy > 0) window.scrollTo({ top: window.pageYOffset + dy, behavior: reduced() ? 'auto' : 'smooth' });
      }
    }
  }
  function showDay(strip) {
    var b = strip.querySelector('[aria-pressed="true"]');
    if (!b) return;
    var padL = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
    if (b.offsetLeft - padL < strip.scrollLeft) strip.scrollLeft = b.offsetLeft - padL;
    else if (b.offsetLeft + b.offsetWidth + padL > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = b.offsetLeft + b.offsetWidth + padL - strip.clientWidth;
  }

  function build() {
    switch (S.phase) {
      case 'loading': return skeleton();
      case 'notfound': return stateView(t('notFound'), t('notFoundSub'));
      case 'gone': return stateView(t('gone'), t('goneSub'));
      case 'bknf': return stateView(t('bkNotFound'), t('bkNotFoundSub'));
      case 'neterr': return stateView(t('offlineT'), t('againSub'), S.retry);
      case 'err': return stateView(t('serverT'), t('againSub'), S.retry);
      case 'pick': return viewBook();
      case 'success': return viewSuccess();
      case 'manage': return viewManage();
    }
    return null;
  }

  function skeleton() {
    var cells = [];
    for (var i = 0; i < 8; i++) cells.push(h('span.sk', { style: null }));
    return h('div', null,
      h('p.bk-sr', { text: t('loading') }),
      h('div.bk-who', { 'aria-hidden': 'true' }, h('span.sk.sk-ava'), h('span.sk.sk-l1')),
      h('div', { 'aria-hidden': 'true' }, h('span.sk.sk-h1'), h('span.sk.sk-l2')),
      h('div.bk-sec', { 'aria-hidden': 'true' }, h('div.sk-row', [0, 1, 2, 3, 4, 5, 6].map(function () { return h('span.sk.sk-day'); }))),
      h('div.bk-sec.sk-grid', { 'aria-hidden': 'true' }, cells)
    );
  }

  function stateView(title, sub, retry) {
    return h('section.bk-state', null,
      h('h1.bk-title', { tabindex: '-1', text: title }),
      sub ? h('p', { text: sub }) : null,
      retry ? h('button.bk-btn', { type: 'button', 'data-k': 'retry', onclick: function () { retry(); }, text: t('retry') }) : null
    );
  }

  function msgText(m) { return m.key === 'moved' ? t('moved', whenVars(m.ms)) : t(m.key); }
  function note(msg, cls) {
    if (!msg) return null;
    return h('div.bk-note' + (cls ? '.' + cls : ''), { role: 'status', tabindex: '-1' },
      h('p', { text: msgText(msg) }),
      msg.retry ? h('button.bk-pill', { type: 'button', 'data-k': 'retry:' + (cls || ''), onclick: function () { msg.retry(); }, text: t('retry') }) : null
    );
  }

  function head(host, title, metaBits) {
    var initial = host ? Array.from(host.trim())[0] : '';
    return h('header.bk-headblock', null,
      host ? h('div.bk-who', null, h('span.bk-ava', { 'aria-hidden': 'true', text: initial ? initial.toUpperCase() : '' }), h('p.bk-host', { text: host })) : null,
      h('h1.bk-title', { tabindex: '-1', text: title || t('meeting') }),
      metaBits && metaBits.length ? h('p.bk-meta', null, metaBits.map(function (x) { return h('span', { text: x }); })) : null
    );
  }

  function placeNode(place, label) {
    if (!place) return null;
    if (URL_RE.test(place)) {
      return h('p.bk-place', null, h('a', { href: place, target: '_blank', rel: 'noopener noreferrer', text: place.replace(/^https?:\/\//i, '').replace(/\/$/, '') }));
    }
    return h('p.bk-place', { text: place || label });
  }

  // Выбор дня и времени — общий для записи и переноса
  function picker(P, hostName, hostTz, cur) {
    var days = groupDays(P.slots), out = [];
    var day = null;
    days.forEach(function (d) { if (d.key === P.day) day = d; });
    if (!day && days.length) day = days[0];
    var prevMon = null;
    var strip = h('div.bk-strip' + (P.busy ? '.bk-busy' : ''), { role: 'group', 'aria-label': t('days'), onkeydown: stripKeys, onscroll: function () { stripState(strip); } },
      days.map(function (d) {
        var mon = fMon(d.first, S.gtz), showMon = mon !== prevMon;
        prevMon = mon;
        var on = day && d.key === day.key;
        return h('button.bk-day', {
          type: 'button', 'aria-pressed': on ? 'true' : 'false', 'aria-label': fLong(d.first, S.gtz), 'data-k': 'd:' + d.key,
          disabled: P.busy || null, onclick: function () { pickDay(P, d.key); }
        }, h('span.wd', { text: fWd(d.first, S.gtz) }), h('span.dn', { text: String(+parts(d.first, S.gtz).day) }), h('span.mo', { text: showMon ? mon : '' }));
      }));
    var nav = h('div.bk-nav', null,
      h('button.bk-arw', { type: 'button', 'aria-label': t('earlier'), title: t('earlier'), 'data-k': 'nav:l', onclick: function () { scrollStrip(-1); } }, '‹'),
      h('button.bk-arw', { type: 'button', 'aria-label': t('later'), title: t('later'), 'data-k': 'nav:r', onclick: function () { scrollStrip(1); } }, '›'));
    out.push(h('section.bk-sec.bk-days', { 'aria-busy': P.busy ? 'true' : 'false' },
      h('div.bk-lblrow', null, h('h2.bk-lbl', { text: t('day') }), nav), strip));
    if (P.msg) out.push(h('div.bk-sec', null, note(P.msg, 'bk-picknote')));
    if (day) {
      var grid = h('div.bk-grid' + (P.busy ? '.bk-busy' : ''), { role: 'group', 'aria-label': t('times') },
        day.list.map(function (ms) {
          var isCur = cur != null && ms === cur;
          var tm = fTime(ms, S.gtz);
          return h('button.bk-slot' + (isCur ? '.bk-cur' : ''), {
            type: 'button', 'aria-pressed': P.slot === ms ? 'true' : 'false', 'data-k': 's:' + ms,
            'aria-label': isCur ? tm + ', ' + t('current') : null, title: isCur ? t('current') : null,
            disabled: (P.busy || isCur) || null, onclick: function () { pickSlot(P, ms); }
          }, tm);
        }));
      var hint = null;
      if (P.slot != null && hostTz && offMin(P.slot, hostTz) !== offMin(P.slot, S.gtz)) {
        var sameDay = dayKey(P.slot, hostTz) === dayKey(P.slot, S.gtz);
        var when = sameDay ? fTime(P.slot, hostTz) : fDay(P.slot, hostTz) + ', ' + fTime(P.slot, hostTz);
        hint = h('p.bk-hint', { text: hostName ? t('hostAt', { host: hostName, when: when }) : t('hostAtAnon', { when: when }) });
      }
      out.push(h('section.bk-sec', null,
        h('h2.bk-h2', { text: fLong(day.first, S.gtz) }), grid,
        h('p.bk-tz', null, t('tz') + ' ', h('span.bk-nw', { text: tzLabel(S.gtz, day.first) })), hint));
    }
    return out;
  }
  function scrollStrip(dir) {
    var s = app.querySelector('.bk-strip');
    if (s) s.scrollBy({ left: dir * Math.max(140, s.clientWidth - 96), behavior: reduced() ? 'auto' : 'smooth' });
  }
  // затухание по краям и стрелки (только для мыши) — когда дни не помещаются
  function stripState(s) {
    var max = s.scrollWidth - s.clientWidth, atL = s.scrollLeft <= 2, atR = s.scrollLeft >= max - 2, sec = s.parentNode;
    s.classList.toggle('fade-l', max > 2 && !atL);
    s.classList.toggle('fade-r', max > 2 && !atR);
    if (sec) {
      sec.classList.toggle('can-scroll', max > 2);
      var l = sec.querySelector('[data-k="nav:l"]'), r = sec.querySelector('[data-k="nav:r"]');
      if (l) l.disabled = atL;
      if (r) r.disabled = atR;
    }
  }
  function stripKeys(ev) {
    if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft' && ev.key !== 'Home' && ev.key !== 'End') return;
    var bs = Array.prototype.slice.call(ev.currentTarget.querySelectorAll('.bk-day')), i = bs.indexOf(document.activeElement);
    if (i < 0) return;
    ev.preventDefault();
    var j = ev.key === 'Home' ? 0 : ev.key === 'End' ? bs.length - 1 : Math.max(0, Math.min(bs.length - 1, i + (ev.key === 'ArrowRight' ? 1 : -1)));
    bs[j].focus();
  }

  function empty() {
    return h('div.bk-empty', { role: 'status' }, h('h2', { text: t('empty') }), h('p', { text: t('emptySub') }));
  }

  function viewBook() {
    var L = S.link, P = S.pick, out = [];
    out.push(head(L.host, L.title, [minLabel(S.dur), L.place].filter(Boolean)));
    if (L.durs.length > 1) {
      out.push(h('section.bk-sec', null, h('h2.bk-lbl', { text: t('dur') }),
        h('div.bk-chips', { role: 'group', 'aria-label': t('dur') }, L.durs.map(function (d) {
          return h('button.bk-chip', {
            type: 'button', 'aria-pressed': d === S.dur ? 'true' : 'false', 'data-k': 'dur:' + d,
            onclick: function () { if (d !== S.dur && !S.sending) loadBook(d); }
          }, minLabel(d));
        }))));
    }
    if (!P.slots.length) {
      if (P.msg) out.push(h('div.bk-sec', null, note(P.msg, 'bk-picknote')));
      out.push(P.busy ? h('p.bk-quiet', { text: t('loading') }) : empty());
      return out;
    }
    out = out.concat(picker(P, L.host, L.tz, null));
    if (P.slot != null) out.push(formView());
    return out;
  }

  function field(id, label, input, err, opt) {
    return h('div.bk-f', null,
      h('label.bk-fl', { for: id }, label, opt ? h('span.bk-opt', { text: ' · ' + opt }) : null),
      input,
      err ? h('span.bk-err', { id: id + '-err', text: t(err) }) : null);
  }
  function formView() {
    var P = S.pick, e = S.errs;
    var sync = function (k) { return function (ev) { S.form[k] = ev.target.value; if (S.errs[k]) { S.errs[k] = null; ev.target.removeAttribute('aria-invalid'); var m = document.getElementById(ev.target.id + '-err'); if (m) m.remove(); } }; };
    var name = h('input.bk-in', {
      id: 'bk-name', name: 'name', type: 'text', autocomplete: 'name', maxlength: '80', required: true, 'data-k': 'f:name',
      'aria-invalid': e.name ? 'true' : null, 'aria-describedby': e.name ? 'bk-name-err' : null, value: S.form.name, oninput: sync('name')
    });
    var contact = h('input.bk-in', {
      id: 'bk-contact', name: 'contact', type: 'text', autocomplete: 'email', inputmode: 'email', maxlength: '120', required: true,
      autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', placeholder: t('contactPh'), 'data-k': 'f:contact',
      'aria-invalid': e.contact ? 'true' : null, 'aria-describedby': e.contact ? 'bk-contact-err' : null, value: S.form.contact, oninput: sync('contact')
    });
    var noteEl = h('textarea.bk-in', { id: 'bk-note', name: 'note', rows: '3', maxlength: '600', placeholder: t('notePh'), 'data-k': 'f:note', oninput: sync('note') });
    noteEl.value = S.form.note;
    var label = S.sending ? t('booking') : t('book', whenVars(P.slot));
    return h('form.bk-form', { novalidate: true, onsubmit: submitBook, 'aria-label': t('details') },
      h('h2.bk-h2', { text: t('details') }),
      field('bk-name', t('name'), name, e.name),
      field('bk-contact', t('contact'), contact, e.contact),
      field('bk-note', t('note'), noteEl, null, t('optional')),
      h('div.bk-hp', { 'aria-hidden': 'true' },
        h('label', { for: 'bk-web', text: 'Leave empty' }),
        h('input', { id: 'bk-web', name: 'web', type: 'text', tabindex: '-1', autocomplete: 'off', value: '' })),
      h('button.bk-btn', { type: 'submit', 'data-k': 'f:submit', disabled: S.sending || null, 'aria-disabled': S.sending ? 'true' : null }, label),
      note(S.formMsg, 'bk-formnote')
    );
  }

  function calBlock(m) {
    return h('section.bk-sec', null,
      h('h2.bk-lbl', { text: t('addCal') }),
      h('div.bk-cal', null,
        h('button.bk-pill', { type: 'button', 'data-k': 'cal:ics', onclick: function () { downloadIcs(m); } }, t('ics')),
        h('a.bk-pill', { href: googleUrl(m), target: '_blank', rel: 'noopener noreferrer', 'data-k': 'cal:g' }, t('gcal'))));
  }
  function saveBlock(url) {
    var code = h('code.bk-url', { text: url });
    var btn = h('button.bk-pill', { type: 'button', 'data-k': 'copy', onclick: function () { copy(url, btn, code); } }, t('copy'));
    return h('section.bk-save', null, h('h2', { text: t('save') }), code, btn);
  }
  function card(m, off, tag, noWhat) {
    var what = noWhat ? '' : [m.title, m.host].filter(Boolean).join(' · ');
    return h('div.bk-card' + (off ? '.is-off' : ''), null,
      tag ? h('span.bk-status', { text: tag }) : null,
      h('p.bk-when', { text: fLong(m.start, S.gtz) }),
      h('p.bk-range', { text: fRange(m.start, m.end, S.gtz) }),
      h('p.bk-tz', null, h('span.bk-nw', { text: tzLabel(S.gtz, m.start) })),
      what ? h('p.bk-what', { text: what }) : null,
      off ? null : placeNode(m.place, m.label));
  }

  function viewSuccess() {
    var d = S.done, hasM = S.route.kind === 'manage';
    var m = { id: d.id || String(d.start), start: d.start, end: d.end, title: d.title, host: d.host, place: d.place, label: d.label, manage: hasM ? manageUrl(S.route.id, S.route.t) : '' };
    return [
      h('div.bk-who', { 'aria-hidden': 'true' }, h('span.bk-ava.bk-check', { text: '✓' })),
      h('h1.bk-title', { tabindex: '-1', text: t('booked') }),
      card(m, false, null),
      calBlock(m),
      hasM ? saveBlock(m.manage) : null
    ];
  }

  function viewManage() {
    var b = S.bk, off = b.status === 'cancelled', future = isFuture(b), out = [];
    var tag = off ? t('cancelledTag') : future ? t('confirmed') : t('pastTag');
    out.push(head(b.host, b.title, [t('yours'), minLabel(b.dur)]));
    var m = { id: S.route.id, start: b.start, end: b.end, title: b.title, host: b.host, place: b.place, label: '', manage: manageUrl(S.route.id, S.route.t) };
    out.push(card(m, off, tag, true));
    if (S.mmsg) out.push(h('div.bk-sec', null, note(S.mmsg, 'bk-mnote')));
    if (off) {
      out.push(h('section.bk-sec', null,
        h('p.bk-h2', { text: b.by === 'owner' ? t('cancelledOwner') : t('cancelled') }),
        b.link ? h('a.bk-btn', { href: '#' + b.link, 'data-k': 'm:another' }, t('another')) : null));
      return out;
    }
    if (!future) { out.push(h('section.bk-sec', null, h('p.bk-h2', { text: t('past') }))); return out; }
    if (S.mmode === 'move' && S.mv) { out = out.concat(moveView(b)); return out; }
    out.push(calBlock(m));
    var acts = h('div.bk-row', null,
      b.link ? h('button.bk-btn.bk-2', { type: 'button', 'data-k': 'm:move', disabled: S.mbusy || null, onclick: startMove }, t('reschedule')) : null,
      S.mmode === 'ask' ? null : h('button.bk-btn.bk-2', { type: 'button', 'data-k': 'm:cancel', disabled: S.mbusy || null, onclick: askCancel }, t('cancel')));
    out.push(h('section.bk-sec', null, acts));
    if (S.mmode === 'ask') {
      out.push(h('div.bk-ask', { role: 'group', 'aria-label': t('cancelAsk') },
        h('p', { text: t('cancelAsk') }),
        h('div.bk-row', null,
          h('button.bk-btn', { type: 'button', 'data-k': 'm:yes', disabled: S.mbusy || null, onclick: doCancel }, S.mbusy === 'cancel' ? t('cancelling') : t('cancelYes')),
          h('button.bk-btn.bk-2', { type: 'button', 'data-k': 'm:no', disabled: S.mbusy || null, onclick: keepIt }, t('cancelNo')))));
    }
    return out;
  }

  function moveView(b) {
    var P = S.mv, out = [];
    out.push(h('div.bk-sec.bk-movewrap', null, h('h2.bk-h2.bk-movehead', { tabindex: '-1', text: t('pickNew') })));
    if (P.loading) { out.push(h('p.bk-quiet', { text: t('loading') })); }
    else if (!P.slots.length) {
      if (P.msg) out.push(note(P.msg, 'bk-picknote'));
      else out.push(empty());
    } else {
      var L = P.link || {};
      out = out.concat(picker(P, L.host || b.host, L.tz || b.tz, b.start));
    }
    out.push(h('div.bk-sec', null,
      P.slot != null ? h('button.bk-btn', { type: 'button', 'data-k': 'm:moveok', disabled: P.sending || null, onclick: doMove }, P.sending ? t('moving') : t('moveTo', whenVars(P.slot))) : null,
      h('button.bk-btn.bk-2', { type: 'button', 'data-k': 'm:back', disabled: P.sending || null, onclick: stopMove }, t('back'))));
    return out;
  }

  /* ---------- язык ---------- */
  function setLang(l, save) {
    S.lang = l === 'ru' ? 'ru' : 'en';
    document.documentElement.lang = S.lang;
    Array.prototype.forEach.call(document.querySelectorAll('.lang button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === S.lang)); });
    var mt = document.getElementById('made-t');
    if (mt) mt.textContent = t('made');
    if (save) { try { localStorage.setItem(LS_LANG, S.lang); } catch (e) { /* приватный режим */ } }
  }
  function initialLang() {
    var s = null;
    try { s = localStorage.getItem(LS_LANG); } catch (e) { s = null; }
    if (s === 'ru' || s === 'en') return s;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return /^ru/i.test(nav) ? 'ru' : 'en';
  }

  /* ---------- старт ---------- */
  S.gtz = guestTz();
  setLang(initialLang(), false);
  Array.prototype.forEach.call(document.querySelectorAll('.lang button'), function (b) {
    b.addEventListener('click', function () {
      if (b.getAttribute('data-l') === S.lang) return;
      setLang(b.getAttribute('data-l'), true); setTitle(); render();
    });
  });
  window.addEventListener('hashchange', function () { window.scrollTo(0, 0); route(); });
  window.addEventListener('resize', function () { var s = app.querySelector('.bk-strip'); if (s) stripState(s); });
  route();
})();
