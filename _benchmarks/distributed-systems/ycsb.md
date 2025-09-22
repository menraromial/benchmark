---
title: "YCSB (Yahoo! Cloud Serving Benchmark)"
category: "distributed-systems"
subcategory: "Database Benchmarks"
description: "Framework for evaluating the performance of NoSQL database systems under different workloads"
tags: ["nosql", "database", "scalability", "throughput", "latency"]
difficulty: "intermediate"
last_updated: "2024-01-15"
version: "0.17.0"
official_website: "https://github.com/brianfrankcooper/YCSB"
license: "Apache License 2.0"
platforms: ["Linux", "Windows", "macOS"]
languages: ["Java"]
maintainer: "YCSB Community"
citation: "Cooper, B. F., et al. (2010). Benchmarking cloud serving systems with YCSB. Proceedings of the 1st ACM symposium on Cloud computing, 143-154."
---

# YCSB (Yahoo! Cloud Serving Benchmark)

## Vue d'ensemble

YCSB est un framework de benchmarking conçu pour évaluer les performances des systèmes de bases de données NoSQL et des services de stockage cloud. Il fournit un ensemble de workloads standardisés et supporte de nombreux systèmes de stockage distribués.

### Cas d'usage principaux
- Évaluation des performances des bases de données NoSQL
- Comparaison de différents systèmes de stockage distribués
- Test de scalabilité et de charge
- Analyse des compromis performance/consistance

### Avantages
- Support de nombreux systèmes de stockage
- Workloads configurables et extensibles
- Métriques détaillées (latence, débit)
- Framework modulaire et extensible

### Limitations
- Focus sur les opérations simples (CRUD)
- Ne teste pas les requêtes complexes
- Modèle de données simplifié

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 18.04+, CentOS 7+)
- Windows 10+
- macOS 10.14+

