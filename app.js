(() => {
  'use strict';

  const C = window.INVITE;
  const $ = (s) => document.querySelector(s);
  const TZ = 'Europe/Istanbul';
  const STORE_KEY = 'can-davetiye-yanit';

  const start = new Date(C.start);
  const end = new Date(C.end);
  const location = `${C.venue}, ${C.address}`;
  const mapsUrl = C.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(location);

  /* ---------- Metinler ---------- */
  const dateStr = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', timeZone: TZ }).format(start);
  const timeFmt = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ });
  const timeStr = `${timeFmt.format(start)}–${timeFmt.format(end)}`;

  document.title = `${C.childName} 2 Yaşında! · Doğum Günü Davetiyesi`;
  $('#title').textContent = C.title;
  $('#message').textContent = C.message;
  $('#eventnote').textContent = `${dateStr} · ${timeStr} · ${C.venue}, ${C.district}`;

  /* ---------- Takvim bağlantıları ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const utc = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const programLines = (C.program || []).map((p) => `${p.icon} ${p.text}`);
  const programList = $('#program');
  (C.program || []).forEach((p) => {
    const li = document.createElement('li');
    const ico = document.createElement('span');
    ico.className = 'ico';
    ico.setAttribute('aria-hidden', 'true');
    ico.textContent = p.icon;
    li.append(ico, p.text);
    programList.appendChild(li);
  });

  const description = [C.eventNote, '', 'Programımız:', ...programLines, '', `Yer: ${location}`, `Harita: ${mapsUrl}`, C.contact || ''].join('\n').trim();

  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(C.eventTitle)}` +
    `&dates=${utc(start)}/${utc(end)}` +
    `&details=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(location)}` +
    `&ctz=${encodeURIComponent(TZ)}`;

  const outlookUrl =
    'https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent' +
    `&subject=${encodeURIComponent(C.eventTitle)}` +
    `&startdt=${encodeURIComponent(start.toISOString())}` +
    `&enddt=${encodeURIComponent(end.toISOString())}` +
    `&body=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(location)}`;

  const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const fold = (line) => (line.match(/.{1,60}/gu) || ['']).join('\r\n ');

  function buildIcs() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dogum Gunu Davetiyesi//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${utc(start)}-dogum-gunu@davetiye`,
      `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(start)}`,
      `DTEND:${utc(end)}`,
      `SUMMARY:${icsEscape(C.eventTitle)}`,
      `LOCATION:${icsEscape(location)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      `URL:${mapsUrl}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape('Yarın: ' + C.eventTitle)}`, 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape('2 saat sonra: ' + C.eventTitle)}`, 'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  function downloadIcs() {
    const blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'can-dogum-gunu.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  $('#calGoogle').href = googleUrl;
  $('#calOutlook').href = outlookUrl;
  $('#mapBtn').href = mapsUrl;
  $('#calIcs').addEventListener('click', downloadIcs);

  /* ---------- Form ---------- */
  const form = $('#rsvp');
  const err = $('#err');
  const submitBtn = $('#submitBtn');
  const counts = $('#counts');
  const values = { adults: 1, kids: 0 };

  const setCount = (field, n) => {
    values[field] = Math.max(field === 'adults' ? 1 : 0, Math.min(10, n));
    document.querySelector(`.stepper[data-field="${field}"] output`).textContent = values[field];
  };

  document.querySelectorAll('.stepper').forEach((el) => {
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-d]');
      if (b) setCount(el.dataset.field, values[el.dataset.field] + Number(b.dataset.d));
    });
  });

  form.addEventListener('change', () => {
    const status = form.status.value;
    counts.hidden = !status || status === 'Gelmiyor';
    err.textContent = '';
  });

  const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } };
  const save = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch { /* özel pencere vb. */ } };

  async function send(payload) {
    if (!C.scriptUrl) {
      console.info('[Demo modu] scriptUrl boş, yanıt gönderilmedi:', payload);
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await fetch(C.scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams(payload)
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website.value) return; // bot tuzağı

    const name = form.name.value.trim();
    const status = form.status.value;
    if (name.length < 2) { err.textContent = 'Lütfen adınızı ve soyadınızı yazın.'; form.name.focus(); return; }
    if (!status) { err.textContent = 'Lütfen katılım durumunuzu seçin.'; return; }

    const going = status !== 'Gelmiyor';
    const payload = {
      name,
      status,
      adults: going ? values.adults : 0,
      kids: going ? values.kids : 0,
      note: form.note.value.trim(),
      update: load() ? '1' : ''
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor…';
    try {
      await send(payload);
    } catch {
      err.textContent = 'Gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Yanıtı Gönder';
      return;
    }
    save(payload);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Yanıtı Gönder';
    showThanks(payload);
  });

  /* ---------- Görünümler ---------- */
  function showThanks(d) {
    const copy = {
      Geliyor: ['Harika, sizi bekliyoruz! 🎉', `Yanıtınız kaydedildi, ${d.name}. Etkinliği takviminize ekleyin; yer ve konum bilgisi etkinliğin içinde yer alıyor.`],
      Belki: ['Teşekkürler! 🤞', `Yanıtınız kaydedildi, ${d.name}. Kararınız netleşince yanıtınızı güncelleyebilirsiniz. Şimdilik takviminize ekleyebilirsiniz.`],
      Gelmiyor: ['Haberiniz için teşekkürler 💙', `Sizi aramızda göremeyeceğiz ama bildirdiğiniz için teşekkür ederiz, ${d.name}.`]
    }[d.status];
    $('#thanksTitle').textContent = copy[0];
    $('#thanksText').textContent = copy[1];
    $('#calBox').hidden = d.status === 'Gelmiyor';
    $('#view-form').hidden = true;
    $('#view-thanks').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showForm(prefill) {
    if (prefill) {
      form.name.value = prefill.name || '';
      form.note.value = prefill.note || '';
      const r = form.querySelector(`input[name=status][value="${prefill.status}"]`);
      if (r) r.checked = true;
      setCount('adults', Number(prefill.adults) || 1);
      setCount('kids', Number(prefill.kids) || 0);
      counts.hidden = !prefill.status || prefill.status === 'Gelmiyor';
    }
    $('#view-thanks').hidden = true;
    $('#view-form').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('#editBtn').addEventListener('click', () => showForm(load()));

  const saved = load();
  if (saved) { showForm(saved); showThanks(saved); }
})();
