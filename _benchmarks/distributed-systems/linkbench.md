---
title: "LinkBench"
category: "distributed-systems"
subcategory: "Social Graph Benchmarks"
description: "Database benchmark based on the Facebook social graph workload for testing graph-like data access patterns"
tags: ["social-graph", "database", "facebook", "graph-database", "mysql", "scalability"]
difficulty: "intermediate"
last_updated: "2024-01-15"
version: "1.1.8"
official_website: "https://github.com/facebookarchive/linkbench"
license: "Apache License 2.0"
platforms: ["Linux", "macOS", "Windows"]
languages: ["Java"]
maintainer: "Facebook (Archived)"
citation: "Armstrong, T. G., et al. (2013). LinkBench: a database benchmark based on the Facebook social graph. Proceedings of the 2013 ACM SIGMOD International Conference on Management of Data, 1185-1196."
---

# LinkBench

## Vue d'ensemble

LinkBench est un benchmark de base de données développé par Facebook qui reproduit les patterns d'accès aux données d'un graphe social. Il simule les opérations typiques d'un réseau social comme l'ajout d'amis, la consultation de profils, et la navigation dans le graphe social.

### Cas d'usage principaux
- Benchmarking des bases de données avec workloads de graphe social
- Test de performance des systèmes de stockage de graphes
- Évaluation de la scalabilité des bases de données relationnelles
- Comparaison de différents systèmes de stockage pour applications sociales
- Recherche en bases de données et systèmes distribués

### Avantages
- Basé sur un workload réel (Facebook)
- Modèle de données réaliste et complexe
- Support de plusieurs bases de données
- Métriques détaillées de performance
- Workload configurable et extensible

### Limitations
- Projet archivé (plus de développement actif)
- Complexité de configuration initiale
- Nécessite des ressources importantes pour tests réalistes
- Documentation limitée pour nouvelles bases de données

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 18.04+, CentOS 7+, RHEL 7+)
- macOS 10.14+
- Windows 10+ (avec WSL recommandé)

