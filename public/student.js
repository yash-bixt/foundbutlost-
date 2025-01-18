// Sample data
const SAMPLE_ITEMS = [
  {
    id: 13,
    name: "Black Laptop",
    type: "Electronics",
    location: "Library",
    description: "Found near study area",
    date: "2025-01-15",
    status: "available",
    studentStatus: " ",
    image: null,
  },
  {
    id: 10,
    name: "Black Laptop",
    type: "Electronics",
    location: "Library",
    description: "Found near study area",
    date: "2025-01-15",
    status: "available",
    studentStatus: " ",
    image: null,
  },
  {
    id: 1,
    name: "Black Laptop",
    type: "Electronics",
    location: "Library",
    description: "Found near study area",
    date: "2025-01-15",
    status: "available",
    studentStatus: " ",
    image: null,
  },
  {
    id: 2,
    name: "Black Laptop",
    type: "Electronics",
    location: "Library",
    description: "Found near study area",
    date: "2025-01-15",
    status: "available",
    studentStatus: " ",
    image: null,
  },
  {
    id: 3,
    name: "Black Laptop",
    type: "Stationery",
    location: "Library",
    description: "Found near study area",
    date: "2025-01-15",
    status: "available",
    studentStatus: "requested",
    image: null,
  },
  {
    id: 4,
    name: "Black Laptop",
    type: "Electronics",
    location: "Library",
    description: "Found near study area",
    date: "2025-01-15",
    status: "unavailable",
    studentStatus: " ",
    image: null,
  },
];

// Constants
const ITEM_TYPES = [
  "Electronics",
  "Stationery",
  "Clothing and Accessories",
  "Personal Belongings",
  "Miscellaneous",
];
const STATUSES = ["available", "unavailable"];
const STUDENT_STATUSES = ["requested", "approved"];

// State management
let items = [...SAMPLE_ITEMS];
let filters = {
  types: [],
  statuses: [],
  studentStatuses: [],
  search: "",
};
let sortOrder = "latest";

// Utility functions
function createIcon(type) {
  const icons = {
    clock: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" /></svg>',
    image: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>'
  };
  return icons[type] || '';
}

// Filter and sort functions
function filterAndSortItems() {
  return items
    .filter(item => {
      const matchesType = filters.types.length === 0 || filters.types.includes(item.type);
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(item.status);
      const matchesStudentStatus = 
        filters.studentStatuses.length === 0 || 
        (item.studentStatus && item.studentStatus.trim() !== "" && filters.studentStatuses.includes(item.studentStatus));
      const matchesSearch = 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());
      return matchesType && matchesStatus && matchesStudentStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return new Date(b.date) - new Date(a.date);
      }
      return new Date(a.date) - new Date(b.date);
    });
}

// DOM manipulation functions
function renderItems() {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = '';

  const filteredItems = filterAndSortItems();
  
  filteredItems.forEach(item => {
    const itemElement = createItemCard(item);
    container.appendChild(itemElement);
  });
}

function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  const button = getActionButton(item);
  
  card.innerHTML = `
    <div class="item-grid">
      <div class="item-image-container">
        ${item.image ? 
          `<img src="${item.image}" alt="${item.name}" class="item-image">` :
          `<div class="item-image-placeholder">${createIcon('image')}</div>`
        }
      </div>
      <div class="item-content">
        <div class="item-header">
          <div>
            <h3 class="item-title">${item.name}</h3>
            <p class="item-type">${item.type}</p>
          </div>
          <span class="status-badge status-${item.status}">${item.status}</span>
          ${item.studentStatus && item.studentStatus.trim() ? 
            `<span class="studentStatus-badge studentStatus-${item.studentStatus}">${item.studentStatus}</span>` : 
            ''
          }
        </div>
        <div class="item-details">
          <p><strong>Location:</strong> ${item.location}</p>
          <p><strong>Description:</strong> ${item.description}</p>
          <p><strong>Date:</strong> ${item.date}</p>
        </div>
        <div class="item-footer">
          ${button}
        </div>
      </div>
    </div>
  `;

  // Add event listeners for buttons
  const actionButton = card.querySelector('.button');
  if (actionButton) {
    actionButton.addEventListener('click', () => {
      const confirmAction = confirm("Are you sure you want to proceed?");
      if (confirmAction) {
        if (actionButton.classList.contains('button-primary')) {
          handleCreateRequest(item.id);
        } else if (actionButton.textContent.includes('Mark as Collected')) {
          handleMarkAsCollected(item.id);
        }
      }
    });
  }

  return card;
}

