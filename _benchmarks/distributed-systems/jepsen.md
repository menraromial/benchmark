---
title: "Jepsen"
category: "distributed-systems"
subcategory: "Consistency Testing"
description: "Framework for testing distributed systems under network partitions and failures to verify consistency guarantees"
tags: ["consistency", "partition-tolerance", "fault-injection", "distributed-systems", "cap-theorem"]
difficulty: "advanced"
last_updated: "2024-01-15"
version: "0.3.5"
official_website: "https://jepsen.io/"
license: "Eclipse Public License"
platforms: ["Linux", "macOS"]
languages: ["Clojure", "Java", "Bash"]
maintainer: "Kyle Kingsbury (Aphyr)"
citation: "Kingsbury, K. (2013). Jepsen: Distributed Systems Safety Research. Retrieved from https://jepsen.io/"
---

# Jepsen

## Vue d'ensemble

Jepsen est un framework de test pour systèmes distribués qui vérifie les garanties de consistance en présence de pannes réseau et de défaillances de nœuds. Il utilise l'injection de fautes pour découvrir les violations de consistance dans les bases de données distribuées et autres systèmes.

### Cas d'usage principaux
- Test de consistance des bases de données distribuées
- Vérification des garanties ACID en environnement distribué
- Validation de la tolérance aux pannes de partition
- Audit de sécurité des systèmes distribués
- Recherche en systèmes distribués

### Avantages
- Détection de bugs subtils de consistance
- Injection de fautes réalistes
- Analyse automatisée des violations
- Support de nombreux systèmes populaires
- Visualisation des résultats

### Limitations
- Courbe d'apprentissage élevée (Clojure)
- Configuration complexe pour nouveaux systèmes
- Nécessite un cluster de test dédié
- Temps d'exécution long pour tests complets

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)
- macOS 10.14+ (pour développement uniquement)

### Dépendances logicielles
- **Java**: OpenJDK 11+ ou Oracle JDK 11+
- **Leiningen**: 2.9+ (gestionnaire de projet Clojure)
- **SSH**: Client SSH configuré avec clés
- **Docker**: 20.03+ (optionnel, pour isolation)
- **Git**: Pour cloner les tests existants

### Configuration matérielle recommandée
- **Cluster de test**: 5+ nœuds (minimum 3)
- **CPU**: 4+ cœurs par nœud
- **RAM**: 8GB+ par nœud
- **Réseau**: Connexion stable entre nœuds
- **Stockage**: SSD recommandé, 50GB+ par nœud

### Configuration réseau
- Accès SSH sans mot de passe entre nœuds
- Possibilité d'injection de pannes réseau (iptables)
- Résolution DNS ou fichier /etc/hosts configuré

## Installation

### Méthode 1 : Installation locale
```bash
# Installer Java et Leiningen
sudo apt-get update
sudo apt-get install openjdk-11-jdk

# Installer Leiningen
curl https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein > ~/bin/lein
chmod +x ~/bin/lein
lein version

# Cloner Jepsen
git clone https://github.com/jepsen-io/jepsen.git
cd jepsen
```

### Méthode 2 : Docker (développement)
```bash
# Utiliser l'image Docker officielle
docker pull jepsen/jepsen

# Créer un environnement de test
git clone https://github.com/jepsen-io/jepsen.git
cd jepsen/docker
./up.sh --dev

# Se connecter au container de contrôle
docker exec -it jepsen-control bash
```

### Méthode 3 : Vagrant (cluster local)
```bash
# Utiliser Vagrant pour un cluster local
cd jepsen/vagrant
vagrant up

# Se connecter à la machine de contrôle
vagrant ssh control
```

### Configuration SSH
```bash
# Générer une clé SSH (si nécessaire)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Copier la clé sur tous les nœuds du cluster
for node in n1 n2 n3 n4 n5; do
    ssh-copy-id root@$node
done

# Tester la connectivité
for node in n1 n2 n3 n4 n5; do
    ssh root@$node "hostname && date"
done
```

## Configuration

### Configuration du cluster
```clojure
; test/jepsen/mytest.clj
(ns jepsen.mytest
  (:require [jepsen [cli :as cli]
                    [control :as c]
                    [db :as db]
                    [tests :as tests]]
            [jepsen.control.util :as cu]
            [jepsen.os.debian :as debian]))

(def db
  (reify db/DB
    (setup! [_ test node]
      (info node "Setting up database"))
    
    (teardown! [_ test node]
      (info node "Tearing down database"))))

(defn mytest
  "Configuration du test"
  [opts]
  (merge tests/noop-test
         {:name "mytest"
          :os   debian/os
          :db   db
          :nodes ["n1" "n2" "n3" "n4" "n5"]}
         opts))
```

### Configuration réseau
```bash
# Configuration iptables pour injection de pannes
# Script d'isolation réseau
cat > isolate_node.sh << 'EOF'
#!/bin/bash
NODE=$1
ACTION=$2

case $ACTION in
    "isolate")
        # Isoler le nœud du réseau
        iptables -A INPUT -s 192.168.1.0/24 -j DROP
        iptables -A OUTPUT -d 192.168.1.0/24 -j DROP
        ;;
    "restore")
        # Restaurer la connectivité
        iptables -F INPUT
        iptables -F OUTPUT
        ;;
esac
EOF

chmod +x isolate_node.sh
```

