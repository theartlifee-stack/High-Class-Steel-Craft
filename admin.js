/* ---------- Auth guard ---------- */
if (sessionStorage.getItem('hcsc_admin_auth') !== '1') {
  window.location.href = 'login.html';
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('hcsc_admin_auth');
  window.location.href = 'login.html';
});

/* ---------- Toast ---------- */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Navigation between panels ---------- */
const sideLinks = document.querySelectorAll('.side-link');
const panels = document.querySelectorAll('.panel');
const panelTitle = document.getElementById('panelTitle');
const titles = {
  'panel-gallery': 'Gallery / Work',
  'panel-products': 'Products',
  'panel-enquiries': 'Enquiries',
  'panel-settings': 'Settings'
};
sideLinks.forEach(link => {
  link.addEventListener('click', () => {
    sideLinks.forEach(l => l.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.panel).classList.add('active');
    panelTitle.textContent = titles[link.dataset.panel];
  });
});

/* ---------- Data ---------- */
let store = hcscGetData();

const categoryLabels = {
  structural: 'Structural',
  gates: 'Gates & Fencing',
  staircases: 'Staircases & Railings',
  furniture: 'Furniture & Decor'
};

/* ============ Image upload helper ============ */
function setupUpload(boxId, inputId, placeholderId, previewId, onLoaded) {
  const box = document.getElementById(boxId);
  const input = document.getElementById(inputId);
  const placeholder = document.getElementById(placeholderId);
  const preview = document.getElementById(previewId);

  box.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Please choose an image smaller than 4MB.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.hidden = false;
      placeholder.hidden = true;
      onLoaded(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  // drag & drop
  ['dragover', 'dragleave', 'drop'].forEach(evt => {
    box.addEventListener(evt, (e) => e.preventDefault());
  });
  box.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event('change'));
    }
  });

  return {
    reset() {
      input.value = '';
      preview.src = '';
      preview.hidden = true;
      placeholder.hidden = false;
    }
  };
}

let gImageData = null;
let pImageData = null;
const gUpload = setupUpload('gUploadBox', 'gImage', 'gUploadPlaceholder', 'gImagePreview', (data) => gImageData = data);
const pUpload = setupUpload('pUploadBox', 'pImage', 'pUploadPlaceholder', 'pImagePreview', (data) => pImageData = data);

/* ============ GALLERY ============ */
const galleryAdminGrid = document.getElementById('galleryAdminGrid');
const galleryCount = document.getElementById('galleryCount');
const galleryForm = document.getElementById('galleryForm');

function renderGalleryAdmin() {
  galleryCount.textContent = store.gallery.length;
  if (!store.gallery.length) {
    galleryAdminGrid.innerHTML = '<div class="empty-state">No projects yet. Add your first one above.</div>';
    return;
  }
  galleryAdminGrid.innerHTML = store.gallery.map(item => `
    <div class="admin-card">
      <div class="thumb"><img src="${item.image}" alt="${item.title}"></div>
      <div class="body">
        <span class="tag">${categoryLabels[item.category] || item.category}</span>
        <h4>${item.title}</h4>
        <div class="row-actions">
          <button data-id="${item.id}" class="delGalleryBtn">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  galleryAdminGrid.querySelectorAll('.delGalleryBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this project from the gallery?')) return;
      store.gallery = store.gallery.filter(g => g.id !== btn.dataset.id);
      hcscSaveData(store);
      renderGalleryAdmin();
      showToast('Project removed');
    });
  });
}

galleryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('gTitle').value.trim();
  const category = document.getElementById('gCategory').value;
  if (!title) return;
  if (!gImageData) {
    alert('Please upload a photo for this project.');
    return;
  }
  store.gallery.unshift({
    id: hcscUid('g'),
    title,
    category,
    image: gImageData
  });
  hcscSaveData(store);
  renderGalleryAdmin();
  galleryForm.reset();
  gUpload.reset();
  gImageData = null;
  showToast('Project added to gallery');
});

/* ============ PRODUCTS ============ */
const productAdminGrid = document.getElementById('productAdminGrid');
const productCount = document.getElementById('productCount');
const productForm = document.getElementById('productForm');

function renderProductAdmin() {
  productCount.textContent = store.products.length;
  if (!store.products.length) {
    productAdminGrid.innerHTML = '<div class="empty-state">No products yet. Add your first one above.</div>';
    return;
  }
  productAdminGrid.innerHTML = store.products.map(p => `
    <div class="admin-card">
      <div class="thumb"><img src="${p.image}" alt="${p.name}"></div>
      <div class="body">
        <span class="tag">${p.category}</span>
        <h4>${p.name}</h4>
        <p>${p.description}</p>
        <div class="row-actions">
          <button data-id="${p.id}" class="delProductBtn">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  productAdminGrid.querySelectorAll('.delProductBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this product?')) return;
      store.products = store.products.filter(p => p.id !== btn.dataset.id);
      hcscSaveData(store);
      renderProductAdmin();
      showToast('Product removed');
    });
  });
}

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('pName').value.trim();
  const category = document.getElementById('pCategory').value.trim();
  const description = document.getElementById('pDescription').value.trim();
  if (!name || !category || !description) return;
  if (!pImageData) {
    alert('Please upload a photo for this product.');
    return;
  }
  store.products.unshift({
    id: hcscUid('p'),
    name,
    category,
    description,
    image: pImageData
  });
  hcscSaveData(store);
  renderProductAdmin();
  productForm.reset();
  pUpload.reset();
  pImageData = null;
  showToast('Product added');
});

