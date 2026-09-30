// Vanilla JavaScript for Flask Client
document.addEventListener('DOMContentLoaded', () => {
  // Navigation tabs
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('page-title');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      navBtns.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add('active');
      pageTitle.textContent = btn.textContent.replace(/[^\w\s]/gi, '').trim();

      if (target === 'inventory') loadInventory();
    });
  });

  // Load Dashboard Data
  async function loadDashboard() {
    try {
      const res = await fetch('/api/inventory/alerts');
      const alerts = await res.json();
      const tbody = document.getElementById('alerts-tbody');
      if (!tbody) return;

      tbody.innerHTML = '';
      alerts.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${item.product_name}</strong></td>
          <td class="text-danger font-bold">${item.current_stock} units</td>
          <td>${item.reorder_point} units</td>
          <td><span class="badge ${item.risk === 'CRITICAL' ? 'badge-ai' : ''}">${item.risk}</span></td>
          <td><small>${item.reason}</small></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('Failed to load alerts:', e);
    }
  }

  // Load Inventory Data
  async function loadInventory() {
    try {
      const res = await fetch('/api/inventory');
      const items = await res.json();
      const tbody = document.getElementById('inventory-tbody');
      if (!tbody) return;

      tbody.innerHTML = '';
      items.forEach((p) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><code>${p.id}</code></td>
          <td><strong>${p.name}</strong></td>
          <td>${p.category}</td>
          <td>${p.current_stock}</td>
          <td>$${p.unit_price.toFixed(2)}</td>
          <td>${p.reorder_point}</td>
          <td>${p.average_daily_sales}/day</td>
          <td><span class="badge">${p.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('Failed to load inventory:', e);
    }
  }

  // AI Chat Form
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'chat-msg user';
      userDiv.textContent = text;
      chatMessages.appendChild(userDiv);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Loading placeholder
      const botDiv = document.createElement('div');
      botDiv.className = 'chat-msg bot';
      botDiv.textContent = 'Analyzing supply chain database...';
      chatMessages.appendChild(botDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();
        botDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
      } catch (err) {
        botDiv.textContent = 'Error connecting to AI service. Fallback engine active.';
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  loadDashboard();
});