### Dépendances logicielles
- **Java**: OpenJDK 8+ ou Oracle JDK 8+
- **Maven**: 3.6+ (pour compilation)
- **Python**: 3.6+ (pour scripts d'analyse)

### Configuration matérielle recommandée
- **CPU**: 4+ cœurs
- **RAM**: 8GB minimum, 16GB recommandé
- **Stockage**: SSD recommandé pour les tests locaux
- **Réseau**: Connexion stable pour tests distribués

## Installation

### Méthode 1 : Téléchargement des binaires
```bash
# Télécharger la dernière version
wget https://github.com/brianfrankcooper/YCSB/releases/download/0.17.0/ycsb-0.17.0.tar.gz
tar -xzf ycsb-0.17.0.tar.gz
cd ycsb-0.17.0
```

### Méthode 2 : Compilation depuis les sources
```bash
# Cloner le repository
git clone https://github.com/brianfrankcooper/YCSB.git
cd YCSB

# Compiler avec Maven
mvn clean package -DskipTests
```

### Vérification de l'installation
```bash
# Tester l'installation
./bin/ycsb.sh load basic -P workloads/workloada
./bin/ycsb.sh run basic -P workloads/workloada
```

## Configuration

### Workloads prédéfinis
YCSB inclut plusieurs workloads standardisés :

- **Workload A**: Heavy Update (50% read, 50% update)
- **Workload B**: Mostly Read (95% read, 5% update)  
- **Workload C**: Read Only (100% read)
- **Workload D**: Read Latest (95% read, 5% insert)
- **Workload E**: Short Ranges (95% scan, 5% insert)
- **Workload F**: Read-Modify-Write (50% read, 50% read-modify-write)

### Configuration personnalisée
```properties
# workload_custom.properties
recordcount=1000000
operationcount=1000000
workload=site.ycsb.workloads.CoreWorkload

readallfields=true
readproportion=0.5
updateproportion=0.5
scanproportion=0
insertproportion=0

requestdistribution=zipfian
```

### Configuration des bases de données

#### MongoDB
```bash
# Charger les données
./bin/ycsb.sh load mongodb -s \
  -P workloads/workloada \
  -p mongodb.url=mongodb://localhost:27017/ycsb

# Exécuter le benchmark
./bin/ycsb.sh run mongodb -s \
  -P workloads/workloada \
  -p mongodb.url=mongodb://localhost:27017/ycsb
```

#### Cassandra
```bash
# Configuration Cassandra
./bin/ycsb.sh load cassandra-cql -s \
  -P workloads/workloada \
  -p hosts=localhost \
  -p port=9042 \
  -p cassandra.keyspace=ycsb
```

## Utilisation

### Exemple basique
```bash
# Phase de chargement (load)
./bin/ycsb.sh load basic -P workloads/workloada -s

# Phase d'exécution (run)
./bin/ycsb.sh run basic -P workloads/workloada -s
```

### Test avec Redis
```bash
# Charger 1M d'enregistrements
./bin/ycsb.sh load redis -s \
  -P workloads/workloada \
  -p redis.host=127.0.0.1 \
  -p redis.port=6379 \
  -p recordcount=1000000

# Exécuter workload B (lecture intensive)
./bin/ycsb.sh run redis -s \
  -P workloads/workloadb \
  -p redis.host=127.0.0.1 \
  -p redis.port=6379 \
  -p operationcount=1000000 \
  -threads 10
```

### Test de scalabilité
```bash
#!/bin/bash
# Script de test de scalabilité
for threads in 1 2 4 8 16 32; do
    echo "Testing with $threads threads"
    ./bin/ycsb.sh run mongodb -s \
      -P workloads/workloada \
      -p mongodb.url=mongodb://localhost:27017/ycsb \
      -threads $threads \
      -p operationcount=100000 \
      > results_${threads}threads.txt
done
```

### Configuration cluster distribué
```bash
# Configuration MongoDB Replica Set
# Initialiser le replica set
mongo --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    {_id: 0, host: 'mongo1:27017'},
    {_id: 1, host: 'mongo2:27017'},
    {_id: 2, host: 'mongo3:27017'}
  ]
})
"

# Test avec cluster distribué
./bin/ycsb.sh load mongodb -s \
  -P workloads/workloada \
  -p mongodb.url=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/ycsb?replicaSet=rs0 \
  -p mongodb.readPreference=secondaryPreferred \
  -p mongodb.writeConcern=majority

# Configuration Cassandra Cluster
# Test avec cluster Cassandra 3 nœuds
./bin/ycsb.sh load cassandra-cql -s \
  -P workloads/workloada \
  -p hosts=cassandra1,cassandra2,cassandra3 \
  -p port=9042 \
  -p cassandra.keyspace=ycsb \
  -p cassandra.readconsistencylevel=QUORUM \
  -p cassandra.writeconsistencylevel=QUORUM
```

### Test de consistance et tolérance aux pannes
```bash
#!/bin/bash
# Test de consistance avec pannes de nœuds

# 1. Test de consistance forte
echo "Testing strong consistency..."
./bin/ycsb.sh run mongodb -s \
  -P workloads/workloada \
  -p mongodb.url=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/ycsb?replicaSet=rs0 \
  -p mongodb.readConcern=majority \
  -p mongodb.writeConcern=majority \
  -p operationcount=100000 \
  > consistency_strong.txt

# 2. Test avec panne d'un nœud secondaire
echo "Stopping secondary node..."
docker stop mongo2

./bin/ycsb.sh run mongodb -s \
  -P workloads/workloadb \
  -p mongodb.url=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/ycsb?replicaSet=rs0 \
  -p mongodb.readPreference=primaryPreferred \
  -p operationcount=50000 \
  > consistency_node_down.txt

# 3. Redémarrer le nœud et tester la récupération
echo "Restarting secondary node..."
docker start mongo2
sleep 30

./bin/ycsb.sh run mongodb -s \
  -P workloads/workloadc \
  -p mongodb.url=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/ycsb?replicaSet=rs0 \
  -p operationcount=50000 \
  > consistency_recovery.txt
```

### Cas d'usage avancés
```bash
# Test avec distribution de charge personnalisée
./bin/ycsb.sh run cassandra-cql -s \
  -P workloads/workloada \
  -p hosts=node1,node2,node3 \
  -p requestdistribution=uniform \
  -p insertorder=hashed \
  -threads 50

# Test de latence avec histogrammes
./bin/ycsb.sh run mongodb -s \
  -P workloads/workloadc \
  -p mongodb.url=mongodb://localhost:27017/ycsb \
  -p hdrhistogram.percentiles=50,95,99,99.9 \
  -p measurementtype=hdrhistogram
```

## Métriques et Performance

### Types de métriques collectées
- **Throughput**: Opérations par seconde (ops/sec)
- **Latency**: Temps de réponse (ms)
  - Moyenne, médiane, 95e, 99e, 99.9e percentiles
- **Distribution**: Répartition des types d'opérations
- **Erreurs**: Taux d'échec des opérations

### Exemple de sortie
```
[OVERALL], RunTime(ms), 30000
[OVERALL], Throughput(ops/sec), 33333.333333333336
[READ], Operations, 475131
[READ], AverageLatency(us), 1456.2
[READ], MinLatency(us), 180
[READ], MaxLatency(us), 47519
[READ], 95thPercentileLatency(us), 2615
[READ], 99thPercentileLatency(us), 4007
[UPDATE], Operations, 524869
[UPDATE], AverageLatency(us), 1532.8
```

### Analyse des résultats
```python
# Script Python pour analyser les résultats
import re
import matplotlib.pyplot as plt

def parse_ycsb_output(filename):
    results = {}
    with open(filename, 'r') as f:
        for line in f:
            if '[OVERALL], Throughput(ops/sec)' in line:
                results['throughput'] = float(line.split(', ')[2])
            elif '[READ], AverageLatency(us)' in line:
                results['read_latency'] = float(line.split(', ')[2])
    return results

# Analyser plusieurs fichiers de résultats
results = []
for threads in [1, 2, 4, 8, 16, 32]:
    result = parse_ycsb_output(f'results_{threads}threads.txt')
    result['threads'] = threads
    results.append(result)

# Graphique de scalabilité
threads = [r['threads'] for r in results]
throughput = [r['throughput'] for r in results]
plt.plot(threads, throughput)
plt.xlabel('Threads')
plt.ylabel('Throughput (ops/sec)')
plt.title('YCSB Scalability Test')
plt.savefig('ycsb_scalability.png')
```

### Comparaison de systèmes

| Système | Workload A (ops/sec) | Workload B (ops/sec) | Latence P99 (ms) |
|---------|---------------------|---------------------|------------------|
| MongoDB | 45,000 | 85,000 | 12.5 |
| Cassandra | 55,000 | 75,000 | 8.2 |
| Redis | 120,000 | 150,000 | 2.1 |

## Troubleshooting

### Problèmes courants

**Erreur de connexion à la base de données**
```bash
# Vérifier la connectivité
telnet localhost 27017  # MongoDB
telnet localhost 9042   # Cassandra
telnet localhost 6379   # Redis

# Vérifier les logs de la base de données
tail -f /var/log/mongodb/mongod.log
```

**Performance dégradée**
```bash
# Vérifier les ressources système
top
iostat 1 5
free -h

# Optimiser la JVM
export JAVA_OPTS="-Xmx4g -Xms4g -XX:+UseG1GC"
```

**Erreurs de timeout**
```bash
# Augmenter les timeouts
./bin/ycsb.sh run mongodb -s \
  -P workloads/workloada \
  -p mongodb.url=mongodb://localhost:27017/ycsb \
  -p mongodb.readPreference=primaryPreferred \
  -p mongodb.maxConnectionIdleTime=300000
```

## Ressources

### Documentation officielle
- [YCSB Wiki](https://github.com/brianfrankcooper/YCSB/wiki)
- [Core Workloads](https://github.com/brianfrankcooper/YCSB/wiki/Core-Workloads)
- [Database Bindings](https://github.com/brianfrankcooper/YCSB/wiki/Database-Bindings)

### Tutoriels complémentaires
- [YCSB Best Practices](https://example.com/ycsb-best-practices)
- [NoSQL Performance Testing](https://example.com/nosql-performance)

### Articles de recherche
- Cooper, B. F., et al. (2010). Benchmarking cloud serving systems with YCSB. *Proceedings of the 1st ACM symposium on Cloud computing*, 143-154.
- Patil, S., et al. (2011). YCSB++: benchmarking and performance debugging advanced features in scalable table stores. *Proceedings of the 2nd ACM Symposium on Cloud Computing*, 1-14.

### Code source
- [YCSB GitHub Repository](https://github.com/brianfrankcooper/YCSB)
- [Community Extensions](https://github.com/ycsb-extensions)

## Sources et Références

1. Cooper, B. F., Silberstein, A., Tam, E., Ramakrishnan, R., & Sears, R. (2010). Benchmarking cloud serving systems with YCSB. *Proceedings of the 1st ACM symposium on Cloud computing*, 143-154.
2. Dey, A., Fekete, A., Röhm, U., & Viglas, S. (2014). Scalable distributed transactions across heterogeneous stores. *2014 IEEE 30th International Conference on Data Engineering*, 125-136.
3. Bermbach, D., & Tai, S. (2011). Eventual consistency: How soon is eventual? An evaluation of Amazon S3's consistency behavior. *Proceedings of the 6th workshop on Middleware for service oriented computing*, 1-6.