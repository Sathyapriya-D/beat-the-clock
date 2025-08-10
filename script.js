// Simple dynamic quote fetcher using Quotable API
const QUOTE_API = 'https://api.quotable.io/random';

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newBtn = document.getElementById('newQuote');
const copyBtn = document.getElementById('copyQuote');
const favBtn = document.getElementById('favoriteBtn');
const tweetBtn = document.getElementById('tweetBtn');
const statusEl = document.getElementById('status');
const favoritesList = document.getElementById('favoritesList');
const themeToggle = document.getElementById('themeToggle');

let currentQuote = null;

// load theme
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme','dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    localStorage.removeItem('theme');
  } else {
    document.documentElement.setAttribute('data-theme','dark');
    themeToggle.textContent = '☀️';
    localStorage.setItem('theme','dark');
  }
});

async function fetchQuote() {
  setStatus('Fetching quote…');
  newBtn.disabled = true;
  try {
    const res = await fetch(QUOTE_API);
    if (!res.ok) throw new Error('Quote fetch failed');
    const data = await res.json();
    currentQuote = data;
    quoteText.textContent = `"${data.content}"`;
    quoteAuthor.textContent = data.author ? `— ${data.author}` : '';
    favBtn.setAttribute('aria-pressed','false');
    setStatus('');
  } catch (err) {
    setStatus('Could not fetch quote. Try again.');
    console.error(err);
  } finally {
    newBtn.disabled = false;
  }
}

function setStatus(text){
  statusEl.textContent = text || '';
}

newBtn.addEventListener('click', fetchQuote);

copyBtn.addEventListener('click', async () => {
  if (!currentQuote) return;
  const text = `${currentQuote.content} — ${currentQuote.author || 'Unknown'}`;
  try {
    await navigator.clipboard.writeText(text);
    setStatus('Copied to clipboard ✅');
    setTimeout(()=>setStatus(''),1500);
  } catch {
    setStatus('Copy failed — your browser might block clipboard access.');
  }
});

favBtn.addEventListener('click', () => {
  if (!currentQuote) return;
  const favs = loadFavs();
  const exists = favs.find(q => q._id === currentQuote._id);
  if (exists) {
    // remove
    const newFavs = favs.filter(q => q._id !== currentQuote._id);
    saveFavs(newFavs);
    favBtn.textContent = '♡ Favorite';
    favBtn.setAttribute('aria-pressed','false');
    setStatus('Removed from favorites');
    renderFavs();
    return;
  }
  favs.unshift(currentQuote);
  saveFavs(favs);
  favBtn.textContent = '♥ Favorited';
  favBtn.setAttribute('aria-pressed','true');
  setStatus('Added to favorites');
  renderFavs();
});

tweetBtn.addEventListener('click', () => {
  if (!currentQuote) return;
  const text = encodeURIComponent(`"${currentQuote.content}" — ${currentQuote.author || 'Unknown'}`);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank', 'noopener');
});

// favorites persistence
function loadFavs() {
  try {
    return JSON.parse(localStorage.getItem('live-quotes-favs') || '[]');
  } catch { return []; }
}
function saveFavs(list) {
  localStorage.setItem('live-quotes-favs', JSON.stringify(list.slice(0,50)));
}

function renderFavs(){
  const favs = loadFavs();
  favoritesList.innerHTML = '';
  if (favs.length === 0) {
    favoritesList.innerHTML = '<li style="color:var(--muted)">No favorites yet — add one!</li>';
    return;
  }
  favs.forEach(q => {
    const li = document.createElement('li');
    const text = document.createElement('div');
    text.innerHTML = `<strong>${q.author || 'Unknown'}</strong><div style="font-size:.95rem;margin-top:6px">${q.content}</div>`;
    const actions = document.createElement('div');
    actions.className = 'fav-actions';
    const copy = document.createElement('button');
    copy.textContent = 'Copy';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`${q.content} — ${q.author || 'Unknown'}`); setStatus('Copied favorite'); setTimeout(()=>setStatus(''),1200);}
      catch { setStatus('Copy failed'); }
    });
    const remove = document.createElement('button');
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      const newFavs = loadFavs().filter(item => item._id !== q._id);
      saveFavs(newFavs);
      renderFavs();
      setStatus('Removed favorite');
      setTimeout(()=>setStatus(''),1200);
    });
    actions.appendChild(copy);
    actions.appendChild(remove);
    li.appendChild(text);
    li.appendChild(actions);
    favoritesList.appendChild(li);
  });
}

// initial
fetchQuote();
renderFavs();