### Configuration des tests existants
```bash
# Tester MongoDB
cd jepsen
lein run test --workload register --db mongodb --nodes-file nodes.txt --time-limit 60

# Tester Cassandra
lein run test --workload set --db cassandra --nodes-file nodes.txt --time-limit 120

# Tester Elasticsearch
lein run test --workload append --db elasticsearch --nodes-file nodes.txt --time-limit 180
```

## Utilisation

### Exemple basique - Test MongoDB
```bash
# Créer le fichier de nœuds
echo -e "n1\nn2\nn3\nn4\nn5" > nodes.txt

# Exécuter un test de registre sur MongoDB
cd jepsen
lein run test \
    --workload register \
    --db mongodb \
    --nodes-file nodes.txt \
    --time-limit 300 \
    --concurrency 10 \
    --nemesis partition-random-halves \
    --test-count 1
```

### Test de consistance avec Cassandra
```bash
# Test avec workload set (ensemble)
lein run test \
    --workload set \
    --db cassandra \
    --nodes-file nodes.txt \
    --time-limit 600 \
    --concurrency 20 \
    --nemesis partition-random-node \
    --consistency-level quorum \
    --replication-factor 3
```

### Test personnalisé
```clojure
; test/jepsen/mydb_test.clj
(ns jepsen.mydb-test
  (:require [clojure.tools.logging :refer :all]
            [jepsen [checker :as checker]
                    [cli :as cli]
                    [client :as client]
                    [control :as c]
                    [db :as db]
                    [generator :as gen]
                    [nemesis :as nemesis]
                    [tests :as tests]]
            [jepsen.checker.timeline :as timeline]
            [jepsen.control.util :as cu]
            [jepsen.os.debian :as debian]))

(defrecord Client [conn]
  client/Client
  (open! [this test node]
    (assoc this :conn (connect-to-db node)))
  
  (setup! [this test]
    (create-table conn))
  
  (invoke! [this test op]
    (case (:f op)
      :read  (assoc op :type :ok :value (read-value conn (:key op)))
      :write (do (write-value conn (:key op) (:value op))
                 (assoc op :type :ok))))
  
  (teardown! [this test])
  
  (close! [this test]
    (disconnect conn)))

(defn mydb-test
  [opts]
  (merge tests/noop-test
         {:name      "mydb"
          :os        debian/os
          :db        (mydb-db)
          :client    (Client. nil)
          :nemesis   (nemesis/partition-random-halves)
          :generator (->> (gen/mix [r w])
                          (gen/stagger 1/10)
                          (gen/nemesis
                            (cycle [(gen/sleep 5)
                                   {:type :info :f :start}
                                   (gen/sleep 5)
                                   {:type :info :f :stop}]))
                          (gen/time-limit (:time-limit opts)))
          :checker   (checker/compose
                       {:perf     (checker/perf)
                        :timeline (timeline/html)
                        :linear   (checker/linearizable
                                   {:model (model/cas-register)})})}
         opts))
```

### Cas d'usage avancés

#### Test de performance sous panne
```bash
# Test avec charge élevée et pannes fréquentes
lein run test \
    --workload bank \
    --db postgresql \
    --nodes-file nodes.txt \
    --time-limit 1800 \
    --concurrency 50 \
    --nemesis partition-majorities-ring \
    --nemesis-interval 30 \
    --isolation serializable
```

#### Test de récupération après panne
```bash
# Test de récupération avec kill de processus
lein run test \
    --workload append \
    --db redis \
    --nodes-file nodes.txt \
    --time-limit 900 \
    --nemesis kill \
    --recovery-time 60 \
    --final-recovery-time 300
```

#### Analyse de différents niveaux de consistance
```bash
#!/bin/bash
# Script de test multi-niveaux
consistency_levels=("eventual" "strong" "causal")
workloads=("register" "set" "bank")

for consistency in "${consistency_levels[@]}"; do
    for workload in "${workloads[@]}"; do
        echo "Testing $workload with $consistency consistency"
        
        lein run test \
            --workload $workload \
            --db cassandra \
            --nodes-file nodes.txt \
            --time-limit 300 \
            --consistency-level $consistency \
            --output-dir "results/${workload}_${consistency}" \
            --test-count 3
        
        sleep 120  # Pause entre tests
    done
done
```

## Métriques et Performance

### Types de métriques collectées
- **Violations de consistance**: Nombre et types d'anomalies détectées
- **Latence**: Distribution des temps de réponse
- **Débit**: Opérations par seconde
- **Disponibilité**: Pourcentage de requêtes réussies
- **Durée des pannes**: Temps de récupération

### Types d'anomalies détectées
1. **Dirty Read**: Lecture de données non commitées
2. **Non-repeatable Read**: Lectures inconsistantes
3. **Phantom Read**: Apparition de nouveaux enregistrements
4. **Lost Update**: Perte de mises à jour concurrentes
5. **Write Skew**: Écriture basée sur lecture obsolète

