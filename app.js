const API_BASE = "https://back-stopcredit-production.up.railway.app";

let userId = null;

// Инициализация приложения
async function init() {
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe?.user; // ⚠️ Уже объект, JSON.parse не нужен

  if (!user) {
    document.getElementById('status').innerText = "❌ Открой через Telegram Mini App!";
    return;
  }

  console.log("Telegram user:", user);

  document.getElementById('username').innerText = user.first_name || user.username;
  document.getElementById('status').style.display = 'none';
  document.getElementById('user-info').style.display = 'block';

  // Авторизация на backend
  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: user.id })
    });

    const userData = await res.json();
    console.log("Backend user data:", userData);

    userId = userData.id;

    await loadState();
    setupTabs();
  } catch (err) {
    console.error("Ошибка подключения к backend:", err);
    document.getElementById('status').innerText = "❌ Ошибка подключения к серверу!";
    document.getElementById('status').style.display = 'block';
  }
}

// Загрузка состояния пользователя
async function loadState() {
  if (!userId) return;

  try {
    const res = await fetch(`${API_BASE}/state/${userId}`);
    const data = await res.json();
    console.log("State data:", data);

    renderObligations(data, 'credits', 'credit');
    renderObligations(data, 'debts', 'debt');
  } catch (err) {
    console.error("Ошибка загрузки состояния:", err);
  }
}

// Рендер кредитов / долгов
function renderObligations(data, containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const filtered = data.filter(ob => ob.type === type);
  if (!filtered.length) {
    container.innerHTML = `<p>Нет данных о ${type === 'credit' ? 'кредитах' : 'долгах'}</p>`;
    return;
  }

  filtered.forEach(ob => {
    const div = document.createElement('div');
    div.className = 'obligation';
    const progressPercent = Math.round(((ob.initial_amount - ob.current_amount) / ob.initial_amount) * 100);

    div.innerHTML = `
      <strong>${ob.name}</strong><br>
      Остаток: ${ob.current_amount} / ${ob.initial_amount}
      <div class="progress-bar"><div class="progress" style="width:${progressPercent}%"></div></div>
    `;
    container.appendChild(div);
  });
}

// Настройка вкладок
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      document.getElementById(tab.dataset.tab).style.display = 'block';
    });
  });
}

// Кнопка обновления
document.getElementById('refresh').addEventListener('click', loadState);

// Запуск
window.addEventListener('DOMContentLoaded', init);
