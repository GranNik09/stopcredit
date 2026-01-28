const API_BASE = "https://back-stopcredit-production.up.railway.app";

async function init() {
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe?.user;

  if (!user) {
    document.getElementById('status').innerText = "❌ Открой через Telegram";
    return;
  }

  document.getElementById('username').innerText = user.first_name || user.username;
  document.getElementById('status').style.display = 'none';
  document.getElementById('user-info').style.display = 'block';

  // Авторизация
  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: user.id })
  });

  const userData = await res.json();
  console.log("AUTH OK:", userData);

  loadState(userData.id);
}

async function loadState(userId) {
  const res = await fetch(`${API_BASE}/state/${userId}`);
  const data = await res.json();

  const container = document.getElementById('state');
  container.innerHTML = '';

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Нет данных о долгах или кредитах</p>";
    return;
  }

  data.forEach(ob => {
    const div = document.createElement('div');
    div.className = 'obligation';
    div.innerHTML = `
      <strong>${ob.name}</strong> (${ob.type})<br>
      Остаток: ${ob.current_amount} / ${ob.initial_amount}
    `;
    container.appendChild(div);
  });
}

document.getElementById('refresh').addEventListener('click', () => {
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe?.user;
  if (user) loadState(user.id);
});

window.addEventListener('DOMContentLoaded', init);
