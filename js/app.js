/**
 * Contact Management System - Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    contacts: [],
    stats: { total: 0, favorites: 0, categories: {} },
    activeCategory: 'All',
    searchQuery: '',
    sortOrder: 'name_asc',
    viewMode: 'grid',
    selectedContactId: null,
    isEditMode: false
  };

  // --- API CLIENT ---
  const isStaticHosting = window.location.protocol === 'file:'
    || window.location.hostname === 'github.io'
    || window.location.hostname.endsWith('.github.io');
  const storageKey = 'contacthub.contacts.v1';

  function readStoredContacts() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (err) {
      console.error('Unable to read saved contacts', err);
      return [];
    }
  }

  function saveStoredContacts(contacts) {
    localStorage.setItem(storageKey, JSON.stringify(contacts));
  }

  const API = {
    async getContacts() {
      if (isStaticHosting) {
        let contacts = readStoredContacts();
        const search = state.searchQuery.trim().toLowerCase();
        if (search) {
          contacts = contacts.filter(contact =>
            [contact.name, contact.email, contact.phone, contact.notes]
              .some(value => (value || '').toLowerCase().includes(search))
          );
        }
        if (state.activeCategory === 'Favorite') {
          contacts = contacts.filter(contact => contact.is_favorite);
        } else if (state.activeCategory !== 'All') {
          contacts = contacts.filter(contact => contact.category === state.activeCategory);
        }
        contacts.sort((a, b) => {
          if (state.sortOrder === 'name_desc') return b.name.localeCompare(a.name);
          if (state.sortOrder === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
          if (state.sortOrder === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
          return a.name.localeCompare(b.name);
        });
        return { success: true, data: contacts };
      }

      const params = new URLSearchParams();
      if (state.searchQuery) params.append('search', state.searchQuery);
      if (state.activeCategory === 'Favorite') {
        params.append('favorite', 'true');
      } else if (state.activeCategory !== 'All') {
        params.append('category', state.activeCategory);
      }
      if (state.sortOrder) params.append('sort', state.sortOrder);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      return await res.json();
    },

    async getStats() {
      if (isStaticHosting) {
        const contacts = readStoredContacts();
        return {
          success: true,
          data: {
            total: contacts.length,
            favorites: contacts.filter(contact => contact.is_favorite).length,
            categories: contacts.reduce((counts, contact) => {
              counts[contact.category] = (counts[contact.category] || 0) + 1;
              return counts;
            }, {})
          }
        };
      }

      const res = await fetch('/api/contacts/stats');
      return await res.json();
    },

    async getContactById(id) {
      if (isStaticHosting) {
        const contact = readStoredContacts().find(item => item.id === id);
        return contact
          ? { success: true, data: contact }
          : { success: false, error: 'Contact not found' };
      }

      const res = await fetch(`/api/contacts/${id}`);
      return await res.json();
    },

    async createContact(data) {
      if (isStaticHosting) {
        const contacts = readStoredContacts();
        const contact = {
          ...data,
          id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          created_at: new Date().toISOString()
        };
        contacts.push(contact);
        saveStoredContacts(contacts);
        return { success: true, data: contact };
      }

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    },

    async updateContact(id, data) {
      if (isStaticHosting) {
        const contacts = readStoredContacts();
        const index = contacts.findIndex(contact => contact.id === id);
        if (index < 0) return { success: false, error: 'Contact not found' };
        contacts[index] = { ...contacts[index], ...data };
        saveStoredContacts(contacts);
        return { success: true, data: contacts[index] };
      }

      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    },

    async toggleFavorite(id) {
      if (isStaticHosting) {
        const contacts = readStoredContacts();
        const contact = contacts.find(item => item.id === id);
        if (!contact) return { success: false, error: 'Contact not found' };
        contact.is_favorite = !contact.is_favorite;
        saveStoredContacts(contacts);
        return { success: true, data: contact };
      }

      const res = await fetch(`/api/contacts/${id}/favorite`, {
        method: 'PATCH'
      });
      return await res.json();
    },

    async deleteContact(id) {
      if (isStaticHosting) {
        const contacts = readStoredContacts();
        const remaining = contacts.filter(contact => contact.id !== id);
        if (remaining.length === contacts.length) {
          return { success: false, error: 'Contact not found' };
        }
        saveStoredContacts(remaining);
        return { success: true, deletedId: id };
      }

      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }
  };

  // --- DOM ELEMENTS ---
  const DOM = {
    // Stats
    statTotal: document.getElementById('statTotal'),
    statFav: document.getElementById('statFav'),

    // Export
    exportBtn: document.getElementById('exportBtn'),
    exportDropdown: document.getElementById('exportDropdown'),

    // Toolbar
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    categoryPills: document.getElementById('categoryPills'),
    sortSelect: document.getElementById('sortSelect'),
    gridViewBtn: document.getElementById('gridViewBtn'),
    listViewBtn: document.getElementById('listViewBtn'),

    // Main Container
    contactsContainer: document.getElementById('contactsContainer'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyMessage: document.getElementById('emptyMessage'),
    emptyAddBtn: document.getElementById('emptyAddBtn'),

    // Modals
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    contactModal: document.getElementById('contactModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelFormBtn: document.getElementById('cancelFormBtn'),

    // Form
    contactForm: document.getElementById('contactForm'),
    contactId: document.getElementById('contactId'),
    contactName: document.getElementById('contactName'),
    contactPhone: document.getElementById('contactPhone'),
    contactEmail: document.getElementById('contactEmail'),
    contactCategory: document.getElementById('contactCategory'),
    contactFavorite: document.getElementById('contactFavorite'),
    contactNotes: document.getElementById('contactNotes'),
    nameError: document.getElementById('nameError'),
    phoneError: document.getElementById('phoneError'),
    emailError: document.getElementById('emailError'),

    // View Modal
    viewModal: document.getElementById('viewModal'),
    closeViewModalBtn: document.getElementById('closeViewModalBtn'),
    viewAvatar: document.getElementById('viewAvatar'),
    viewStarBtn: document.getElementById('viewStarBtn'),
    viewName: document.getElementById('viewName'),
    viewCategory: document.getElementById('viewCategory'),
    viewPhone: document.getElementById('viewPhone'),
    viewEmail: document.getElementById('viewEmail'),
    viewNotes: document.getElementById('viewNotes'),
    viewCreated: document.getElementById('viewCreated'),
    viewCallLink: document.getElementById('viewCallLink'),
    viewEmailLink: document.getElementById('viewEmailLink'),
    viewEditBtn: document.getElementById('viewEditBtn'),
    viewDeleteBtn: document.getElementById('viewDeleteBtn'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteContactName: document.getElementById('deleteContactName'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  // --- HELPER FUNCTIONS ---

  // Get initials for avatar (e.g. "John Doe" -> "JD")
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Consistent background color hash for avatars
  function getAvatarColor(name) {
    const colors = [
      '#4f46e5', '#2563eb', '#0284c7', '#0d9488',
      '#059669', '#d97706', '#dc2626', '#7c3aed', '#c026d3'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Format Date string
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Show Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i>
      <span>${message}</span>
    `;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- RENDERING ---

  async function loadData() {
    DOM.loadingState.classList.remove('hidden');
    DOM.emptyState.classList.add('hidden');
    DOM.contactsContainer.innerHTML = '';

    try {
      // Load contacts & stats concurrently
      const [contactsRes, statsRes] = await Promise.all([
        API.getContacts(),
        API.getStats()
      ]);

      if (statsRes.success) {
        state.stats = statsRes.data;
        DOM.statTotal.textContent = state.stats.total;
        DOM.statFav.textContent = state.stats.favorites;
      }

      if (contactsRes.success) {
        state.contacts = contactsRes.data;
        renderContacts();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load contacts', 'error');
    } finally {
      DOM.loadingState.classList.add('hidden');
    }
  }

  function renderContacts() {
    DOM.contactsContainer.className = state.viewMode === 'grid' ? 'contacts-grid' : 'contacts-list';
    DOM.contactsContainer.innerHTML = '';

    if (state.contacts.length === 0) {
      DOM.emptyState.classList.remove('hidden');
      if (state.searchQuery) {
        DOM.emptyMessage.textContent = `No contacts matching "${state.searchQuery}". Try clearing your search.`;
      } else if (state.activeCategory !== 'All') {
        DOM.emptyMessage.textContent = `No contacts found under "${state.activeCategory}".`;
      } else {
        DOM.emptyMessage.textContent = 'Get started by creating your first contact!';
      }
      return;
    }

    DOM.emptyState.classList.add('hidden');

    state.contacts.forEach(contact => {
      const card = createContactCard(contact);
      DOM.contactsContainer.appendChild(card);
    });
  }

  function createContactCard(c) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.dataset.id = c.id;

    const initials = getInitials(c.name);
    const avatarBg = getAvatarColor(c.name);
    const categoryClass = (c.category || 'personal').toLowerCase();
    const isFav = Boolean(c.is_favorite);

    card.innerHTML = `
      <div class="card-top">
        <div class="avatar-wrapper">
          <div class="avatar" style="background-color: ${avatarBg}">${initials}</div>
          <div class="contact-info">
            <h3 class="contact-name" data-action="view">${escapeHtml(c.name)}</h3>
            <span class="category-badge ${categoryClass}">${escapeHtml(c.category || 'Personal')}</span>
          </div>
        </div>
        <button class="star-btn ${isFav ? 'active' : ''}" data-action="star" title="${isFav ? 'Unstar' : 'Star'}">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
        </button>
      </div>

      <div class="card-details">
        <div class="detail-row">
          <i class="fa-solid fa-phone"></i>
          <a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a>
        </div>
        ${c.email ? `
          <div class="detail-row">
            <i class="fa-solid fa-envelope"></i>
            <a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>
          </div>
        ` : ''}
      </div>

      <div class="card-footer">
        <button class="icon-btn" data-action="view" title="View Details">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="icon-btn" data-action="edit" title="Edit Contact">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="icon-btn delete-btn" data-action="delete" title="Delete Contact">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    // Event delegation on card
    card.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.dataset.action;
      if (action === 'view') {
        openViewModal(c);
      } else if (action === 'edit') {
        openAddEditModal(c);
      } else if (action === 'delete') {
        openDeleteModal(c);
      } else if (action === 'star') {
        toggleFavorite(c.id);
      }
    });

    return card;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return map[match];
    });
  }

  // --- MODAL HANDLERS ---

  function openAddEditModal(contact = null) {
    clearFormErrors();
    DOM.contactForm.reset();

    if (contact) {
      state.isEditMode = true;
      state.selectedContactId = contact.id;
      DOM.modalTitle.innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Contact';
      DOM.contactId.value = contact.id;
      DOM.contactName.value = contact.name || '';
      DOM.contactPhone.value = contact.phone || '';
      DOM.contactEmail.value = contact.email || '';
      DOM.contactCategory.value = contact.category || 'Personal';
      DOM.contactFavorite.checked = Boolean(contact.is_favorite);
      DOM.contactNotes.value = contact.notes || '';
    } else {
      state.isEditMode = false;
      state.selectedContactId = null;
      DOM.modalTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> Add New Contact';
      DOM.contactId.value = '';
    }

    DOM.contactModal.classList.remove('hidden');
    DOM.contactName.focus();
  }

  function closeAddEditModal() {
    DOM.contactModal.classList.add('hidden');
    DOM.contactForm.reset();
    clearFormErrors();
  }

  function clearFormErrors() {
    DOM.nameError.textContent = '';
    DOM.phoneError.textContent = '';
    DOM.emailError.textContent = '';
  }

  function validateForm() {
    clearFormErrors();
    let isValid = true;

    const name = DOM.contactName.value.trim();
    const phone = DOM.contactPhone.value.trim();
    const email = DOM.contactEmail.value.trim();

    if (!name) {
      DOM.nameError.textContent = 'Name is required.';
      isValid = false;
    }

    if (!phone) {
      DOM.phoneError.textContent = 'Phone number is required.';
      isValid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      DOM.emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    return isValid;
  }

  // Handle Form Submission
  DOM.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: DOM.contactName.value.trim(),
      phone: DOM.contactPhone.value.trim(),
      email: DOM.contactEmail.value.trim(),
      category: DOM.contactCategory.value,
      is_favorite: DOM.contactFavorite.checked,
      notes: DOM.contactNotes.value.trim()
    };

    try {
      if (state.isEditMode) {
        const res = await API.updateContact(state.selectedContactId, payload);
        if (res.success) {
          showToast('Contact updated successfully!');
          closeAddEditModal();
          // If view modal is open for this contact, refresh it
          if (!DOM.viewModal.classList.contains('hidden') && state.selectedContactId === res.data.id) {
            openViewModal(res.data);
          }
          loadData();
        } else {
          showToast(res.error || 'Failed to update contact', 'error');
        }
      } else {
        const res = await API.createContact(payload);
        if (res.success) {
          showToast('New contact added!');
          closeAddEditModal();
          loadData();
        } else {
          showToast(res.error || 'Failed to add contact', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected error occurred', 'error');
    }
  });

  // VIEW MODAL
  function openViewModal(contact) {
    state.selectedContactId = contact.id;
    const initials = getInitials(contact.name);
    const avatarBg = getAvatarColor(contact.name);
    const categoryClass = (contact.category || 'personal').toLowerCase();
    const isFav = Boolean(contact.is_favorite);

    DOM.viewAvatar.textContent = initials;
    DOM.viewAvatar.style.backgroundColor = avatarBg;
    DOM.viewName.textContent = contact.name;
    DOM.viewCategory.textContent = contact.category || 'Personal';
    DOM.viewCategory.className = `category-badge ${categoryClass}`;

    DOM.viewPhone.textContent = contact.phone || 'N/A';
    DOM.viewEmail.textContent = contact.email || 'None provided';
    DOM.viewNotes.textContent = contact.notes || 'No notes provided';
    DOM.viewCreated.textContent = formatDate(contact.created_at);

    DOM.viewCallLink.href = contact.phone ? `tel:${contact.phone}` : '#';
    DOM.viewEmailLink.href = contact.email ? `mailto:${contact.email}` : '#';

    if (isFav) {
      DOM.viewStarBtn.classList.add('active');
      DOM.viewStarBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
    } else {
      DOM.viewStarBtn.classList.remove('active');
      DOM.viewStarBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
    }

    DOM.viewModal.classList.remove('hidden');
  }

  function closeViewModal() {
    DOM.viewModal.classList.add('hidden');
  }

  DOM.viewStarBtn.addEventListener('click', async () => {
    if (state.selectedContactId) {
      await toggleFavorite(state.selectedContactId);
      const res = await API.getContactById(state.selectedContactId);
      if (res.success) openViewModal(res.data);
    }
  });

  DOM.viewEditBtn.addEventListener('click', async () => {
    closeViewModal();
    const res = await API.getContactById(state.selectedContactId);
    if (res.success) openAddEditModal(res.data);
  });

  DOM.viewDeleteBtn.addEventListener('click', async () => {
    closeViewModal();
    const res = await API.getContactById(state.selectedContactId);
    if (res.success) openDeleteModal(res.data);
  });

  // DELETE MODAL
  function openDeleteModal(contact) {
    state.selectedContactId = contact.id;
    DOM.deleteContactName.textContent = contact.name;
    DOM.deleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    DOM.deleteModal.classList.add('hidden');
  }

  DOM.confirmDeleteBtn.addEventListener('click', async () => {
    if (!state.selectedContactId) return;

    try {
      const res = await API.deleteContact(state.selectedContactId);
      if (res.success) {
        showToast('Contact deleted!');
        closeDeleteModal();
        loadData();
      } else {
        showToast(res.error || 'Failed to delete contact', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting contact', 'error');
    }
  });

  // TOGGLE FAVORITE
  async function toggleFavorite(id) {
    try {
      const res = await API.toggleFavorite(id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- EVENT LISTENERS ---

  // Export Dropdown
  DOM.exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.exportDropdown.parentElement.classList.toggle('active');
  });

  DOM.exportDropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      if (!isStaticHosting) return;
      event.preventDefault();

      const format = new URL(link.href).searchParams.get('format');
      const contacts = readStoredContacts().sort((a, b) => a.name.localeCompare(b.name));
      const content = format === 'csv'
        ? [
            ['ID', 'Name', 'Email', 'Phone', 'Category', 'Favorite', 'Notes', 'Created At'],
            ...contacts.map(contact => [
              contact.id,
              contact.name,
              contact.email,
              contact.phone,
              contact.category,
              contact.is_favorite ? 'Yes' : 'No',
              contact.notes,
              contact.created_at
            ])
          ].map(row => row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\n')
        : JSON.stringify(contacts, null, 2);
      const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
      const downloadUrl = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = format === 'csv' ? 'contacts.csv' : 'contacts.json';
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);
    });
  });

  document.addEventListener('click', () => {
    DOM.exportDropdown.parentElement.classList.remove('active');
  });

  // Search Input (with Debounce)
  let searchTimeout = null;
  DOM.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    state.searchQuery = val;

    if (val.trim()) {
      DOM.clearSearchBtn.classList.remove('hidden');
    } else {
      DOM.clearSearchBtn.classList.add('hidden');
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadData();
    }, 250);
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.searchQuery = '';
    DOM.clearSearchBtn.classList.add('hidden');
    loadData();
  });

  // Category Pills Filter
  DOM.categoryPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    DOM.categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    state.activeCategory = pill.dataset.category;
    loadData();
  });

  // Sort Selector
  DOM.sortSelect.addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    loadData();
  });

  // View Toggle (Grid vs List)
  DOM.gridViewBtn.addEventListener('click', () => {
    state.viewMode = 'grid';
    DOM.gridViewBtn.classList.add('active');
    DOM.listViewBtn.classList.remove('active');
    renderContacts();
  });

  DOM.listViewBtn.addEventListener('click', () => {
    state.viewMode = 'list';
    DOM.listViewBtn.classList.add('active');
    DOM.gridViewBtn.classList.remove('active');
    renderContacts();
  });

  // Open Add Modal
  DOM.openAddModalBtn.addEventListener('click', () => openAddEditModal(null));
  DOM.emptyAddBtn.addEventListener('click', () => openAddEditModal(null));

  // Modal Close Buttons
  DOM.closeModalBtn.addEventListener('click', closeAddEditModal);
  DOM.cancelFormBtn.addEventListener('click', closeAddEditModal);
  DOM.closeViewModalBtn.addEventListener('click', closeViewModal);
  DOM.cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Close modals on overlay click
  [DOM.contactModal, DOM.viewModal, DOM.deleteModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // INITIAL LOAD
  loadData();
});