function getActionButton(item) {
  if (item.status === "unavailable") {
    return '';
  }

  if (item.status === "available") {
    if (item.studentStatus === " " || !item.studentStatus) {
      return `<button class="button button-primary">Create Request${createIcon('clock')}</button>`;
    } else if (item.studentStatus === "requested") {
      return `<button class="button button-outline" disabled>Requested${createIcon('clock')}</button>`;
    } else if (item.studentStatus === "approved") {
      return `<button class="button button-outline">Mark as Collected${createIcon('check')}</button>`;
    }
  }

  return '';
}

// Event handlers
function handleCreateRequest(itemId) {
  items = items.map(item => 
    item.id === itemId 
      ? { ...item, status: "available", studentStatus: "requested" }
      : item
  );
  renderItems();
}

function handleMarkAsCollected(itemId) {
  items = items.map(item => 
    item.id === itemId 
      ? { ...item, status: "unavailable", studentStatus: "approved" }
      : item
  );
  renderItems();
}

// Filter panel functions
function createFilterPanel() {
  const filterContent = document.querySelector('.filter-content');
  filterContent.innerHTML = `
    <div class="filter-section">
      <p class="filter-label">Type</p>
      <div class="checkbox-group">
        ${ITEM_TYPES.map(type => `
          <label class="checkbox-label">
            <input type="checkbox" data-filter="types" value="${type}">
            <span>${type}</span>
          </label>
        `).join('')}
      </div>

      <p class="filter-label">Status</p>
      <div class="checkbox-group">
        ${STATUSES.map(status => `
          <label class="checkbox-label">
            <input type="checkbox" data-filter="statuses" value="${status}">
            <span>${status}</span>
          </label>
        `).join('')}
      </div>

      <p class="filter-label">Student Status</p>
      <div class="checkbox-group">
        ${STUDENT_STATUSES.map(studentStatus => `
          <label class="checkbox-label">
            <input type="checkbox" data-filter="studentStatuses" value="${studentStatus}">
            <span>${studentStatus}</span>
          </label>
        `).join('')}
      </div>
    </div>

    <div class="filter-section">
      <p class="filter-label">Search</p>
      <input class="search-input" type="text" placeholder="Search keywords...">
    </div>
  `;

  // Add event listeners for filter inputs
  filterContent.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const filterType = e.target.dataset.filter;
      const value = e.target.value;
      const checked = e.target.checked;

      if (checked) {
        filters[filterType].push(value);
      } else {
        filters[filterType] = filters[filterType].filter(item => item !== value);
      }
      renderItems();
    });
  });

  filterContent.querySelector('.search-input').addEventListener('input', (e) => {
    filters.search = e.target.value;
    renderItems();
  });
}

// Initialize the application
function initializeApp() {
  // Create filter panel
  createFilterPanel();

  // Set up event listeners
  document.getElementById('filterButton').addEventListener('click', () => {
    document.getElementById('filterModal').style.display = 'flex';
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('filterModal').style.display = 'none';
  });

  document.getElementById('filterModal').addEventListener('click', (e) => {
    if (e.target.id === 'filterModal') {
      document.getElementById('filterModal').style.display = 'none';
    }
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    sortOrder = e.target.value;
    renderItems();
  });

  // Initial render
  renderItems();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);