const CK_FORM_ID = '8495408';
const POSTS_PER_PAGE = 9;

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function stripHtml(html) { const t = document.createElement('div'); t.innerHTML = html; return t.textContent || ''; }
function truncate(str, len = 140) { const c = stripHtml(str); return c.length > len ? c.slice(0, len).trim() + '…' : c; }

/* ── API (via Netlify serverless proxy — no CORS issues) ── */
async function fetchBroadcasts(page = 1) {
  try {
    const res = await fetch(`/api/posts?page=${page}&limit=${POSTS_PER_PAGE}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (e) { console.error('fetchBroadcasts error:', e); return null; }
}

async function fetchBroadcast(id) {
  try {
    const res = await fetch(`/api/post?id=${id}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (e) { console.error('fetchBroadcast error:', e); return null; }
}

/* ── ARTICLE CARD ── */
function createArticleCard(b) {
  const card = document.createElement('div');
  card.className = 'article-card fade-up';
  const thumb = b.thumbnail_url
    ? `<img class="article-card-thumb" src="${b.thumbnail_url}" alt="${b.subject}" loading="lazy">`
    : `<div class="article-card-thumb-placeholder">✦</div>`;
  card.innerHTML = `
    ${thumb}
    <div class="article-card-body">
      <div class="article-card-date">${formatDate(b.published_at || b.created_at)}</div>
      <div class="article-card-title">${b.subject}</div>
      <div class="article-card-excerpt">${truncate(b.description || b.preview_text || '')}</div>
    </div>
    <div class="article-card-footer"><span class="read-more">Read article →</span></div>`;
  card.addEventListener('click', () => { window.location.href = `article.html?id=${b.id}`; });
  return card;
}

/* ── HOME ARTICLES ── */
async function loadHomeArticles() {
  const grid = document.getElementById('home-articles-grid');
  if (!grid) return;
  grid.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading articles…</p></div>`;
  const data = await fetchBroadcasts(1);
  if (!data || !data.broadcasts?.length) {
    grid.innerHTML = `<div class="error-state"><p>Couldn't load articles right now.</p></div>`; return;
  }
  grid.innerHTML = '';
  data.broadcasts.slice(0, 3).forEach((b, i) => {
    const card = createArticleCard(b);
    card.style.transitionDelay = `${i * 0.1}s`;
    grid.appendChild(card);
  });
  observeFadeUps();
}

/* ── BLOG PAGE ── */
let currentPage = 1, totalPages = 1;
async function loadBlogPage(page = 1) {
  const grid = document.getElementById('blog-grid');
  const pagination = document.getElementById('pagination');
  if (!grid) return;
  grid.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading articles…</p></div>`;
  const data = await fetchBroadcasts(page);
  if (!data || !data.broadcasts?.length) {
    grid.innerHTML = `<div class="error-state"><p>No articles found.</p></div>`; return;
  }
  totalPages = data.total_pages || 1;
  currentPage = page;
  grid.innerHTML = '';
  data.broadcasts.forEach((b, i) => {
    const card = createArticleCard(b);
    card.style.transitionDelay = `${i * 0.05}s`;
    grid.appendChild(card);
  });
  if (pagination) renderPagination(pagination);
  observeFadeUps();
}

function renderPagination(container) {
  container.innerHTML = '';
  if (totalPages <= 1) return;
  const prev = document.createElement('button');
  prev.className = 'page-btn'; prev.innerHTML = '←'; prev.disabled = currentPage === 1;
  prev.onclick = () => loadBlogPage(currentPage - 1); container.appendChild(prev);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`; btn.textContent = i;
    btn.onclick = () => loadBlogPage(i); container.appendChild(btn);
  }
  const next = document.createElement('button');
  next.className = 'page-btn'; next.innerHTML = '→'; next.disabled = currentPage === totalPages;
  next.onclick = () => loadBlogPage(currentPage + 1); container.appendChild(next);
}

/* ── ARTICLE PAGE ── */
async function loadArticle() {
  const container = document.getElementById('article-content');
  if (!container) return;
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = 'blog.html'; return; }
  container.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading…</p></div>`;
  const data = await fetchBroadcast(id);
  if (!data?.broadcast) {
    container.innerHTML = `<div class="error-state"><p>Article not found. <a href="blog.html" style="color:var(--accent)">Back to blog</a></p></div>`; return;
  }
  const b = data.broadcast;
  document.title = `${b.subject} — Motheo Masole`;
  container.innerHTML = `
    <a href="blog.html" class="article-page-back">← Back to articles</a>
    <div class="article-page-date">${formatDate(b.published_at || b.created_at)}</div>
    <h1>${b.subject}</h1>
    <div class="article-divider"></div>
    <div class="article-body">${b.content || b.html_body || '<p>Content unavailable.</p>'}</div>`;
}

/* ── NEWSLETTER FORMS ── */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const btn = form.querySelector('.btn-primary');
      const successMsg = form.parentElement.querySelector('.newsletter-success');
      const email = input.value.trim();
      if (!email) return;
      btn.textContent = 'Subscribing…'; btn.disabled = true;
      try {
        const res = await fetch(`https://app.convertkit.com/forms/${CK_FORM_ID}/subscriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `email_address=${encodeURIComponent(email)}`
        });
        btn.textContent = '✓ You\'re in!'; input.value = '';
        if (successMsg) successMsg.style.display = 'block';
      } catch {
        window.open(`https://app.convertkit.com/landing_pages/${CK_FORM_ID}`, '_blank');
        btn.textContent = '✓ Check new tab!'; input.value = '';
      }
    });
  });
}

/* ── SCROLL ANIMATIONS ── */
function observeFadeUps() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer.observe(el));
}

/* ── SCROLL IMAGE FADE & PARALLAX ── */
function initScrollImageEffects() {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        const rect = e.target.getBoundingClientRect();
        if (rect.top > 0) e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.scroll-fade').forEach(el => fadeObserver.observe(el));

  // Parallax on scroll for key images
  const heroImg = document.querySelector('.hero-image-wrap img');
  const whyImg = document.querySelector('.why-image-wrap img');
  const aboutImg = document.querySelector('.about-image-wrap img');

  if (heroImg || whyImg || aboutImg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (heroImg) {
            const rect = heroImg.closest('.hero')?.getBoundingClientRect();
            if (rect) {
              const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.6)));
              heroImg.style.opacity = 1 - progress * 0.5;
              heroImg.style.transform = `translateY(${progress * 20}px) scale(${1 - progress * 0.03})`;
            }
          }
          if (whyImg) {
            const rect = whyImg.closest('.why-section')?.getBoundingClientRect();
            if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
              const p = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
              whyImg.style.transform = `translateY(${(p - 0.5) * -30}px)`;
            }
          }
          if (aboutImg) {
            const rect = aboutImg.closest('.about-image-wrap')?.getBoundingClientRect();
            if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
              const p = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
              aboutImg.style.transform = `translateY(${(p - 0.5) * -25}px)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

/* ── MOBILE NAV ── */
function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!hamburger || !links) return;
  hamburger.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !links.contains(e.target)) links.classList.remove('open');
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initNewsletterForms();
  observeFadeUps();
  initScrollImageEffects();
  const page = document.body.dataset.page;
  if (page === 'home') loadHomeArticles();
  if (page === 'blog') loadBlogPage(1);
  if (page === 'article') loadArticle();
});
