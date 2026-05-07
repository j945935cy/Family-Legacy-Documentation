/* ===== UTILS ===== */

function estimateReadTime(story) {
  const text = [
    story.scene, story.characters, story.conflict,
    story.plot, story.sensory, story.dialogue,
    story.resolution, story.lesson
  ].join(' ');
  return Math.max(2, Math.round(text.length / 260));
}

function storyHookText(story) {
  const source = story.scene || story.summary || '';
  const sentence = source.split('。')[0].trim();
  return sentence ? `${sentence}。` : '';
}

function spotlightQuote(story) {
  const raw = story.dialogue || '';
  const match = raw.match(/「([^」]{8,40})」/);
  if (match) return match[1];
  return raw.slice(0, 36).replace(/[。！？]$/, '');
}

function heroNarrative(person, firstStory) {
  return `${person.name}從台南市場旁的一間小店開始，把一家人的未來一點一點撐起來。這不是突然翻身的故事，而是把每一天的選擇、每一次修正、每一句留下來的話，慢慢活成一個家庭的底氣。`;
}

function fallbackImageOnError(fallback) {
  if (!fallback) {
    return "this.style.display='none'";
  }
  return `if(this.src.indexOf('${fallback.split('/').pop()}')===-1){this.src='../${fallback}';}else{this.style.display='none';}`;
}

function aStoryCard(story, expanded) {
  return `
    <div class="a-card" id="story-${story.id}">
      <div class="a-card-media">
        <img class="a-card-img" src="../${story.image}" alt="${story.title}" loading="lazy" onerror="this.style.display='none'"/>
        <div class="a-card-overlay">
          <span class="a-story-kicker">家族故事</span>
          <span class="a-story-readtime">約 ${estimateReadTime(story)} 分鐘</span>
        </div>
      </div>
      <div class="a-card-body">
        <div class="a-card-meta">
          <span>${story.year}</span>
          <span>${story.location}</span>
          <span>${story.people.join('、')}</span>
        </div>
        <h3 class="a-card-title">${story.title}</h3>
        <p class="a-story-hook">${storyHookText(story)}</p>
        <p class="a-card-summary">${story.summary}</p>
      </div>
      <div class="a-card-footer">
        <button class="a-btn a-btn-sm a-btn-outline toggle-story" data-id="${story.id}">展開閱讀</button>
      </div>
      <div class="a-story-expand" id="expand-${story.id}">
        ${aStoryFull(story)}
      </div>
    </div>
  `;
}

function aStoryFull(story) {
  return `
    <div class="a-story-lead-block">
      <p class="a-story-lead">${story.summary}</p>
      <div class="a-story-pills">
        <span class="a-story-pill">${story.year}</span>
        <span class="a-story-pill">${story.location}</span>
        <span class="a-story-pill">${story.people.join('、')}</span>
      </div>
    </div>
    <div class="a-story-section"><h4>場景</h4><p>${story.scene}</p></div>
    <div class="a-story-section"><h4>人物</h4><p>${story.characters}</p></div>
    <div class="a-story-section"><h4>衝突</h4><p>${story.conflict}</p></div>
    <div class="a-story-section"><h4>情節發展</h4><p>${story.plot}</p></div>
    <div class="a-story-section"><h4>感官細節</h4><p>${story.sensory}</p></div>
    <div class="a-story-section"><h4>對話</h4><p class="a-story-dialogue">${story.dialogue}</p></div>
    <div class="a-story-section"><h4>結局與啟示</h4><p>${story.resolution}</p><div class="a-story-lesson">${story.lesson}</div></div>
  `;
}

/* ===== NAVBAR HAMBURGER ===== */
function initHamburger() {
  const btn = document.querySelector('.a-hamburger');
  const links = document.querySelector('.a-navbar-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.setAttribute('aria-expanded', links.classList.contains('open'));
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

/* ===== ACTIVE NAV LINK ===== */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.a-navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('a-back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===== STORY TOGGLE ===== */
function initStoryToggles() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-story');
    if (!btn) return;
    const id = btn.dataset.id;
    const expand = document.getElementById(`expand-${id}`);
    if (!expand) return;
    const isOpen = expand.classList.toggle('open');
    btn.textContent = isOpen ? '收合閱讀' : '展開閱讀';
  });
}

