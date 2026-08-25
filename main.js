// ─── Config — change this to your real username ───
const GITHUB_USERNAME = 'localhost-5555';

// ─── i18n ───
const TRANSLATIONS = {
  en: {
    'badge.role': 'Junior web dev',
    'bq.prefix': 'I like to ',
    'p.intro': `I'm primarily focused on web development using <code>Django</code> for the backend and <code>Vue</code>
          for the frontend. I like to explore different languages and technologies. I've also worked with IoT technologies and microcontrollers.`,
    'p.student': "I'm currently a biomedical engineering student, but I'm open to work.",
    'btn.viewProjects': 'View projects',
    'btn.viewAllProjects': 'View all projects',
    'h2.connect': 'Connect',
    'h2.languages': 'Languages',
    'h2.projects': 'Projects',
    'lang.spanish': 'Spanish (Native)',
    'lang.english': 'English (B2)',
    'dialog.title': 'Projects',
    words: ['code.', 'build stuff.', 'try new things.', 'research.'],
    'proj.noDescription': 'No description provided.',
    'proj.retry': 'retry',
    'proj.userNotFound': repo => `User "${repo}" not found.`,
    'proj.rateLimit': 'Rate limit reached (60 req/hr). Try again shortly.',
    'proj.apiError': status => `GitHub API error: ${status}`,
    'proj.repoCount': n => `— ${n} repositories`,
  },
  es: {
    'badge.role': 'Desarrollador web junior',
    'bq.prefix': 'Me gusta ',
    'p.intro': `Me enfoco principalmente en desarrollo web usando <code>Django</code> para el backend y <code>Vue</code>
          para el frontend. Me gusta explorar diferentes lenguajes y tecnologías. También he trabajado con tecnologías IoT y microcontroladores.`,
    'p.student': 'Actualmente soy estudiante de ingeniería biomédica, pero estoy disponible para trabajar.',
    'btn.viewProjects': 'Ver proyectos',
    'btn.viewAllProjects': 'Ver todos los proyectos',
    'h2.connect': 'Contacto',
    'h2.languages': 'Idiomas',
    'h2.projects': 'Proyectos',
    'lang.spanish': 'Español (Nativo)',
    'lang.english': 'Inglés (B2)',
    'dialog.title': 'Proyectos',
    words: ['programar.', 'construir cosas.', 'probar cosas nuevas.', 'investigar.'],
    'proj.noDescription': 'Sin descripción disponible.',
    'proj.retry': 'reintentar',
    'proj.userNotFound': repo => `Usuario "${repo}" no encontrado.`,
    'proj.rateLimit': 'Límite de solicitudes alcanzado (60/hora). Intenta de nuevo en un momento.',
    'proj.apiError': status => `Error de la API de GitHub: ${status}`,
    'proj.repoCount': n => `— ${n} repositorios`,
  },
};

function t(key) {
  return TRANSLATIONS[currentLang()][key];
}

