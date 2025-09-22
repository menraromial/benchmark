/**
 * Category page filtering and sorting functionality
 */

class CategoryFilters {
  constructor() {
    this.benchmarksGrid = document.getElementById('benchmarks-grid');
    this.benchmarkCards = [];
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.filteredItems = [];
    
    this.init();
  }
  
  init() {
    if (!this.benchmarksGrid) return;
    
    // Get all benchmark cards
    this.benchmarkCards = Array.from(this.benchmarksGrid.querySelectorAll('.benchmark-card'));
    this.filteredItems = [...this.benchmarkCards];
    
    // Initialize filters
    this.initializeFilters();
    this.initializePagination();
    this.initializeSearch();
    
    // Apply initial pagination
    this.updateDisplay();
  }
  
  initializeFilters() {
    // Difficulty filter
    const difficultyFilter = document.getElementById('difficulty-filter');
    if (difficultyFilter) {
      difficultyFilter.addEventListener('change', () => this.applyFilters());
    }
    
    // Subcategory filter
    const subcategoryFilter = document.getElementById('subcategory-filter');
    if (subcategoryFilter) {
      subcategoryFilter.addEventListener('change', () => this.applyFilters());
    }
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.applySorting());
    }
  }
  
  initializeSearch() {
    const searchInput = document.querySelector('.category-search .search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applySearch(e.target.value);
        }, 300);
      });
    }
  }
  
  initializePagination() {
    // URL parameters for initial state
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    this.currentPage = page;
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.currentPage = e.state.page;
        this.updateDisplay();
      }
    });
  }
  
  applyFilters() {
    const difficultyFilter = document.getElementById('difficulty-filter');
    const subcategoryFilter = document.getElementById('subcategory-filter');
    
    const selectedDifficulty = difficultyFilter ? difficultyFilter.value : '';
    const selectedSubcategory = subcategoryFilter ? subcategoryFilter.value : '';
    
    this.filteredItems = this.benchmarkCards.filter(card => {
      // Difficulty filter
      if (selectedDifficulty) {
        const difficultyBadge = card.querySelector('.difficulty-badge');
        if (!difficultyBadge || !difficultyBadge.classList.contains(`difficulty-${selectedDifficulty}`)) {
          return false;
        }
      }
      
      // Subcategory filter
      if (selectedSubcategory) {
        const cardData = this.getCardData(card);
        if (!cardData.subcategory || cardData.subcategory !== selectedSubcategory) {
          return false;
        }
      }
      
      return true;
    });
    
    this.currentPage = 1;
    this.applySorting();
  }
  
  applySearch(searchTerm) {
    if (!searchTerm.trim()) {
      this.applyFilters();
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.filteredItems = this.filteredItems.filter(card => {
      const cardData = this.getCardData(card);
      return (
        cardData.title.toLowerCase().includes(term) ||
        cardData.description.toLowerCase().includes(term) ||
        cardData.tags.some(tag => tag.toLowerCase().includes(term))
      );
    });
    
    this.currentPage = 1;
    this.updateDisplay();
  }
  
  applySorting() {
    const sortSelect = document.getElementById('sort-select');
    const sortBy = sortSelect ? sortSelect.value : 'title';
    
    this.filteredItems.sort((a, b) => {
      const dataA = this.getCardData(a);
      const dataB = this.getCardData(b);
      
      switch (sortBy) {
        case 'title':
          return dataA.title.localeCompare(dataB.title);
        
        case 'date':
          const dateA = new Date(dataA.lastUpdated || '1970-01-01');
          const dateB = new Date(dataB.lastUpdated || '1970-01-01');
          return dateB - dateA; // Most recent first
        
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          const diffA = difficultyOrder[dataA.difficulty] || 0;
          const diffB = difficultyOrder[dataB.difficulty] || 0;
          return diffA - diffB;
        
        default:
          return 0;
      }
    });
    
    this.updateDisplay();
  }
  
  getCardData(card) {
    const titleElement = card.querySelector('.card-title-link');
    const descriptionElement = card.querySelector('.card-text');
    const difficultyElement = card.querySelector('.difficulty-badge');
    const tagsElements = card.querySelectorAll('.tag');
    const lastUpdatedElement = card.querySelector('.metadata-item .fa-clock + .metadata-text');
    
    return {
      title: titleElement ? titleElement.textContent.trim() : '',
      description: descriptionElement ? descriptionElement.textContent.trim() : '',
      difficulty: difficultyElement ? this.extractDifficulty(difficultyElement) : '',
      tags: Array.from(tagsElements).map(tag => tag.textContent.trim()),
      lastUpdated: lastUpdatedElement ? lastUpdatedElement.textContent.trim() : '',
      subcategory: this.extractSubcategory(card)
    };
  }
  
  extractDifficulty(element) {
    if (element.classList.contains('difficulty-beginner')) return 'beginner';
    if (element.classList.contains('difficulty-intermediate')) return 'intermediate';
    if (element.classList.contains('difficulty-advanced')) return 'advanced';
    return '';
  }
  
  extractSubcategory(card) {
    // This would need to be extracted from the card data or URL
    // For now, return empty string
    return '';
  }
  
  updateDisplay() {
    // Hide all cards
    this.benchmarkCards.forEach(card => {
      card.style.display = 'none';
    });
    
    // Calculate pagination
    const totalItems = this.filteredItems.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
    
    // Show current page items
    for (let i = startIndex; i < endIndex; i++) {
      if (this.filteredItems[i]) {
        this.filteredItems[i].style.display = 'block';
      }
    }
    
    // Update pagination
    this.updatePagination(totalPages);
    
    // Update results count
    this.updateResultsCount(totalItems, startIndex + 1, endIndex);
    
    // Update URL
    this.updateURL();
  }
  
  updatePagination(totalPages) {
    const paginationWrapper = document.querySelector('.pagination-wrapper');
    if (!paginationWrapper || totalPages <= 1) {
      if (paginationWrapper) paginationWrapper.style.display = 'none';
      return;
    }
    
    paginationWrapper.style.display = 'block';
    const pagination = paginationWrapper.querySelector('.pagination');
    
    let paginationHTML = '';
    
    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <li class="page-item">
          <a href="#" class="page-link" data-page="${this.currentPage - 1}">
            <i class="fas fa-chevron-left"></i> Précédent
          </a>
        </li>
      `;
    }
    
    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    
    if (startPage > 1) {
      paginationHTML += `
        <li class="page-item">
          <a href="#" class="page-link" data-page="1">1</a>
        </li>
      `;
      if (startPage > 2) {
        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a href="#" class="page-link" data-page="${i}">${i}</a>
        </li>
      `;
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      paginationHTML += `
        <li class="page-item">
          <a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>
        </li>
      `;
    }
    
    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `
        <li class="page-item">
          <a href="#" class="page-link" data-page="${this.currentPage + 1}">
            Suivant <i class="fas fa-chevron-right"></i>
          </a>
        </li>
      `;
    }
    
    pagination.innerHTML = paginationHTML;
    
    // Add click handlers
    pagination.querySelectorAll('.page-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage = parseInt(e.target.dataset.page);
        this.updateDisplay();
        
        // Scroll to top of results
        this.benchmarksGrid.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
  
  updateResultsCount(total, start, end) {
    let countElement = document.querySelector('.results-count');
    if (!countElement) {
      // Create results count element
      const controlsWrapper = document.querySelector('.controls-wrapper');
      if (controlsWrapper) {
        countElement = document.createElement('div');
        countElement.className = 'results-count';
        controlsWrapper.appendChild(countElement);
      }
    }
    
    if (countElement) {
      if (total === 0) {
        countElement.textContent = 'Aucun résultat trouvé';
      } else if (total <= this.itemsPerPage) {
        countElement.textContent = `${total} résultat${total > 1 ? 's' : ''}`;
      } else {
        countElement.textContent = `Affichage de ${start} à ${end} sur ${total} résultats`;
      }
    }
  }
  
  updateURL() {
    const url = new URL(window.location);
    if (this.currentPage > 1) {
      url.searchParams.set('page', this.currentPage);
    } else {
      url.searchParams.delete('page');
    }
    
    // Update URL without triggering page reload
    window.history.replaceState(
      { page: this.currentPage },
      '',
      url.toString()
    );
  }
}

// Initialize when DOM is loaded
function initializeCategoryFilters() {
  new CategoryFilters();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CategoryFilters;
}