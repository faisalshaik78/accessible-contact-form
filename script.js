'use strict';

const form = document.getElementById('contactForm');
const errSummary = document.getElementById('errSummary');
const success = document.getElementById('success');
const $ = id => document.getElementById(id);

/* ---------- Validation messages ---------- */
function getError(el) {
  const validity = el.validity;

  switch (el.name) {
    case 'name':
      if (validity.valueMissing || !el.value.trim()) return 'Please enter your name.';
      if (validity.tooShort) return 'Name must be at least 2 characters.';
      if (!/^[\p{L}][\p{L} .'-]*$/u.test(el.value.trim())) {
        return 'Use letters only (spaces, periods, apostrophes, and hyphens are allowed).';
      }
      return '';
    case 'email':
      if (validity.valueMissing) return 'Please enter your email address.';
      if (validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value)) {
        return 'Enter a valid email address, like name@example.com.';
      }
      return '';
    case 'phone':
      return el.value && validity.patternMismatch
        ? 'Enter a valid 10-digit mobile number starting with 6–9.'
        : '';
    case 'subject':
      return validity.valueMissing ? 'Please choose a subject.' : '';
    case 'message': {
      const length = el.value.trim().length;
      if (!length) return 'Please write a message.';
      if (length < 10) {
        const remaining = 10 - length;
        return `Add ${remaining} more character${remaining === 1 ? '' : 's'} (minimum 10).`;
      }
      return '';
    }
    case 'consent':
      return el.checked ? '' : 'Please agree before sending your enquiry.';
    default:
      return '';
  }
}

/* ---------- Field state ---------- */
function setState(el, message, wrapper) {
  const field = wrapper || el.closest('.field');
  const error = $(el.id + '-err');

  if (field) {
    field.classList.toggle('invalid', Boolean(message));
    field.classList.toggle('valid', !message && Boolean(el.value) && el.type !== 'checkbox');
  }

  el.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (error) error.textContent = message;
}

function checkField(el) {
  const message = getError(el);
  setState(el, message);
  return !message;
}

function checkMethod() {
  const radios = [...form.querySelectorAll('input[name="method"]')];
  const selected = radios.find(radio => radio.checked);
  const message = selected ? '' : 'Please choose a preferred contact method.';

  $('methodGroup').classList.toggle('invalid', Boolean(message));
  $('method-err').textContent = message;
  radios.forEach(radio => radio.setAttribute('aria-invalid', message ? 'true' : 'false'));
  return !message;
}

/* ---------- Live validation after interaction ---------- */
const fields = ['name', 'email', 'phone', 'subject', 'message', 'consent'].map($);

fields.forEach(field => {
  field.addEventListener('blur', () => {
    field.dataset.touched = 'true';
    checkField(field);
  });

  const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
  field.addEventListener(eventName, () => {
    if (field.dataset.touched || field.closest('.field').classList.contains('invalid')) {
      checkField(field);
    }
  });
});

form.querySelectorAll('input[name="method"]').forEach(radio => {
  radio.addEventListener('change', checkMethod);
});

/* ---------- Input helpers ---------- */
$('phone').addEventListener('input', event => {
  const cleaned = event.target.value.replace(/\D/g, '').slice(0, 10);
  if (event.target.value !== cleaned) event.target.value = cleaned;
});

const message = $('message');
const count = $('message-count');

function updateCount() {
  const length = message.value.length;
  count.textContent = `${length} / ${message.maxLength}`;
  count.classList.toggle('warn', length >= message.maxLength - 20);
}

message.addEventListener('input', updateCount);

/* ---------- Submission ---------- */
form.addEventListener('submit', event => {
  event.preventDefault();

  const results = fields.map(field => ({ field, valid: checkField(field) }));
  const methodValid = checkMethod();
  const invalidFields = results.filter(result => !result.valid).map(result => result.field);
  const firstInvalid = invalidFields[0] || (!methodValid ? form.querySelector('input[name="method"]') : null);

  if (firstInvalid) {
    const invalidCount = invalidFields.length + (methodValid ? 0 : 1);
    errSummary.textContent = `Please correct ${invalidCount} field${invalidCount === 1 ? '' : 's'} and try again.`;
    errSummary.hidden = false;
    firstInvalid.focus();
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
  list.replaceChildren();

  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');

    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    list.append(row);
  });

  form.hidden = true;
  success.hidden = false;
  success.focus();
}

/* ---------- Reset and submit another message ---------- */
function clearState() {
  form.querySelectorAll('.field').forEach(field => field.classList.remove('invalid', 'valid'));
  form.querySelectorAll('.err').forEach(error => { error.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach(control => control.removeAttribute('aria-invalid'));
  fields.forEach(field => delete field.dataset.touched);
  $('methodGroup').classList.remove('invalid');
  errSummary.hidden = true;
  updateCount();
}

form.addEventListener('reset', () => {
  requestAnimationFrame(clearState);
});

$('again').addEventListener('click', () => {
  form.reset();
  success.hidden = true;
  form.hidden = false;
  $('name').focus();
});

updateCount();
