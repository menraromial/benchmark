---
layout: default
title: "Research Benchmark Hub"
description: "Hub centralisé de benchmarks pour la recherche en informatique dans les domaines du cloud computing, green computing, systèmes distribués, IoT, énergie, calcul parallèle et HPC."
---

<!-- Hero Section -->
<section class="hero-section">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">Research Benchmark Hub</h1>
      <p class="hero-description">
        Hub centralisé de benchmarks pour la recherche en informatique dans les domaines 
        du cloud computing, green computing, systèmes distribués, IoT, énergie, 
        calcul parallèle et HPC (High Performance Computing).
      </p>
      
      <!-- Search Bar -->
      <div class="hero-search">
        {% include search.html %}
      </div>
      
      <!-- Quick Stats -->
      <div class="hero-stats">
        {% assign total_benchmarks = site.benchmarks | size %}
        {% assign categories_count = site.data.categories | size %}
        <div class="stat-item">
          <span class="stat-number">{{ total_benchmarks }}</span>
          <span class="stat-label">Benchmarks</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ categories_count }}</span>
          <span class="stat-label">Domaines</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ site.benchmarks | where: "difficulty", "beginner" | size }}</span>
          <span class="stat-label">Guides Débutant</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Categories Grid -->
<section class="categories-section">
  <div class="container">
    <h2 class="section-title">Domaines de Recherche</h2>
    <p class="section-description">
      Explorez nos collections de benchmarks organisées par domaine de recherche. 
      Chaque catégorie contient des guides détaillés avec instructions d'installation, 
      configuration et utilisation.
    </p>
    
    <div class="categories-grid">
      <!-- Cloud Computing -->
      {% assign cloud_benchmarks = site.benchmarks | where: "category", "cloud-computing" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.cloud-computing.color }}">
        <a href="{{ '/categories/cloud-computing/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.cloud-computing.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ cloud_benchmarks.size }} benchmark{% if cloud_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.cloud-computing.name }}</h3>
            <p class="category-description">{{ site.data.categories.cloud-computing.description }}</p>
            
            <!-- Popular benchmarks preview -->
            {% if site.data.categories.cloud-computing.popular_benchmarks and site.data.categories.cloud-computing.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.cloud-computing.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            <!-- Subcategories -->
            {% if site.data.categories.cloud-computing.subcategories and site.data.categories.cloud-computing.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.cloud-computing.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.cloud-computing.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.cloud-computing.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>

      <!-- Green Computing -->
      {% assign green_benchmarks = site.benchmarks | where: "category", "green-computing" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.green-computing.color }}">
        <a href="{{ '/categories/green-computing/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.green-computing.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ green_benchmarks.size }} benchmark{% if green_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.green-computing.name }}</h3>
            <p class="category-description">{{ site.data.categories.green-computing.description }}</p>
            
            {% if site.data.categories.green-computing.popular_benchmarks and site.data.categories.green-computing.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.green-computing.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            {% if site.data.categories.green-computing.subcategories and site.data.categories.green-computing.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.green-computing.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.green-computing.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.green-computing.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>

      <!-- Distributed Systems -->
      {% assign distributed_benchmarks = site.benchmarks | where: "category", "distributed-systems" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.distributed-systems.color }}">
        <a href="{{ '/categories/distributed-systems/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.distributed-systems.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ distributed_benchmarks.size }} benchmark{% if distributed_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.distributed-systems.name }}</h3>
            <p class="category-description">{{ site.data.categories.distributed-systems.description }}</p>
            
            {% if site.data.categories.distributed-systems.popular_benchmarks and site.data.categories.distributed-systems.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.distributed-systems.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            {% if site.data.categories.distributed-systems.subcategories and site.data.categories.distributed-systems.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.distributed-systems.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.distributed-systems.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.distributed-systems.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>

      <!-- IoT -->
      {% assign iot_benchmarks = site.benchmarks | where: "category", "iot" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.iot.color }}">
        <a href="{{ '/categories/iot/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.iot.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ iot_benchmarks.size }} benchmark{% if iot_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.iot.name }}</h3>
            <p class="category-description">{{ site.data.categories.iot.description }}</p>
            
            {% if site.data.categories.iot.popular_benchmarks and site.data.categories.iot.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.iot.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            {% if site.data.categories.iot.subcategories and site.data.categories.iot.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.iot.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.iot.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.iot.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>

      <!-- Energy -->
      {% assign energy_benchmarks = site.benchmarks | where: "category", "energy" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.energy.color }}">
        <a href="{{ '/categories/energy/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.energy.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ energy_benchmarks.size }} benchmark{% if energy_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.energy.name }}</h3>
            <p class="category-description">{{ site.data.categories.energy.description }}</p>
            
            {% if site.data.categories.energy.popular_benchmarks and site.data.categories.energy.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.energy.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            {% if site.data.categories.energy.subcategories and site.data.categories.energy.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.energy.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.energy.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.energy.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>

      <!-- Parallel Computing -->
      {% assign parallel_benchmarks = site.benchmarks | where: "category", "parallel-computing" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.parallel-computing.color }}">
        <a href="{{ '/categories/parallel-computing/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.parallel-computing.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ parallel_benchmarks.size }} benchmark{% if parallel_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.parallel-computing.name }}</h3>
            <p class="category-description">{{ site.data.categories.parallel-computing.description }}</p>
            
            {% if site.data.categories.parallel-computing.popular_benchmarks and site.data.categories.parallel-computing.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.parallel-computing.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            {% if site.data.categories.parallel-computing.subcategories and site.data.categories.parallel-computing.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.parallel-computing.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.parallel-computing.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.parallel-computing.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>

      <!-- HPC -->
      {% assign hpc_benchmarks = site.benchmarks | where: "category", "hpc" %}
      <div class="category-card" style="--category-color: {{ site.data.categories.hpc.color }}">
        <a href="{{ '/categories/hpc/' | relative_url }}" class="category-link">
          <div class="category-header">
            <div class="category-icon">
              <i class="fas fa-{{ site.data.categories.hpc.icon }}"></i>
            </div>
            <div class="category-meta">
              <span class="benchmark-count">{{ hpc_benchmarks.size }} benchmark{% if hpc_benchmarks.size != 1 %}s{% endif %}</span>
            </div>
          </div>
          
          <div class="category-content">
            <h3 class="category-name">{{ site.data.categories.hpc.name }}</h3>
            <p class="category-description">{{ site.data.categories.hpc.description }}</p>
            
            {% if site.data.categories.hpc.popular_benchmarks and site.data.categories.hpc.popular_benchmarks.size > 0 %}
              <div class="popular-benchmarks">
                <span class="popular-label">Populaires:</span>
                {% for benchmark_name in site.data.categories.hpc.popular_benchmarks limit: 3 %}
                  <span class="popular-item">{{ benchmark_name }}</span>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </div>
            {% endif %}
            
            {% if site.data.categories.hpc.subcategories and site.data.categories.hpc.subcategories.size > 0 %}
              <div class="subcategories">
                {% for subcategory in site.data.categories.hpc.subcategories limit: 3 %}
                  <span class="subcategory-tag">{{ subcategory }}</span>
                {% endfor %}
                {% if site.data.categories.hpc.subcategories.size > 3 %}
                  <span class="subcategory-more">+{{ site.data.categories.hpc.subcategories.size | minus: 3 }}</span>
                {% endif %}
              </div>
            {% endif %}
          </div>
          
          <div class="category-footer">
            <span class="explore-text">Explorer →</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Featured Benchmarks -->
<section class="featured-section">
  <div class="container">
    <h2 class="section-title">Benchmarks Populaires</h2>
    <p class="section-description">
      Découvrez les benchmarks les plus utilisés dans la recherche académique et industrielle.
    </p>
    
    <div class="benchmarks-grid">
      {% assign featured_benchmarks = site.benchmarks | where: "featured", true | limit: 6 %}
      {% if featured_benchmarks.size == 0 %}
        {% assign featured_benchmarks = site.benchmarks | sort: "last_updated" | reverse | limit: 6 %}
      {% endif %}
      
      {% for benchmark in featured_benchmarks %}
        {% include benchmark-card.html benchmark=benchmark %}
      {% endfor %}
    </div>
    
    <div class="section-footer">
      <a href="{{ '/benchmarks/' | relative_url }}" class="btn btn-primary btn-lg">
        Voir tous les benchmarks
      </a>
    </div>
  </div>
</section>

<!-- Quick Access for Specialized Categories -->
<section class="quick-access-section">
  <div class="container">
    <h2 class="section-title">Accès Rapide</h2>
    
    <div class="quick-access-grid">
      <!-- Parallel Computing Quick Access -->
      <div class="quick-access-card">
        <h3 class="quick-access-title">
          <i class="fas fa-project-diagram"></i>
          Calcul Parallèle
        </h3>
        <div class="quick-links">
          {% if site.data.categories.parallel-computing.parallel_models %}
            {% for model in site.data.categories.parallel-computing.parallel_models %}
              <a href="{{ '/categories/parallel-computing/?filter=' | append: model.name | downcase | relative_url }}" class="quick-link">
                <i class="fas fa-{{ model.icon | default: 'code' }}"></i>
                {{ model.name }}
              </a>
            {% endfor %}
          {% endif %}
        </div>
      </div>
      
      <!-- HPC Quick Access -->
      <div class="quick-access-card">
        <h3 class="quick-access-title">
          <i class="fas fa-server"></i>
          High Performance Computing
        </h3>
        <div class="quick-links">
          {% if site.data.categories.hpc.rankings %}
            {% for ranking in site.data.categories.hpc.rankings limit: 3 %}
              <a href="{{ ranking.url }}" class="quick-link" target="_blank" rel="noopener">
                <i class="fas fa-trophy"></i>
                {{ ranking.name }}
              </a>
            {% endfor %}
          {% endif %}
        </div>
      </div>
      
      <!-- Recent Updates -->
      <div class="quick-access-card">
        <h3 class="quick-access-title">
          <i class="fas fa-clock"></i>
          Récemment Mis à Jour
        </h3>
        <div class="recent-updates">
          {% assign recent_benchmarks = site.benchmarks | sort: "last_updated" | reverse | limit: 3 %}
          {% for benchmark in recent_benchmarks %}
            <a href="{{ benchmark.url | relative_url }}" class="recent-item">
              <span class="recent-title">{{ benchmark.title }}</span>
              <span class="recent-date">{{ benchmark.last_updated | date: "%d/%m/%Y" }}</span>
            </a>
          {% endfor %}
        </div>
      </div>
    </div>
  </div>
</section>
