---
title: "TPC-C"
category: "cloud-computing"
subcategory: "Database Performance"
description: "Industry-standard OLTP benchmark for evaluating database performance in cloud environments"
tags: ["database", "oltp", "transactions", "performance"]
difficulty: "advanced"
last_updated: "2024-01-15"
version: "5.11"
official_website: "http://www.tpc.org/tpcc/"
license: "TPC License (Free for research)"
platforms: ["Linux", "Windows", "Unix"]
languages: ["SQL", "C", "Java", "Python"]
maintainer: "Transaction Processing Performance Council (TPC)"
citation: "Transaction Processing Performance Council. (2010). TPC Benchmark C Standard Specification Revision 5.11."
---

# TPC-C (Transaction Processing Performance Council Benchmark C)

## Vue d'ensemble

TPC-C est un benchmark de référence pour évaluer les performances des systèmes de traitement de transactions en ligne (OLTP). Il simule un environnement de gestion d'entrepôt avec des transactions complexes, ce qui en fait un excellent indicateur des performances des bases de données dans les environnements cloud.

### Cas d'usage principaux
- Évaluation des performances des bases de données cloud (RDS, Cloud SQL, etc.)
- Comparaison des systèmes de gestion de bases de données (SGBD)
- Test de scalabilité des architectures de bases de données
- Validation des performances avant migration vers le cloud
- Benchmarking des solutions de bases de données distribuées

### Avantages
- Standard industriel reconnu mondialement
- Modèle de données réaliste et complexe
- Métriques standardisées (tpmC, $/tpmC)
- Excellent pour tester la cohérence ACID
- Supporte les tests de montée en charge

### Limitations
- Configuration complexe et chronophage
- Nécessite une expertise en bases de données
- Coût élevé pour les tests à grande échelle
- Licence restrictive pour usage commercial

## Prérequis

### Système d'exploitation
- Linux (RHEL 8+, Ubuntu 20.04+, CentOS 8+)
- Windows Server 2019+
- Unix (AIX, Solaris)