### Dépendances logicielles
- **Java**: OpenJDK 8+ ou Oracle JDK 8+
- **Maven**: 3.6+ (pour compilation)
- **Base de données**: MySQL 5.7+, PostgreSQL 11+, ou HBase 2.0+
- **Python**: 3.6+ (pour scripts d'analyse)

### Configuration matérielle recommandée
- **CPU**: 8+ cœurs
- **RAM**: 16GB minimum, 32GB recommandé
- **Stockage**: SSD recommandé, 100GB+ disponible
- **Réseau**: Connexion stable pour tests distribués

## Installation

### Méthode 1 : Compilation depuis les sources
```bash
# Cloner le repository
git clone https://github.com/facebookarchive/linkbench.git
cd linkbench

# Compiler avec Maven
mvn clean compile assembly:single

# Vérifier la compilation
ls target/linkbench-*-jar-with-dependencies.jar
```

### Méthode 2 : Docker
```bash
# Créer un Dockerfile
cat > Dockerfile << 'EOF'
FROM openjdk:8-jdk
RUN apt-get update && apt-get install -y maven git mysql-client
WORKDIR /opt
RUN git clone https://github.com/facebookarchive/linkbench.git
WORKDIR /opt/linkbench
RUN mvn clean compile assembly:single
CMD ["bash"]
EOF

# Construire l'image
docker build -t linkbench .

# Exécuter le container
docker run -it --name linkbench-test linkbench
```

### Configuration de la base de données

#### MySQL
```bash
# Installer MySQL
sudo apt-get install mysql-server mysql-client

# Créer la base de données
mysql -u root -p << 'EOF'
CREATE DATABASE linkdb;
CREATE USER 'linkbench'@'localhost' IDENTIFIED BY 'linkbench';
GRANT ALL PRIVILEGES ON linkdb.* TO 'linkbench'@'localhost';
FLUSH PRIVILEGES;
EOF

# Optimiser MySQL pour LinkBench
cat >> /etc/mysql/mysql.conf.d/linkbench.cnf << 'EOF'
[mysqld]
innodb_buffer_pool_size = 8G
innodb_log_file_size = 1G
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
max_connections = 1000
query_cache_size = 0
query_cache_type = 0
EOF

sudo systemctl restart mysql
```

#### PostgreSQL
```bash
# Installer PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql << 'EOF'
CREATE DATABASE linkdb;
CREATE USER linkbench WITH PASSWORD 'linkbench';
GRANT ALL PRIVILEGES ON DATABASE linkdb TO linkbench;
EOF

# Optimiser PostgreSQL
cat >> /etc/postgresql/14/main/postgresql.conf << 'EOF'
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 256MB
min_wal_size = 2GB
max_wal_size = 8GB
max_connections = 1000
EOF
```

## Configuration

### Configuration principale
```properties
# config/LinkConfigMysql.properties
# Configuration de base pour MySQL

# Database connection
host = localhost
port = 3306
user = linkbench
password = linkbench
dbid = linkdb

# Workload parameters
maxid1 = 100000000
startid1 = 1

# Request rate and duration
requestrate = 1000
maxtime = 300

# Request mix (percentages)
addlink = 25
deletelink = 5
updatelink = 5
countlink = 25
getlink = 25
getlinklist = 15

# Node operations
addnode = 5
updatenode = 5
getnode = 90

# Loader settings
loaders = 4
generate_nodes = true
partition_loading = false
```

### Configuration avancée
```properties
# config/LinkConfigAdvanced.properties
# Configuration pour tests de performance

# Scaling parameters
maxid1 = 1000000000  # 1 milliard de nœuds
startid1 = 1

# High throughput settings
requestrate = 10000
maxtime = 1800  # 30 minutes

# Thread configuration
loaders = 8
requesters = 32

# Database tuning
mysql_engine = innodb
mysql_charset = utf8

# Monitoring
displayfreq_seconds = 10
progressfreq_seconds = 300

# Error handling
max_failed_requests = 1000
retry_limit = 3
```

### Configuration pour différentes bases de données

#### Configuration HBase
```properties
# config/LinkConfigHBase.properties
hbase_config_file = /etc/hbase/conf/hbase-site.xml
hbase_table_prefix = linkbench_
hbase_column_family = d
hbase_splits = 100

# HBase specific tuning
hbase_write_buffer_size = 12582912
hbase_client_scanner_caching = 1000
```

#### Configuration Cassandra
```properties
# config/LinkConfigCassandra.properties
cassandra_hosts = localhost:9042
cassandra_keyspace = linkbench
cassandra_consistency_level = QUORUM
cassandra_replication_factor = 3

# Cassandra tuning
cassandra_batch_size = 100
cassandra_concurrent_reads = 32
cassandra_concurrent_writes = 32
```

## Utilisation

### Exemple basique
```bash
# 1. Créer le schéma de base de données
java -cp target/linkbench-*-jar-with-dependencies.jar \
    com.facebook.LinkBench.LinkBenchDriver \
    -c config/LinkConfigMysql.properties \
    -schema

# 2. Charger les données initiales
java -cp target/linkbench-*-jar-with-dependencies.jar \
    com.facebook.LinkBench.LinkBenchDriver \
    -c config/LinkConfigMysql.properties \
    -load

# 3. Exécuter le benchmark
java -cp target/linkbench-*-jar-with-dependencies.jar \
    com.facebook.LinkBench.LinkBenchDriver \
    -c config/LinkConfigMysql.properties \
    -req
```

### Test de scalabilité
```bash
#!/bin/bash
# Script de test de scalabilité LinkBench

# Paramètres de test
node_counts=(1000000 10000000 100000000)
thread_counts=(4 8 16 32)
config_base="config/LinkConfigMysql.properties"

for nodes in "${node_counts[@]}"; do
    for threads in "${thread_counts[@]}"; do
        echo "Testing: $nodes nodes, $threads threads"
        
        # Créer configuration spécifique
        config_file="config/test_${nodes}n_${threads}t.properties"
        cp $config_base $config_file
        
        # Modifier les paramètres
        sed -i "s/maxid1 = .*/maxid1 = $nodes/" $config_file
        sed -i "s/requesters = .*/requesters = $threads/" $config_file
        
        # Recréer le schéma
        java -cp target/linkbench-*-jar-with-dependencies.jar \
            com.facebook.LinkBench.LinkBenchDriver \
            -c $config_file -schema
        
        # Charger les données
        java -cp target/linkbench-*-jar-with-dependencies.jar \
            com.facebook.LinkBench.LinkBenchDriver \
            -c $config_file -load
        
        # Exécuter le benchmark
        java -cp target/linkbench-*-jar-with-dependencies.jar \
            com.facebook.LinkBench.LinkBenchDriver \
            -c $config_file -req \
            > "results_${nodes}n_${threads}t.log" 2>&1
        
        sleep 60  # Pause entre les tests
    done
done
```

### Test de différents workloads
```bash
# Workload lecture intensive
cat > config/ReadHeavy.properties << 'EOF'
# Hérite de la configuration de base
include = LinkConfigMysql.properties

# Mix orienté lecture (90% lecture, 10% écriture)
addlink = 5
deletelink = 2
updatelink = 3
countlink = 30
getlink = 40
getlinklist = 20

addnode = 2
updatenode = 3
getnode = 95
EOF

# Workload écriture intensive  
cat > config/WriteHeavy.properties << 'EOF'
include = LinkConfigMysql.properties

# Mix orienté écriture (60% écriture, 40% lecture)
addlink = 40
deletelink = 10
updatelink = 10
countlink = 15
getlink = 15
getlinklist = 10

addnode = 20
updatenode = 20
getnode = 60
EOF
```

### Cas d'usage avancés

#### Test de consistance
```bash
# Configuration pour test de consistance
cat > config/ConsistencyTest.properties << 'EOF'
include = LinkConfigMysql.properties

# Paramètres pour test de consistance
consistency_check = true
check_count = 1000
isolation_level = READ_COMMITTED

# Workload spécifique
addlink = 50
getlink = 50
EOF

# Exécuter le test de consistance
java -cp target/linkbench-*-jar-with-dependencies.jar \
    com.facebook.LinkBench.LinkBenchDriver \
    -c config/ConsistencyTest.properties \
    -req -consistency
```

#### Test multi-base de données
```bash
#!/bin/bash
# Comparer différentes bases de données

databases=("mysql" "postgresql" "hbase")

for db in "${databases[@]}"; do
    echo "Testing $db..."
    
    config_file="config/LinkConfig${db^}.properties"
    
    # Adapter la configuration selon la base
    case $db in
        "mysql")
            # Configuration MySQL déjà prête
            ;;
        "postgresql")
            sed -i 's/mysql/postgresql/g' $config_file
            sed -i 's/3306/5432/g' $config_file
            ;;
        "hbase")
            # Configuration HBase spécifique
            ;;
    esac
    
    # Exécuter le benchmark
    java -cp target/linkbench-*-jar-with-dependencies.jar \
        com.facebook.LinkBench.LinkBenchDriver \
        -c $config_file -schema -load -req \
        > "results_${db}.log" 2>&1
done
```

#### Analyse de performance en temps réel
```java
// CustomLinkBenchDriver.java - Monitoring personnalisé
public class CustomLinkBenchDriver extends LinkBenchDriver {
    private static final Logger logger = Logger.getLogger(CustomLinkBenchDriver.class);
    
    @Override
    protected void logStats(LinkBenchRequest req, long duration, boolean error) {
        super.logStats(req, duration, error);
        
        // Logging personnalisé
        if (duration > 1000) { // Requêtes lentes > 1s
            logger.warn("Slow request: " + req.type + " took " + duration + "ms");
        }
        
        // Métriques en temps réel
        if (System.currentTimeMillis() % 10000 == 0) {
            printRealTimeStats();
        }
    }
    
    private void printRealTimeStats() {
        // Afficher statistiques en temps réel
        System.out.println("Current throughput: " + getCurrentThroughput() + " req/s");
        System.out.println("Average latency: " + getAverageLatency() + "ms");
    }
}
```

## Métriques et Performance

### Types de métriques collectées
- **Throughput**: Requêtes par seconde par type d'opération
- **Latence**: Distribution des temps de réponse
- **Mix d'opérations**: Répartition des types de requêtes
- **Taux d'erreur**: Pourcentage de requêtes échouées
- **Utilisation ressources**: CPU, mémoire, I/O de la base

### Types d'opérations LinkBench
1. **addlink**: Ajouter une relation entre nœuds
2. **deletelink**: Supprimer une relation
3. **updatelink**: Mettre à jour une relation existante
4. **getlink**: Récupérer une relation spécifique
5. **getlinklist**: Récupérer toutes les relations d'un nœud
6. **countlink**: Compter les relations d'un nœud
7. **addnode**: Ajouter un nouveau nœud
8. **updatenode**: Mettre à jour un nœud
9. **getnode**: Récupérer les données d'un nœud

### Exemple de résultats
```
LinkBench Results Summary:
=========================
Test Duration: 300 seconds
Total Requests: 1,234,567
Successful Requests: 1,230,123 (99.64%)
Failed Requests: 4,444 (0.36%)

Throughput by Operation:
- addlink: 1,250 req/s (avg latency: 12ms)
- getlink: 1,875 req/s (avg latency: 8ms)  
- getlinklist: 625 req/s (avg latency: 45ms)
- countlink: 1,250 req/s (avg latency: 15ms)
- addnode: 125 req/s (avg latency: 25ms)
- getnode: 2,250 req/s (avg latency: 5ms)

Overall Performance:
- Total Throughput: 4,115 req/s
- Average Latency: 18.5ms
- 95th Percentile: 85ms
- 99th Percentile: 250ms
```

### Analyse des résultats
```python
# analyze_linkbench.py
import re
import pandas as pd
import matplotlib.pyplot as plt

def parse_linkbench_log(filename):
    results = {
        'operations': {},
        'overall': {}
    }
    
    with open(filename, 'r') as f:
        content = f.read()
    
    # Parser les métriques par opération
    operation_pattern = r'(\w+):\s+(\d+\.?\d*)\s+req/s.*?(\d+\.?\d*)ms'
    operations = re.findall(operation_pattern, content)
    
    for op, throughput, latency in operations:
        results['operations'][op] = {
            'throughput': float(throughput),
            'latency': float(latency)
        }
    
    # Parser les métriques globales
    total_throughput = re.search(r'Total Throughput:\s+(\d+\.?\d*)', content)
    avg_latency = re.search(r'Average Latency:\s+(\d+\.?\d*)', content)
    
    if total_throughput:
        results['overall']['throughput'] = float(total_throughput.group(1))
    if avg_latency:
        results['overall']['latency'] = float(avg_latency.group(1))
    
    return results

# Analyser les résultats de scalabilité
scalability_data = []
for nodes in [1000000, 10000000, 100000000]:
    for threads in [4, 8, 16, 32]:
        filename = f'results_{nodes}n_{threads}t.log'
        try:
            result = parse_linkbench_log(filename)
            scalability_data.append({
                'nodes': nodes,
                'threads': threads,
                'throughput': result['overall']['throughput'],
                'latency': result['overall']['latency']
            })
        except FileNotFoundError:
            continue

# Créer graphiques
df = pd.DataFrame(scalability_data)

# Graphique de scalabilité par threads
plt.figure(figsize=(15, 10))

plt.subplot(2, 2, 1)
for nodes in df['nodes'].unique():
    subset = df[df['nodes'] == nodes]
    plt.plot(subset['threads'], subset['throughput'], 
             marker='o', label=f'{nodes/1000000:.0f}M nodes')
plt.xlabel('Threads')
plt.ylabel('Throughput (req/s)')
plt.title('Throughput vs Threads')
plt.legend()
plt.grid(True)

plt.subplot(2, 2, 2)
for nodes in df['nodes'].unique():
    subset = df[df['nodes'] == nodes]
    plt.plot(subset['threads'], subset['latency'], 
             marker='o', label=f'{nodes/1000000:.0f}M nodes')
plt.xlabel('Threads')
plt.ylabel('Latency (ms)')
plt.title('Latency vs Threads')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('linkbench_scalability.png')
```

### Comparaison de bases de données

| Base de données | Throughput (req/s) | Latence P95 (ms) | Charge CPU | Utilisation RAM |
|-----------------|-------------------|------------------|------------|-----------------|
| MySQL 8.0 | 4,500 | 120 | 65% | 8GB |
| PostgreSQL 14 | 3,800 | 95 | 58% | 6GB |
| HBase 2.4 | 6,200 | 180 | 45% | 12GB |
| Cassandra 4.0 | 5,100 | 150 | 52% | 10GB |

## Troubleshooting

### Problèmes courants

**Erreurs de connexion à la base de données**
```bash
# Vérifier la connectivité
mysql -h localhost -u linkbench -p linkdb -e "SELECT 1;"

# Problèmes de permissions
mysql -u root -p << 'EOF'
GRANT ALL PRIVILEGES ON linkdb.* TO 'linkbench'@'%';
FLUSH PRIVILEGES;
EOF
```

**Performance dégradée**
```bash
# Vérifier les index MySQL
mysql -u linkbench -p linkdb << 'EOF'
SHOW INDEX FROM linktable;
SHOW INDEX FROM nodetable;
SHOW INDEX FROM counttable;
EOF

# Analyser les requêtes lentes
mysql -u root -p << 'EOF'
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
SHOW VARIABLES LIKE 'slow_query_log%';
EOF
```

**Erreurs de mémoire Java**
```bash
# Augmenter la heap Java
java -Xmx8g -Xms4g -XX:+UseG1GC \
    -cp target/linkbench-*-jar-with-dependencies.jar \
    com.facebook.LinkBench.LinkBenchDriver \
    -c config/LinkConfigMysql.properties -req

# Monitoring JVM
java -XX:+PrintGCDetails -XX:+PrintGCTimeStamps \
    -Xloggc:gc.log \
    -cp target/linkbench-*-jar-with-dependencies.jar \
    com.facebook.LinkBench.LinkBenchDriver
```

**Problèmes de verrouillage**
```sql
-- Analyser les verrous MySQL
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- Optimiser les transactions
SET SESSION transaction_isolation = 'READ-COMMITTED';
SET SESSION innodb_lock_wait_timeout = 10;
```

### Optimisation des performances
```properties
# Configuration optimisée pour haute performance
# config/HighPerformance.properties

# Augmenter le parallélisme
loaders = 16
requesters = 64

# Optimiser le batch loading
loader_chunk_size = 10000
bulk_insert_batch = 1000

# Réduire la contention
max_failed_requests = 100
request_timeout_ms = 5000

# Monitoring détaillé
enable_detailed_stats = true
stats_refresh_interval = 5
```

## Ressources

### Documentation officielle
- [LinkBench GitHub](https://github.com/facebookarchive/linkbench)
- [LinkBench Paper](https://research.facebook.com/publications/linkbench-a-database-benchmark-based-on-the-facebook-social-graph/)

### Tutoriels complémentaires
- [Social Graph Database Design](https://example.com/social-graph-db)
- [Graph Database Benchmarking](https://example.com/graph-db-benchmark)

### Articles de recherche
- Armstrong, T. G., et al. (2013). LinkBench: a database benchmark based on the Facebook social graph. *Proceedings of the 2013 ACM SIGMOD International Conference on Management of Data*, 1185-1196.
- Curtiss, M., et al. (2013). Unicorn: A system for searching the social graph. *Proceedings of the VLDB Endowment*, 6(11), 1150-1161.

### Code source
- [LinkBench Original](https://github.com/facebookarchive/linkbench)
- [LinkBench Forks](https://github.com/facebookarchive/linkbench/network/members)

## Sources et Références

1. Armstrong, T. G., Ponnekanti, V., Borthakur, D., & Callaghan, M. (2013). LinkBench: a database benchmark based on the Facebook social graph. *Proceedings of the 2013 ACM SIGMOD International Conference on Management of Data*, 1185-1196.
2. Curtiss, M., Becker, I., Bosman, T., Doroshenko, S., Grijincu, L., Jackson, T., ... & Woss, A. (2013). Unicorn: A system for searching the social graph. *Proceedings of the VLDB Endowment*, 6(11), 1150-1161.
3. Bronson, N., Amsden, Z., Cabrera, G., Chakka, P., Dimov, P., Ding, H., ... & Marchukov, M. (2013). TAO: Facebook's distributed data store for the social graph. *Proceedings of the 2013 USENIX Annual Technical Conference*, 49-60.
4. Angles, R., & Gutierrez, C. (2008). Survey of graph database models. *ACM Computing Surveys*, 40(1), 1-39.