/* ============ ENQUIRIES ============ */
const enquiryTableBody = document.getElementById('enquiryTableBody');
const enquiryCount = document.getElementById('enquiryCount');
const enquiryEmpty = document.getElementById('enquiryEmpty');
const enquiryBadge = document.getElementById('enquiryBadge');

function renderEnquiries() {
  enquiryCount.textContent = store.enquiries.length;
  enquiryBadge.textContent = store.enquiries.length || '';
  if (!store.enquiries.length) {
    enquiryTableBody.innerHTML = '';
    enquiryEmpty.hidden = false;
    document.getElementById('enquiryTable').hidden = true;
    return;
  }
  enquiryEmpty.hidden = true;
  document.getElementById('enquiryTable').hidden = false;

  enquiryTableBody.innerHTML = store.enquiries.map(e => {
    const date = new Date(e.date);
    const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' +
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td>${dateStr}</td>
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.phone)}</td>
        <td>${escapeHtml(e.email || '—')}</td>
        <td>${escapeHtml(e.type || '—')}</td>
        <td><span class="channel-pill ${e.channel}">${e.channel}</span></td>
        <td class="msg-cell">${escapeHtml(e.message || '—')}</td>
        <td><button class="del-btn" data-id="${e.id}">Delete</button></td>
      </tr>
    `;
  }).join('');

  enquiryTableBody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.enquiries = store.enquiries.filter(en => en.id !== btn.dataset.id);
      hcscSaveData(store);
      renderEnquiries();
      showToast('Enquiry deleted');
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/* ============ SETTINGS ============ */
const settingsForm = document.getElementById('settingsForm');
document.getElementById('sWhatsapp').value = store.settings.whatsappNumber;
document.getElementById('sEmail').value = store.settings.email;
document.getElementById('sAddress').value = store.settings.address;

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  store.settings.whatsappNumber = document.getElementById('sWhatsapp').value.trim().replace(/\D/g, '');
  store.settings.email = document.getElementById('sEmail').value.trim();
  store.settings.address = document.getElementById('sAddress').value.trim();
  hcscSaveData(store);
  const confirmEl = document.getElementById('settingsSaved');
  confirmEl.classList.add('show');
  setTimeout(() => confirmEl.classList.remove('show'), 2000);
  showToast('Settings saved');
});

/* ============ Data management ============ */
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hcsc-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!imported.gallery || !imported.products) throw new Error('Invalid file');
      store = imported;
      hcscSaveData(store);
      renderAll();
      showToast('Backup imported');
    } catch (err) {
      alert('Could not read this file — make sure it is a valid HCSC backup JSON.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('This will erase all current gallery items, products and enquiries and restore the default demo data. Continue?')) return;
  localStorage.removeItem(HCSC_STORE_KEY);
  store = hcscGetData();
  renderAll();
  showToast('Data reset to default');
});

/* ---------- Initial render ---------- */
function renderAll() {
  renderGalleryAdmin();
  renderProductAdmin();
  renderEnquiries();
  document.getElementById('sWhatsapp').value = store.settings.whatsappNumber;
  document.getElementById('sEmail').value = store.settings.email;
  document.getElementById('sAddress').value = store.settings.address;
}
renderAll();
