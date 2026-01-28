const API_BASE = "back-stopcredit-production.up.railway.app";

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

let userId = null;

// ---------- INIT ----------
async function init() {
  if (!tg.initDataUnsafe?.user?.id) {
    statusEl.textContent = "❌ Открой приложение через Telegram";
    return;
  }

  statusEl.textContent = "🎮 Вход в игру…";

  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: tg.initDataUnsafe.user.id
      })
    });

    const user = await res.json();
    userId = user.id;

    statusEl.textContent = "🗺 Поле боя загружено";
    loadState();
  } catch (e) {
    statusEl.textContent = "❌ Ошибка подключения";
    console.error(e);
  }
}

// ---------- LOAD ----------
async function loadState() {
  listEl.innerHTML = "";

  const res = await fetch(`${API_BASE}/state/${userId}`);
  const data = await res.json();

  if (!data.length) {
    listEl.innerHTML = "<p>Пока врагов нет. Добавь первого.</p>";
    return;
  }

  data.forEach(o => {
    const percent = Math.round(
      (1 - o.current_amount / o.initial_amount) * 100
    );

    const div = document.createElement("div");
    div.className = "enemy";
    div.innerHTML = `
      <h3>${o.name}</h3>
      <p>${o.type === "credit" ? "💳 Кредит" : "🤝 Долг"} · Осталось ${o.current_amount}</p>
      <div class="progress">
        <div style="width:${percent}%"></div>
      </div>
      <small>${percent}% пройдено</small>
    `;

    listEl.appendChild(div);
  });
}

// ---------- ADD ----------
async function addObligation() {
  const type = document.getElementById("type").value;
  const name = document.getElementById("name").value;
  const amount = Number(document.getElementById("amount").value);

  if (!name || !amount) {
    alert("Заполни все поля");
    return;
  }

  await fetch(`${API_BASE}/obligation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      type,
      name,
      amount
    })
  });

  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";

  loadState();
}

// START
init();

