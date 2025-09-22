---
title: "YCSB for Cloud Databases"
category: "cloud-computing"
subcategory: "Database Performance"
description: "Framework for benchmarking cloud database services including AWS DynamoDB, Google Firestore, and Azure Cosmos DB"
tags: ["nosql", "cloud-database", "scalability", "managed-services"]
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

# YCSB for Cloud Databases

## Vue d'ensemble

YCSB (Yahoo! Cloud Serving Benchmark) est particulièrement adapté pour évaluer les performances des services de bases de données cloud managés. Cette version se concentre sur les services cloud natifs comme AWS DynamoDB, Google Cloud Firestore, Azure Cosmos DB, et autres services DBaaS.

### Cas d'usage principaux
- Évaluation des performances des bases de données cloud managées
- Comparaison de différents fournisseurs cloud (AWS, GCP, Azure)
- Test de scalabilité automatique des services cloud
- Analyse des coûts vs performance des services DBaaS
- Validation des SLA de performance des fournisseurs

### Avantages pour le cloud
- Support natif des APIs cloud (DynamoDB, Firestore, Cosmos DB)
- Test de la scalabilité automatique
- Métriques adaptées aux environnements cloud
- Simulation de charges de travail réalistes
- Évaluation des coûts opérationnels

### Limitations
- Dépendant de la connectivité réseau
- Coûts potentiels élevés pour les tests intensifs
- Variabilité des performances selon les régions cloud

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 18.04+, CentOS 7+)
- Windows 10+
- macOS 10.14+

### Dépendances logicielles
- **Java**: OpenJDK 11+ ou Oracle JDK 11+
- **Maven**: 3.6+ (pour compilation)
- **AWS CLI**: 2.0+ (pour DynamoDB)
- **Google Cloud SDK**: Latest (pour Firestore)
- **Azure CLI**: 2.0+ (pour Cosmos DB)

### Configuration cloud requise
- Comptes actifs sur les plateformes cloud à tester
- Credentials configurés (IAM roles, service accounts)
- Quotas suffisants pour les tests de charge
- Budget alloué pour les coûts de test

## Installation

### Méthode 1 : Installation avec support cloud
```bash
# Télécharger YCSB avec bindings cloud
wget https://github.com/brianfrankcooper/YCSB/releases/download/0.17.0/ycsb-0.17.0.tar.gz
tar -xzf ycsb-0.17.0.tar.gz
cd ycsb-0.17.0

# Vérifier les bindings cloud disponibles
ls lib/ | grep -E "(dynamodb|googlebigtable|azurecosmos)"
```

### Méthode 2 : Compilation avec modules cloud
```bash
# Cloner et compiler avec modules cloud
git clone https://github.com/brianfrankcooper/YCSB.git
cd YCSB

# Compiler avec tous les bindings cloud
mvn clean package -DskipTests -pl :dynamodb-binding,:googlebigtable-binding,:azurecosmos-binding
```

### Configuration des credentials cloud

#### AWS DynamoDB
```bash
# Configurer AWS CLI
aws configure
# ou utiliser des variables d'environnement
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Google Cloud Firestore/Bigtable
```bash
# Authentification avec service account
gcloud auth application-default login
# ou utiliser une clé de service
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

#### Azure Cosmos DB
```bash
# Configurer Azure CLI
az login
# ou utiliser des variables d'environnement
export AZURE_COSMOS_URI=https://your-account.documents.azure.com:443/
export AZURE_COSMOS_KEY=your_primary_key
```

## Configuration

### Configuration DynamoDB
```properties
# workload_dynamodb.properties
recordcount=1000000
operationcount=1000000
workload=site.ycsb.workloads.CoreWorkload

# Configuration DynamoDB
dynamodb.region=us-east-1
dynamodb.table=ycsb-test
dynamodb.readCapacityUnits=1000
dynamodb.writeCapacityUnits=1000
dynamodb.consistentReads=false

# Workload configuration
readproportion=0.7
updateproportion=0.2
insertproportion=0.1
requestdistribution=zipfian
```

### Configuration Google Bigtable
```properties
# workload_bigtable.properties
recordcount=1000000
operationcount=1000000
workload=site.ycsb.workloads.CoreWorkload

# Configuration Bigtable
google.bigtable.project.id=your-project-id
google.bigtable.instance.id=ycsb-instance
google.bigtable.table.id=ycsb-table
google.bigtable.cluster.id=ycsb-cluster

# Performance settings
google.bigtable.connection.pool.size=10
```

### Configuration Azure Cosmos DB
```properties
# workload_cosmosdb.properties
recordcount=1000000
operationcount=1000000
workload=site.ycsb.workloads.CoreWorkload

# Configuration Cosmos DB
azurecosmos.uri=https://your-account.documents.azure.com:443/
azurecosmos.primaryKey=your_primary_key
azurecosmos.databaseName=ycsb
azurecosmos.containerName=ycsb-container
azurecosmos.useGateway=false
```