function currentLang() {
  const stored = localStorage.getItem('lang-pref');
  if (stored === 'en' || stored === 'es') return stored;
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function applyLang(lang) {
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  words.length = 0;
  words.push(...t('words'));

  Object.entries(langOpts).forEach(([key, btn]) => {
    btn.classList.toggle('active', key === lang);
  });

  reposCache = null;
  if (overlay.classList.contains('open')) loadRepos();
  loadTape();
}

// ─── Language color map ───
const LANG_COLORS = {
  JavaScript:  '#f7df1e',
  TypeScript:  '#3178c6',
  Python:      '#3572a5',
  Go:          '#00add8',
  Rust:        '#dea584',
  Vue:         '#41b883',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Shell:       '#89e051',
  Ruby:        '#701516',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  C:           '#555555',
  Kotlin:      '#A97BFF',
  Swift:       '#F05138',
};

// ─── Language icon map (iconify logos slugs) ───
const LANG_ICONS = {
  JavaScript: 'javascript',
  TypeScript: 'typescript-icon',
  Python:     'python',
  Go:         'go',
  Rust:       'rust',
  Vue:        'vue',
  HTML:       'html-5',
  CSS:        'css-3',
  Shell:      'bash-icon',
  Ruby:       'ruby',
  Java:       'java',
  'C++':      'c-plusplus',
  C:          'c',
  Kotlin:     'kotlin-icon',
  Swift:      'swift',
};

// ─── Cover gradient palette (cycles through repos) ───
const COVER_PALETTES = [
  { bg: 'linear-gradient(135deg,#1e3a5f,#0d1b2e)', accent: '#7aa2f7', dots: ['#7dcfff','#9ece6a','#f7768e'] },
  { bg: 'linear-gradient(135deg,#2d1f3e,#1a1228)', accent: '#bb9af7', dots: ['#bb9af7','#9ece6a','#7aa2f7'] },
  { bg: 'linear-gradient(135deg,#1e2e1a,#111a0e)', accent: '#9ece6a', dots: ['#9ece6a','#7dcfff','#e0af68'] },
  { bg: 'linear-gradient(135deg,#2a1f10,#1a1308)', accent: '#ff9e64', dots: ['#9ece6a','#f7768e','#e0af68'] },
  { bg: 'linear-gradient(135deg,#1e2535,#111520)', accent: '#7dcfff', dots: ['#7aa2f7','#bb9af7','#7dcfff'] },
  { bg: 'linear-gradient(135deg,#1f2d20,#121c13)', accent: '#9ece6a', dots: ['#41b883','#9ece6a','#7aa2f7'] },
];

// ─── Build cover SVG for a repo ───
function makeCover(repo, idx) {
  const p = COVER_PALETTES[idx % COVER_PALETTES.length];
  const name = repo.name.replace(/-/g, ' ');
  return `
    <div class="proj-img-placeholder" style="background:${p.bg}">
      <span class="cover-name" style="color:${p.accent}">${name}</span>
    </div>`;
}

// ─── Build a single card ───
function makeCard(repo, idx) {
  const langColor = LANG_COLORS[repo.language] || '#888';
  const langName  = repo.language || '—';
  const desc = repo.description || t('proj.noDescription');
  const stars = repo.stargazers_count || 0;
  const topics = (repo.topics || []).slice(0, 3);

  const topicsHtml = topics.length
    ? `<div class="proj-topics">${topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}</div>`
    : '';

  const langIcon = LANG_ICONS[repo.language];
  const stackHtml = repo.language
    ? `<div class="proj-stack">
         <span class="proj-stack-item">
           ${langIcon
             ? `<img src="https://api.iconify.design/logos:${langIcon}.svg" alt="" />`
             : `<span class="lang-dot" style="background:${langColor}"></span>`}
           <span>${langName}</span>
         </span>
       </div>`
    : '';

  const starsHtml = stars > 0
    ? `<span class="proj-stars">
         <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
           <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
         </svg>
         ${stars}
       </span>`
    : '';

  return `
    <a href="${repo.html_url}" class="proj-card" data-idx="${idx}">
      <div class="proj-media-container">
        <img src="https://raw.githubusercontent.com/localhost-5555/${repo.name}/refs/heads/main/docs/img/interface1.png" 
             style="width: 100%; height: 150px; display: block; object-fit: cover;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        
        <div class="proj-fallback-cover" style="display: none;">
          ${makeCover(repo, idx)}
        </div>
      </div>   
      
      <div class="proj-body">
        <div class="proj-num">// ${String(idx + 1).padStart(2, '0')}</div>
        <div class="proj-title">${repo.name}</div>
        <p class="proj-desc">${desc}</p>
        ${stackHtml}
        ${topicsHtml}
        <div class="proj-meta">
          <div class="proj-left">
            ${starsHtml}
          </div>
        </div>
      </div>
    </a>`;
}

// ─── Skeleton loaders ───
function showSkeletons(n = 6) {
  const grid = document.getElementById('proj-grid');
  grid.innerHTML = Array.from({ length: n }, () => `
    <div class="proj-skeleton">
      <div class="skel-img"></div>
      <div class="skel-body">
        <div class="skel-line w-40"></div>
        <div class="skel-line w-70"></div>
        <div class="skel-line w-90"></div>
        <div class="skel-line w-80"></div>
      </div>
    </div>`).join('');
}

// ─── Fetch & cache ───
let reposCache = null;
let reposPromise = null;

function fetchRepos() {
  if (reposCache) return Promise.resolve(reposCache);
  if (reposPromise) return reposPromise;

  reposPromise = fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`,
    { headers: { Accept: 'application/vnd.github+json' } }
  )
    .then(res => {
      if (!res.ok) {
        const msg = res.status === 404
          ? t('proj.userNotFound')(GITHUB_USERNAME)
          : res.status === 403
            ? t('proj.rateLimit')
            : t('proj.apiError')(res.status);
        throw new Error(msg);
      }
      return res.json();
    })
    .then(repos => {
      // filter out forks (optional — remove if you want forks included)
      const filtered = repos.filter(r => !r.fork);
      reposCache = filtered;
      reposPromise = null;
      return filtered;
    })
    .catch(err => {
      reposPromise = null;
      throw err;
    });

  return reposPromise;
}

// ─── Render modal grid ───
async function loadRepos() {
  const grid  = document.getElementById('proj-grid');
  const count = document.getElementById('dialog-count');

  showSkeletons(6);

  try {
    const repos = await fetchRepos();
    grid.innerHTML = repos.map((r, i) => makeCard(r, i)).join('');
    count.textContent = t('proj.repoCount')(repos.length);
    return repos;

  } catch (err) {
    grid.innerHTML = `
      <div class="proj-error">
        <span class="err-icon">⚠</span>
        <span>${err.message}</span>
        <code>GET api.github.com/users/${GITHUB_USERNAME}/repos</code>
        <button onclick="reposCache=null;loadRepos()"
                style="margin-top:8px;padding:6px 14px;font-family:var(--mono);font-size:11px;
                       color:var(--blue);background:rgba(122,162,247,0.08);border:1px solid rgba(122,162,247,0.3);
                       border-radius:4px;cursor:pointer;">
          ${t('proj.retry')}
        </button>
      </div>`;
    count.textContent = '';
    return [];
  }
}

// ─── Render projects tape (below the Stack tape) ───
async function loadTape(n = 4) {
  const tape = document.getElementById('proj-tape');
  if (!tape) return;

  tape.innerHTML = Array.from({ length: n }, () => `
    <div class="proj-skeleton">
      <div class="skel-img"></div>
      <div class="skel-body">
        <div class="skel-line w-40"></div>
        <div class="skel-line w-70"></div>
        <div class="skel-line w-90"></div>
      </div>
    </div>`).join('');

  try {
    const repos = await fetchRepos();
    const subset = repos.slice(0, n);
    tape.innerHTML = subset.map((r, i) => makeCard(r, i)).join('');
    requestAnimationFrame(() => {
      tape.querySelectorAll('.proj-card').forEach((c, i) => {
        setTimeout(() => c.classList.add('visible'), 60 + i * 55);
      });
    });
  } catch (err) {
    tape.innerHTML = '';
  }
}

// ─── Dialog open/close ───
const projOpenBtns = document.querySelectorAll('.proj-open-btn');
const overlay  = document.getElementById('dialog-overlay');
const dialog   = document.getElementById('dialog');
const closeBtn = document.getElementById('dialog-close');

function staggerCards() {
  const cards = document.querySelectorAll('.proj-card');
  cards.forEach((c, i) => {
    c.classList.remove('visible');
    setTimeout(() => c.classList.add('visible'), 60 + i * 55);
  });
}

async function openDialog() {
  overlay.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();

  await loadRepos();
  staggerCards();
}

function closeDialog() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  projOpenBtns[0]?.focus();
}

projOpenBtns.forEach(btn => btn.addEventListener('click', openDialog));
closeBtn.addEventListener('click', closeDialog);
overlay.addEventListener('click', e => { if (e.target === overlay) closeDialog(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeDialog();
});
dialog.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = dialog.querySelectorAll('button, a, [tabindex="0"]');
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// ─── Theme logic ───
const root = document.documentElement;
const opts = {
  auto:  document.getElementById('opt-auto'),
  dark:  document.getElementById('opt-dark'),
  light: document.getElementById('opt-light'),
};

function resolvedTheme(pref) {
  if (pref === 'light' || pref === 'dark') return pref;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(pref) {
  // pref: 'auto' | 'dark' | 'light'
  const theme = resolvedTheme(pref === 'auto' ? null : pref);
  root.setAttribute('data-theme', theme);

  Object.entries(opts).forEach(([key, btn]) => {
    btn.classList.toggle('active', key === pref);
  });
}

function currentPref() {
  return localStorage.getItem('theme-pref') || 'auto';
}

applyTheme(currentPref());

Object.entries(opts).forEach(([pref, btn]) => {
  btn.addEventListener('click', () => {
    localStorage.setItem('theme-pref', pref);
    applyTheme(pref);
  });
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (currentPref() === 'auto') applyTheme('auto');
});

const words = [];

// ─── Language logic ───
const langOpts = {
  en: document.getElementById('opt-lang-en'),
  es: document.getElementById('opt-lang-es'),
};

Object.entries(langOpts).forEach(([lang, btn]) => {
  btn.addEventListener('click', () => {
    localStorage.setItem('lang-pref', lang);
    applyLang(lang);
  });
});

applyLang(currentLang());

let i = 0;
let timer;

function typingEffect() {
    let word = words[i].split("");
    var loopTyping = function() {
        if (word.length > 0) {
            document.getElementById('terminal-text').innerHTML += word.shift();
        } else {
            // Wait 2 seconds before starting to erase
            setTimeout(deletingEffect, 2000);
            return false;
        }
        timer = setTimeout(loopTyping, 30); // Typing speed (100ms per letter)
    };
    loopTyping();
}

function deletingEffect() {
    let word = words[i].split("");
    var loopDeleting = function() {
        if (word.length > 0) {
            word.pop();
            document.getElementById('terminal-text').innerHTML = word.join("");
        } else {
            // Move to the next word in the array
            if (words.length > (i + 1)) {
                i++;
            } else {
                i = 0; // Reset to the first word if we reach the end
            }
            // Wait 0.5 seconds before typing the next word
            setTimeout(typingEffect, 500);
            return false;
        }
        timer = setTimeout(loopDeleting, 20); // Erasing speed (faster than typing)
    };
    loopDeleting();
}


// Kick off the animations when the page loads
document.addEventListener("DOMContentLoaded", () => {
  typingEffect();
});