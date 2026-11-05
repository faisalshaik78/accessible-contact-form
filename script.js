'use strict';

const form = document.getElementById('contactForm');
const errSummary = document.getElementById('errSummary');
const success = document.getElementById('success');
const $ = id => document.getElementById(id);

/* ---------- Error messages per field ---------- */
function getError(el) {
  const v = el.validity;
  switch (el.name) {
    case 'name':
      if (v.valueMissing || !el.value.trim()) return 'Please enter your name.';
      if (v.tooShort) return 'Name must be at least 2 characters.';
      if (!/^[\p{L}][\p{L} .'-]*$/u.test(el.value.trim())) return 'Use letters only (spaces, . and - allowed).';
      return '';
    case 'email':
      if (v.valueMissing) return 'Please enter your email address.';
      if (v.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value)) return 'Enter a valid email, like name@example.com.';
      return '';
    case 'phone':
      if (el.value && v.patternMismatch) return 'Enter a valid 10-digit mobile number starting with 6–9.';
      return '';
    case 'subject':
      return v.valueMissing ? 'Please choose a subject.' : '';
    case 'message': {
      const len = el.value.trim().length;
      if (!len) return 'Please write a message.';
      if (len < 10) return `Add ${10 - len} more character${10 - len === 1 ? '' : 's'} (minimum 10).`;
      return '';
    }
    case 'consent':
      return el.checked ? '' : 'You need to agree before sending.';
    default:
      return '';
  }
}

/* ---------- Show / clear state ---------- */
function setState(el, msg, wrapper) {
  const box = wrapper || el.closest('.field');
  const out = $(el.id + '-err');
  box.classList.toggle('invalid', !!msg);
  box.classList.toggle('valid', !msg && el.value && el.type !== 'checkbox');
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (out) out.textContent = msg;
}
function checkField(el) {
  const msg = getError(el);
  setState(el, msg);
  return !msg;
}
function checkMethod() {
  const picked = form.querySelector('input[name="method"]:checked');
  const msg = picked ? '' : 'Please pick a contact method.';
  $('methodGroup').classList.toggle('invalid', !!msg);
  $('method-err').textContent = msg;
  return !msg;
}

/* ---------- Live validation (after a field has been touched) ---------- */
const fields = ['name', 'email', 'phone', 'subject', 'message', 'consent'].map($);
fields.forEach(el => {
  el.addEventListener('blur', () => { el.dataset.touched = '1'; checkField(el); });
  const evt = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
  el.addEventListener(evt, () => { if (el.dataset.touched || el.closest('.field').classList.contains('invalid')) checkField(el); });
});
form.querySelectorAll('input[name="method"]').forEach(r => r.addEventListener('change', checkMethod));

/* ---------- Input handling ---------- */
$('phone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });

const message = $('message'), count = $('message-count');
function updateCount() {
  const n = message.value.length;
  count.textContent = `${n} / ${message.maxLength}`;
  count.classList.toggle('warn', n >= message.maxLength - 20);
}
message.addEventListener('input', updateCount);

/* ---------- Submit ---------- */
form.addEventListener('submit', e => {
  e.preventDefault();
  const results = fields.map(el => ({ el, ok: checkField(el) }));
  const methodOk = checkMethod();
  const bad = results.filter(r => !r.ok).map(r => r.el);
  const firstBad = bad[0] || (!methodOk ? form.querySelector('input[name="method"]') : null);

  if (firstBad) {
    const n = bad.length + (methodOk ? 0 : 1);
    errSummary.textContent = `Please fix ${n} field${n > 1 ? 's' : ''} below and try again.`;
    errSummary.hidden = false;
    firstBad.focus();
    return;
  }
  errSummary.hidden = true;
  showSuccess(new FormData(form));
});

function showSuccess(data) {
  $('sName').textContent = data.get('name').trim();
  const rows = [
    ['Name', data.get('name').trim()],
    ['Email', data.get('email')],
    ['Phone', data.get('phone') || 'Not provided'],
    ['Subject', data.get('subject')],
    ['Contact via', data.get('method')],
    ['Interests', data.getAll('interest').join(', ') || 'None selected'],
    ['Message', data.get('message').trim()]
  ];
  const list = $('sList');
  list.textContent = '';
  rows.forEach(([k, v]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    row.append(dt, dd); list.append(row);
  });
  form.hidden = true;
  success.hidden = false;
  success.focus();
}

/* ---------- Reset / send another ---------- */
function clearState() {
  form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid', 'valid'));
  form.querySelectorAll('.err').forEach(s => s.textContent = '');
  form.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
  fields.forEach(f => delete f.dataset.touched);
  errSummary.hidden = true;
  setTimeout(updateCount, 0);
}
$('resetBtn').addEventListener('click', clearState);
$('again').addEventListener('click', () => {
  form.reset(); clearState();
  success.hidden = true; form.hidden = false;
  $('name').focus();
});
updateCount();
