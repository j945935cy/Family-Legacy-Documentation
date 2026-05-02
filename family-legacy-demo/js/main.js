/* ===== UTILS ===== */

function estimateReadTime(story) {
  const text = [
    story.scene,
    story.characters,
    story.conflict,
    story.plot,
    story.sensory,
    story.dialogue,
    story.resolution,
    story.lesson
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
  return `if(this.src.indexOf('${fallback.split('/').pop()}')===-1){this.src='${fallback}';}else{this.style.display='none';}`;
}

function storyCard(story, expanded) {
  return `
    <div class="card" id="story-${story.id}">
      <div class="card-media">
        <img class="card-img" src="${story.image}" alt="${story.title}" loading="lazy" onerror="${fallbackImageOnError(story.imageFallback)}"/>
        <div class="card-overlay">
          <span class="story-kicker">家族故事</span>
          <span class="story-readtime">約 ${estimateReadTime(story)} 分鐘閱讀</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span>📅 ${story.year}</span>
          <span>📍 ${story.location}</span>
          <span>👤 ${story.people.join('、')}</span>
        </div>
        <h3 class="card-title">${story.title}</h3>
        <p class="story-hook">${storyHookText(story)}</p>
        <p class="card-summary">${story.summary}</p>
        ${expanded ? storyFull(story) : ''}
      </div>
      <div class="card-footer">
        <button class="btn btn-sm btn-primary toggle-story" data-id="${story.id}">展開閱讀</button>
      </div>
      <div class="story-expand" id="expand-${story.id}">
        ${storyFull(story)}
      </div>
    </div>
  `;
}

function storyFull(story) {
  return `
    <div class="story-lead-block">
      <p class="story-lead">${story.summary}</p>
      <div class="story-pills">
        <span class="story-pill">${story.year}</span>
        <span class="story-pill">${story.location}</span>
        <span class="story-pill">${story.people.join('、')}</span>
      </div>
    </div>
    <div class="story-section"><h4>場景</h4><p>${story.scene}</p></div>
    <div class="story-section"><h4>人物</h4><p>${story.characters}</p></div>
    <div class="story-section"><h4>衝突</h4><p>${story.conflict}</p></div>
    <div class="story-section"><h4>情節發展</h4><p>${story.plot}</p></div>
    <div class="story-section"><h4>感官細節</h4><p>${story.sensory}</p></div>
    <div class="story-section"><h4>對話</h4><p class="story-dialogue">${story.dialogue}</p></div>
    <div class="story-section"><h4>結局與啟示</h4><p>${story.resolution}</p><div class="story-lesson">${story.lesson}</div></div>
  `;
}

/* ===== NAVBAR HAMBURGER ===== */
function initHamburger() {
  const btn = document.querySelector('.hamburger');
  const links = document.querySelector('.navbar-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.setAttribute('aria-expanded', links.classList.contains('open'));
  });
  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

/* ===== ACTIVE NAV LINK ===== */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
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

  const heroNarrativeEl = document.getElementById('hero-narrative');
  if (heroNarrativeEl && person && firstStory) {
    heroNarrativeEl.textContent = heroNarrative(person, firstStory);
  }

  const heroQuoteEl = document.getElementById('hero-quote-panel');
  if (heroQuoteEl && person) {
    heroQuoteEl.innerHTML = `
      <div class="hero-quote-label">一句留下來的話</div>
      <div class="hero-quote-text">「${person.quote}」</div>
      <div class="hero-quote-source">${person.name}・${person.role}</div>
    `;
  }

  const heroSceneEl = document.getElementById('hero-scene-card');
  if (heroSceneEl && firstStory) {
    heroSceneEl.innerHTML = `
      <img src="${firstStory.image}" alt="${firstStory.title}" class="hero-scene-image" loading="lazy" onerror="${fallbackImageOnError(firstStory.imageFallback)}"/>
      <div class="hero-scene-label">故事開場</div>
      <h2 class="hero-scene-title">${firstStory.title}</h2>
      <p class="hero-scene-text">${firstStory.scene}</p>
      <a href="stories.html#story-${firstStory.id}" class="hero-scene-link">從第一篇開始閱讀 →</a>
    `;
  }

  const heroStatsEl = document.getElementById('hero-stats');
  if (heroStatsEl) {
    heroStatsEl.innerHTML = `
      <div class="hero-stat">
        <span class="hero-stat-number">${familyStories.length}</span>
        <span class="hero-stat-label">篇關鍵故事</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-number">${familyTimeline.length}</span>
        <span class="hero-stat-label">個人生節點</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-number">${familyValues.length}</span>
        <span class="hero-stat-label">項家族價值</span>
      </div>
    `;
  }

  // Featured person
  const personEl = document.getElementById('featured-person');
  if (personEl && familyPeople.length) {
    const p = familyPeople[0];
    personEl.innerHTML = `
      <div class="featured-person">
        <img src="${p.image}" alt="${p.name}" class="featured-person-photo" style="width:140px;height:140px;border-radius:50%;object-fit:cover;box-shadow:0 4px 16px rgba(60,40,10,0.18);flex-shrink:0;" onerror="if(this.src.indexOf('person-lin.svg')===-1){this.src='${p.imageFallback||p.image.replace(/\.png$/,'.svg')}';}"/>
        <div class="featured-person-info">
          <div class="featured-person-name">${p.name}</div>
          <div class="featured-person-role">${p.role}・${p.location}・${p.birthYear} 年生</div>
          <div class="featured-person-quote">${p.quote}</div>
        </div>
      </div>
    `;
  }

  // Featured stories (first 3)
  const storiesEl = document.getElementById('featured-stories');
  if (storiesEl) {
    storiesEl.innerHTML = `<div class="cards-grid">
      ${familyStories.slice(0, 3).map(s => storyCard(s, false)).join('')}
    </div>`;
  }

  // Featured values (first 4)
  const valuesEl = document.getElementById('featured-values');
  if (valuesEl) {
    valuesEl.innerHTML = `<div class="cards-grid">
      ${familyValues.slice(0, 4).map(v => `
        <div class="value-card">
          <div class="value-title">${v.title}</div>
          <div class="value-desc">${v.description}</div>
        </div>
      `).join('')}
    </div>`;
  }
}