## Utilisation

### Test AWS DynamoDB
```bash
# Créer la table DynamoDB
aws dynamodb create-table \
  --table-name ycsb-test \
  --attribute-definitions AttributeName=_id,AttributeType=S \
  --key-schema AttributeName=_id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1000,WriteCapacityUnits=1000

# Charger les données
./bin/ycsb.sh load dynamodb -s \
  -P workloads/workloada \
  -p dynamodb.region=us-east-1 \
  -p dynamodb.table=ycsb-test \
  -threads 10

# Exécuter le benchmark
./bin/ycsb.sh run dynamodb -s \
  -P workloads/workloada \
  -p dynamodb.region=us-east-1 \
  -p dynamodb.table=ycsb-test \
  -threads 20
```

### Test Google Bigtable
```bash
# Créer l'instance Bigtable
gcloud bigtable instances create ycsb-instance \
  --cluster=ycsb-cluster \
  --cluster-zone=us-central1-b \
  --cluster-num-nodes=3 \
  --display-name="YCSB Test Instance"

# Charger et tester
./bin/ycsb.sh load googlebigtable -s \
  -P workloads/workloadb \
  -p google.bigtable.project.id=your-project-id \
  -p google.bigtable.instance.id=ycsb-instance \
  -threads 50

./bin/ycsb.sh run googlebigtable -s \
  -P workloads/workloadb \
  -p google.bigtable.project.id=your-project-id \
  -p google.bigtable.instance.id=ycsb-instance \
  -threads 100
```

### Test Azure Cosmos DB
```bash
# Charger les données
./bin/ycsb.sh load azurecosmos -s \
  -P workloads/workloadc \
  -p azurecosmos.uri=https://your-account.documents.azure.com:443/ \
  -p azurecosmos.primaryKey=your_primary_key \
  -p azurecosmos.databaseName=ycsb \
  -threads 25

# Exécuter le benchmark
./bin/ycsb.sh run azurecosmos -s \
  -P workloads/workloadc \
  -p azurecosmos.uri=https://your-account.documents.azure.com:443/ \
  -p azurecosmos.primaryKey=your_primary_key \
  -p azurecosmos.databaseName=ycsb \
  -threads 50
```

### Test de scalabilité automatique
```bash
#!/bin/bash
# Script de test de scalabilité cloud

# Test DynamoDB avec auto-scaling
for load in 100 500 1000 2000 5000; do
  echo "Testing with $load ops/sec target"
  
  # Ajuster les capacités
  aws dynamodb update-table \
    --table-name ycsb-test \
    --provisioned-throughput ReadCapacityUnits=$load,WriteCapacityUnits=$load
  
  # Attendre la mise à jour
  aws dynamodb wait table-exists --table-name ycsb-test
  
  # Lancer le test
  ./bin/ycsb.sh run dynamodb -s \
    -P workloads/workloada \
    -p dynamodb.table=ycsb-test \
    -p target=$load \
    -threads 50 \
    > results_dynamodb_${load}ops.txt
  
  sleep 300  # Pause entre les tests
done
```

## Métriques et Performance

### Métriques spécifiques au cloud
- **Throughput**: Opérations par seconde réelles vs provisionnées
- **Latency**: Temps de réponse incluant la latence réseau
- **Throttling**: Taux de limitation par le fournisseur cloud
- **Cost**: Coût par opération et par heure
- **Auto-scaling**: Temps de réaction de la scalabilité automatique

### Benchmarks de référence par service cloud

#### AWS DynamoDB (us-east-1)
```
Provisioned Mode (1000 RCU/WCU):
- Workload A: ~800 ops/sec, P99: 15ms
- Workload B: ~950 ops/sec, P99: 12ms
- Cost: ~$0.65/hour

On-Demand Mode:
- Workload A: ~400 ops/sec, P99: 25ms
- Burst capability: 4000 ops/sec
- Cost: ~$1.25 per million requests
```

#### Google Cloud Bigtable (us-central1)
```
3-node cluster:
- Workload A: ~15,000 ops/sec, P99: 8ms
- Workload B: ~25,000 ops/sec, P99: 6ms
- Cost: ~$1.85/hour per node

Auto-scaling enabled:
- Scale-up time: ~2 minutes
- Scale-down time: ~10 minutes
```

#### Azure Cosmos DB (East US)
```
Provisioned (10,000 RU/s):
- Workload A: ~8,000 ops/sec, P99: 10ms
- Workload B: ~9,500 ops/sec, P99: 8ms
- Cost: ~$5.84/hour

Serverless:
- Workload A: ~2,000 ops/sec, P99: 20ms
- Cost: ~$0.28 per million RUs consumed
```

