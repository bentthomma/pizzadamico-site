// ======================================================
// Pizza D'Amico · Apps Script v10
// v9 + TEST_MODE (Pietro nicht im CC) + HTML-Mails via Drive
// 7-Tage-Lead entfernt (nur Datum >= heute)
// ======================================================

var CALENDAR_ID = '5c991f1ed4e86953a8a15fa7d3239daba3f6dfb2e0c625f4874e0b1f147dd0a6@group.calendar.google.com';
var BUFFER_HOURS = 3;
var TIMEZONE = 'Europe/Zurich';
var OWNER_NAME = "Pietro D'Amico";
var OWNER_PHONE = '076 331 32 59';
var OWNER_EMAIL = 'damicopietro69@hotmail.it';
var NOTIFY_BENEDIKT = 'benedikt@thomma.ch';
var RATE_ADULT = 25;
var RATE_CHILD = 12;
var RATE_KM = 1.50;
var DEPOSIT = 250;
var VAT_RATE = 0.081;
var RATE_LIMIT_MAX = 2;
var RATE_LIMIT_HOURS = 24;

// === NEU in v10 ===
// TEST_MODE true = nur Ben bekommt Mails, Pietro NICHT im CC
// Auf false setzen sobald produktiv geht.
var TEST_MODE = true;

// Drive-File-IDs der HTML-Templates
// HOWTO: Upload der HTMLs nach Drive → Rechtsklick → "Link kopieren" →
// aus https://drive.google.com/file/d/XXXXXXXXX/view die XXXXXXXXX hier einfuegen.
// Leer lassen = Fallback auf Plain-Text.
var TEMPLATE_CUSTOMER_ID = '';
var TEMPLATE_OWNER_ID = '';

// TWINT-QR-Code URL fuer Customer-Mail (externes Bild, z.B. Vercel oder jsdelivr CDN).
// Leer lassen = nur Applink-Button wird angezeigt, kein QR.
// Empfohlene URL: https://<dein-vercel-deploy>.vercel.app/src/images/twint-qr-cropped.png
var TWINT_QR_URL = '';

