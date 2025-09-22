---
layout: default
title: "À propos"
description: "Découvrez Research Benchmark Hub, votre ressource centralisée pour les benchmarks de recherche en informatique"
permalink: /about/
---

<div class="about-page">
  
  <!-- Hero Section -->
  <section class="about-hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">À propos de Research Benchmark Hub</h1>
        <p class="hero-description">
          Votre ressource centralisée pour les benchmarks de recherche en informatique, 
          couvrant les domaines du cloud computing, green computing, systèmes distribués, 
          IoT, énergie, calcul parallèle et HPC.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Mission Section -->
  <section class="about-mission">
    <div class="container">
      <div class="mission-grid">
        <div class="mission-content">
          <h2>Notre Mission</h2>
          <p>
            Research Benchmark Hub a été créé pour répondre au besoin croissant d'une 
            ressource centralisée et fiable pour les benchmarks de recherche en informatique. 
            Notre objectif est de faciliter l'accès aux outils de mesure de performance 
            pour les chercheurs, étudiants et professionnels.
          </p>
          <p>
            Nous nous engageons à fournir des guides détaillés, des instructions 
            d'installation complètes et des exemples pratiques pour chaque benchmark, 
            permettant à notre communauté de reproduire et comparer les résultats 
            de recherche de manière efficace.
          </p>
        </div>
        <div class="mission-stats">
          <div class="stat-card">
            <div class="stat-number">{{ site.benchmarks.size }}</div>
            <div class="stat-label">Benchmarks</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ site.data.categories.size }}</div>
            <div class="stat-label">Domaines</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100+</div>
            <div class="stat-label">Heures de Documentation</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Domains Section -->
  <section class="about-domains">
    <div class="container">
      <h2 class="section-title">Domaines Couverts</h2>
      <div class="domains-grid">
        {% for category_data in site.data.categories %}
          {% assign category_id = category_data[0] %}
          {% assign category = category_data[1] %}
          <div class="domain-card">
            <div class="domain-icon">
              <i class="fas fa-{{ category.icon }}"></i>
            </div>
            <h3 class="domain-name">{{ category.name }}</h3>
            <p class="domain-description">{{ category.description }}</p>
          </div>
        {% endfor %}
      </div>
    </div>
  </section>
  
  <!-- Team Section -->
  <section class="about-team">
    <div class="container">
      <h2 class="section-title">Équipe</h2>
      <div class="team-content">
        <p>
          Research Benchmark Hub est maintenu par une équipe de chercheurs et 
          d'ingénieurs passionnés par l'informatique haute performance et 
          l'évaluation de systèmes. Notre équipe combine expertise académique 
          et expérience industrielle pour fournir des ressources de qualité.
        </p>
        
        <div class="team-values">
          <div class="value-item">
            <div class="value-icon">
              <i class="fas fa-microscope"></i>
            </div>
            <h4>Rigueur Scientifique</h4>
            <p>Chaque benchmark est validé selon les standards académiques</p>
          </div>
          
          <div class="value-item">
            <div class="value-icon">
              <i class="fas fa-users"></i>
            </div>
            <h4>Communauté</h4>
            <p>Nous encourageons la contribution et le partage de connaissances</p>
          </div>
          
          <div class="value-item">
            <div class="value-icon">
              <i class="fas fa-rocket"></i>
            </div>
            <h4>Innovation</h4>
            <p>Nous suivons les dernières avancées en recherche informatique</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Contribute Section -->
  <section class="about-contribute">
    <div class="container">
      <div class="contribute-content">
        <h2>Contribuer au Projet</h2>
        <p>
          Research Benchmark Hub est un projet open source qui s'enrichit 
          grâce aux contributions de la communauté. Que vous soyez chercheur, 
          étudiant ou professionnel, votre expertise peut aider d'autres 
          personnes dans leurs travaux.
        </p>
        
        <div class="contribute-ways">
          <div class="contribute-item">
            <i class="fas fa-plus-circle"></i>
            <h4>Ajouter un Benchmark</h4>
            <p>Partagez vos benchmarks favoris avec la communauté</p>
          </div>
          
          <div class="contribute-item">
            <i class="fas fa-edit"></i>
            <h4>Améliorer la Documentation</h4>
            <p>Aidez-nous à améliorer les guides existants</p>
          </div>
          
          <div class="contribute-item">
            <i class="fas fa-bug"></i>
            <h4>Signaler des Problèmes</h4>
            <p>Faites-nous savoir si vous trouvez des erreurs</p>
          </div>
        </div>
        
        <div class="contribute-actions">
          <a href="{{ '/contribute/' | relative_url }}" class="btn btn-primary btn-lg">
            Guide de Contribution
          </a>
          <a href="https://github.com/research-benchmark-hub" class="btn btn-outline-primary btn-lg" target="_blank">
            <i class="fab fa-github"></i>
            Voir sur GitHub
          </a>
        </div>
      </div>
    </div>
  </section>
  
</div>

<style>
.about-page {
  
}

.about-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 4rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.95;
  line-height: 1.6;
}

.about-mission {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.mission-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  align-items: center;
}

.mission-content h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.mission-content p {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 1.5rem;
}

.mission-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  display: block;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
}

.about-domains {
  padding: 4rem 0;
}

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.domain-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.domain-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.domain-icon {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 1.5rem;
}

.domain-name {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.domain-description {
  color: #6c757d;
  line-height: 1.6;
}

.about-team {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.team-content p {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.team-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.value-item {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.value-icon {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1.5rem;
}

.value-item h4 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.value-item p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.about-contribute {
  padding: 4rem 0;
}

.contribute-content {
  text-align: center;
}

.contribute-content h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.contribute-content > p {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.contribute-ways {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.contribute-item {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
}

.contribute-item i {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1.5rem;
}

.contribute-item h4 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.contribute-item p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.contribute-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.25rem;
  }
  
  .mission-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .mission-stats {
    flex-direction: row;
    justify-content: space-around;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .domains-grid,
  .team-values,
  .contribute-ways {
    grid-template-columns: 1fr;
  }
  
  .contribute-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
