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

function dStoryCard(story, expanded) {
  return `
    <div class="d-card" id="story-${story.id}">
      <div class="d-card-media">
        <img class="d-card-img" src="../${story.image}" alt="${story.title}" loading="lazy" onerror="this.style.display='none'"/>
        <div class="d-card-overlay">
          <span class="d-story-kicker">家族故事</span>
          <span class="d-story-readtime">約 ${estimateReadTime(story)} 分鐘閱讀</span>
        </div>
      </div>
      <div class="d-card-body">
        <div class="d-card-meta">
          <span>📅 ${story.year}</span>
          <span>📍 ${story.location}</span>
          <span>👤 ${story.people.join('、')}</span>
        </div>
        <h3 class="d-card-title">${story.title}</h3>
        <p class="d-story-hook">${storyHookText(story)}</p>
        <p class="d-card-summary">${story.summary}</p>
      </div>
      <div class="d-card-footer">
        <button class="d-btn d-btn-sm d-btn-primary toggle-story" data-id="${story.id}">展開閱讀</button>
      </div>
      <div class="d-story-expand" id="expand-${story.id}">
        ${dStoryFull(story)}
      </div>
    </div>
  `;
}

function dStoryFull(story) {
  return `
    <div class="d-story-lead-block">
      <p class="d-story-lead">${story.summary}</p>
      <div class="d-story-pills">
        <span class="d-story-pill">${story.year}</span>
        <span class="d-story-pill">${story.location}</span>
        <span class="d-story-pill">${story.people.join('、')}</span>
      </div>
    </div>
    <div class="d-story-section"><h4>場景</h4><p>${story.scene}</p></div>
    <div class="d-story-section"><h4>人物</h4><p>${story.characters}</p></div>
    <div class="d-story-section"><h4>衝突</h4><p>${story.conflict}</p></div>
    <div class="d-story-section"><h4>情節發展</h4><p>${story.plot}</p></div>
    <div class="d-story-section"><h4>感官細節</h4><p>${story.sensory}</p></div>
    <div class="d-story-section"><h4>對話</h4><p class="d-story-dialogue">${story.dialogue}</p></div>
    <div class="d-story-section"><h4>結局與啟示</h4><p>${story.resolution}</p><div class="d-story-lesson">${story.lesson}</div></div>
  `;
}

/* ===== NAVBAR HAMBURGER ===== */
function initHamburger() {
  const btn = document.querySelector('.d-hamburger');
  const links = document.querySelector('.d-navbar-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', links.classList.contains('open'));
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
    });
  });
}

/* ===== ACTIVE NAV LINK ===== */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.d-navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('d-back-to-top');
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

  const heroNarrativeEl = document.getElementById('d-hero-narrative');
  if (heroNarrativeEl && person && firstStory) {
    heroNarrativeEl.textContent = heroNarrative(person, firstStory);
  }

  const heroQuoteEl = document.getElementById('d-hero-quote-panel');
  if (heroQuoteEl && person) {
    heroQuoteEl.innerHTML = `
      <div class="d-hero-quote-label">一句留下來的話</div>
      <div class="d-hero-quote-text">「${person.quote}」</div>
      <div class="d-hero-quote-source">${person.name}・${person.role}</div>
    `;
  }

  const heroSceneEl = document.getElementById('d-hero-scene-card');
  if (heroSceneEl && firstStory) {
    heroSceneEl.innerHTML = `
      <img src="../${firstStory.image}" alt="${firstStory.title}" class="d-hero-scene-image" loading="lazy" onerror="this.style.display='none'"/>
      <div class="d-hero-scene-label">故事開場</div>
      <h2 class="d-hero-scene-title">${firstStory.title}</h2>
      <p class="d-hero-scene-text">${firstStory.scene}</p>
      <a href="stories.html#story-${firstStory.id}" class="d-hero-scene-link">從第一篇開始閱讀 →</a>
    `;
  }

  const heroStatsEl = document.getElementById('d-hero-stats');
  if (heroStatsEl) {
    heroStatsEl.innerHTML = `
      <div class="d-hero-stat">
        <span class="d-hero-stat-number">${familyStories.length}</span>
        <span class="d-hero-stat-label">篇關鍵故事</span>
      </div>
      <div class="d-hero-stat">
        <span class="d-hero-stat-number">${familyTimeline.length}</span>
        <span class="d-hero-stat-label">個人生節點</span>
      </div>
      <div class="d-hero-stat">
        <span class="d-hero-stat-number">${familyValues.length}</span>
        <span class="d-hero-stat-label">項家族價值</span>
      </div>
    `;
  }

  // Featured person
  const personEl = document.getElementById('d-featured-person');
  if (personEl && familyPeople.length) {
    const p = familyPeople[0];
    personEl.innerHTML = `
      <div class="d-featured-person">
        <img src="../${p.image}" alt="${p.name}" class="d-featured-person-photo" onerror="this.style.display='none'"/>
        <div>
          <div class="d-featured-person-name">${p.name}</div>
          <div class="d-featured-person-role">${p.role}・${p.location}・${p.birthYear} 年生</div>
          <div class="d-featured-person-quote">「${p.quote}」</div>
        </div>
      </div>
    `;
  }

  // Featured stories (first 3)
  const storiesEl = document.getElementById('d-featured-stories');
  if (storiesEl) {
    storiesEl.innerHTML = `<div class="d-cards-grid">
      ${familyStories.slice(0, 3).map(s => dStoryCard(s, false)).join('')}
    </div>`;
  }

  // Featured values (first 4)
  const valuesEl = document.getElementById('d-featured-values');
  if (valuesEl) {
    valuesEl.innerHTML = familyValues.slice(0, 4).map(v => `
      <div class="d-value-card">
        <div class="d-value-title">${v.title}</div>
        <div class="d-value-desc">${v.description}</div>
      </div>
    `).join('');
  }
}