### Dépendances logicielles
- Système de gestion de base de données (PostgreSQL, MySQL, Oracle, SQL Server)
- Java 11+ (pour certains outils)
- Python 3.8+ (pour les scripts d'analyse)
- Outils de monitoring (iostat, vmstat, sar)

### Configuration matérielle recommandée
- **CPU**: 16+ cœurs physiques
- **RAM**: 64GB minimum, 128GB+ pour tests intensifs
- **Stockage**: SSD NVMe avec 1TB+ disponible
- **Réseau**: 10Gbps pour tests distribués
- **Base de données**: Instance dédiée avec ressources garanties

## Installation

### Méthode 1 : HammerDB (Implémentation open source)
```bash
# Télécharger HammerDB
wget https://github.com/TPC-Council/HammerDB/releases/download/v4.7/HammerDB-4.7-Linux.tar.gz
tar -xzf HammerDB-4.7-Linux.tar.gz
cd HammerDB-4.7

# Installation des dépendances
sudo apt-get install tcl tk tcllib

# Lancer HammerDB
./hammerdbcli
```

### Méthode 2 : BenchmarkSQL (Alternative Java)
```bash
# Cloner BenchmarkSQL
git clone https://github.com/petergeoghegan/benchmarksql.git
cd benchmarksql

# Compiler
ant

# Configuration pour PostgreSQL
cp props/postgres/sample.properties my_postgres.properties
```

### Méthode 3 : Installation Docker
```bash
# Utiliser une image Docker préconfigurée
docker pull hammerdb/hammerdb:latest

# Lancer avec interface graphique
docker run -it --rm -e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix hammerdb/hammerdb
```

## Configuration

### Configuration HammerDB pour PostgreSQL
```tcl
# hammerdb_config.tcl
dbset db pg
dbset bm TPC-C

# Configuration de la base de données
diset connection pg_host localhost
diset connection pg_port 5432
diset connection pg_dbase tpcc
diset connection pg_user tpcc
diset connection pg_pass tpccpass

# Configuration du schéma
diset tpcc pg_count_ware 100
diset tpcc pg_num_vu 16
diset tpcc pg_user tpcc
diset tpcc pg_pass tpccpass
diset tpcc pg_dbase tpcc

# Configuration des tests
diset tpcc pg_driver timed
diset tpcc pg_rampup 2
diset tpcc pg_duration 10
diset tpcc pg_allwarehouse true
```

### Configuration BenchmarkSQL
```properties
# my_postgres.properties
db=postgres
driver=org.postgresql.Driver
conn=jdbc:postgresql://localhost:5432/benchmarksql
user=benchmarksql
password=benchmarksql

warehouses=100
loadWorkers=16
terminals=64
runTxnsPerTerminal=0
runMins=30
limitTxnsPerMin=0

# Paramètres de performance
newOrderWeight=45
paymentWeight=43
orderStatusWeight=4
deliveryWeight=4
stockLevelWeight=4
```

### Optimisations base de données
```sql
-- PostgreSQL optimizations
-- postgresql.conf
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

## Utilisation

### Exemple basique avec HammerDB
```bash
# Créer le schéma de base
./hammerdbcli << EOF
dbset db pg
dbset bm TPC-C
diset connection pg_host localhost
diset tpcc pg_count_ware 10
buildschema
EOF

# Lancer le test
./hammerdbcli << EOF
dbset db pg
dbset bm TPC-C
diset connection pg_host localhost
diset tpcc pg_num_vu 8
diset tpcc pg_duration 5
loadscript
vuset logtotemp 1
vucreate
vurun
EOF
```

### Cas d'usage avancés
```bash
# Test de scalabilité avec différents nombres d'entrepôts
for warehouses in 10 50 100 500 1000; do
  echo "Testing with $warehouses warehouses"
  ./run_tpcc.sh --warehouses $warehouses --duration 30 --output results_${warehouses}.log
done

# Test de performance réseau (base distante)
./hammerdbcli -config remote_db.tcl

# Test avec monitoring système
iostat -x 1 > iostat.log &
vmstat 1 > vmstat.log &
./run_tpcc.sh --duration 30
killall iostat vmstat
```

### Scripts d'automatisation
```bash
#!/bin/bash
# run_tpcc_suite.sh

WAREHOUSES=(10 50 100 500)
USERS=(1 4 8 16 32)

for w in "${WAREHOUSES[@]}"; do
  for u in "${USERS[@]}"; do
    echo "Running TPC-C: $w warehouses, $u users"
    
    # Créer le schéma
    ./create_schema.sh $w
    
    # Lancer le test
    ./run_test.sh $w $u 30 > results_${w}_${u}.log 2>&1
    
    # Nettoyer
    ./cleanup_schema.sh
    
    sleep 60  # Pause entre les tests
  done
done
```

## Métriques et Performance

### Types de métriques collectées
- **tpmC (Transactions per Minute C)**: Métrique principale TPC-C
- **Response Time**: Temps de réponse par type de transaction
- **Throughput**: Débit de transactions par seconde
- **Resource Utilization**: CPU, mémoire, I/O, réseau
- **ACID Compliance**: Vérification de la cohérence des données

### Métriques détaillées par transaction
```
Transaction Types:
- New Order (45%): Création de nouvelles commandes
- Payment (43%): Traitement des paiements
- Order Status (4%): Consultation du statut des commandes
- Delivery (4%): Livraison des commandes
- Stock Level (4%): Vérification des niveaux de stock
```

### Benchmarks de référence par plateforme

#### Cloud Databases
- **AWS RDS PostgreSQL (db.r5.4xlarge)**: ~50,000 tpmC
- **Google Cloud SQL (db-n1-highmem-16)**: ~45,000 tpmC
- **Azure Database PostgreSQL (GP_Gen5_16)**: ~48,000 tpmC

#### On-Premise Systems
- **PostgreSQL 14 (32 cores, 128GB RAM)**: ~80,000 tpmC
- **Oracle 19c (64 cores, 256GB RAM)**: ~150,000 tpmC
- **SQL Server 2019 (48 cores, 192GB RAM)**: ~120,000 tpmC

### Analyse des coûts performance
```bash
# Calcul du ratio $/tpmC
cost_per_hour=5.50  # Coût instance cloud par heure
tpmc_result=45000
cost_per_tpmc=$(echo "scale=4; $cost_per_hour / $tpmc_result * 60" | bc)
echo "Cost per tpmC: $${cost_per_tpmc}"
```

## Troubleshooting

### Problèmes courants

**Performance dégradée**
```sql
-- Analyser les requêtes lentes
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Vérifier les index manquants
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' AND n_distinct > 100;
```

**Erreurs de connexion**
```bash
# Vérifier les connexions actives
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Augmenter max_connections si nécessaire
echo "max_connections = 200" >> postgresql.conf
sudo systemctl restart postgresql
```

**Problèmes de verrouillage**
```sql
-- Identifier les verrous bloquants
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## Ressources

### Documentation officielle
- [TPC-C Specification](http://www.tpc.org/tpc_documents_current_versions/pdf/tpc-c_v5.11.0.pdf)
- [TPC-C FAQ](http://www.tpc.org/information/benchmarks/tpcc/tpcc_faq.asp)
- [Official Results Database](http://www.tpc.org/tpcc/results/tpcc_results5.asp)

### Outils et implémentations
- [HammerDB Documentation](https://www.hammerdb.com/docs/)
- [BenchmarkSQL Guide](https://github.com/petergeoghegan/benchmarksql/wiki)
- [OLTP-Bench](https://github.com/oltpbenchmark/oltpbench)

### Tutoriels complémentaires
- [TPC-C with PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tpcc.html)
- [Cloud Database Benchmarking Best Practices](https://cloud.google.com/solutions/database-benchmarking)
- [AWS RDS Performance Tuning](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)

### Articles de recherche
- Difallah, D. E., Pavlo, A., Curino, C., & Cudre-Mauroux, P. (2013). "OLTP-bench: An extensible testbed for benchmarking relational databases". *Proceedings of the VLDB Endowment*, 7(4), 277-288.
- Cooper, B. F., Silberstein, A., Tam, E., Ramakrishnan, R., & Sears, R. (2010). "Benchmarking cloud serving systems with YCSB". *Proceedings of the 1st ACM symposium on Cloud computing*, 143-154.

### Code source
- [HammerDB GitHub](https://github.com/TPC-Council/HammerDB)
- [BenchmarkSQL GitHub](https://github.com/petergeoghegan/benchmarksql)
- [OLTP-Bench GitHub](https://github.com/oltpbenchmark/oltpbench)

## Sources et Références

1. Transaction Processing Performance Council. (2010). *TPC Benchmark C Standard Specification Revision 5.11*. http://www.tpc.org/tpcc/
2. Difallah, D. E., Pavlo, A., Curino, C., & Cudre-Mauroux, P. (2013). OLTP-bench: An extensible testbed for benchmarking relational databases. *Proceedings of the VLDB Endowment*, 7(4), 277-288.
3. Gray, J. (Ed.). (1993). *The benchmark handbook: for database and transaction processing systems*. Morgan Kaufmann.
4. Harizopoulos, S., Shkapenyuk, V., & Ailamaki, A. (2005). QPipe: a simultaneously pipelined relational query engine. *ACM Transactions on Database Systems*, 30(2), 383-426.