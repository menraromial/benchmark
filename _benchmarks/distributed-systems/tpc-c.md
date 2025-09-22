---
title: "TPC-C (Transaction Processing Performance Council Benchmark C)"
category: "distributed-systems"
subcategory: "Transaction Processing"
description: "Industry-standard OLTP benchmark for measuring transaction processing performance and scalability"
tags: ["oltp", "transactions", "database", "scalability", "acid", "consistency"]
difficulty: "advanced"
last_updated: "2024-01-15"
version: "5.11"
official_website: "http://www.tpc.org/tpcc/"
license: "TPC License"
platforms: ["Linux", "Windows", "Unix"]
languages: ["C", "Java", "SQL"]
maintainer: "Transaction Processing Performance Council"
citation: "Transaction Processing Performance Council. (1992). TPC Benchmark C Standard Specification Revision 5.11."
---

# TPC-C (Transaction Processing Performance Council Benchmark C)

## Vue d'ensemble

TPC-C est un benchmark de référence pour mesurer les performances des systèmes de traitement transactionnel en ligne (OLTP). Il simule un environnement de commerce électronique avec des transactions complexes impliquant plusieurs tables et contraintes d'intégrité.

### Cas d'usage principaux
- Évaluation des performances OLTP des bases de données
- Test de scalabilité des systèmes transactionnels
- Comparaison de différents SGBD et architectures
- Validation de la conformité ACID
- Benchmarking des systèmes distribués

### Avantages
- Standard industriel reconnu mondialement
- Modèle de données réaliste et complexe
- Test complet des propriétés ACID
- Métriques standardisées (tpmC)
- Support de la scalabilité horizontale

### Limitations
- Complexité d'implémentation élevée
- Coût de certification officielle
- Modèle de données spécifique au commerce
- Nécessite des ressources importantes

## Prérequis

### Système d'exploitation
- Linux (RHEL 7+, Ubuntu 18.04+, SLES 12+)
- Windows Server 2016+
- AIX 7.1+, Solaris 11+

