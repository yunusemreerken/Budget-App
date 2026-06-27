'use strict';

/* ─── Data ─── */
const CATS_EXP = [
  { id: 'food',          name: 'Yemek',     icon: '🍔', color: '#eda100' },
  { id: 'transport',     name: 'Ulaşım',    icon: '🚗', color: '#2a78d6' },
  { id: 'housing',       name: 'Kira',      icon: '🏠', color: '#4a3aa7' },
  { id: 'health',        name: 'Sağlık',    icon: '💊', color: '#e34948' },
  { id: 'shopping',      name: 'Alışveriş', icon: '🛍️', color: '#1baf7a' },
  { id: 'entertainment', name: 'Eğlence',   icon: '🎮', color: '#e87ba4' },
  { id: 'education',     name: 'Eğitim',    icon: '📚', color: '#008300' },
  { id: 'other',         name: 'Diğer',     icon: '•',  color: '#888780' },
];
const CATS_INC = [
  { id: 'salary',     name: 'Maaş',    icon: '💼', color: '#1baf7a' },
  { id: 'freelance',  name: 'Serbest', icon: '💻', color: '#2a78d6' },
  { id: 'investment', name: 'Yatırım', icon: '📈', color: '#eda100' },
  { id: 'gift',       name: 'Hediye',  icon: '🎁', color: '#e87ba4' },
  { id: 'other_inc',  name: 'Diğer',   icon: '•',  color: '#888780' },
];
const ALL_CATS = [...CATS_EXP, ...CATS_INC];

const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

let transactions = [];
let currentDate  = new Date();
let activeTab    = 'all';
let txType       = 'expense';
let selCat       = CATS_EXP[0].id;

/* ─── Helpers ─── */
function fmt(n) {
  return '₺' + Math.abs(n).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function monthKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function catById(id) {
  return ALL_CATS.find(c => c.id === id) || { name: 'Diğer', icon: '•', color: '#888780' };
}

function formatDay(dateStr) {
  const d    = new Date(dateStr + 'T00:00:00');
  const now  = new Date(); now.setHours(0,0,0,0);
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString())  return 'Bugün';
  if (d.toDateString() === yest.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
}

/* ─── Persistence ─── */
async function load() {
  if (window.budgetAPI) {
    transactions = await window.budgetAPI.loadTransactions();
  } else {
    try { transactions = JSON.parse(localStorage.getItem('txs') || '[]'); } catch { transactions = []; }
  }
}

async function persist() {
  if (window.budgetAPI) {
    await window.budgetAPI.saveTransactions(transactions);
  } else {
    localStorage.setItem('txs', JSON.stringify(transactions));
  }
}

/* ─── Render ─── */
function renderAll() {
  const mk = monthKey(currentDate);
  document.getElementById('monthLabel').textContent =
    MONTHS[currentDate.getMonth()] + ' ' + currentDate.getFullYear();

  const monthTxs = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return monthKey(d) === mk;
  });

  const inc = monthTxs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const exp = monthTxs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const net = inc - exp;

  document.getElementById('totalIncome').textContent  = fmt(inc);
  document.getElementById('totalExpense').textContent = fmt(exp);
  const nb = document.getElementById('netBalance');
  nb.textContent  = (net >= 0 ? '+' : '-') + fmt(net);
  nb.className    = 'net-amount ' + (net >= 0 ? 'pos' : 'neg');

  renderCatSidebar(monthTxs);
  renderDonut(monthTxs);

  const filtered = monthTxs.filter(t =>
    activeTab === 'all' ||
    (activeTab === 'income'  && t.type === 'income') ||
    (activeTab === 'expense' && t.type === 'expense')
  );
  renderTransactions(filtered);
}

function renderCatSidebar(txs) {
  const totals = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    totals[t.cat] = (totals[t.cat] || 0) + t.amount;
  });
  const sorted = Object.entries(totals).sort((a,b) => b[1]-a[1]);
  const el = document.getElementById('catList');
  if (!sorted.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text-3);padding:8px 2px;">Henüz işlem yok</div>';
    return;
  }
  el.innerHTML = sorted.map(([id, amt]) => {
    const c = catById(id);
    return `<div class="cat-row">
      <div class="cat-dot" style="background:${c.color}"></div>
      <span class="cat-name">${c.name}</span>
      <span class="cat-amt">${fmt(amt)}</span>
    </div>`;
  }).join('');
}

