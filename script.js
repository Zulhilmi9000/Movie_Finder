/* ============================================================
   MovieFinder — script.js
   TVMaze API  |  fetch + async/await  |  ES2020
   ============================================================ */

const API_BASE = 'https://api.tvmaze.com/search/shows?q=';

/* ── DOM REFS ──────────────────────────────────────────── */
const searchInput  = document.getElementById('searchInput');
const searchBtn    = document.getElementById('searchBtn');
const cardsGrid    = document.getElementById('cardsGrid');
const statusBox    = document.getElementById('statusBox');
const loading      = document.getElementById('loading');
const resultsCount = document.getElementById('resultsCount');
const chips        = document.querySelectorAll('.chip');

/* ── UTILITY HELPERS ───────────────────────────────────── */
function showStatus(message, isError = false) {
  statusBox.classList.remove('hidden');
  statusBox.innerHTML = `<p class="${isError ? 'status-error' : 'status-text'}">${message}</p>`;
}

function hideStatus() {
  statusBox.classList.add('hidden');
}

function showLoading() {
  loading.classList.remove('hidden');
  cardsGrid.innerHTML = '';
  resultsCount.classList.add('hidden');
  hideStatus();
}

function hideLoading() {
  loading.classList.add('hidden');
}

function getYear(premiered) {
  if (!premiered) return 'N/A';
  return premiered.slice(0, 4);
}

function getGenre(genres) {
  if (!genres || genres.length === 0) return 'Unknown';
  return genres[0];
}

/* ── BUILD SINGLE CARD ─────────────────────────────────── */
function buildCard(show, index) {
  const card  = document.createElement('article');
  card.className = 'card';
  card.style.animationDelay = `${index * 0.05}s`;

  const posterUrl  = show.image?.medium || null;
  const title      = show.name || 'Tiada Tajuk';
  const year       = getYear(show.premiered);
  const genre      = getGenre(show.genres);

  const posterHTML = posterUrl
    ? `<img class="card-poster" src="${posterUrl}" alt="Poster ${title}" loading="lazy" />`
    : `<div class="card-poster-placeholder">🎬</div>`;

  card.innerHTML = `
    ${posterHTML}
    <div class="card-body">
      <h3 class="card-title" title="${title}">${title}</h3>
      <div class="card-meta">
        <span class="card-genre">${genre}</span>
        <span class="card-year">${year}</span>
      </div>
    </div>
  `;

  return card;
}

/* ── MAIN SEARCH FUNCTION ──────────────────────────────── */
async function searchMovies(query) {
  const trimmed = query.trim();

  /* TC03 – Input kosong */
  if (!trimmed) {
    showStatus('Sila masukkan tajuk filem untuk memulakan carian.');
    return;
  }

  showLoading();

  try {
    const response = await fetch(`${API_BASE}${encodeURIComponent(trimmed)}`);

    if (!response.ok) {
      throw new Error(`Ralat rangkaian: ${response.status}`);
    }

    const data = await response.json();
    hideLoading();

    /* TC02 – Tiada hasil */
    if (!data || data.length === 0) {
      showStatus(`Tiada filem dijumpai untuk "<strong>${trimmed}</strong>". Cuba tajuk lain.`, false);
      resultsCount.classList.add('hidden');
      return;
    }

    /* TC01 – Ada hasil */
    hideStatus();
    resultsCount.textContent = `Dijumpai ${data.length} hasil untuk "${trimmed}"`;
    resultsCount.classList.remove('hidden');

    const fragment = document.createDocumentFragment();
    data.forEach((item, idx) => {
      if (item.show) {
        fragment.appendChild(buildCard(item.show, idx));
      }
    });

    cardsGrid.appendChild(fragment);

  } catch (err) {
    hideLoading();
    showStatus('Gagal mendapatkan data. Sila semak sambungan internet anda.', true);
    console.error('MovieFinder Error:', err);
  }
}

/* ── EVENT LISTENERS ───────────────────────────────────── */

/* Button click */
searchBtn.addEventListener('click', () => {
  searchMovies(searchInput.value);
});

/* Enter key */
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchMovies(searchInput.value);
  }
});

/* Suggestion chips */
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const query = chip.dataset.query;
    searchInput.value = query;
    searchMovies(query);
    searchInput.focus();
  });
});