### Dépendances logicielles
- **Base de données**: PostgreSQL 12+, MySQL 8.0+, Oracle 19c+, SQL Server 2019+
- **Compilateur**: GCC 7+ ou équivalent
- **Java**: OpenJDK 11+ (pour certaines implémentations)
- **Python**: 3.7+ (pour scripts d'analyse)

### Configuration matérielle recommandée
- **CPU**: 16+ cœurs (pour tests de scalabilité)
- **RAM**: 32GB minimum, 128GB+ pour tests intensifs
- **Stockage**: SSD NVMe recommandé, 500GB+ disponible
- **Réseau**: 10Gbps pour configurations distribuées

## Installation

### Méthode 1 : HammerDB (Implémentation open-source)
```bash
# Télécharger HammerDB
wget https://github.com/TPC-Council/HammerDB/releases/download/v4.7/HammerDB-4.7-Linux.tar.gz
tar -xzf HammerDB-4.7-Linux.tar.gz
cd HammerDB-4.7

# Installation des dépendances
sudo apt-get update
sudo apt-get install tcl tcl-dev tk tk-dev

# Vérifier l'installation
./hammerdbcli
```

### Méthode 2 : BenchmarkSQL (PostgreSQL)
```bash
# Cloner BenchmarkSQL
git clone https://github.com/petergeoghegan/benchmarksql.git
cd benchmarksql

# Compiler
ant clean
ant

# Configuration PostgreSQL
sudo -u postgres createdb tpcc
sudo -u postgres psql tpcc -c "CREATE USER tpcc WITH PASSWORD 'tpcc';"
sudo -u postgres psql tpcc -c "GRANT ALL PRIVILEGES ON DATABASE tpcc TO tpcc;"
```

### Méthode 3 : Container Docker
```bash
# Utiliser un container pré-configuré
docker pull hammerdb/hammerdb:latest
docker run -it --name tpcc-test hammerdb/hammerdb:latest

# Ou construire depuis Dockerfile
cat > Dockerfile << EOF
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y \\
    tcl tk postgresql-client mysql-client \\
    wget tar gzip
WORKDIR /opt
RUN wget https://github.com/TPC-Council/HammerDB/releases/download/v4.7/HammerDB-4.7-Linux.tar.gz \\
    && tar -xzf HammerDB-4.7-Linux.tar.gz
WORKDIR /opt/HammerDB-4.7
CMD ["./hammerdbcli"]
EOF

docker build -t tpcc-benchmark .
```

## Configuration

### Schéma de base de données TPC-C

Le benchmark utilise 9 tables principales :
- **WAREHOUSE**: Entrepôts (facteur de scalabilité)
- **DISTRICT**: Districts (10 par entrepôt)
- **CUSTOMER**: Clients (3000 par district)
- **ITEM**: Articles (100,000 au total)
- **STOCK**: Stock (100,000 par entrepôt)
- **ORDERS**: Commandes
- **NEW_ORDER**: Nouvelles commandes
- **ORDER_LINE**: Lignes de commande
- **HISTORY**: Historique des paiements

### Configuration HammerDB
```tcl
# config_tpcc.tcl
dbset db pg
dbset bm TPC-C

# Configuration de la base de données
diset connection pg_host localhost
diset connection pg_port 5432
diset connection pg_dbase tpcc
diset connection pg_user tpcc
diset connection pg_pass tpcc

# Configuration du benchmark
diset tpcc pg_count_ware 100
diset tpcc pg_num_vu 50
diset tpcc pg_user tpcc
diset tpcc pg_pass tpcc
diset tpcc pg_dbase tpcc
diset tpcc pg_driver timed
diset tpcc pg_rampup 2
diset tpcc pg_duration 10
```

### Configuration BenchmarkSQL
```properties
# props.pg (PostgreSQL)
db=postgres
driver=org.postgresql.Driver
conn=jdbc:postgresql://localhost:5432/tpcc
user=tpcc
password=tpcc

warehouses=100
loadWorkers=10
terminals=50
runTxnsPerTerminal=0
runMins=10
limitTxnsPerMin=0

terminalWarehouseFixed=false
newOrderWeight=45
paymentWeight=43
orderStatusWeight=4
deliveryWeight=4
stockLevelWeight=4
```

## Utilisation

### Exemple basique avec HammerDB
```bash
# 1. Créer le schéma et charger les données
./hammerdbcli << EOF
dbset db pg
dbset bm TPC-C
diset connection pg_host localhost
diset connection pg_port 5432
diset connection pg_dbase tpcc
diset connection pg_user tpcc
diset connection pg_pass tpcc
diset tpcc pg_count_ware 10
buildschema
EOF

# 2. Exécuter le benchmark
./hammerdbcli << EOF
dbset db pg
dbset bm TPC-C
diset connection pg_host localhost
diset connection pg_port 5432
diset connection pg_dbase tpcc
diset connection pg_user tpcc
diset connection pg_pass tpcc
diset tpcc pg_num_vu 10
diset tpcc pg_driver timed
diset tpcc pg_rampup 2
diset tpcc pg_duration 5
loadscript
vuset logtotemp 1
vucreate
vurun
EOF
```

### Test avec BenchmarkSQL
```bash
# 1. Créer les tables
./runSQL.sh props.pg sql.common/tableCreates.sql

# 2. Charger les données
./runLoader.sh props.pg

# 3. Créer les index
./runSQL.sh props.pg sql.common/indexCreates.sql

# 4. Exécuter le benchmark
./runBenchmark.sh props.pg
```

### Configuration cluster distribué
```bash
# Configuration multi-nœuds avec PostgreSQL
# Nœud maître
cat > cluster_config.tcl << 'EOF'
# Configuration cluster
set cluster_nodes {
    {node1 192.168.1.10 5432}
    {node2 192.168.1.11 5432}
    {node3 192.168.1.12 5432}
}

# Répartition des entrepôts
set warehouses_per_node 50
set total_warehouses [expr {[llength $cluster_nodes] * $warehouses_per_node}]

foreach node $cluster_nodes {
    set host [lindex $node 1]
    set port [lindex $node 2]
    
    # Configuration spécifique au nœud
    diset connection pg_host $host
    diset connection pg_port $port
    diset tpcc pg_count_ware $warehouses_per_node
    
    puts "Configuring node: $host:$port with $warehouses_per_node warehouses"
}
EOF
```

### Cas d'usage avancés

#### Test de scalabilité
```bash
#!/bin/bash
# Script de test de scalabilité TPC-C

warehouses=(10 25 50 100 200)
virtual_users=(10 25 50 100 200)

for w in "${warehouses[@]}"; do
    for vu in "${virtual_users[@]}"; do
        echo "Testing: $w warehouses, $vu virtual users"
        
        # Recréer la base avec le bon nombre d'entrepôts
        ./hammerdbcli << EOF
dbset db pg
dbset bm TPC-C
diset connection pg_host localhost
diset tpcc pg_count_ware $w
buildschema
diset tpcc pg_num_vu $vu
diset tpcc pg_duration 10
loadscript
vucreate
vurun
EOF
        
        # Sauvegarder les résultats
        mv hammerdb.log "results_${w}w_${vu}vu.log"
        sleep 60  # Pause entre les tests
    done
done
```

#### Test de consistance et isolation
```sql
-- Test de lecture répétable
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT c_balance FROM customer WHERE c_id = 1 AND c_d_id = 1 AND c_w_id = 1;
-- Simulation d'une transaction concurrente
SELECT c_balance FROM customer WHERE c_id = 1 AND c_d_id = 1 AND c_w_id = 1;
COMMIT;

-- Test de sérialisation
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT s_quantity FROM stock WHERE s_i_id = 1 AND s_w_id = 1;
UPDATE stock SET s_quantity = s_quantity - 10 WHERE s_i_id = 1 AND s_w_id = 1;
COMMIT;
```

## Métriques et Performance

### Types de métriques collectées
- **tpmC**: Transactions par minute (métrique principale)
- **Latence**: Temps de réponse par type de transaction
- **Débit**: Transactions par seconde par type
- **Taux d'erreur**: Pourcentage de transactions échouées
- **Utilisation ressources**: CPU, mémoire, I/O

### Types de transactions TPC-C
1. **New-Order** (45%): Création de nouvelles commandes
2. **Payment** (43%): Traitement des paiements
3. **Order-Status** (4%): Consultation du statut des commandes
4. **Delivery** (4%): Livraison des commandes
5. **Stock-Level** (4%): Vérification des niveaux de stock

### Exemple de résultats
```
TPC-C Results Summary:
=====================
Warehouses: 100
Virtual Users: 50
Test Duration: 10 minutes

Transaction Mix:
- New-Order: 45.2% (2,260 txns)
- Payment: 43.1% (2,155 txns)
- Order-Status: 4.0% (200 txns)
- Delivery: 3.9% (195 txns)
- Stock-Level: 3.8% (190 txns)

Performance Metrics:
- Total tpmC: 15,000
- Average Response Time: 125ms
- 95th Percentile: 250ms
- 99th Percentile: 500ms
- Error Rate: 0.02%
```

### Analyse des résultats
```python
# Script d'analyse des résultats TPC-C
import re
import pandas as pd
import matplotlib.pyplot as plt

def parse_hammerdb_log(filename):
    results = {
        'timestamp': [],
        'tpm': [],
        'response_time': []
    }
    
    with open(filename, 'r') as f:
        for line in f:
            if 'TEST RESULT' in line:
                # Parser les résultats
                match = re.search(r'(\d+) TPM', line)
                if match:
                    results['tpm'].append(int(match.group(1)))
    
    return results

# Analyser la scalabilité
scalability_data = []
for w in [10, 25, 50, 100, 200]:
    for vu in [10, 25, 50, 100, 200]:
        filename = f'results_{w}w_{vu}vu.log'
        try:
            result = parse_hammerdb_log(filename)
            if result['tpm']:
                scalability_data.append({
                    'warehouses': w,
                    'virtual_users': vu,
                    'tpm': max(result['tpm'])
                })
        except FileNotFoundError:
            continue

# Créer graphiques de scalabilité
df = pd.DataFrame(scalability_data)
pivot_table = df.pivot(index='warehouses', columns='virtual_users', values='tpm')

plt.figure(figsize=(12, 8))
for vu in pivot_table.columns:
    plt.plot(pivot_table.index, pivot_table[vu], marker='o', label=f'{vu} VU')

plt.xlabel('Warehouses')
plt.ylabel('TPM-C')
plt.title('TPC-C Scalability Analysis')
plt.legend()
plt.grid(True)
plt.savefig('tpcc_scalability.png')
```

### Comparaison de systèmes

| SGBD | tpmC (100W) | Latence P95 (ms) | Coût/tpmC |
|------|-------------|------------------|-----------|
| PostgreSQL 14 | 45,000 | 180 | $2.50 |
| MySQL 8.0 | 38,000 | 220 | $2.80 |
| Oracle 19c | 65,000 | 120 | $8.50 |
| SQL Server 2019 | 52,000 | 150 | $5.20 |

## Troubleshooting

### Problèmes courants

**Erreurs de contraintes d'intégrité**
```sql
-- Vérifier les contraintes
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'customer'::regclass;

-- Analyser les violations
SELECT * FROM pg_stat_database_conflicts WHERE datname = 'tpcc';
```

**Performance dégradée**
```bash
# Optimisation PostgreSQL
cat >> postgresql.conf << EOF
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
EOF

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

**Problèmes de verrouillage**
```sql
-- Analyser les verrous
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

**Erreurs de connexion**
```bash
# Augmenter les connexions PostgreSQL
echo "max_connections = 200" >> /etc/postgresql/14/main/postgresql.conf
echo "listen_addresses = '*'" >> /etc/postgresql/14/main/postgresql.conf

# Configuration pg_hba.conf
echo "host tpcc tpcc 0.0.0.0/0 md5" >> /etc/postgresql/14/main/pg_hba.conf

sudo systemctl restart postgresql
```

## Ressources

### Documentation officielle
- [TPC-C Specification](http://www.tpc.org/tpc_documents_current_versions/pdf/tpc-c_v5.11.0.pdf)
- [HammerDB Documentation](https://www.hammerdb.com/docs/)
- [BenchmarkSQL Guide](https://github.com/petergeoghegan/benchmarksql/blob/master/HOW-TO-RUN.txt)

### Tutoriels complémentaires
- [TPC-C Best Practices](https://www.tpc.org/information/benchmarks/tpcc/tpcc_best_practices.asp)
- [Database Tuning for TPC-C](https://example.com/tpcc-tuning)

### Articles de recherche
- Gray, J. (Ed.). (1993). *The Benchmark Handbook for Database and Transaction Processing Systems*. Morgan Kaufmann.
- Difallah, D. E., et al. (2013). OLTP-Bench: An extensible testbed for benchmarking relational databases. *Proceedings of the VLDB Endowment*, 7(4), 277-288.

### Code source
- [HammerDB GitHub](https://github.com/TPC-Council/HammerDB)
- [BenchmarkSQL GitHub](https://github.com/petergeoghegan/benchmarksql)
- [OLTP-Bench](https://github.com/oltpbenchmark/oltpbench)

## Sources et Références

1. Transaction Processing Performance Council. (1992). *TPC Benchmark C Standard Specification Revision 5.11*. TPC.
2. Gray, J., & Reuter, A. (1992). *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann.
3. Bernstein, P. A., & Newcomer, E. (2009). *Principles of Transaction Processing*. Second Edition. Morgan Kaufmann.
4. Difallah, D. E., Pavlo, A., Curino, C., & Cudre-Mauroux, P. (2013). OLTP-Bench: An extensible testbed for benchmarking relational databases. *Proceedings of the VLDB Endowment*, 7(4), 277-288.