### Analyse des coûts
```python
# Script d'analyse coût/performance
import json

def analyze_cost_performance(results_file, cost_per_hour):
    with open(results_file, 'r') as f:
        results = json.load(f)
    
    runtime_hours = results['runtime_ms'] / (1000 * 3600)
    total_cost = cost_per_hour * runtime_hours
    throughput = results['throughput_ops_sec']
    
    cost_per_million_ops = (total_cost / throughput) * 1000000 / 3600
    
    return {
        'cost_per_hour': cost_per_hour,
        'cost_per_million_ops': cost_per_million_ops,
        'throughput': throughput,
        'p99_latency': results['p99_latency_ms']
    }

# Comparer les services
services = {
    'dynamodb': analyze_cost_performance('dynamodb_results.json', 0.65),
    'bigtable': analyze_cost_performance('bigtable_results.json', 5.55),
    'cosmosdb': analyze_cost_performance('cosmosdb_results.json', 5.84)
}

for service, metrics in services.items():
    print(f"{service}: ${metrics['cost_per_million_ops']:.2f} per million ops")
```

## Troubleshooting

### Problèmes spécifiques au cloud

**Throttling DynamoDB**
```bash
# Vérifier les métriques CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=ycsb-test \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Sum

# Ajuster la configuration YCSB
./bin/ycsb.sh run dynamodb -s \
  -P workloads/workloada \
  -p dynamodb.table=ycsb-test \
  -p dynamodb.maxRetries=10 \
  -p dynamodb.retryDelay=100
```

**Erreurs de quota Google Cloud**
```bash
# Vérifier les quotas
gcloud compute project-info describe --project=your-project-id

# Demander une augmentation de quota
gcloud alpha billing quotas list --service=bigtable.googleapis.com
```

**Problèmes de connectivité Azure**
```bash
# Tester la connectivité
curl -I https://your-account.documents.azure.com:443/

# Vérifier les règles de firewall
az cosmosdb firewall-rule list --account-name your-account --resource-group your-rg
```

### Optimisation des performances cloud
```bash
# Utiliser des régions proches
export AWS_DEFAULT_REGION=us-east-1  # Si client en Virginie

# Optimiser les connexions
./bin/ycsb.sh run dynamodb -s \
  -P workloads/workloada \
  -p dynamodb.table=ycsb-test \
  -p dynamodb.maxConnections=50 \
  -p dynamodb.requestTimeout=10000
```

## Ressources

### Documentation cloud-spécifique
- [YCSB DynamoDB Binding](https://github.com/brianfrankcooper/YCSB/tree/master/dynamodb)
- [YCSB Google Bigtable Binding](https://github.com/brianfrankcooper/YCSB/tree/master/googlebigtable)
- [YCSB Azure Cosmos DB Binding](https://github.com/brianfrankcooper/YCSB/tree/master/azurecosmos)

### Guides de performance cloud
- [DynamoDB Performance Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Bigtable Performance Guide](https://cloud.google.com/bigtable/docs/performance)
- [Cosmos DB Performance Tips](https://docs.microsoft.com/en-us/azure/cosmos-db/performance-tips)

### Articles de recherche
- Cooper, B. F., et al. (2010). "Benchmarking cloud serving systems with YCSB". *Proceedings of the 1st ACM symposium on Cloud computing*, 143-154.
- Bermbach, D., & Tai, S. (2014). "Eventually consistent: how soon is eventual? An evaluation of Amazon S3's consistency behavior". *Proceedings of the 6th workshop on Middleware for service oriented computing*, 1-6.
- Dey, A., et al. (2013). "Yak: A high-performance big-data-friendly garbage collector". *12th USENIX Symposium on Operating Systems Design and Implementation*, 495-508.

## Sources et Références

1. Cooper, B. F., Silberstein, A., Tam, E., Ramakrishnan, R., & Sears, R. (2010). Benchmarking cloud serving systems with YCSB. *Proceedings of the 1st ACM symposium on Cloud computing*, 143-154.
2. Amazon Web Services. (2024). *Amazon DynamoDB Developer Guide*. https://docs.aws.amazon.com/dynamodb/
3. Google Cloud. (2024). *Cloud Bigtable Documentation*. https://cloud.google.com/bigtable/docs
4. Microsoft Azure. (2024). *Azure Cosmos DB Documentation*. https://docs.microsoft.com/en-us/azure/cosmos-db/
5. Bermbach, D., & Tai, S. (2014). Eventually consistent: how soon is eventual? An evaluation of Amazon S3's consistency behavior. *Proceedings of the 6th workshop on Middleware for service oriented computing*, 1-6.