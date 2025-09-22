---
title: "Apache Kafka Performance Testing"
category: "distributed-systems"
subcategory: "Message Queue Benchmarks"
description: "Built-in performance testing tools for Apache Kafka to measure throughput, latency, and scalability of distributed streaming platforms"
tags: ["kafka", "streaming", "messaging", "throughput", "latency", "distributed-systems"]
difficulty: "intermediate"
last_updated: "2024-01-15"
version: "3.6.0"
official_website: "https://kafka.apache.org/"
license: "Apache License 2.0"
platforms: ["Linux", "Windows", "macOS"]
languages: ["Java", "Scala"]
maintainer: "Apache Software Foundation"
citation: "Kreps, J., et al. (2011). Kafka: a Distributed Messaging System for Log Processing. Proceedings of the NetDB Workshop, 1-7."
---

# Apache Kafka Performance Testing

## Vue d'ensemble

Apache Kafka inclut des outils de benchmarking intégrés pour mesurer les performances de throughput, latence et scalabilité des clusters Kafka. Ces outils permettent de tester les producteurs, consommateurs et l'infrastructure de streaming dans différentes conditions de charge.

### Cas d'usage principaux
- Test de performance des clusters Kafka
- Validation de la scalabilité des producteurs/consommateurs
- Benchmarking des configurations de stockage
- Test de résilience et de récupération
- Optimisation des paramètres de performance

### Avantages
- Outils intégrés dans Kafka
- Tests réalistes de streaming
- Support de différents patterns de charge
- Métriques détaillées de performance
- Configuration flexible

### Limitations
- Limité à l'écosystème Kafka
- Configuration complexe pour tests avancés
- Nécessite un cluster Kafka fonctionnel
- Pas de GUI intégrée

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 18.04+, CentOS 7+, RHEL 7+)
- Windows 10+ (avec WSL recommandé)
- macOS 10.14+

