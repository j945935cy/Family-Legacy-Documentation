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

function pStoryCard(story, expanded) {
  return `
    <div class="p-card" id="story-${story.id}">
      <div class="p-card-media">
        <img class="p-card-img" src="../${story.image}" alt="${story.title}" loading="lazy" onerror="this.style.display='none'"/>
        <div class="p-card-overlay">
          <span class="p-story-kicker">家族故事</span>
          <span class="p-story-readtime">約 ${estimateReadTime(story)} 分鐘閱讀</span>
        </div>
      </div>
      <div class="p-card-body">
        <div class="p-card-meta">
          <span>📅 ${story.year}</span>
          <span>📍 ${story.location}</span>
          <span>👤 ${story.people.join('、')}</span>
        </div>
        <h3 class="p-card-title">${story.title}</h3>
        <p class="p-story-hook">${storyHookText(story)}</p>
        <p class="p-card-summary">${story.summary}</p>
      </div>
      <div class="p-card-footer">
        <button class="p-btn p-btn-sm p-btn-primary toggle-story" data-id="${story.id}">展開閱讀</button>
      </div>
      <div class="p-story-expand" id="expand-${story.id}">
        ${pStoryFull(story)}
      </div>
    </div>
  `;
}

function pStoryFull(story) {
  return `
    <div class="p-story-lead-block">
      <p class="p-story-lead">${story.summary}</p>
      <div class="p-story-pills">
        <span class="p-story-pill">${story.year}</span>
        <span class="p-story-pill">${story.location}</span>
        <span class="p-story-pill">${story.people.join('、')}</span>
      </div>
    </div>
    <div class="p-story-section"><h4>場景</h4><p>${story.scene}</p></div>
    <div class="p-story-section"><h4>人物</h4><p>${story.characters}</p></div>
    <div class="p-story-section"><h4>衝突</h4><p>${story.conflict}</p></div>
    <div class="p-story-section"><h4>情節發展</h4><p>${story.plot}</p></div>
    <div class="p-story-section"><h4>感官細節</h4><p>${story.sensory}</p></div>
    <div class="p-story-section"><h4>對話</h4><p class="p-story-dialogue">${story.dialogue}</p></div>
    <div class="p-story-section"><h4>結局與啟示</h4><p>${story.resolution}</p><div class="p-story-lesson">${story.lesson}</div></div>
  `;
}

