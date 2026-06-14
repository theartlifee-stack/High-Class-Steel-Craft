document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('open')));

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------- Hero weld spark animation ---------- */
function spawnSparks() {
  const g = document.getElementById('sparks');
  if (!g) return;
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 10;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', 240);
    c.setAttribute('cy', 240);
    c.setAttribute('r', (1 + Math.random() * 2).toFixed(1));
    c.setAttribute('class', 'spark-particle');
    c.style.setProperty('--dx', dx + 'px');
    c.style.setProperty('--dy', dy + 'px');
    c.style.animationDelay = (Math.random() * 0.3) + 's';
    g.appendChild(c);
  }
  setTimeout(() => { g.innerHTML = ''; }, 1400);
}
setTimeout(spawnSparks, 2100);
setInterval(spawnSparks, 6000);

/* ---------- Render Gallery ---------- */
const data = hcscGetData();
const galleryGrid = document.getElementById('galleryGrid');
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

const categoryLabels = {
  structural: 'Structural',
  gates: 'Gates & Fencing',
  staircases: 'Staircases & Railings',
  furniture: 'Furniture & Decor'
};

function renderGallery(filter = 'all') {
  const items = data.gallery.filter(g => filter === 'all' || g.category === filter);
  if (!items.length) {
    galleryGrid.innerHTML = '<div class="empty-note">No projects in this category yet.</div>';
    return;
  }
  galleryGrid.innerHTML = items.map(item => `
    <div class="gallery-item" data-img="${item.image}">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="gallery-overlay">
        <div class="corner-frame"></div>
        <span>${categoryLabels[item.category] || item.category}</span>
        <h4>${item.title}</h4>
      </div>
    </div>
  `).join('');

  galleryGrid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(el.dataset.img));
  });
}
renderGallery();

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.dataset.filter);
  });
});

/* ---------- Render Products ---------- */
function renderProducts() {
  if (!data.products.length) {
    productGrid.innerHTML = '<div class="empty-note">No products listed yet — check back soon.</div>';
    return;
  }
  productGrid.innerHTML = data.products.map(p => {
    const waText = encodeURIComponent(`Hi, I'm interested in: ${p.name}`);
    const mailSubject = encodeURIComponent(`Enquiry: ${p.name}`);
    const mailBody = encodeURIComponent(`Hi,\n\nI'd like more information about "${p.name}".\n\nThanks.`);
    return `
    <div class="product-card">
      <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="product-body">
        <span class="pcat">${p.category}</span>
        <h4>${p.name}</h4>
        <p>${p.description}</p>
        <div class="product-actions">
          <a class="pa-whatsapp" href="https://wa.me/${data.settings.whatsappNumber}?text=${waText}" target="_blank">WhatsApp</a>
          <a class="pa-email" href="mailto:${data.settings.email}?subject=${mailSubject}&body=${mailBody}">Email</a>
        </div>
      </div>
    </div>`;
  }).join('');
}
renderProducts();

/* ---------- Wire up dynamic contact links / numbers ---------- */
document.querySelectorAll('a[href^="https://wa.me/910000000000"]').forEach(a => {
  const url = new URL(a.href);
  url.pathname = '/' + data.settings.whatsappNumber;
  a.href = url.toString();
});
document.querySelectorAll('a[href^="mailto:enquiries@highclasssteelcraft.com"]').forEach(a => {
  a.href = a.href.replace('enquiries@highclasssteelcraft.com', data.settings.email);
});
const waContactCard = document.querySelector('.contact-card[href^="https://wa.me/"]');
if (waContactCard) {
  waContactCard.querySelector('strong').textContent = '+' + data.settings.whatsappNumber;
}
const emailContactCard = document.querySelector('.contact-card[href^="mailto:"]');
if (emailContactCard) {
  emailContactCard.querySelector('strong').textContent = data.settings.email;
}
const addressCard = document.querySelectorAll('.contact-card .meta strong')[2];
if (addressCard) addressCard.textContent = data.settings.address;

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
}
lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('active'); });

/* ---------- Enquiry form ---------- */
const enquiryForm = document.getElementById('enquiryForm');
const waSubmitBtn = document.getElementById('waSubmit');

function getFormPayload() {
  const fd = new FormData(enquiryForm);
  return {
    name: fd.get('name') || '',
    phone: fd.get('phone') || '',
    email: fd.get('email') || '',
    type: fd.get('type') || '',
    message: fd.get('message') || ''
  };
}

function saveEnquiry(payload, channel) {
  const store = hcscGetData();
  store.enquiries.unshift({
    id: hcscUid('enq'),
    ...payload,
    channel,
    date: new Date().toISOString()
  });
  hcscSaveData(store);
}

enquiryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const p = getFormPayload();
  if (!p.name || !p.phone) {
    alert('Please fill in your name and phone number.');
    return;
  }
  saveEnquiry(p, 'email');
  const subject = encodeURIComponent(`New Enquiry — ${p.type}`);
  const body = encodeURIComponent(
    `Name: ${p.name}\nPhone: ${p.phone}\nEmail: ${p.email}\nType: ${p.type}\n\nMessage:\n${p.message}`
  );
  window.location.href = `mailto:${data.settings.email}?subject=${subject}&body=${body}`;
});

waSubmitBtn.addEventListener('click', () => {
  const p = getFormPayload();
  if (!p.name || !p.phone) {
    alert('Please fill in your name and phone number.');
    return;
  }
  saveEnquiry(p, 'whatsapp');
  const text = encodeURIComponent(
    `New Enquiry\nName: ${p.name}\nPhone: ${p.phone}\nEmail: ${p.email}\nType: ${p.type}\nMessage: ${p.message}`
  );
  window.open(`https://wa.me/${data.settings.whatsappNumber}?text=${text}`, '_blank');
});