/* ===== STORIES PAGE ===== */
function renderStories() {
  const el = document.getElementById('d-stories-list');
  if (!el) return;
  const intro = familyStories[0];
  el.innerHTML = `
  <div class="d-story-spotlight">
    <div>
      <div class="d-story-spotlight-label">本頁導讀</div>
      <h2 class="d-story-spotlight-title">從一盞燈、一張飯桌，到一本帳本</h2>
      <p class="d-story-spotlight-text">這些故事不是傳記摘要，而是林志遠如何在壓力裡做選擇、在不確定裡守住方向的過程。建議從第一篇開始讀，會更看得見這個家庭怎麼一步一步站穩。</p>
    </div>
    <blockquote class="d-story-spotlight-quote">「${spotlightQuote(intro)}」</blockquote>
  </div>
  <div class="d-cards-grid">
    ${familyStories.map(s => dStoryCard(s, false)).join('')}
  </div>`;
}

/* ===== PEOPLE PAGE ===== */
function renderPeople() {
  const el = document.getElementById('d-people-list');
  if (!el) return;
  el.innerHTML = familyPeople.map(p => {
    const related = familyStories.filter(s => s.people.includes(p.name));
    return `
      <div class="d-person-card">
        <div class="d-person-header">
          <img src="../${p.image}" alt="${p.name}" class="d-avatar" onerror="this.style.display='none'"/>
          <div>
            <div class="d-person-name">${p.name}</div>
            <div class="d-person-english">${p.englishName}</div>
            <div class="d-person-tags">
              <span class="d-tag">${p.birthYear} 年生</span>
              <span class="d-tag">${p.location}</span>
              <span class="d-tag">${p.role}</span>
            </div>
          </div>
        </div>
        <blockquote class="d-person-quote">「${p.quote}」</blockquote>
        <p class="d-person-desc">${p.description}</p>
        ${related.length ? `
          <div class="d-person-related-label">相關故事</div>
          <div class="d-cards-grid">
            ${related.map(s => dStoryCard(s, false)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/* ===== TIMELINE PAGE ===== */
function renderTimeline() {
  const el = document.getElementById('d-timeline-list');
  if (!el) return;
  el.innerHTML = `<div class="d-timeline">
    ${familyTimeline.map(t => `
      <div class="d-timeline-item">
        <div class="d-timeline-year-col">
          <span class="d-timeline-year">${t.year}</span>
        </div>
        <div class="d-timeline-dot"></div>
        <div class="d-timeline-content">
          <div class="d-timeline-title">${t.title}</div>
          <div class="d-timeline-location">${t.location}</div>
          <div class="d-timeline-desc">${t.description}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ===== VALUES PAGE ===== */
function renderValues() {
  const el = document.getElementById('d-values-list');
  if (!el) return;
  el.innerHTML = familyValues.map(v => `
    <div class="d-value-card">
      <div class="d-value-title">${v.title}</div>
      <div class="d-value-desc">${v.description}</div>
    </div>
  `).join('');
}

/* ===== GALLERY PAGE ===== */
function renderGallery() {
  const el = document.getElementById('d-gallery-grid');
  if (!el) return;
  el.innerHTML = `<div class="d-gallery-grid">
    ${familyGallery.map(g => `
      <div class="d-gallery-item">
        <img class="d-gallery-img" src="../${g.image}" alt="${g.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'d-gallery-placeholder\\'></div>'"/>
        <div class="d-gallery-caption">
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
