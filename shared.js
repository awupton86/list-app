(function () {
  const SESSION_KEY = 'hm_session';
  const page = location.pathname.split('/').pop() || 'index.html';
  const session = (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } })();

  const savedTheme = localStorage.getItem('hm_theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = savedTheme;

  function activeFor(name) {
    if (name === 'home') return page === '' || page === 'index.html';
    if (name === 'groceries') return page === 'groceries.html';
    if (name === 'calendar') return page === 'appointments.html';
    return false;
  }

  function closeSheets() {
    document.querySelectorAll('.hm-sheet-backdrop').forEach(el => el.classList.remove('open'));
  }

  function addChrome() {
    if (!session || !session.user || Date.now() > session.exp) return;
    document.body.insertAdjacentHTML('beforeend', `
      <button class="hm-fab" type="button" aria-label="Quick add" title="Quick add">+</button>
      <nav class="hm-bottom-nav" aria-label="Main navigation">
        <a href="index.html" class="${activeFor('home') ? 'active' : ''}"><span class="hm-icon">⌂</span><span>Home</span></a>
        <a href="index.html#today"><span class="hm-icon">☀️</span><span>Today</span></a>
        <a href="groceries.html" class="${activeFor('groceries') ? 'active' : ''}"><span class="hm-icon">🛒</span><span>Groceries</span></a>
        <a href="appointments.html" class="${activeFor('calendar') ? 'active' : ''}"><span class="hm-icon">📅</span><span>Calendar</span></a>
        <button type="button" class="hm-more"><span class="hm-icon">•••</span><span>More</span></button>
      </nav>
      <div class="hm-sheet-backdrop" id="hm-quick-sheet" role="dialog" aria-modal="true" aria-label="Quick add">
        <div class="hm-sheet"><div class="hm-sheet-handle"></div><h3>Quick add</h3>
          <div class="hm-action-grid">
            <a class="hm-action" href="groceries.html?action=add"><span>🛒</span>Add grocery</a>
            <a class="hm-action" href="chores.html?action=add"><span>✅</span>Add chore</a>
            <a class="hm-action" href="appointments.html?action=add"><span>📅</span>Add appointment</a>
            <a class="hm-action" href="meals.html?action=add"><span>🍽️</span>Add meal</a>
            <a class="hm-action" href="budget.html?action=add"><span>💵</span>Add expense</a>
          </div>
          <div class="hm-sheet-footer"><button type="button" data-close-sheet>Close</button></div>
        </div>
      </div>
      <div class="hm-sheet-backdrop" id="hm-more-sheet" role="dialog" aria-modal="true" aria-label="More">
        <div class="hm-sheet"><div class="hm-sheet-handle"></div><h3>More</h3>
          <div class="hm-action-grid">
            <a class="hm-action" data-feature="meals" href="meals.html"><span>🍽️</span>Meals</a>
            <a class="hm-action" data-feature="chores" href="chores.html"><span>✅</span>Chores</a>
            <a class="hm-action" data-feature="budget" href="budget.html"><span>💵</span>Budget</a>
            <button class="hm-action" type="button" id="hm-theme"><span>${savedTheme === 'dark' ? '☀️' : '🌙'}</span>${savedTheme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
          </div>
          <div class="hm-sheet-footer"><button type="button" data-close-sheet>Close</button><a href="index.html#family-settings">Family settings</a></div>
        </div>
      </div>
      <div class="hm-sync" id="hm-sync" role="status" aria-live="polite"></div>`);

    document.querySelector('.hm-fab').addEventListener('click', () => document.getElementById('hm-quick-sheet').classList.add('open'));
    document.querySelector('.hm-more').addEventListener('click', () => document.getElementById('hm-more-sheet').classList.add('open'));
    document.querySelectorAll('[data-close-sheet]').forEach(btn => btn.addEventListener('click', closeSheets));
    document.querySelectorAll('.hm-sheet-backdrop').forEach(el => el.addEventListener('click', e => { if (e.target === el) closeSheets(); }));
    document.getElementById('hm-theme').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hm_theme', next); document.documentElement.dataset.theme = next; closeSheets();
    });
    let hidden=[]; try{hidden=JSON.parse(localStorage.getItem('hm_hidden_features')||'[]');}catch(e){}
    document.querySelectorAll('[data-feature]').forEach(el=>{if(hidden.includes(el.dataset.feature))el.style.display='none';});
  }

  window.hmStatus = function (message, isError) {
    const el = document.getElementById('hm-sync'); if (!el) return;
    el.textContent = message; el.classList.toggle('error', !!isError); el.classList.add('show');
    clearTimeout(el._timer); el._timer = setTimeout(() => el.classList.remove('show'), 2400);
  };

  window.addEventListener('offline', () => window.hmStatus('Offline — changes may not sync', true));
  window.addEventListener('online', () => window.hmStatus('Back online'));
  window.addEventListener('unhandledrejection', () => window.hmStatus('That did not save — please try again', true));
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addChrome); else addChrome();
})();