// === Entrypoint ===
function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();
  try {
    if (action === 'check') return checkAvailability(e.parameter.start, e.parameter.end);
    if (action === 'reserve') return reserveSlot(JSON.parse(e.parameter.data || '{}'));
    if (action === 'debug') return debugInfo();
    return json({ error: 'Unknown action' });
  } catch (err) {
    return json({ error: String(err.message || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getCal() {
  var cal = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!cal) throw new Error('Calendar not found');
  return cal;
}

// === Availability ===
function checkAvailability(startISO, endISO) {
  if (!startISO || !endISO) return json({ error: 'start & end required' });
  var start = new Date(startISO);
  var cal = getCal();
  var end = new Date(endISO);
  var confs = collectConflicts(cal, start, end);
  if (confs.length === 0) return json({ available: true });
  return json({
    available: false,
    conflictOn: formatConflict(confs[0]),
    alternativesSameDay: findAlternatives(cal, start, end),
    nextAvailableDays: findNextDays(cal, start, end, 60)
  });
}

function collectConflicts(cal, start, end) {
  var buf = BUFFER_HOURS * 3600 * 1000;
  var rs = new Date(start.getTime() - buf);
  var re = new Date(end.getTime() + buf);
  var timed = cal.getEvents(rs, re);
  var allDay = cal.getEventsForDay(start).filter(function (x) { return x.isAllDayEvent(); });
  return timed.concat(allDay);
}

function isFree(cal, start, end) {
  return collectConflicts(cal, start, end).length === 0;
}

function formatConflict(ev) {
  // Privacy: kein Event-Titel (enthaelt Kundennamen) — nur Zeiten.
  try {
    if (ev.isAllDayEvent()) return 'Bereits belegt (ganztägig)';
    var s = Utilities.formatDate(ev.getStartTime(), TIMEZONE, 'HH:mm');
    var e = Utilities.formatDate(ev.getEndTime(), TIMEZONE, 'HH:mm');
    return 'Bereits belegt (' + s + '–' + e + ')';
  } catch (_) { return 'Bereits belegt'; }
}

function findAlternatives(cal, start, end) {
  var out = [];
  var dur = end.getTime() - start.getTime();
  var shifts = [-6, -4, -2, 2, 4, 6];
  for (var i = 0; i < shifts.length; i++) {
    var alt = new Date(start.getTime() + shifts[i] * 3600 * 1000);
    var altEnd = new Date(alt.getTime() + dur);
    if (alt.getDate() !== start.getDate()) continue;
    if (alt.getHours() < 9 || altEnd.getHours() > 23) continue;
    if (isFree(cal, alt, altEnd)) out.push(Utilities.formatDate(alt, TIMEZONE, 'HH:mm'));
    if (out.length >= 3) break;
  }
  return out;
}

function findNextDays(cal, start, end, lookAhead) {
  var out = [];
  var dur = end.getTime() - start.getTime();
  var ONE = 86400 * 1000;
  for (var i = 1; i <= lookAhead && out.length < 5; i++) {
    var ds = new Date(start.getTime() + i * ONE);
    ds.setHours(start.getHours(), start.getMinutes(), 0, 0);
    var de = new Date(ds.getTime() + dur);
    if (isFree(cal, ds, de)) {
      out.push({ date: Utilities.formatDate(ds, TIMEZONE, 'yyyy-MM-dd'), from: Utilities.formatDate(ds, TIMEZONE, 'HH:mm') });
    }
  }
  return out;
}

// === Rate-Limit ===
function checkRateLimit(data) {
  try {
    var cal = getCal();
    var now = new Date();
    var since = new Date(now.getTime() - RATE_LIMIT_HOURS * 3600 * 1000);
    var until = new Date(now.getTime() + 365 * 86400 * 1000);
    var events = cal.getEvents(since, until);
    var emailLc = (data.email || '').toLowerCase().trim();
    var phoneDigits = (data.phone || '').replace(/\D/g, '');
    if (!emailLc && !phoneDigits) return { blocked: false, count: 0 };
    var matches = 0;
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var created = ev.getDateCreated();
      if (created < since) continue;
      var desc = String(ev.getDescription() || '').toLowerCase();
      var hitEmail = emailLc && desc.indexOf(emailLc) !== -1;
      var hitPhone = phoneDigits && phoneDigits.length >= 8 && desc.replace(/\D/g, '').indexOf(phoneDigits) !== -1;
      if (hitEmail || hitPhone) matches++;
      if (matches >= RATE_LIMIT_MAX) return { blocked: true, count: matches };
    }
    return { blocked: false, count: matches };
  } catch (err) {
    console.error('rate limit check failed (permissive):', err);
    return { blocked: false, count: 0 };
  }
}

// === Reservation ===
function reserveSlot(data) {
  var start = new Date(data.startISO);

  var rateCheck = checkRateLimit(data);
  if (rateCheck.blocked) {
    return json({
      success: false,
      error: 'Zu viele Anfragen in den letzten 24 Stunden. Bitte kontaktiere uns direkt: ' + OWNER_PHONE,
      rateLimitCount: rateCheck.count
    });
  }

  var cal = getCal();
  var end = new Date(data.endISO);
  if (!isFree(cal, start, end)) return json({ success: false, error: 'Slot nicht mehr frei' });

  var reference = 'REF-' + Utilities.formatDate(new Date(), TIMEZONE, 'yyyyMMdd') + '-' + Math.floor(Math.random() * 1000);
  var title = 'Evento - ' + (data.name || 'Anfrage') + ' (' + (data.adults || 0) + '+' + (data.children || 0) + ')';
  var description = buildDescription(data, reference);
  var event = cal.createEvent(title, start, end, { description: description });

  try { if (data.email) sendCustomerMail(data, reference); } catch (err) { console.error('customer mail:', err); }
  try { sendOwnerMail(data, reference, event.getId()); } catch (err) { console.error('owner mail:', err); }

  return json({ success: true, eventId: event.getId(), reference: reference });
}

// === Pricing ===
function calcBreakdown(d) {
  var adults = d.adults || 0;
  var children = d.children || 0;
  var km = typeof d.distanceKm === 'number' ? d.distanceKm : 0;
  var adultsTotal = adults * RATE_ADULT;
  var childrenTotal = children * RATE_CHILD;
  var travelTotal = km * 2 * RATE_KM;
  var netto = DEPOSIT + adultsTotal + childrenTotal + travelTotal;
  var vat = Math.round(netto * VAT_RATE * 100) / 100;
  var total = Math.round((netto + vat) * 100) / 100;
  return {
    deposit: DEPOSIT, adults: adults, adultsTotal: adultsTotal,
    children: children, childrenTotal: childrenTotal,
    km: km, travelTotal: travelTotal,
    netto: netto, vat: vat, total: total,
    restbetrag: Math.round((total - DEPOSIT) * 100) / 100
  };
}

// === Plain-Text Description fuer Kalender-Event (unchanged) ===
function buildDescription(d, reference) {
  var s = d.setup || {};
  var b = calcBreakdown(d);
  var z = (d.toppings || []).join(', ') || '-';
  var lines = [];
  lines.push('CATERING  ' + reference);
  lines.push('');
  lines.push('ANZAHLUNG CHF 250.-');
  lines.push('  [ ] erhalten     [ ] offen');
  lines.push('  (hier editieren nach TWINT)');
  lines.push('');
  lines.push('KONTAKT');
  lines.push('  ' + (d.name || '-'));
  lines.push('  ' + (d.email || '-'));
  lines.push('  ' + (d.phone || '-'));
  lines.push('');
  lines.push('EVENT');
  lines.push('  Anlass:  ' + cap(d.eventType || '-'));
  lines.push('  Termin:  ' + formatDeDateTime(d.startISO, d.durationHours));
  lines.push('  Ort:     ' + (d.address || '-'));
  if (d.distanceKm != null) lines.push('           ' + d.distanceKm + ' km');
  lines.push('  Gaeste:  ' + (d.adults || 0) + ' Erw + ' + (d.children || 0) + ' Kinder');
  if (d.vegetarian) lines.push('           ' + d.vegetarian + ' davon vegetarisch');
  lines.push('');
  lines.push('ZUTATEN');
  lines.push('  ' + z);
  lines.push('');
  lines.push('SETUP');
  lines.push('  Strom:   ' + (s.power || '-'));
  lines.push('  Platz:   ' + (s.space || '-'));
  lines.push('  Dach:    ' + (s.shelter || '-'));
  lines.push('');
  lines.push('KOSTEN-AUFSCHLUESSELUNG');
  lines.push(padRight('  Reservation & Organisation', 32) + '  CHF ' + formatChf(b.deposit));
  lines.push(padRight('  ' + b.adults + ' Erwachsene x CHF 25.-', 32) + '  CHF ' + formatChf(b.adultsTotal));
  if (b.children > 0) {
    lines.push(padRight('  ' + b.children + ' Kinder x CHF 12.-', 32) + '  CHF ' + formatChf(b.childrenTotal));
  }
  lines.push(padRight('  ' + b.km + ' km x 2 x CHF 1.50', 32) + '  CHF ' + formatChf(b.travelTotal));
  lines.push('  ' + repeat('-', 40));
  lines.push(padRight('  Netto', 32) + '  CHF ' + formatChf(b.netto));
  lines.push(padRight('  + 8.1 % MwSt', 32) + '  CHF ' + formatChf(b.vat));
  lines.push('  ' + repeat('=', 40));
  lines.push(padRight('  TOTAL', 32) + '  CHF ' + formatChf(b.total));
  lines.push('');
  lines.push(padRight('  Davon Anzahlung TWINT', 32) + '  CHF ' + formatChf(b.deposit));
  lines.push(padRight('  Restbetrag bei Event', 32) + '  CHF ' + formatChf(b.restbetrag));
  if (d.note) {
    lines.push('');
    lines.push('NOTIZ VOM KUNDEN');
    lines.push('  ' + d.note);
  }
  lines.push('');
  lines.push('via pizzadamico.ch');
  return lines.join('\n');
}

// === HTML-Template-Rendering ===
function renderTemplate(templateId, vars) {
  var tmpl = DriveApp.getFileById(templateId).getBlob().getDataAsString();
  for (var key in vars) {
    var pattern = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
    var val = vars[key];
    tmpl = tmpl.replace(pattern, val == null ? '' : String(val));
  }
  return tmpl;
}

function htmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBreakdownRowsHtml(b) {
  var rows = '';
  rows += rowHtml('Reservation & Organisation', 'CHF ' + formatChf(b.deposit));
  rows += rowHtml(b.adults + ' Erwachsene x CHF ' + RATE_ADULT + '.-', 'CHF ' + formatChf(b.adultsTotal));
  if (b.children > 0) {
    rows += rowHtml(b.children + ' Kinder x CHF ' + RATE_CHILD + '.-', 'CHF ' + formatChf(b.childrenTotal));
  }
  rows += rowHtml(b.km + ' km hin & zurueck x CHF ' + RATE_KM.toFixed(2), 'CHF ' + formatChf(b.travelTotal));
  return rows;
}

function rowHtml(label, amount) {
  return '<tr>' +
    '<td style="padding:4px 0; color:rgba(20,16,12,0.7); vertical-align:top;">' + htmlEscape(label) + '</td>' +
    '<td style="padding:4px 0; text-align:right; color:#14100C; font-variant-numeric:tabular-nums;">' + htmlEscape(amount) + '</td>' +
    '</tr>';
}

function buildMailVars(d, reference) {
  var b = calcBreakdown(d);
  var s = d.setup || {};
  var kmSuffix = d.distanceKm != null ? ' (' + d.distanceKm + ' km)' : '';
  var childrenSuffix = (d.children || 0) > 0 ? ', ' + d.children + ' Kinder' : '';
  var vegSuffix = d.vegetarian ? ' \u2014 ' + d.vegetarian + ' vegetarisch' : '';
  var toppingsStr = (d.toppings || []).map(cap).join(', ') || '-';
  var toppingsRow = '';
  if (d.toppings && d.toppings.length) {
    toppingsRow = '<tr>' +
      '<td style="padding:6px 0; color:rgba(20,16,12,0.6); vertical-align:top; width:110px;">Zutaten</td>' +
      '<td style="padding:6px 0; color:#14100C;">' + htmlEscape(toppingsStr) + '</td></tr>';
  }
  var noteBlock = '';
  if (d.note) {
    noteBlock = '<tr><td style="padding:20px 32px 0 32px;">' +
      '<div style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#C9A66B; font-weight:600; margin-bottom:10px;">Notiz vom Kunden</div>' +
      '<p style="margin:0; font-size:14px; line-height:1.55; color:#14100C; padding:14px 16px; background:rgba(20,16,12,0.04); border-radius:4px;">' + htmlEscape(d.note) + '</p>' +
      '</td></tr>';
  }
  var twintQrBlock = '';
  if (TWINT_QR_URL) {
    twintQrBlock = '<div style="text-align:center; margin:8px 0 4px 0;">' +
      '<img src="' + TWINT_QR_URL + '" alt="TWINT QR-Code" width="200" height="200" style="width:200px; height:auto; background:#ffffff; padding:14px; border-radius:8px;" />' +
      '</div>';
  }
  return {
    reference: reference,
    name: htmlEscape(d.name || '-'),
    email: htmlEscape(d.email || '-'),
    phone: htmlEscape(d.phone || '-'),
    phoneClean: (d.phone || '').replace(/\D/g, ''),
    eventType: htmlEscape(cap(d.eventType || '-')),
    eventDateHuman: htmlEscape(formatDeDateTime(d.startISO, d.durationHours)),
    address: htmlEscape(d.address || '-'),
    kmSuffix: htmlEscape(kmSuffix),
    adults: String(d.adults || 0),
    children: String(d.children || 0),
    childrenSuffix: htmlEscape(childrenSuffix),
    vegSuffix: htmlEscape(vegSuffix),
    toppings: htmlEscape(toppingsStr),
    toppingsRow: toppingsRow,
    setupPower: htmlEscape(s.power || '-'),
    setupSpace: htmlEscape(s.space || '-'),
    setupShelter: htmlEscape(s.shelter || '-'),
    breakdownRows: buildBreakdownRowsHtml(b),
    netto: formatChf(b.netto),
    vat: formatChf(b.vat),
    total: formatChf(b.total),
    deposit: formatChf(b.deposit),
    rest: formatChf(b.restbetrag),
    ownerName: OWNER_NAME,
    ownerPhone: OWNER_PHONE,
    ownerEmail: OWNER_EMAIL,
    noteBlock: noteBlock,
    twintQrBlock: twintQrBlock
  };
}

// === Mails ===
function sendCustomerMail(d, reference) {
  var b = calcBreakdown(d);
  var textBody = customerText(d, reference, b);
  var htmlBody = null;
  if (TEMPLATE_CUSTOMER_ID) {
    try {
      var vars = buildMailVars(d, reference);
      htmlBody = renderTemplate(TEMPLATE_CUSTOMER_ID, vars);
    } catch (err) { console.error('customer template:', err); }
  }

  var opts = {
    to: d.email,
    cc: NOTIFY_BENEDIKT,
    subject: 'Ihre Catering-Anfrage bei Pizza DAmico - ' + reference,
    body: textBody,
    name: "Pizza D'Amico",
    replyTo: OWNER_EMAIL
  };
  if (htmlBody) opts.htmlBody = htmlBody;
  MailApp.sendEmail(opts);
}

function sendOwnerMail(d, reference, eventId) {
  var textBody = ownerText(d, reference, eventId);
  var htmlBody = null;
  if (TEMPLATE_OWNER_ID) {
    try {
      var vars = buildMailVars(d, reference);
      htmlBody = renderTemplate(TEMPLATE_OWNER_ID, vars);
    } catch (err) { console.error('owner template:', err); }
  }

  var opts = {
    to: NOTIFY_BENEDIKT,
    subject: 'Neue Anfrage ' + reference + ' - ' + (d.name || ''),
    body: textBody,
    name: "Pizza D'Amico Bot"
  };
  // Pietro nur wenn nicht TEST_MODE
  if (!TEST_MODE) opts.cc = OWNER_EMAIL;
  if (htmlBody) opts.htmlBody = htmlBody;
  MailApp.sendEmail(opts);
}

function customerText(d, reference, b) {
  var lines = [];
  lines.push('========================================');
  lines.push("  PIZZA D'AMICO - CATERING");
  lines.push('========================================');
  lines.push('');
  lines.push('  Grazie!');
  lines.push('  Ihre Catering-Anfrage ist eingegangen.');
  lines.push('  Pietro meldet sich persoenlich');
  lines.push('  zur Bestaetigung.');
  lines.push('');
  lines.push('----------------------------------------');
  lines.push('  Referenz: ' + reference);
  lines.push('----------------------------------------');
  lines.push('');
  lines.push('IHR EVENT');
  lines.push('  Anlass:  ' + cap(d.eventType || '-'));
  lines.push('  Termin:  ' + formatDeDateTime(d.startISO, d.durationHours));
  lines.push('  Ort:     ' + (d.address || '-') + (d.distanceKm != null ? ' (' + d.distanceKm + ' km)' : ''));
  lines.push('  Gaeste:  ' + (d.adults || 0) + ' Erwachsene');
  lines.push('           ' + (d.children || 0) + ' Kinder');
  if (d.vegetarian) lines.push('           ' + d.vegetarian + ' davon vegetarisch');
  if (d.toppings && d.toppings.length) {
    lines.push('  Zutaten: ' + d.toppings.map(cap).join(', '));
  }
  lines.push('');
  lines.push('KOSTEN-AUFSCHLUESSELUNG');
  lines.push('');
  lines.push(padRight('  Reservation & Organisation', 32) + '  CHF ' + formatChf(b.deposit));
  lines.push(padRight('  ' + b.adults + ' Erwachsene x CHF 25.-', 32) + '  CHF ' + formatChf(b.adultsTotal));
  if (b.children > 0) {
    lines.push(padRight('  ' + b.children + ' Kinder x CHF 12.-', 32) + '  CHF ' + formatChf(b.childrenTotal));
  }
  lines.push(padRight('  ' + b.km + ' km hin & zurueck x 1.50', 32) + '  CHF ' + formatChf(b.travelTotal));
  lines.push('  ' + repeat('-', 40));
  lines.push(padRight('  Netto', 32) + '  CHF ' + formatChf(b.netto));
  lines.push(padRight('  + 8.1 % MwSt', 32) + '  CHF ' + formatChf(b.vat));
  lines.push('  ' + repeat('=', 40));
  lines.push(padRight('  TOTAL', 32) + '  CHF ' + formatChf(b.total));
  lines.push('');
  lines.push(padRight('  Anzahlung per TWINT', 32) + '  CHF ' + formatChf(b.deposit));
  lines.push(padRight('  Restbetrag bei Event', 32) + '  CHF ' + formatChf(b.restbetrag));
  lines.push('');
  lines.push('----------------------------------------');
  lines.push('NAECHSTER SCHRITT');
  lines.push('----------------------------------------');
  lines.push('');
  lines.push('  Damit Pietro Ihren Termin definitiv');
  lines.push('  blockiert, senden Sie bitte die');
  lines.push('  Anzahlung von CHF 250.- per TWINT an:');
  lines.push('');
  lines.push('    ' + OWNER_PHONE);
  lines.push('    ' + OWNER_NAME);
  lines.push('');
  lines.push('  Sobald die Zahlung eingegangen ist,');
  lines.push('  erhalten Sie die finale Bestaetigung.');
  lines.push('');
  lines.push('----------------------------------------');
  lines.push('KONTAKT');
  lines.push('----------------------------------------');
  lines.push('');
  lines.push('  Telefon: ' + OWNER_PHONE);
  lines.push('  E-Mail:  ' + OWNER_EMAIL);
  lines.push('  Adresse: Schlossstrasse 15');
  lines.push('           3110 Muensingen');
  lines.push('');
  lines.push('========================================');
  lines.push("       Pizza D'Amico - Grazie Mille");
  lines.push('========================================');
  return lines.join('\n');
}

function ownerText(d, reference, eventId) {
  var s = d.setup || {};
  var b = calcBreakdown(d);
  var lines = [];
  lines.push('========================================');
  lines.push('  NEUE CATERING-ANFRAGE');
  lines.push('========================================');
  lines.push('');
  lines.push('Referenz: ' + reference);
  lines.push('Event-ID: ' + eventId);
  lines.push('');
  lines.push('ANZAHLUNG CHF 250.-');
  lines.push('  [ ] erhalten     [ ] offen');
  lines.push('  (im Kalender-Event editieren)');
  lines.push('');
  lines.push('KONTAKT');
  lines.push('  Name:     ' + (d.name || '-'));
  lines.push('  E-Mail:   ' + (d.email || '-'));
  lines.push('  Telefon:  ' + (d.phone || '-'));
  lines.push('');
  lines.push('EVENT');
  lines.push('  Anlass:   ' + cap(d.eventType || '-'));
  lines.push('  Termin:   ' + formatDeDateTime(d.startISO, d.durationHours));
  lines.push('  Ort:      ' + (d.address || '-') + (d.distanceKm != null ? ' (' + d.distanceKm + ' km)' : ''));
  lines.push('  Gaeste:   ' + (d.adults || 0) + ' Erw + ' + (d.children || 0) + ' Kinder' + (d.vegetarian ? ' (' + d.vegetarian + ' vegi)' : ''));
  lines.push('  Zutaten:  ' + ((d.toppings || []).join(', ') || '-'));
  lines.push('');
  lines.push('SETUP');
  lines.push('  Strom:    ' + (s.power || '-'));
  lines.push('  Platz:    ' + (s.space || '-'));
  lines.push('  Dach:     ' + (s.shelter || '-'));
  lines.push('');
  lines.push('KOSTEN');
  lines.push(padRight('  Reservation', 24) + '  CHF ' + formatChf(b.deposit));
  lines.push(padRight('  ' + b.adults + ' Erw x 25', 24) + '  CHF ' + formatChf(b.adultsTotal));
  if (b.children > 0) {
    lines.push(padRight('  ' + b.children + ' Kind x 12', 24) + '  CHF ' + formatChf(b.childrenTotal));
  }
  lines.push(padRight('  ' + b.km + ' km x 2 x 1.50', 24) + '  CHF ' + formatChf(b.travelTotal));
  lines.push('  ' + repeat('-', 32));
  lines.push(padRight('  Netto', 24) + '  CHF ' + formatChf(b.netto));
  lines.push(padRight('  MwSt 8.1%', 24) + '  CHF ' + formatChf(b.vat));
  lines.push(padRight('  TOTAL', 24) + '  CHF ' + formatChf(b.total));
  if (d.note) {
    lines.push('');
    lines.push('NOTIZ VOM KUNDEN');
    lines.push('  ' + d.note);
  }
  return lines.join('\n');
}

// === Helpers ===
function padRight(s, len) {
  s = String(s);
  while (s.length < len) s += ' ';
  return s;
}

function repeat(char, n) {
  var out = '';
  for (var i = 0; i < n; i++) out += char;
  return out;
}

function formatDeDateTime(iso, dur) {
  if (!iso) return '-';
  try {
    var d = new Date(iso);
    var wds = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    var ms = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    var time = Utilities.formatDate(d, TIMEZONE, 'HH:mm');
    var line = wds[d.getDay()] + ', ' + d.getDate() + '. ' + ms[d.getMonth()] + ' ' + d.getFullYear() + ' - ' + time + ' Uhr';
    if (dur) line += ' (' + dur + ' h)';
    return line;
  } catch (_) { return String(iso); }
}

function formatChf(n) {
  if (n == null || isNaN(n)) return '-';
  return Number(n).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cap(s) {
  if (!s || typeof s !== 'string') return String(s || '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function debugInfo() {
  var cal = getCal();
  var now = new Date();
  var fut = new Date(now.getTime() + 60 * 86400 * 1000);
  var events = cal.getEvents(now, fut);
  return json({
    version: 'v12-conflict-privacy',
    testMode: TEST_MODE,
    templateCustomerSet: !!TEMPLATE_CUSTOMER_ID,
    templateOwnerSet: !!TEMPLATE_OWNER_ID,
    twintQrUrlSet: !!TWINT_QR_URL,
    calendarInUse: { id: cal.getId(), name: cal.getName() },
    totalEventsNext60Days: events.length,
    rateLimit: RATE_LIMIT_MAX + '/' + RATE_LIMIT_HOURS + 'h'
  });
}
