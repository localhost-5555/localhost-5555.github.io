// ─── Config — change this to your real username ───
const GITHUB_USERNAME = 'localhost-5555';

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
  const desc = repo.description || 'No description provided.';
  const stars = repo.stargazers_count || 0;
  const topics = (repo.topics || []).slice(0, 3);

  const topicsHtml = topics.length
    ? `<div class="proj-topics">${topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}</div>`
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
    <div class="proj-card" data-idx="${idx}">
      ${makeCover(repo, idx)}
      <div class="proj-body">
        <div class="proj-num">// ${String(idx + 1).padStart(2, '0')}</div>
        <div class="proj-title">${repo.name}</div>
        <p class="proj-desc">${desc}</p>
        ${topicsHtml}
        <div class="proj-meta">
          <div class="proj-left">
            <span class="proj-lang">
              <span class="lang-dot" style="background:${langColor}"></span>${langName}
            </span>
            ${starsHtml}
          </div>
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="proj-link" aria-label="View ${repo.name} on GitHub">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>`;
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

// ─── Fetch & render ───
let reposCache = null;

async function loadRepos() {
  if (reposCache) return reposCache;

  const grid  = document.getElementById('proj-grid');
  const count = document.getElementById('dialog-count');

  showSkeletons(6);

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );

    if (!res.ok) {
      const msg = res.status === 404
        ? `User "${GITHUB_USERNAME}" not found.`
        : res.status === 403
          ? 'Rate limit reached (60 req/hr). Try again shortly.'
          : `GitHub API error: ${res.status}`;
      throw new Error(msg);
    }

    const repos = await res.json();
    // filter out forks (optional — remove if you want forks included)
    const filtered = repos.filter(r => !r.fork);

    reposCache = filtered;

    grid.innerHTML = filtered.map((r, i) => makeCard(r, i)).join('');
    count.textContent = `— ${filtered.length} repositories`;
    return filtered;

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
          retry
        </button>
      </div>`;
    count.textContent = '';
    return [];
  }
}

// ─── Dialog open/close ───
const projBtn  = document.getElementById('proj-btn');
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
  projBtn.focus();
}

projBtn.addEventListener('click', openDialog);
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

// ─── Skill bars ───
function animateCounter(el, target, duration) {
  const start = performance.now();
  (function step(now) {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(performance.now());
}

const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('tr').forEach((row, i) => {
      const pct   = parseInt(row.dataset.pct);
      const color = row.dataset.color;
      const fill  = row.querySelector('.bar-fill');
      const ctr   = row.querySelector('.pct-counter');
      if (!fill) return;
      fill.style.background = color;
      setTimeout(() => {
        fill.style.width = pct + '%';
        fill.classList.add('animating');
        if (ctr) animateCounter(ctr, pct, 900);
        setTimeout(() => fill.classList.remove('animating'), 1500);
      }, 150 + i * 100);
    });
    skillObs.unobserve(e.target);
  });
}, { threshold: 0.2 });

const sl = document.getElementById('skill-list');
if (sl) skillObs.observe(sl);

const words = ["code.", "build stuff.", "try new things.", "research."];
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

// Kick off the animation when the page loads
document.addEventListener("DOMContentLoaded", typingEffect);