/* ===== NAVBAR HAMBURGER ===== */
function initHamburger() {
  const btn = document.querySelector('.p-hamburger');
  const links = document.querySelector('.p-navbar-links');
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
  document.querySelectorAll('.p-navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('p-back-to-top');
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

  const heroNarrativeEl = document.getElementById('p-hero-narrative');
  if (heroNarrativeEl && person && firstStory) {
    heroNarrativeEl.textContent = heroNarrative(person, firstStory);
  }

  const heroQuoteEl = document.getElementById('p-hero-quote-panel');
  if (heroQuoteEl && person) {
    heroQuoteEl.innerHTML = `
      <div class="p-hero-quote-label">一句留下來的話</div>
      <div class="p-hero-quote-text">「${person.quote}」</div>
      <div class="p-hero-quote-source">${person.name}・${person.role}</div>
    `;
  }

  const heroSceneEl = document.getElementById('p-hero-scene-card');
  if (heroSceneEl && firstStory) {
    heroSceneEl.innerHTML = `
      <img src="../${firstStory.image}" alt="${firstStory.title}" class="p-hero-scene-image" loading="lazy" onerror="this.style.display='none'"/>
      <div class="p-hero-scene-label">故事開場</div>
      <h2 class="p-hero-scene-title">${firstStory.title}</h2>
      <p class="p-hero-scene-text">${firstStory.scene}</p>
      <a href="stories.html#story-${firstStory.id}" class="p-hero-scene-link">從第一篇開始閱讀 →</a>
    `;
  }

  const heroStatsEl = document.getElementById('p-hero-stats');
  if (heroStatsEl) {
    heroStatsEl.innerHTML = `
      <div class="p-hero-stat">
        <span class="p-hero-stat-number">${familyStories.length}</span>
        <span class="p-hero-stat-label">篇關鍵故事</span>
      </div>
      <div class="p-hero-stat">
        <span class="p-hero-stat-number">${familyTimeline.length}</span>
        <span class="p-hero-stat-label">個人生節點</span>
      </div>
      <div class="p-hero-stat">
        <span class="p-hero-stat-number">${familyValues.length}</span>
        <span class="p-hero-stat-label">項家族價值</span>
      </div>
    `;
  }

  // Featured person
  const personEl = document.getElementById('p-featured-person');
  if (personEl && familyPeople.length) {
    const p = familyPeople[0];
    personEl.innerHTML = `
      <div class="p-featured-person">
        <img src="../${p.image}" alt="${p.name}" class="p-featured-person-photo" onerror="this.style.display='none'"/>
        <div>
          <div class="p-featured-person-name">${p.name}</div>
          <div class="p-featured-person-role">${p.role}・${p.location}・${p.birthYear} 年生</div>
          <div class="p-featured-person-quote">「${p.quote}」</div>
        </div>
      </div>
    `;
  }

  // Featured stories (first 3)
  const storiesEl = document.getElementById('p-featured-stories');
  if (storiesEl) {
    storiesEl.innerHTML = `<div class="p-cards-grid">
      ${familyStories.slice(0, 3).map(s => pStoryCard(s, false)).join('')}
    </div>`;
  }

  // Featured values (first 4)
  const valuesEl = document.getElementById('p-featured-values');
  if (valuesEl) {
    valuesEl.innerHTML = familyValues.slice(0, 4).map(v => `
      <div class="p-value-card">
        <div class="p-value-title">${v.title}</div>
        <div class="p-value-desc">${v.description}</div>
      </div>
    `).join('');
  }
}

/* ===== STORIES PAGE ===== */
function renderStories() {
  const el = document.getElementById('p-stories-list');
  if (!el) return;
  const intro = familyStories[0];
  el.innerHTML = `
  <div class="p-story-spotlight">
    <div>
      <div class="p-story-spotlight-label">本頁導讀</div>
      <h2 class="p-story-spotlight-title">從一盞燈、一張飯桌，到一本帳本</h2>
      <p class="p-story-spotlight-text">這些故事不是傳記摘要，而是林志遠如何在壓力裡做選擇、在不確定裡守住方向的過程。建議從第一篇開始讀，會更看得見這個家庭怎麼一步一步站穩。</p>
    </div>
    <blockquote class="p-story-spotlight-quote">「${spotlightQuote(intro)}」</blockquote>
  </div>
  <div class="p-cards-grid">
    ${familyStories.map(s => pStoryCard(s, false)).join('')}
  </div>`;
}

/* ===== PEOPLE PAGE ===== */
function renderPeople() {
  const el = document.getElementById('p-people-list');
  if (!el) return;
  el.innerHTML = familyPeople.map(p => {
    const related = familyStories.filter(s => s.people.includes(p.name));
    return `
      <div class="p-person-card">
        <div class="p-person-header">
          <img src="../${p.image}" alt="${p.name}" class="p-avatar" onerror="this.style.display='none'"/>
          <div>
            <div class="p-person-name">${p.name}</div>
            <div class="p-person-english">${p.englishName}</div>
            <div class="p-person-tags">
              <span class="p-tag">${p.birthYear} 年生</span>
              <span class="p-tag">${p.location}</span>
              <span class="p-tag">${p.role}</span>
            </div>
          </div>
        </div>
        <blockquote class="p-person-quote">「${p.quote}」</blockquote>
        <p class="p-person-desc">${p.description}</p>
        ${related.length ? `
          <div class="p-person-related-label">相關故事</div>
          <div class="p-cards-grid">
            ${related.map(s => pStoryCard(s, false)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/* ===== TIMELINE PAGE ===== */
function renderTimeline() {
  const el = document.getElementById('p-timeline-list');
  if (!el) return;
  el.innerHTML = `<div class="p-timeline">
    ${familyTimeline.map(t => `
      <div class="p-timeline-item">
        <div class="p-timeline-year-col">
          <span class="p-timeline-year">${t.year}</span>
        </div>
        <div class="p-timeline-dot"></div>
        <div class="p-timeline-content">
          <div class="p-timeline-title">${t.title}</div>
          <div class="p-timeline-location">${t.location}</div>
          <div class="p-timeline-desc">${t.description}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ===== VALUES PAGE ===== */
function renderValues() {
  const el = document.getElementById('p-values-list');
  if (!el) return;
  el.innerHTML = familyValues.map(v => `
    <div class="p-value-card">
      <div class="p-value-title">${v.title}</div>
      <div class="p-value-desc">${v.description}</div>
    </div>
  `).join('');
}

/* ===== GALLERY PAGE ===== */
function renderGallery() {
  const el = document.getElementById('p-gallery-grid');
  if (!el) return;
  el.innerHTML = `<div class="p-gallery-grid">
    ${familyGallery.map(g => `
      <div class="p-gallery-item">
        <img class="p-gallery-img" src="../${g.image}" alt="${g.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'p-gallery-placeholder\\'></div>'"/>
        <div class="p-gallery-caption">
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
