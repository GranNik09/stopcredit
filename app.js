const API_BASE = "back-stopcredit-production.up.railway.app";

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const telegramId = tg.initDataUnsafe?.user?.id;

const userInfo = document.getElementById("user-info");
const tableBody = document.getElementById("table-body");

let userId = null;

// ==========================
// Авторизация
// ==========================
async function auth() {
  const res = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegram_id: telegramId })
  });

  const user = await res.json();
  userId = user.id;

  userInfo.textContent = `👤 Пользователь #${userId}`;
  loadState();
}

// ==========================
// Загрузка данных
// ==========================
async function loadState() {
  tableBody.innerHTML = "";

  const res = await fetch(`${API_BASE}/state/${userId}`);
  const data = await res.json();

  data.forEach(o => {
    const percent =
      Math.round((1 - o.current_amount / o.initial_amount) * 100);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${o.type}</td>
      <td>${o.name}</td>
      <td>${o.current_amount}</td>
      <td>
        <div class="progress">
          <div style="width:${percent}%"></div>
        </div>
        ${percent}%
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// ==========================
// Добавление долга / кредита
// ==========================
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

// Запуск
auth();
