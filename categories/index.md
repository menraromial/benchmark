---
layout: default
title: "Toutes les Catégories"
description: "Explorez toutes les catégories de benchmarks disponibles dans le Research Benchmark Hub"
permalink: /categories/
---

<div class="categories-index-page">
  
  <!-- Header -->
  <section class="page-header">
    <div class="container">
      <h1 class="page-title">Toutes les Catégories</h1>
      <p class="page-description">
        Explorez nos collections de benchmarks organisées par domaine de recherche. 
        Chaque catégorie contient des guides détaillés avec instructions d'installation, 
        configuration et utilisation.
      </p>
    </div>
  </section>
  
  <!-- Categories Grid -->
  <section class="categories-listing">
    <div class="container">
      <div class="categories-grid">
        {% for category_data in site.data.categories %}
          {% assign category_id = category_data[0] %}
          {% assign category = category_data[1] %}
          {% assign category_benchmarks = site.benchmarks | where: "category", category_id %}
          
          <div class="category-card" style="--category-color: {{ category.color }}">
            <a href="{{ '/categories/' | append: category_id | relative_url }}" class="category-link">
              <div class="category-header">
                <div class="category-icon">
                  <i class="fas fa-{{ category.icon }}"></i>
                </div>
                <div class="category-meta">
                  <span class="benchmark-count">{{ category_benchmarks.size }} benchmark{% if category_benchmarks.size != 1 %}s{% endif %}</span>
                </div>
              </div>
              
              <div class="category-content">
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-description">{{ category.description }}</p>
                
                <!-- Popular benchmarks preview -->
                {% if category.popular_benchmarks and category.popular_benchmarks.size > 0 %}
                  <div class="popular-benchmarks">
                    <span class="popular-label">Populaires:</span>
                    {% for benchmark_name in category.popular_benchmarks limit: 3 %}
                      <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                    {% endfor %}
                  </div>
                {% endif %}
                
                <!-- Subcategories -->
                {% if category.subcategories and category.subcategories.size > 0 %}
                  <div class="subcategories">
                    {% for subcategory in category.subcategories limit: 4 %}
                      <span class="subcategory-tag">{{ subcategory }}</span>
                    {% endfor %}
                    {% if category.subcategories.size > 4 %}
                      <span class="subcategory-more">+{{ category.subcategories.size | minus: 4 }}</span>
                    {% endif %}
                  </div>
                {% endif %}
              </div>
              
              <div class="category-footer">
                <span class="explore-text">Explorer →</span>
              </div>
            </a>
          </div>
        {% endfor %}
      </div>
    </div>
  </section>
  
  <!-- Statistics -->
  <section class="categories-stats">
    <div class="container">
      <h2 class="section-title">Statistiques</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ site.benchmarks | size }}</div>
            <div class="stat-label">Benchmarks Total</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ site.data.categories | size }}</div>
            <div class="stat-label">Catégories</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ site.benchmarks | where: "difficulty", "beginner" | size }}</div>
            <div class="stat-label">Guides Débutant</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            {% assign recent_benchmarks = site.benchmarks | where_exp: "item", "item.last_updated != nil" %}
            <div class="stat-number">{{ recent_benchmarks | size }}</div>
            <div class="stat-label">Avec dates de MAJ</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
</div>

<style>
.categories-index-page {
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 3rem 0;
    text-align: center;
    
    @media (max-width: 768px) {
      padding: 2rem 0;
    }
  }
  
  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .page-description {
    font-size: 1.25rem;
    opacity: 0.9;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
  }
  
  .categories-listing {
    padding: 4rem 0;
  }
  
  .categories-stats {
    background-color: #f8f9fa;
    padding: 4rem 0;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  }
  
  .stat-card {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateY(-4px);
    }
  }
  
  .stat-icon {
    font-size: 2.5rem;
    color: #3498db;
    margin-bottom: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}
</style>