### Exemple de résultats
```
Jepsen Test Results:
===================
Database: MongoDB 5.0
Workload: register
Duration: 300 seconds
Concurrency: 10 clients
Nemesis: partition-random-halves

Operations:
- Total: 15,420
- Successful: 14,891 (96.6%)
- Failed: 529 (3.4%)

Consistency Violations:
- Stale reads: 23
- Lost updates: 0
- Dirty reads: 0

Performance:
- Mean latency: 45ms
- 95th percentile: 120ms
- 99th percentile: 250ms
- Throughput: 51.4 ops/sec
```

### Analyse des résultats
```clojure
; Analyse personnalisée des résultats
(defn analyze-results [history]
  (let [ops (filter #(= :ok (:type %)) history)
        reads (filter #(= :read (:f %)) ops)
        writes (filter #(= :write (:f %)) ops)]
    
    {:total-ops (count ops)
     :read-ops (count reads)
     :write-ops (count writes)
     :mean-latency (mean (map :latency ops))
     :violations (detect-violations history)}))

; Génération de graphiques
(defn generate-timeline [history]
  (timeline/html
    {:history history
     :nemeses #{:start :stop}
     :colors {:read "blue" :write "red" :cas "green"}}))
```

### Comparaison de systèmes

| Système | Workload | Violations | Latence P99 | Disponibilité |
|---------|----------|------------|-------------|---------------|
| MongoDB | register | 23 stale reads | 250ms | 96.6% |
| Cassandra | set | 0 violations | 180ms | 98.2% |
| PostgreSQL | bank | 5 write skews | 320ms | 94.1% |
| Redis | append | 12 lost updates | 95ms | 97.8% |

## Troubleshooting

### Problèmes courants

**Erreurs de connexion SSH**
```bash
# Vérifier la connectivité SSH
ssh -v root@n1

# Problèmes de clés SSH
ssh-add ~/.ssh/id_rsa
ssh-agent bash

# Permissions incorrectes
chmod 600 ~/.ssh/id_rsa
chmod 700 ~/.ssh/
```

**Erreurs de compilation Clojure**
```bash
# Nettoyer le cache Leiningen
lein clean
rm -rf ~/.m2/repository

# Mettre à jour les dépendances
lein deps

# Problèmes de version Java
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
lein version
```

**Problèmes d'injection de pannes**
```bash
# Vérifier les permissions iptables
sudo iptables -L
sudo usermod -aG sudo jepsen

# Problèmes de timing
# Augmenter les timeouts dans le test
:nemesis-interval 60
:recovery-time 120
```

**Erreurs de base de données**
```bash
# Logs détaillés
export JEPSEN_LOG_LEVEL=debug
lein run test --log-level debug

# Nettoyage entre tests
lein run test --leave-db-running false
```

### Optimisation des performances
```clojure
; Configuration optimisée
{:concurrency 20          ; Ajuster selon les ressources
 :time-limit 600         ; Tests plus longs pour plus de données
 :nemesis-interval 45    ; Équilibrer pannes et récupération
 :rate 100               ; Limiter le taux de requêtes
 :ssh {:strict-host-key-checking false
       :connect-timeout 10000}}
```

## Ressources

### Documentation officielle
- [Jepsen Documentation](https://github.com/jepsen-io/jepsen/blob/main/doc/tutorial/index.md)
- [Jepsen Blog](https://jepsen.io/analyses)
- [Clojure Documentation](https://clojure.org/guides/getting_started)

### Tutoriels complémentaires
- [Writing Jepsen Tests](https://github.com/jepsen-io/jepsen/blob/main/doc/tutorial/02-writing-a-test.md)
- [Understanding CAP Theorem](https://jepsen.io/consistency)

### Articles de recherche
- Kingsbury, K., & Alvaro, P. (2020). Elle: Finding Linearizability Violations in Distributed Systems. *Proceedings of the 2020 ACM SIGOPS 28th Symposium on Operating Systems Principles*, 405-420.
- Bailis, P., et al. (2013). Highly available transactions: Virtues and limitations. *Proceedings of the VLDB Endowment*, 7(3), 181-192.

### Code source
- [Jepsen GitHub](https://github.com/jepsen-io/jepsen)
- [Tests existants](https://github.com/jepsen-io/jepsen/tree/main/src/jepsen)
- [Elle (Linearizability checker)](https://github.com/jepsen-io/elle)

## Sources et Références

1. Kingsbury, K. (2013). *Jepsen: Distributed Systems Safety Research*. Retrieved from https://jepsen.io/
2. Brewer, E. A. (2000). Towards robust distributed systems. *Proceedings of the nineteenth annual ACM symposium on Principles of distributed computing*, 7-10.
3. Gilbert, S., & Lynch, N. (2002). Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services. *ACM SIGACT News*, 33(2), 51-59.
4. Bailis, P., Venkataraman, S., Franklin, M. J., Hellerstein, J. M., & Stoica, I. (2012). Probabilistically bounded staleness for practical partial quorums. *Proceedings of the VLDB Endowment*, 5(8), 776-787.