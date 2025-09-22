/**
 * Search functionality using Lunr.js
 * Provides real-time search with filtering and highlighting
 */

class SearchEngine {
  constructor() {
    this.searchIndex = null;
    this.searchData = null;
    this.lunrIndex = null;
    this.isInitialized = false;
    this.searchInput = null;
    this.searchResults = null;
    this.searchSuggestions = null;
    this.currentQuery = '';
    this.searchTimeout = null;
    
    // Popular search terms for suggestions
    this.popularSearches = [
      'cloud computing',
      'performance',
      'parallel',
      'HPC',
      'energy',
      'distributed',
      'IoT',
      'benchmark',
      'LINPACK',
      'SPEC',
      'MPI',
      'OpenMP',
      'CUDA'
    ];
    
    this.init();
  }
  
  async init() {
    try {
      // Load Lunr.js
      await this.loadLunr();
      
      // Load search data
      await this.loadSearchData();
      
      // Initialize search interface
      this.initializeInterface();
      
      // Build search index
      this.buildSearchIndex();
      
      this.isInitialized = true;
      console.log('Search engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search engine:', error);
    }
  }
  
  async loadLunr() {
    return new Promise((resolve, reject) => {
      if (typeof lunr !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lunr.js/2.3.9/lunr.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Lunr.js'));
      document.head.appendChild(script);
    });
  }
  
  async loadSearchData() {
    try {
      const response = await fetch('/search.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.searchData = await response.json();
    } catch (error) {
      console.error('Failed to load search data:', error);
      throw error;
    }
  }
  
  buildSearchIndex() {
    if (!this.searchData || typeof lunr === 'undefined') {
      console.error('Cannot build search index: missing data or Lunr.js');
      return;
    }
    
    this.lunrIndex = lunr(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('description', { boost: 5 });
      this.field('tags', { boost: 8 });
      this.field('category', { boost: 6 });
      this.field('subcategory', { boost: 4 });
      this.field('platforms', { boost: 2 });
      this.field('languages', { boost: 2 });
      this.field('maintainer', { boost: 1 });
      this.field('content', { boost: 1 });
      
      // Add benchmarks to index
      this.searchData.benchmarks.forEach(benchmark => {
        this.add({
          id: benchmark.id,
          title: benchmark.title,
          description: benchmark.description,
          tags: Array.isArray(benchmark.tags) ? benchmark.tags.join(' ') : '',
          category: benchmark.category,
          subcategory: benchmark.subcategory || '',
          platforms: Array.isArray(benchmark.platforms) ? benchmark.platforms.join(' ') : '',
          languages: Array.isArray(benchmark.languages) ? benchmark.languages.join(' ') : '',
          maintainer: benchmark.maintainer,
          content: benchmark.content
        });
      });
    });
  }
  
  initializeInterface() {
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.searchSuggestions = document.getElementById('search-suggestions');
    
    if (!this.searchInput) {
      console.warn('Search input not found');
      return;
    }
    
    // Add event listeners
    this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
    this.searchInput.addEventListener('focus', () => this.handleSearchFocus());
    this.searchInput.addEventListener('blur', (e) => this.handleSearchBlur(e));
    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Initialize suggestions
    this.initializeSuggestions();
  }
  
  handleSearchInput(event) {
    const query = event.target.value.trim();
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search
    this.searchTimeout = setTimeout(() => {
      if (query.length === 0) {
        this.hideResults();
        this.showSuggestions();
      } else if (query.length >= 2) {
        this.performSearch(query);
      }
    }, 300);
  }
  
  handleSearchFocus() {
    if (this.searchInput.value.trim().length === 0) {
      this.showSuggestions();
    }
  }
  
  handleSearchBlur(event) {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      if (!event.relatedTarget || !event.relatedTarget.closest('.search-wrapper')) {
        this.hideResults();
        this.hideSuggestions();
      }
    }, 150);
  }
  
  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.hideResults();
      this.hideSuggestions();
      this.searchInput.blur();
      return;
    }
    
    // Handle arrow key navigation in results
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateResults(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    
    // Handle Enter key
    if (event.key === 'Enter') {
      const activeResult = document.querySelector('.search-result-item.active, .suggestion-item.active');
      if (activeResult) {
        event.preventDefault();
        activeResult.click();
      }
    }
  }
  
  navigateResults(direction) {
    const results = document.querySelectorAll('.search-result-item, .suggestion-item');
    if (results.length === 0) return;
    
    const currentActive = document.querySelector('.search-result-item.active, .suggestion-item.active');
    let newIndex = 0;
    
    if (currentActive) {
      const currentIndex = Array.from(results).indexOf(currentActive);
      newIndex = currentIndex + direction;
      currentActive.classList.remove('active');
    }
    
    // Wrap around
    if (newIndex < 0) newIndex = results.length - 1;
    if (newIndex >= results.length) newIndex = 0;
    
    results[newIndex].classList.add('active');
    results[newIndex].scrollIntoView({ block: 'nearest' });
  }
  
  performSearch(query) {
    if (!this.isInitialized || !this.lunrIndex) {
      console.warn('Search not initialized');
      return;
    }
    
    this.currentQuery = query;
    this.hideSuggestions();
    
    try {
      // Perform Lunr search with fuzzy matching
      let searchQuery = query;
      
      // Add fuzzy matching for single words
      const words = query.trim().split(/\s+/);
      if (words.length === 1 && words[0].length > 3) {
        searchQuery += `~1`; // Allow 1 character difference
      }
      
      // Perform search
      const results = this.lunrIndex.search(searchQuery);
      
      // Get benchmark data for results
      let benchmarkResults = results.map(result => {
        const benchmark = this.searchData.benchmarks.find(b => b.id === result.ref);
        return {
          ...benchmark,
          score: result.score
        };
      }).filter(Boolean);
      
      // Apply filters
      benchmarkResults = this.applyFilters(benchmarkResults);
      
      // Apply sorting
      benchmarkResults = this.applySorting(benchmarkResults);
      
      this.displayResults(benchmarkResults, query);
      
      // Track search analytics
      this.trackSearch(query, benchmarkResults.length);
      
    } catch (error) {
      console.error('Search error:', error);
      this.displayError();
    }
  }
  
  applyFilters(results) {
    const categoryFilter = document.getElementById('search-category-filter');
    const difficultyFilter = document.getElementById('search-difficulty-filter');
    
    let filteredResults = [...results];
    
    // Category filter
    if (categoryFilter && categoryFilter.value) {
      filteredResults = filteredResults.filter(benchmark => 
        benchmark.category === categoryFilter.value
      );
    }
    
    // Difficulty filter
    if (difficultyFilter && difficultyFilter.value) {
      filteredResults = filteredResults.filter(benchmark => 
        benchmark.difficulty === difficultyFilter.value
      );
    }
    
    return filteredResults;
  }
  
  applySorting(results) {
    const sortFilter = document.getElementById('search-sort-filter');
    const sortBy = sortFilter ? sortFilter.value : 'relevance';
    
    const sortedResults = [...results];
    
    switch (sortBy) {
      case 'title':
        sortedResults.sort((a, b) => a.title.localeCompare(b.title));
        break;
      
      case 'date':
        sortedResults.sort((a, b) => {
          const dateA = new Date(a.last_updated || '1970-01-01');
          const dateB = new Date(b.last_updated || '1970-01-01');
          return dateB - dateA; // Most recent first
        });
        break;
      
      case 'difficulty':
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        sortedResults.sort((a, b) => {
          const diffA = difficultyOrder[a.difficulty] || 0;
          const diffB = difficultyOrder[b.difficulty] || 0;
          return diffA - diffB;
        });
        break;
      
      case 'relevance':
      default:
        // Already sorted by Lunr score
        break;
    }
    
    return sortedResults;
  }
  
  displayResults(results, query) {
    if (!this.searchResults) return;
    
    const resultsContainer = document.getElementById('search-results-list');
    const resultsCount = document.getElementById('search-results-count');
    const noResults = document.getElementById('search-no-results');
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '';
      noResults.style.display = 'block';
      resultsCount.textContent = '';
      
      // Show suggestion tags for no results
      this.showSuggestionTags(query);
    } else {
      noResults.style.display = 'none';
      resultsCount.textContent = `${results.length} résultat${results.length > 1 ? 's' : ''}`;
      
      resultsContainer.innerHTML = results.map(benchmark => 
        this.createResultHTML(benchmark, query)
      ).join('');
    }
    
    this.searchResults.style.display = 'block';
    
    // Initialize filter event listeners
    this.initializeFilterListeners();
  }
  
  showSuggestionTags(query) {
    const suggestionTags = document.getElementById('search-suggestion-tags');
    if (!suggestionTags) return;
    
    // Get popular tags from all benchmarks
    const allTags = new Set();
    this.searchData.benchmarks.forEach(benchmark => {
      if (benchmark.tags && Array.isArray(benchmark.tags)) {
        benchmark.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    // Convert to array and sort by popularity (simplified)
    const popularTags = Array.from(allTags).slice(0, 10);
    
    suggestionTags.innerHTML = popularTags.map(tag => `
      <span class="suggestion-tag" data-tag="${tag}">
        ${tag}
      </span>
    `).join('');
    
    // Add click handlers
    suggestionTags.querySelectorAll('.suggestion-tag').forEach(tagElement => {
      tagElement.addEventListener('click', () => {
        const tag = tagElement.dataset.tag;
        this.searchInput.value = tag;
        this.performSearch(tag);
      });
    });
  }
  
  initializeFilterListeners() {
    const categoryFilter = document.getElementById('search-category-filter');
    const difficultyFilter = document.getElementById('search-difficulty-filter');
    const sortFilter = document.getElementById('search-sort-filter');
    const clearButton = document.getElementById('search-filter-clear');
    
    // Remove existing listeners to avoid duplicates
    [categoryFilter, difficultyFilter, sortFilter].forEach(filter => {
      if (filter && !filter.dataset.listenerAdded) {
        filter.addEventListener('change', () => {
          if (this.currentQuery) {
            this.performSearch(this.currentQuery);
          }
        });
        filter.dataset.listenerAdded = 'true';
      }
    });
    
    if (clearButton && !clearButton.dataset.listenerAdded) {
      clearButton.addEventListener('click', () => {
        this.clearFilters();
        if (this.currentQuery) {
          this.performSearch(this.currentQuery);
        }
      });
      clearButton.dataset.listenerAdded = 'true';
    }
  }
  
  clearFilters() {
    const categoryFilter = document.getElementById('search-category-filter');
    const difficultyFilter = document.getElementById('search-difficulty-filter');
    const sortFilter = document.getElementById('search-sort-filter');
    
    if (categoryFilter) categoryFilter.value = '';
    if (difficultyFilter) difficultyFilter.value = '';
    if (sortFilter) sortFilter.value = 'relevance';
  }
  
  createResultHTML(benchmark, query) {
    const categoryData = this.getCategoryData(benchmark.category);
    const highlightedTitle = this.highlightText(benchmark.title, query);
    const highlightedDescription = this.highlightText(benchmark.description, query);
    
    return `
      <a href="${benchmark.url}" class="search-result-item">
        <h4 class="search-result-title">${highlightedTitle}</h4>
        <p class="search-result-description">${highlightedDescription}</p>
        <div class="search-result-meta">
          <span class="search-result-category">
            <i class="fas fa-folder"></i>
            ${categoryData ? categoryData.name : benchmark.category}
          </span>
          <span class="search-result-difficulty">
            <i class="fas fa-signal"></i>
            ${this.formatDifficulty(benchmark.difficulty)}
          </span>
          ${benchmark.tags && benchmark.tags.length > 0 ? `
            <span class="search-result-tags">
              <i class="fas fa-tags"></i>
              ${benchmark.tags.slice(0, 3).join(', ')}
            </span>
          ` : ''}
        </div>
      </a>
    `;
  }
  
  highlightText(text, query) {
    if (!text || !query) return text;
    
    // Split query into individual words for better highlighting
    const words = query.trim().split(/\s+/).filter(word => word.length > 1);
    let highlightedText = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
    });
    
    return highlightedText;
  }
  
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  getCategoryData(categoryId) {
    return this.searchData.categories.find(cat => cat.id === categoryId);
  }
  
  formatDifficulty(difficulty) {
    const difficultyMap = {
      'beginner': 'Débutant',
      'intermediate': 'Intermédiaire',
      'advanced': 'Avancé'
    };
    return difficultyMap[difficulty] || difficulty;
  }
  
  displayError() {
    if (!this.searchResults) return;
    
    const resultsContainer = document.getElementById('search-results-list');
    resultsContainer.innerHTML = `
      <div class="search-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Une erreur s'est produite lors de la recherche. Veuillez réessayer.</p>
      </div>
    `;
    
    this.searchResults.style.display = 'block';
  }
  
  initializeSuggestions() {
    if (!this.searchSuggestions) return;
    
    const suggestionsList = document.getElementById('suggestions-list');
    if (!suggestionsList) return;
    
    // Combine popular searches with user's recent searches
    const suggestions = this.getSuggestions();
    
    suggestionsList.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-item" data-term="${suggestion.term}">
        <i class="fas fa-${suggestion.type === 'recent' ? 'history' : 'search'}"></i>
        ${suggestion.term}
        ${suggestion.type === 'recent' ? '<span class="suggestion-recent">récent</span>' : ''}
      </div>
    `).join('');
    
    // Add click handlers for suggestions
    suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const term = item.dataset.term;
        this.searchInput.value = term;
        this.performSearch(term);
      });
    });
  }
  
  getSuggestions() {
    const suggestions = [];
    
    // Add recent searches from localStorage
    try {
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const recentSearches = searchHistory
        .slice(0, 5)
        .map(search => ({
          term: search.query,
          type: 'recent'
        }));
      suggestions.push(...recentSearches);
    } catch (error) {
      console.warn('Could not load search history:', error);
    }
    
    // Add popular searches
    const popularSuggestions = this.popularSearches
      .filter(term => !suggestions.some(s => s.term === term))
      .slice(0, 8)
      .map(term => ({
        term: term,
        type: 'popular'
      }));
    
    suggestions.push(...popularSuggestions);
    
    return suggestions.slice(0, 10);
  }
  
  showSuggestions() {
    if (this.searchSuggestions) {
      this.searchSuggestions.style.display = 'block';
    }
  }
  
  hideSuggestions() {
    if (this.searchSuggestions) {
      this.searchSuggestions.style.display = 'none';
    }
  }
  
  hideResults() {
    if (this.searchResults) {
      this.searchResults.style.display = 'none';
    }
  }
  
  trackSearch(query, resultCount) {
    // Track search analytics with multiple providers
    const searchData = {
      query: query,
      resultCount: resultCount,
      timestamp: new Date().toISOString(),
      filters: this.getCurrentFilters()
    };
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: query,
        result_count: resultCount,
        custom_parameters: {
          has_filters: Object.keys(searchData.filters).length > 0,
          category_filter: searchData.filters.category || '',
          difficulty_filter: searchData.filters.difficulty || ''
        }
      });
    }
    
    // Custom analytics (can be sent to your own analytics endpoint)
    this.sendCustomAnalytics(searchData);
    
    // Store popular searches in localStorage
    this.updatePopularSearches(query);
    
    // Store search history for user
    this.updateSearchHistory(searchData);
  }
  
  getCurrentFilters() {
    const categoryFilter = document.getElementById('search-category-filter');
    const difficultyFilter = document.getElementById('search-difficulty-filter');
    const sortFilter = document.getElementById('search-sort-filter');
    
    return {
      category: categoryFilter ? categoryFilter.value : '',
      difficulty: difficultyFilter ? difficultyFilter.value : '',
      sort: sortFilter ? sortFilter.value : 'relevance'
    };
  }
  
  sendCustomAnalytics(searchData) {
    // This could send data to your own analytics endpoint
    // For now, we'll just log it for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Search Analytics:', searchData);
    }
    
    // In production, you might send this to your analytics service:
    // fetch('/api/analytics/search', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(searchData)
    // });
  }
  
  updateSearchHistory(searchData) {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      history.unshift(searchData);
      
      // Keep only last 50 searches
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem('searchHistory', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.warn('Could not update search history:', error);
    }
  }
  
  updatePopularSearches(query) {
    try {
      const searches = JSON.parse(localStorage.getItem('popularSearches') || '{}');
      searches[query] = (searches[query] || 0) + 1;
      
      // Keep only top 20 searches
      const sortedSearches = Object.entries(searches)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
      
      localStorage.setItem('popularSearches', JSON.stringify(Object.fromEntries(sortedSearches)));
    } catch (error) {
      console.warn('Could not update popular searches:', error);
    }
  }
  
  // Public API methods
  search(query) {
    if (this.searchInput) {
      this.searchInput.value = query;
      this.performSearch(query);
    }
  }
  
  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.hideResults();
      this.hideSuggestions();
    }
  }
}

// Initialize search engine when DOM is loaded
let searchEngine = null;

document.addEventListener('DOMContentLoaded', function() {
  searchEngine = new SearchEngine();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.SearchEngine = SearchEngine;
  window.getSearchEngine = () => searchEngine;
}