/* ===== STORIES PAGE ===== */
function renderStories() {
  const el = document.getElementById('stories-list');
  if (!el) return;
  const intro = familyStories[0];
  el.innerHTML = `
  <div class="story-spotlight">
    <div>
      <div class="story-spotlight-label">本頁導讀</div>
      <h2 class="story-spotlight-title">從一盞燈、一張飯桌，到一本帳本</h2>
      <p class="story-spotlight-text">這些故事不是傳記摘要，而是林志遠如何在壓力裡做選擇、在不確定裡守住方向的過程。建議從第一篇開始讀，會更看得見這個家庭怎麼一步一步站穩。</p>
    </div>
    <blockquote class="story-spotlight-quote">「${spotlightQuote(intro)}」</blockquote>
  </div>
  <div class="cards-grid">
    ${familyStories.map(s => storyCard(s, false)).join('')}
  </div>`;
}

/* ===== PEOPLE PAGE ===== */
function renderPeople() {
  const el = document.getElementById('people-list');
  if (!el) return;
  el.innerHTML = familyPeople.map(p => {
    const related = familyStories.filter(s => s.people.includes(p.name));
    return `
      <div class="person-card">
        <img src="${p.image}" alt="${p.name}" class="person-photo" onerror="if(this.src.indexOf('person-lin.svg')===-1){this.src='${p.imageFallback||p.image.replace(/\.png$/,'.svg')}';}"/>
        <div class="person-info">
          <div class="person-name">${p.name}</div>
          <div class="person-english">${p.englishName}</div>
          <div class="person-tags">
            <span class="tag">${p.birthYear} 年生</span>
            <span class="tag">${p.location}</span>
            <span class="tag">${p.role}</span>
          </div>
          <blockquote class="person-quote">「${p.quote}」</blockquote>
          <p class="person-desc">${p.description}</p>
        </div>
      </div>
      ${related.length ? `
        <h3 style="color:var(--primary);margin-bottom:20px;font-size:1.1rem;">相關故事</h3>
        <div class="cards-grid">
          ${related.map(s => storyCard(s, false)).join('')}
        </div>
      ` : ''}
    `;
  }).join('');
}

/* ===== TIMELINE PAGE ===== */
function renderTimeline() {
  const el = document.getElementById('timeline-list');
  if (!el) return;
  el.innerHTML = `<div class="timeline">
    ${familyTimeline.map(t => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-year">${t.year}</div>
        <div class="timeline-title">${t.title}</div>
        <div class="timeline-location">📍 ${t.location}</div>
        <div class="timeline-desc">${t.description}</div>
      </div>
    `).join('')}
  </div>`;
}

/* ===== VALUES PAGE ===== */
function renderValues() {
  const el = document.getElementById('values-list');
  if (!el) return;
  el.innerHTML = `<div class="cards-grid">
    ${familyValues.map(v => `
      <div class="value-card">
        <div class="value-title">${v.title}</div>
        <div class="value-desc">${v.description}</div>
      </div>
    `).join('')}
  </div>`;
}

/* ===== GALLERY PAGE ===== */
function renderGallery() {
  const el = document.getElementById('gallery-grid');
  if (!el) return;
  el.innerHTML = `<div class="gallery-grid">
    ${familyGallery.map(g => `
      <div class="gallery-item">
        <img class="gallery-img" src="${g.image}" alt="${g.title}" loading="lazy" onerror="${g.imageFallback ? fallbackImageOnError(g.imageFallback) : "this.outerHTML='<div class=\\'gallery-placeholder\\'>🖼</div>'"}"/>
        <div class="gallery-caption">
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