/* ===== INDEX PAGE ===== */
function renderIndex() {
  const person = familyPeople[0];
  const firstStory = familyStories[0];

  const heroNarrativeEl = document.getElementById('a-hero-narrative');
  if (heroNarrativeEl && person && firstStory) {
    heroNarrativeEl.textContent = heroNarrative(person, firstStory);
  }

  const heroQuoteEl = document.getElementById('a-hero-quote');
  if (heroQuoteEl && person) {
    heroQuoteEl.innerHTML = `
      <div class="a-hero-quote-label">一句留下來的話</div>
      <div class="a-hero-quote-text">「${person.quote}」</div>
      <div class="a-hero-quote-source">${person.name}・${person.role}</div>
    `;
  }

  const heroStatsEl = document.getElementById('a-hero-stats');
  if (heroStatsEl) {
    heroStatsEl.innerHTML = `
      <div class="a-hero-stat">
        <span class="a-hero-stat-number">${familyStories.length}</span>
        <span class="a-hero-stat-label">篇關鍵故事</span>
      </div>
      <div class="a-hero-stat">
        <span class="a-hero-stat-number">${familyTimeline.length}</span>
        <span class="a-hero-stat-label">個人生節點</span>
      </div>
      <div class="a-hero-stat">
        <span class="a-hero-stat-number">${familyValues.length}</span>
        <span class="a-hero-stat-label">項家族價值</span>
      </div>
    `;
  }

  // Featured person
  const personEl = document.getElementById('a-featured-person');
  if (personEl && familyPeople.length) {
    const p = familyPeople[0];
    personEl.innerHTML = `
      <div class="a-featured-person">
        <img src="../${p.image}" alt="${p.name}" class="a-featured-person-photo" onerror="this.style.display='none'"/>
        <div>
          <div class="a-featured-person-name">${p.name}</div>
          <div class="a-featured-person-role">${p.role}・${p.location}・${p.birthYear} 年生</div>
          <div class="a-featured-person-quote">「${p.quote}」</div>
        </div>
      </div>
    `;
  }

  // Featured stories (first 3)
  const storiesEl = document.getElementById('a-featured-stories');
  if (storiesEl) {
    storiesEl.innerHTML = `<div class="a-cards-grid">
      ${familyStories.slice(0, 3).map(s => aStoryCard(s, false)).join('')}
    </div>`;
  }

  // Featured values (first 4)
  const valuesEl = document.getElementById('a-featured-values');
  if (valuesEl) {
    valuesEl.innerHTML = familyValues.slice(0, 4).map(v => `
      <div class="a-value-card">
        <div class="a-value-title">${v.title}</div>
        <div class="a-value-desc">${v.description}</div>
      </div>
    `).join('');
  }
}

/* ===== STORIES PAGE ===== */
function renderStories() {
  const el = document.getElementById('a-stories-list');
  if (!el) return;
  const intro = familyStories[0];
  el.innerHTML = `
  <div class="a-story-spotlight">
    <div>
      <div class="a-story-spotlight-label">本頁導讀</div>
      <h2 class="a-story-spotlight-title">從一盞燈、一張飯桌，到一本帳本</h2>
      <p class="a-story-spotlight-text">這些故事不是傳記摘要，而是林志遠如何在壓力裡做選擇、在不確定裡守住方向的過程。建議從第一篇開始讀，會更看得見這個家庭怎麼一步一步站穩。</p>
    </div>
    <blockquote class="a-story-spotlight-quote">「${spotlightQuote(intro)}」</blockquote>
  </div>
  <div class="a-cards-grid">
    ${familyStories.map(s => aStoryCard(s, false)).join('')}
  </div>`;
}

/* ===== PEOPLE PAGE ===== */
function renderPeople() {
  const el = document.getElementById('a-people-list');
  if (!el) return;
  el.innerHTML = familyPeople.map(p => {
    const related = familyStories.filter(s => s.people.includes(p.name));
    return `
      <div class="a-person-card">
        <div class="a-person-header">
          <img src="../${p.image}" alt="${p.name}" class="a-avatar" onerror="this.style.display='none'"/>
          <div>
            <div class="a-person-name">${p.name}</div>
            <div class="a-person-english">${p.englishName}</div>
            <div class="a-person-tags">
              <span class="a-tag">${p.birthYear} 年生</span>
              <span class="a-tag">${p.location}</span>
              <span class="a-tag">${p.role}</span>
            </div>
          </div>
        </div>
        <blockquote class="a-person-quote">「${p.quote}」</blockquote>
        <p class="a-person-desc">${p.description}</p>
        ${related.length ? `
          <div class="a-person-related-label">相關故事</div>
          <div class="a-cards-grid">
            ${related.map(s => aStoryCard(s, false)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/* ===== TIMELINE PAGE ===== */
function renderTimeline() {
  const el = document.getElementById('a-timeline-list');
  if (!el) return;
  el.innerHTML = `<div class="a-timeline">
    ${familyTimeline.map(t => `
      <div class="a-timeline-item">
        <div class="a-timeline-year-col">
          <span class="a-timeline-year">${t.year}</span>
        </div>
        <div class="a-timeline-dot"></div>
        <div class="a-timeline-content">
          <div class="a-timeline-title">${t.title}</div>
          <div class="a-timeline-location">${t.location}</div>
          <div class="a-timeline-desc">${t.description}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ===== VALUES PAGE ===== */
function renderValues() {
  const el = document.getElementById('a-values-list');
  if (!el) return;
  el.innerHTML = familyValues.map(v => `
    <div class="a-value-card">
      <div class="a-value-title">${v.title}</div>
      <div class="a-value-desc">${v.description}</div>
    </div>
  `).join('');
}

/* ===== GALLERY PAGE ===== */
function renderGallery() {
  const el = document.getElementById('a-gallery-grid');
  if (!el) return;
  el.innerHTML = `<div class="a-gallery-grid">
    ${familyGallery.map(g => `
      <div class="a-gallery-item">
        <img class="a-gallery-img" src="../${g.image}" alt="${g.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'a-gallery-placeholder\\'></div>'"/>
        <div class="a-gallery-caption">
          <h3>${g.title}</h3>
          <p>${g.description}</p>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  setActiveNav();
  initBackToTop();
  initStoryToggles();

  renderIndex();
  renderStories();
  renderPeople();
  renderTimeline();
  renderValues();
  renderGallery();
});
