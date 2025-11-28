class AuthData {
  constructor(login, password, agree) {
    this.login = login;
    this.password = password;
    this.agree = Boolean(agree);
    this.timestamp = new Date().toISOString();
  }

  print() {
    const title = `\n=== AUTH DATA ===`;
    const body = `login: ${this.login}\npassword: ${'*'.repeat(Math.min(this.password.length, 12))}\nagree: ${this.agree}\nwhen: ${this.timestamp}`;
    console.log(`${title}\n${body}\n================\n`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('authForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const agree = document.getElementById('agree').checked;

    const data = new AuthData(login, password, agree);
    data.print();

    // Простая визуальная обратная связь
    form.classList.add('submitted');
    setTimeout(() => form.classList.remove('submitted'), 800);
  });
});

// Бонус: экспорт для возможного тестирования
if (typeof window !== 'undefined') {
  window.AuthData = AuthData;
}