class AuthData {
  constructor(login, password, agree) {
    this.login = login;
    this.password = password;
    this.agree = Boolean(agree);
    this.timestamp = new Date().toISOString();
  }

  prettyPrint() {
    console.log('\n=== AUTH DATA ===');
    console.log(`• Логин: ${this.login}`);
    console.log(`• Пароль: ${'*'.repeat(Math.min(this.password.length, 12))}`);
    console.log(`• Согласие: ${this.agree ? 'Да' : 'Нет'}`);
    console.log(`• Когда: ${this.timestamp}`);
    console.log('================\n');
  }
}

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function setError(fieldId, message) {
  const input = qs(`#${fieldId}`);
  const error = qs(`.form__error[data-error-for="${fieldId}"]`);
  if (!input || !error) return;
  if (message) {
    input.classList.add('form__input--invalid');
    error.textContent = message;
    error.hidden = false;
  } else {
    input.classList.remove('form__input--invalid');
    error.textContent = '';
    error.hidden = true;
  }
}

function validateLogin() {
  const value = qs('#login').value.trim();
  if (value.length < 3) {
    setError('login', 'Минимум 3 символа');
    return false;
  }
  setError('login');
  return true;
}

function validatePassword() {
  const value = qs('#password').value;
  const hasLen = value.length >= 6;
  const hasLetter = /[A-Za-zА-Яа-я]/.test(value);
  const hasDigit = /\d/.test(value);
  if (!hasLen || !hasLetter || !hasDigit) {
    setError('password', 'Пароль ≥6, содержит букву и цифру');
    return false;
  }
  setError('password');
  return true;
}

function validateAgree() {
  const checked = qs('#agree').checked;
  if (!checked) {
    setError('agree', 'Необходимо принять условия');
    return false;
  }
  setError('agree');
  return true;
}

async function postFormData(data) {
  const notify = qs('#submitNotify');
  try {
    notify.className = 'notify';
    notify.textContent = 'Отправка…';
    const res = await fetch('https://httpbin.org/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    notify.className = 'notify notify--success';
    notify.textContent = 'Данные успешно отправлены';
    return json;
  } catch (err) {
    notify.className = 'notify notify--error';
    notify.textContent = `Ошибка отправки: ${err.message}`;
    throw err;
  }
}

async function loadUsers() {
  const table = qs('#usersTable');
  const notify = qs('#usersNotify');
  if (!table) return; // таблица может быть не на каждой странице
  try {
    notify.className = 'notify';
    notify.textContent = 'Загрузка данных…';
    const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users = await res.json();
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = users.map(u => `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td></tr>`).join('');
    notify.className = 'notify notify--success';
    notify.textContent = 'Данные обновлены';
  } catch (err) {
    notify.className = 'notify notify--error';
    notify.textContent = `Ошибка загрузки: ${err.message}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // динамическая валидация
  const form = qs('#authForm');
  if (form) {
    qs('#login').addEventListener('input', validateLogin);
    qs('#password').addEventListener('input', validatePassword);
    qs('#agree').addEventListener('change', validateAgree);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = [validateLogin(), validatePassword(), validateAgree()].every(Boolean);
      if (!ok) return;
      const payload = new AuthData(qs('#login').value.trim(), qs('#password').value, qs('#agree').checked);
      payload.prettyPrint();
      try {
        await postFormData(payload);
        form.classList.add('form--submitted');
        setTimeout(() => form.classList.remove('form--submitted'), 800);
      } catch {}
    });
  }

  // первая загрузка таблицы и периодическое обновление
  loadUsers();
  setInterval(loadUsers, 5 * 60 * 1000);
});

// экспорт для тестирования
if (typeof window !== 'undefined') {
  window.AuthData = AuthData;
}