function renderDonut(txs) {
  const totals = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    totals[t.cat] = (totals[t.cat] || 0) + t.amount;
  });
  const entries  = Object.entries(totals).sort((a,b) => b[1]-a[1]);
  const totalExp = entries.reduce((s,[,v]) => s + v, 0);

  document.getElementById('donutVal').textContent = fmt(totalExp);

  const canvas = document.getElementById('donutChart');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!entries.length) {
    document.getElementById('legend').innerHTML =
      '<div style="font-size:12px;color:var(--text-3);">Gider kaydı yok</div>';
    // Draw empty grey ring
    const cx = W/2, cy = H/2, r = W*0.42, ri = W*0.28;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.arc(cx, cy, ri, 0, Math.PI*2, true);
    ctx.fillStyle = '#e5e5e5'; ctx.fill();
    return;
  }

  const cx = W/2, cy = H/2;
  const outerR = W * 0.44;
  const innerR = W * 0.29;
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const gap    = isDark ? '#2c2c2e' : '#ffffff';

  let angle = -Math.PI / 2;

  entries.forEach(([id, amt]) => {
    const slice = (amt / totalExp) * Math.PI * 2;
    const color = catById(id).color;

    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
    ctx.arc(cx, cy, outerR, angle, angle + slice);
    ctx.arc(cx, cy, innerR, angle + slice, angle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Gap line
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
    ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
    ctx.strokeStyle = gap;
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    angle += slice;
  });

  // Hover tooltip
  canvas._entries  = entries;
  canvas._totalExp = totalExp;
  canvas._cx = cx; canvas._cy = cy;
  canvas._outerR = outerR; canvas._innerR = innerR;

  document.getElementById('legend').innerHTML = entries.slice(0, 6).map(([id, amt]) => {
    const c = catById(id);
    return `<div class="legend-item">
      <div class="legend-sq" style="background:${c.color}"></div>
      <span class="legend-name">${c.name}</span>
      <span class="legend-pct">${Math.round(amt / totalExp * 100)}%</span>
      <span class="legend-val">${fmt(amt)}</span>
    </div>`;
  }).join('');
}

function renderTransactions(txs) {
  const col = document.getElementById('txCol');
  if (!txs.length) {
    col.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🧾</div>
      <div class="empty-title">İşlem bulunamadı</div>
      <div class="empty-sub">Yukarıdan yeni bir işlem ekleyebilirsin.</div>
    </div>`;
    return;
  }

  const sorted = [...txs].sort((a,b) => new Date(b.date) - new Date(a.date));
  const groups = {};
  sorted.forEach(t => { (groups[t.date] = groups[t.date] || []).push(t); });
  const days = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));

  col.innerHTML = days.map(day => `
    <div class="tx-day-group">
      <div class="tx-day-label">${formatDay(day)}</div>
      ${groups[day].map(tx => {
        const c = catById(tx.cat);
        return `<div class="tx-item">
          <div class="tx-icon" style="background:${c.color}22;">${c.icon}</div>
          <div class="tx-info">
            <div class="tx-name">${tx.note || c.name}</div>
            <div class="tx-cat">${c.name}</div>
          </div>
          <div class="tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}</div>
          <button class="tx-del" data-id="${tx.id}" title="Sil">✕</button>
        </div>`;
      }).join('')}
    </div>
  `).join('');

  col.querySelectorAll('.tx-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      transactions = transactions.filter(t => t.id !== Number(btn.dataset.id));
      await persist();
      renderAll();
    });
  });
}

/* ─── Modal ─── */
function openModal() {
  txType = 'expense';
  selCat = CATS_EXP[0].id;
  document.getElementById('amountInput').value = '';
  document.getElementById('noteInput').value   = '';
  document.getElementById('dateInput').value   = todayStr();
  syncTypeButtons();
  renderCatGrid();
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('amountInput').focus(), 60);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function syncTypeButtons() {
  document.getElementById('expBtn').classList.toggle('active', txType === 'expense');
  document.getElementById('incBtn').classList.toggle('active', txType === 'income');
}

function renderCatGrid() {
  const cats = txType === 'expense' ? CATS_EXP : CATS_INC;
  document.getElementById('catGrid').innerHTML = cats.map(c => `
    <div class="cat-pick ${c.id === selCat ? 'selected' : ''}" data-id="${c.id}">
      <span class="cat-pick-icon">${c.icon}</span>
      <span class="cat-pick-name">${c.name}</span>
    </div>
  `).join('');

  document.getElementById('catGrid').querySelectorAll('.cat-pick').forEach(el => {
    el.addEventListener('click', () => {
      selCat = el.dataset.id;
      renderCatGrid();
    });
  });
}

async function saveTransaction() {
  const amt  = parseFloat(document.getElementById('amountInput').value);
  const note = document.getElementById('noteInput').value.trim();
  const date = document.getElementById('dateInput').value;
  if (!amt || amt <= 0 || !date) {
    document.getElementById('amountInput').focus();
    return;
  }
  transactions.push({ id: Date.now(), type: txType, amount: amt, note, cat: selCat, date });
  await persist();
  closeModal();
  renderAll();
}

/* ─── Event listeners ─── */
document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderAll();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderAll();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAll();
  });
});

document.getElementById('addBtn').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('saveBtn').addEventListener('click', saveTransaction);

document.getElementById('expBtn').addEventListener('click', () => {
  txType = 'expense';
  selCat = CATS_EXP[0].id;
  syncTypeButtons();
  renderCatGrid();
});
document.getElementById('incBtn').addEventListener('click', () => {
  txType = 'income';
  selCat = CATS_INC[0].id;
  syncTypeButtons();
  renderCatGrid();
});

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') openModal();
});

/* ─── Init ─── */
(async () => {
  await load();
  renderAll();
})();