### Dépendances logicielles
- **Java**: OpenJDK 11+ ou Oracle JDK 11+
- **Apache Kafka**: 2.8+ (inclut les outils de test)
- **Apache ZooKeeper**: 3.6+ (si pas en mode KRaft)
- **Python**: 3.7+ (pour scripts d'analyse)

### Configuration matérielle recommandée
- **Cluster Kafka**: 3+ brokers minimum
- **CPU**: 8+ cœurs par broker
- **RAM**: 16GB+ par broker
- **Stockage**: SSD recommandé, 500GB+ par broker
- **Réseau**: 10Gbps pour tests haute performance

## Installation

### Méthode 1 : Installation Kafka standalone
```bash
# Télécharger Kafka
wget https://downloads.apache.org/kafka/2.13-3.6.0/kafka_2.13-3.6.0.tgz
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# Démarrer ZooKeeper (si nécessaire)
bin/zookeeper-server-start.sh config/zookeeper.properties &

# Démarrer Kafka
bin/kafka-server-start.sh config/server.properties &
```

### Méthode 2 : Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka1:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: true

  kafka2:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3

  kafka3:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9094:9094"
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9094
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
```

### Méthode 3 : Cluster distribué
```bash
# Configuration pour cluster multi-nœuds
# Sur chaque nœud, modifier config/server.properties

# Nœud 1
broker.id=1
listeners=PLAINTEXT://kafka1:9092
advertised.listeners=PLAINTEXT://kafka1:9092
log.dirs=/var/kafka-logs-1
zookeeper.connect=zk1:2181,zk2:2181,zk3:2181

# Nœud 2  
broker.id=2
listeners=PLAINTEXT://kafka2:9092
advertised.listeners=PLAINTEXT://kafka2:9092
log.dirs=/var/kafka-logs-2
zookeeper.connect=zk1:2181,zk2:2181,zk3:2181

# Nœud 3
broker.id=3
listeners=PLAINTEXT://kafka3:9092
advertised.listeners=PLAINTEXT://kafka3:9092
log.dirs=/var/kafka-logs-3
zookeeper.connect=zk1:2181,zk2:2181,zk3:2181
```

## Configuration

### Configuration des topics de test
```bash
# Créer un topic pour les tests
bin/kafka-topics.sh --create \
    --bootstrap-server localhost:9092 \
    --topic test-topic \
    --partitions 12 \
    --replication-factor 3

# Vérifier la configuration
bin/kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --topic test-topic
```

### Configuration du producteur
```properties
# producer.properties
bootstrap.servers=localhost:9092,localhost:9093,localhost:9094
key.serializer=org.apache.kafka.common.serialization.StringSerializer
value.serializer=org.apache.kafka.common.serialization.StringSerializer

# Performance tuning
batch.size=16384
linger.ms=5
buffer.memory=33554432
compression.type=lz4
acks=1

# Reliability vs Performance
# acks=all (plus sûr mais plus lent)
# acks=1 (équilibré)
# acks=0 (plus rapide mais moins sûr)
```

### Configuration du consommateur
```properties
# consumer.properties
bootstrap.servers=localhost:9092,localhost:9093,localhost:9094
group.id=test-consumer-group
key.deserializer=org.apache.kafka.common.serialization.StringDeserializer
value.deserializer=org.apache.kafka.common.serialization.StringDeserializer

# Performance tuning
fetch.min.bytes=1024
fetch.max.wait.ms=500
max.partition.fetch.bytes=1048576
enable.auto.commit=true
auto.commit.interval.ms=1000
```

## Utilisation

### Test de performance du producteur
```bash
# Test basique de throughput
bin/kafka-producer-perf-test.sh \
    --topic test-topic \
    --num-records 1000000 \
    --record-size 1024 \
    --throughput 10000 \
    --producer-props bootstrap.servers=localhost:9092

# Test avec configuration personnalisée
bin/kafka-producer-perf-test.sh \
    --topic test-topic \
    --num-records 5000000 \
    --record-size 2048 \
    --throughput -1 \
    --producer-props \
        bootstrap.servers=localhost:9092,localhost:9093,localhost:9094 \
        acks=1 \
        batch.size=32768 \
        linger.ms=10 \
        compression.type=lz4
```

### Test de performance du consommateur
```bash
# Test basique de consommation
bin/kafka-consumer-perf-test.sh \
    --bootstrap-server localhost:9092 \
    --topic test-topic \
    --messages 1000000 \
    --threads 1

# Test avec multiple threads
bin/kafka-consumer-perf-test.sh \
    --bootstrap-server localhost:9092,localhost:9093,localhost:9094 \
    --topic test-topic \
    --messages 5000000 \
    --threads 4 \
    --group perf-consumer-group
```

### Test de latence end-to-end
```bash
# Test de latence avec kafka-run-class
bin/kafka-run-class.sh kafka.tools.EndToEndLatency \
    localhost:9092 \
    test-topic \
    1000 \
    1 \
    1024
```

### Scripts de test automatisés
```bash
#!/bin/bash
# comprehensive_kafka_test.sh

BOOTSTRAP_SERVERS="localhost:9092,localhost:9093,localhost:9094"
TOPIC="perf-test-topic"
RESULTS_DIR="kafka_results_$(date +%Y%m%d_%H%M%S)"

mkdir -p $RESULTS_DIR

echo "=== Kafka Performance Test Suite ==="
echo "Results will be saved to: $RESULTS_DIR"

# Créer le topic de test
bin/kafka-topics.sh --create \
    --bootstrap-server $BOOTSTRAP_SERVERS \
    --topic $TOPIC \
    --partitions 12 \
    --replication-factor 3 \
    --if-not-exists

# Test 1: Throughput du producteur
echo "Running producer throughput test..."
bin/kafka-producer-perf-test.sh \
    --topic $TOPIC \
    --num-records 1000000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props bootstrap.servers=$BOOTSTRAP_SERVERS \
    > $RESULTS_DIR/producer_throughput.txt

# Test 2: Throughput du consommateur
echo "Running consumer throughput test..."
bin/kafka-consumer-perf-test.sh \
    --bootstrap-server $BOOTSTRAP_SERVERS \
    --topic $TOPIC \
    --messages 1000000 \
    --threads 4 \
    > $RESULTS_DIR/consumer_throughput.txt

# Test 3: Latence end-to-end
echo "Running end-to-end latency test..."
bin/kafka-run-class.sh kafka.tools.EndToEndLatency \
    $BOOTSTRAP_SERVERS \
    $TOPIC \
    10000 \
    1 \
    1024 \
    > $RESULTS_DIR/end_to_end_latency.txt

# Test 4: Test de scalabilité
echo "Running scalability test..."
for threads in 1 2 4 8 16; do
    echo "Testing with $threads consumer threads..."
    bin/kafka-consumer-perf-test.sh \
        --bootstrap-server $BOOTSTRAP_SERVERS \
        --topic $TOPIC \
        --messages 500000 \
        --threads $threads \
        > $RESULTS_DIR/consumer_scalability_${threads}threads.txt
done

echo "Tests completed. Results in $RESULTS_DIR/"
```

### Cas d'usage avancés

#### Test de résilience avec pannes
```bash
#!/bin/bash
# resilience_test.sh

TOPIC="resilience-test"
BOOTSTRAP_SERVERS="localhost:9092,localhost:9093,localhost:9094"

# Créer topic avec haute réplication
bin/kafka-topics.sh --create \
    --bootstrap-server $BOOTSTRAP_SERVERS \
    --topic $TOPIC \
    --partitions 6 \
    --replication-factor 3

# Démarrer producteur en arrière-plan
bin/kafka-producer-perf-test.sh \
    --topic $TOPIC \
    --num-records 10000000 \
    --record-size 1024 \
    --throughput 1000 \
    --producer-props \
        bootstrap.servers=$BOOTSTRAP_SERVERS \
        acks=all \
        retries=2147483647 \
        max.in.flight.requests.per.connection=1 \
    > producer_resilience.log 2>&1 &

PRODUCER_PID=$!

# Démarrer consommateur en arrière-plan
bin/kafka-consumer-perf-test.sh \
    --bootstrap-server $BOOTSTRAP_SERVERS \
    --topic $TOPIC \
    --messages 10000000 \
    --threads 2 \
    > consumer_resilience.log 2>&1 &

CONSUMER_PID=$!

# Simuler des pannes
sleep 30
echo "Stopping broker 1..."
docker stop kafka1

sleep 60
echo "Restarting broker 1..."
docker start kafka1

sleep 30
echo "Stopping broker 2..."
docker stop kafka2

sleep 60
echo "Restarting broker 2..."
docker start kafka2

# Attendre la fin des tests
wait $PRODUCER_PID
wait $CONSUMER_PID

echo "Resilience test completed"
```

#### Test de différentes configurations
```bash
#!/bin/bash
# configuration_comparison.sh

TOPIC="config-test"
BOOTSTRAP_SERVERS="localhost:9092,localhost:9093,localhost:9094"

# Configurations à tester
declare -A configs=(
    ["high_throughput"]="acks=1 batch.size=65536 linger.ms=20 compression.type=lz4"
    ["low_latency"]="acks=1 batch.size=1 linger.ms=0 compression.type=none"
    ["balanced"]="acks=1 batch.size=16384 linger.ms=5 compression.type=snappy"
    ["reliable"]="acks=all batch.size=16384 linger.ms=5 compression.type=gzip"
)

for config_name in "${!configs[@]}"; do
    echo "Testing configuration: $config_name"
    
    # Recréer le topic
    bin/kafka-topics.sh --delete --bootstrap-server $BOOTSTRAP_SERVERS --topic $TOPIC 2>/dev/null
    sleep 5
    bin/kafka-topics.sh --create \
        --bootstrap-server $BOOTSTRAP_SERVERS \
        --topic $TOPIC \
        --partitions 12 \
        --replication-factor 3
    
    # Test producteur
    bin/kafka-producer-perf-test.sh \
        --topic $TOPIC \
        --num-records 1000000 \
        --record-size 1024 \
        --throughput -1 \
        --producer-props \
            bootstrap.servers=$BOOTSTRAP_SERVERS \
            ${configs[$config_name]} \
        > results_${config_name}_producer.txt
    
    # Test consommateur
    bin/kafka-consumer-perf-test.sh \
        --bootstrap-server $BOOTSTRAP_SERVERS \
        --topic $TOPIC \
        --messages 1000000 \
        --threads 4 \
        > results_${config_name}_consumer.txt
    
    sleep 10
done
```

## Métriques et Performance

### Types de métriques collectées
- **Throughput**: Messages/seconde, MB/seconde
- **Latence**: Temps de bout en bout, percentiles
- **Utilisation ressources**: CPU, mémoire, réseau, disque
- **Métriques Kafka**: Lag des consommateurs, taille des partitions
- **Erreurs**: Taux d'échec, timeouts, reconnexions

### Exemple de résultats producteur
```
Producer Performance Test Results:
=================================
Records sent: 1000000
Records/sec: 85432.10
MB/sec: 83.43
Avg latency: 12.45 ms
Max latency: 247.32 ms
50th percentile: 8.23 ms
95th percentile: 32.45 ms
99th percentile: 78.91 ms
99.9th percentile: 156.78 ms
```

### Exemple de résultats consommateur
```
Consumer Performance Test Results:
=================================
Messages consumed: 1000000
MB consumed: 976.56
Time taken: 11.234 seconds
MB/sec: 86.92
Messages/sec: 89012.34
Rebalance time: 2.345 seconds
```

### Monitoring avec JMX
```bash
# Activer JMX sur les brokers Kafka
export KAFKA_JMX_OPTS="-Dcom.sun.management.jmxremote \
    -Dcom.sun.management.jmxremote.authenticate=false \
    -Dcom.sun.management.jmxremote.ssl=false \
    -Dcom.sun.management.jmxremote.port=9999"

# Collecter métriques JMX
bin/kafka-run-class.sh kafka.tools.JmxTool \
    --object-name kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi \
    --date-format "yyyy-MM-dd HH:mm:ss" \
    --attributes Count,OneMinuteRate,FiveMinuteRate
```

### Analyse des résultats
```python
# analyze_kafka_results.py
import re
import pandas as pd
import matplotlib.pyplot as plt

def parse_producer_results(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Parser les métriques
    records_sec = re.search(r'(\d+\.?\d*) records/sec', content)
    mb_sec = re.search(r'(\d+\.?\d*) MB/sec', content)
    avg_latency = re.search(r'avg latency (\d+\.?\d*) ms', content)
    p99_latency = re.search(r'99th percentile latency (\d+\.?\d*) ms', content)
    
    return {
        'records_per_sec': float(records_sec.group(1)) if records_sec else 0,
        'mb_per_sec': float(mb_sec.group(1)) if mb_sec else 0,
        'avg_latency': float(avg_latency.group(1)) if avg_latency else 0,
        'p99_latency': float(p99_latency.group(1)) if p99_latency else 0
    }

def parse_consumer_results(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    mb_sec = re.search(r'(\d+\.?\d*) MB/sec', content)
    msg_sec = re.search(r'(\d+\.?\d*) nMsg/sec', content)
    
    return {
        'mb_per_sec': float(mb_sec.group(1)) if mb_sec else 0,
        'messages_per_sec': float(msg_sec.group(1)) if msg_sec else 0
    }

# Analyser les résultats de configuration
configs = ['high_throughput', 'low_latency', 'balanced', 'reliable']
results = []

for config in configs:
    try:
        producer_data = parse_producer_results(f'results_{config}_producer.txt')
        consumer_data = parse_consumer_results(f'results_{config}_consumer.txt')
        
        results.append({
            'config': config,
            'producer_throughput': producer_data['records_per_sec'],
            'producer_latency': producer_data['avg_latency'],
            'consumer_throughput': consumer_data['messages_per_sec']
        })
    except FileNotFoundError:
        continue

# Créer graphiques
df = pd.DataFrame(results)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Graphique throughput
ax1.bar(df['config'], df['producer_throughput'], alpha=0.7, label='Producer')
ax1.bar(df['config'], df['consumer_throughput'], alpha=0.7, label='Consumer')
ax1.set_ylabel('Messages/sec')
ax1.set_title('Throughput by Configuration')
ax1.legend()
ax1.tick_params(axis='x', rotation=45)

# Graphique latence
ax2.bar(df['config'], df['producer_latency'], alpha=0.7, color='red')
ax2.set_ylabel('Latency (ms)')
ax2.set_title('Producer Latency by Configuration')
ax2.tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.savefig('kafka_performance_analysis.png')
```

### Comparaison de configurations

| Configuration   | Throughput (msg/s) | Latence P99 (ms) | Fiabilité | Cas d'usage            |
| --------------- | ------------------ | ---------------- | --------- | ---------------------- |
| High Throughput | 120,000            | 45               | Moyenne   | Logs, métriques        |
| Low Latency     | 85,000             | 8                | Moyenne   | Trading, IoT           |
| Balanced        | 100,000            | 25               | Bonne     | Applications web       |
| Reliable        | 75,000             | 35               | Élevée    | Transactions critiques |

## Troubleshooting

### Problèmes courants

**Performance dégradée**
```bash
# Vérifier l'état du cluster
bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# Analyser les métriques JMX
bin/kafka-run-class.sh kafka.tools.JmxTool \
    --object-name kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi

# Vérifier les logs
tail -f logs/server.log | grep -E "(ERROR|WARN)"
```

**Problèmes de connectivité**
```bash
# Tester la connectivité réseau
telnet localhost 9092
telnet localhost 9093
telnet localhost 9094

# Vérifier la configuration DNS
nslookup kafka1
nslookup kafka2
nslookup kafka3
```

**Lag des consommateurs**
```bash
# Vérifier le lag des consumer groups
bin/kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --describe \
    --group test-consumer-group

# Réinitialiser les offsets si nécessaire
bin/kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --group test-consumer-group \
    --reset-offsets \
    --to-earliest \
    --topic test-topic \
    --execute
```

**Problèmes de mémoire**
```bash
# Optimiser la heap JVM pour Kafka
export KAFKA_HEAP_OPTS="-Xmx6g -Xms6g"
export KAFKA_JVM_PERFORMANCE_OPTS="-server -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35"

# Monitoring GC
export KAFKA_GC_LOG_OPTS="-Xloggc:/var/log/kafka/gc.log -verbose:gc -XX:+PrintGCDetails -XX:+PrintGCTimeStamps"
```

### Optimisation des performances
```properties
# server.properties - Configuration optimisée
# Réseau
num.network.threads=8
num.io.threads=16
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# Stockage
num.replica.fetchers=4
replica.fetch.max.bytes=1048576
log.segment.bytes=1073741824
log.retention.hours=168
log.cleanup.policy=delete

# Performance
compression.type=lz4
min.insync.replicas=2
unclean.leader.election.enable=false
```

## Ressources

### Documentation officielle
- [Kafka Performance Testing](https://kafka.apache.org/documentation/#performance)
- [Kafka Operations Guide](https://kafka.apache.org/documentation/#operations)
- [Kafka Configuration](https://kafka.apache.org/documentation/#configuration)

### Tutoriels complémentaires
- [Kafka Performance Tuning](https://example.com/kafka-tuning)
- [Kafka Monitoring Best Practices](https://example.com/kafka-monitoring)

### Articles de recherche
- Kreps, J., Narkhede, N., Rao, J., et al. (2011). Kafka: a Distributed Messaging System for Log Processing. *Proceedings of the NetDB Workshop*, 1-7.
- Wang, G., et al. (2015). Building a replicated logging system with Apache Kafka. *Proceedings of the VLDB Endowment*, 8(12), 1654-1655.

### Code source
- [Apache Kafka GitHub](https://github.com/apache/kafka)
- [Kafka Performance Tools](https://github.com/apache/kafka/tree/trunk/tools/src/main/java/org/apache/kafka/tools)

## Sources et Références

1. Kreps, J., Narkhede, N., Rao, J., & Shah, S. (2011). Kafka: a Distributed Messaging System for Log Processing. *Proceedings of the NetDB Workshop*, 1-7.
2. Goodhope, K., et al. (2012). Building LinkedIn's Real-time Activity Data Pipeline. *IEEE Data Engineering Bulletin*, 35(2), 33-45.
3. Chen, C., & Zhang, J. (2016). Effective testing for distributed stream processing systems. *Proceedings of the 2016 24th ACM SIGSOFT International Symposium on Foundations of Software Engineering*, 834-845.
4. Nasir, M. A. U., et al. (2015). The power of both choices: Practical load balancing for distributed stream processing engines. *2015 IEEE 31st International Conference on Data Engineering*, 137-148.