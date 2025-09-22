---
layout: default
title: Recherche
description: Recherchez parmi tous les benchmarks disponibles
permalink: /search/
---

<div class="search-page">
  <div class="container">
    
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Recherche de Benchmarks</h1>
      <p class="page-description">
        Trouvez rapidement les benchmarks qui correspondent à vos besoins de recherche
      </p>
    </div>
    
    <!-- Search Interface -->
    <div class="search-interface">
      {% include search.html placeholder="Rechercher parmi tous les benchmarks..." %}
    </div>
    
    <!-- Search Tips -->
    <div class="search-tips" id="search-tips">
      <h3>Conseils de recherche</h3>
      <div class="tips-grid">
        <div class="tip-item">
          <i class="fas fa-lightbulb"></i>
          <h4>Mots-clés</h4>
          <p>Utilisez des termes spécifiques comme "LINPACK", "MPI", "cloud performance"</p>
        </div>
        <div class="tip-item">
          <i class="fas fa-filter"></i>
          <h4>Filtres</h4>
          <p>Affinez vos résultats par catégorie, difficulté ou date de mise à jour</p>
        </div>
        <div class="tip-item">
          <i class="fas fa-tags"></i>
          <h4>Tags</h4>
          <p>Recherchez par tags comme "parallel", "GPU", "energy", "distributed"</p>
        </div>
        <div class="tip-item">
          <i class="fas fa-keyboard"></i>
          <h4>Navigation</h4>
          <p>Utilisez les flèches ↑↓ pour naviguer et Entrée pour sélectionner</p>
        </div>
      </div>
    </div>
    
    <!-- Popular Categories -->
    <div class="popular-categories" id="popular-categories">
      <h3>Catégories populaires</h3>
      <div class="categories-grid">
        {% for category_data in site.data.categories %}
          <a href="/categories/{{ category_data[0] }}/" class="category-quick-link">
            <i class="fas fa-{{ category_data[1].icon | default: 'folder' }}"></i>
            <span class="category-name">{{ category_data[1].name }}</span>
            <span class="category-count">
              {% assign category_benchmarks = site.benchmarks | where: "category", category_data[0] %}
              {{ category_benchmarks.size }} benchmark{{ category_benchmarks.size | pluralize: '', 's' }}
            </span>
          </a>
        {% endfor %}
      </div>
    </div>
    
    <!-- Recent Benchmarks -->
    <div class="recent-benchmarks" id="recent-benchmarks">
      <h3>Benchmarks récemment ajoutés</h3>
      <div class="benchmarks-grid">
        {% assign recent_benchmarks = site.benchmarks | sort: 'last_updated' | reverse | limit: 6 %}
        {% for benchmark in recent_benchmarks %}
          {% include benchmark-card.html benchmark=benchmark %}
        {% endfor %}
      </div>
    </div>
    
  </div>
</div>

<style>
.search-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.125rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

.search-interface {
  max-width: 800px;
  margin: 0 auto 4rem;
}

.search-tips {
  margin-bottom: 4rem;
}

.search-tips h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.tip-item {
  text-align: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.tip-item i {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.tip-item h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.tip-item p {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.popular-categories {
  margin-bottom: 4rem;
}

.popular-categories h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.category-quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: #fff;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.category-quick-link:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
}

.category-quick-link i {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.category-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.category-count {
  font-size: 0.875rem;
  color: #6c757d;
}

.recent-benchmarks h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.benchmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Hide tips and categories when search is active */
.search-results[style*="block"] ~ .container .search-tips,
.search-results[style*="block"] ~ .container .popular-categories,
.search-results[style*="block"] ~ .container .recent-benchmarks {
  display: none;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .benchmarks-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Hide tips and categories when search results are shown
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const isVisible = searchResults.style.display === 'block';
          const tips = document.getElementById('search-tips');
          const categories = document.getElementById('popular-categories');
          const recent = document.getElementById('recent-benchmarks');
          
          [tips, categories, recent].forEach(element => {
            if (element) {
              element.style.display = isVisible ? 'none' : 'block';
            }
          });
        }
      });
    });
    
    observer.observe(searchResults, { attributes: true });
  }
  
  // Handle URL search parameter
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  if (searchQuery && window.getSearchEngine) {
    // Wait for search engine to initialize
    const checkSearchEngine = setInterval(() => {
      const searchEngine = window.getSearchEngine();
      if (searchEngine && searchEngine.isInitialized) {
        clearInterval(checkSearchEngine);
        searchEngine.search(searchQuery);
      }
    }, 100);
  }
});
</script>