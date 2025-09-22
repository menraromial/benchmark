---
title: "wrk - HTTP Load Testing Tool"
category: "distributed-systems"
subcategory: "HTTP Load Testing"
description: "Modern HTTP benchmarking tool capable of generating significant load with minimal resource usage"
tags: ["http", "load-testing", "performance", "web-services", "benchmarking"]
difficulty: "beginner"
last_updated: "2024-01-15"
version: "4.2.0"
official_website: "https://github.com/wg/wrk"
license: "Apache License 2.0"
platforms: ["Linux", "macOS", "FreeBSD"]
languages: ["C", "Lua"]
maintainer: "Will Glozer"
citation: "Glozer, W. (2012). wrk - a HTTP benchmarking tool. Retrieved from https://github.com/wg/wrk"
---

# wrk - HTTP Load Testing Tool

## Vue d'ensemble

wrk est un outil de benchmarking HTTP moderne conçu pour générer une charge significative avec une utilisation minimale des ressources. Il combine un design multi-threadé avec des E/O événementielles pour créer un outil de test de charge efficace et scriptable.

### Cas d'usage principaux
- Test de performance des API REST
- Benchmarking des serveurs web
- Test de charge des microservices
- Validation de la scalabilité des applications web
- Test de régression de performance

### Avantages
- Très faible consommation de ressources
- Haute performance (millions de requêtes/seconde)
- Scriptable avec Lua
- Support HTTP/1.1 et HTTP/2
- Métriques détaillées de latence

### Limitations
- Pas de support GUI
- Limité aux protocoles HTTP/HTTPS
- Pas de support natif pour WebSocket
- Configuration avancée nécessite Lua

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 16.04+, CentOS 7+, Debian 9+)
- macOS 10.12+
- FreeBSD 11+

### Dépendances logicielles
- **GCC**: 4.9+ ou Clang 3.5+
- **Make**: GNU Make
- **OpenSSL**: 1.0.2+ (pour HTTPS)
- **Lua**: 5.1+ (optionnel, pour scripts avancés)

### Configuration matérielle recommandée
- **CPU**: 4+ cœurs (pour tests haute charge)
- **RAM**: 4GB minimum
- **Réseau**: Connexion stable, bande passante suffisante
- **Limites système**: ulimit configuré pour nombreuses connexions

## Installation

### Méthode 1 : Compilation depuis les sources
```bash
# Installer les dépendances (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install build-essential libssl-dev git

# Cloner et compiler wrk
git clone https://github.com/wg/wrk.git
cd wrk
make

# Installer globalement (optionnel)
sudo cp wrk /usr/local/bin/
```

### Méthode 2 : Package manager (macOS)
```bash
# Avec Homebrew
brew install wrk

# Vérifier l'installation
wrk --version
```

### Méthode 3 : Package manager (Linux)
```bash
# Ubuntu/Debian
sudo apt-get install wrk

# CentOS/RHEL (EPEL required)
sudo yum install epel-release
sudo yum install wrk

# Arch Linux
sudo pacman -S wrk
```

### Configuration système
```bash
# Augmenter les limites de fichiers ouverts
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimisations réseau
echo 'net.core.somaxconn = 65536' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Configuration

### Syntaxe de base
```bash
wrk [options] <URL>

Options principales:
  -c, --connections <N>  Nombre de connexions HTTP à maintenir
  -d, --duration <T>     Durée du test (ex: 30s, 1m, 2h)
  -t, --threads <N>      Nombre de threads à utiliser
  -s, --script <S>       Script Lua à exécuter
  -H, --header <H>       En-tête HTTP à ajouter
      --latency          Afficher les statistiques de latence détaillées
      --timeout <T>      Timeout des requêtes
```

### Configuration des en-têtes HTTP
```bash
# Ajouter des en-têtes personnalisés
wrk -t4 -c100 -d30s \
    -H "Authorization: Bearer token123" \
    -H "Content-Type: application/json" \
    -H "User-Agent: wrk-benchmark" \
    http://example.com/api
```

### Scripts Lua de base
```lua
-- script.lua - Script POST simple
wrk.method = "POST"
wrk.body   = '{"key": "value", "test": true}'
wrk.headers["Content-Type"] = "application/json"

function response(status, headers, body)
    if status ~= 200 then
        print("Error: " .. status)
    end
end
```

## Utilisation

### Exemple basique
```bash
# Test simple GET
wrk -t4 -c100 -d30s http://example.com/

# Test avec statistiques de latence
wrk -t4 -c100 -d30s --latency http://example.com/api/users
```

### Test de montée en charge
```bash
#!/bin/bash
# Script de test de scalabilité
URL="http://localhost:8080/api/test"
DURATION="60s"

connections=(10 50 100 200 500 1000)

for conn in "${connections[@]}"; do
    echo "Testing with $conn connections..."
    wrk -t4 -c$conn -d$DURATION --latency $URL > results_${conn}conn.txt
    sleep 10  # Pause entre les tests
done
```

### Test POST avec données JSON
```bash
# Créer un script Lua pour POST
cat > post_test.lua << 'EOF'
wrk.method = "POST"
wrk.body = '{"username": "testuser", "action": "login"}'
wrk.headers["Content-Type"] = "application/json"

-- Compteur de requêtes
local counter = 0

function request()
    counter = counter + 1
    return wrk.format(nil, nil, nil, wrk.body)
end

function done(summary, latency, requests)
    print("Total requests: " .. counter)
end
EOF

# Exécuter le test POST
wrk -t4 -c50 -d30s -s post_test.lua http://api.example.com/login
```

### Test avec authentification
```lua
-- auth_test.lua
local tokens = {
    "Bearer token1",
    "Bearer token2", 
    "Bearer token3"
}

local counter = 0

function request()
    counter = counter + 1
    local token = tokens[(counter % #tokens) + 1]
    
    return wrk.format("GET", "/api/protected", {
        ["Authorization"] = token,
        ["Accept"] = "application/json"
    })
end

function response(status, headers, body)
    if status == 401 then
        print("Authentication failed")
    elseif status ~= 200 then
        print("Error: " .. status .. " - " .. body)
    end
end
```

### Cas d'usage avancés

#### Test de différents endpoints
```lua
-- multi_endpoint.lua
local endpoints = {
    "/api/users",
    "/api/products", 
    "/api/orders",
    "/api/stats"
}

local methods = {
    "GET",
    "GET",
    "POST",
    "GET"
}

local bodies = {
    nil,
    nil,
    '{"item": "test", "quantity": 1}',
    nil
}

local counter = 0

function request()
    counter = counter + 1
    local index = (counter % #endpoints) + 1
    
    local headers = {}
    if methods[index] == "POST" then
        headers["Content-Type"] = "application/json"
    end
    
    return wrk.format(methods[index], endpoints[index], headers, bodies[index])
end
```

#### Test de session avec cookies
```lua
-- session_test.lua
local session_cookies = {}

function request()
    local headers = {}
    
    -- Utiliser un cookie de session si disponible
    if session_cookies[wrk.thread.id] then
        headers["Cookie"] = session_cookies[wrk.thread.id]
    end
    
    return wrk.format("GET", "/api/dashboard", headers)
end

function response(status, headers, body)
    -- Extraire et sauvegarder les cookies de session
    local cookie = headers["Set-Cookie"]
    if cookie then
        session_cookies[wrk.thread.id] = cookie:match("([^;]+)")
    end
end
```

#### Test de charge progressive
```bash
#!/bin/bash
# Progressive load test
URL="http://localhost:8080/api"
MAX_CONNECTIONS=1000
STEP=50
DURATION="30s"

echo "Progressive Load Test Results" > progressive_results.txt
echo "=============================" >> progressive_results.txt

for ((conn=STEP; conn<=MAX_CONNECTIONS; conn+=STEP)); do
    echo "Testing with $conn connections..."
    echo "Connections: $conn" >> progressive_results.txt
    
    wrk -t4 -c$conn -d$DURATION --latency $URL | \
        grep -E "(Requests/sec|Latency|requests in)" >> progressive_results.txt
    
    echo "---" >> progressive_results.txt
    sleep 5
done
```

## Métriques et Performance

### Types de métriques collectées
- **Throughput**: Requêtes par seconde
- **Latence**: Distribution des temps de réponse
- **Connexions**: Nombre de connexions actives
- **Erreurs**: Taux d'erreur et codes de statut
- **Transfert**: Données transférées

### Exemple de sortie standard
```
Running 30s test @ http://example.com/api
  4 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    12.45ms   15.67ms 247.32ms   87.24%
    Req/Sec     2.15k   456.78     3.89k    73.25%
  Latency Distribution
     50%   8.23ms
     75%  15.67ms
     90%  32.45ms
     99%  78.91ms
  257834 requests in 30.10s, 52.34MB read
Requests/sec:   8567.23
Transfer/sec:      1.74MB
```

### Script d'analyse des résultats
```bash
#!/bin/bash
# Analyser les résultats de wrk
analyze_wrk_results() {
    local file=$1
    
    echo "=== Analysis of $file ==="
    
    # Extraire les métriques principales
    local rps=$(grep "Requests/sec:" $file | awk '{print $2}')
    local latency_avg=$(grep "Latency" $file | head -1 | awk '{print $2}')
    local latency_p99=$(grep "99%" $file | awk '{print $2}')
    local errors=$(grep "Socket errors:" $file | wc -l)
    
    echo "Requests/sec: $rps"
    echo "Average Latency: $latency_avg"
    echo "99th Percentile: $latency_p99"
    echo "Errors: $errors"
    echo
}

# Analyser tous les fichiers de résultats
for file in results_*.txt; do
    analyze_wrk_results $file
done
```

### Génération de graphiques
```python
# analyze_wrk.py
import re
import matplotlib.pyplot as plt
import numpy as np

def parse_wrk_file(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Extraire les métriques
    rps_match = re.search(r'Requests/sec:\s+(\d+\.?\d*)', content)
    latency_match = re.search(r'Latency\s+(\d+\.?\d*)ms', content)
    p99_match = re.search(r'99%\s+(\d+\.?\d*)ms', content)
    
    return {
        'rps': float(rps_match.group(1)) if rps_match else 0,
        'latency': float(latency_match.group(1)) if latency_match else 0,
        'p99': float(p99_match.group(1)) if p99_match else 0
    }

# Analyser les résultats de scalabilité
connections = []
rps_values = []
latency_values = []

for conn in [10, 50, 100, 200, 500, 1000]:
    filename = f'results_{conn}conn.txt'
    try:
        data = parse_wrk_file(filename)
        connections.append(conn)
        rps_values.append(data['rps'])
        latency_values.append(data['latency'])
    except FileNotFoundError:
        continue

# Créer les graphiques
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Graphique throughput
ax1.plot(connections, rps_values, 'b-o')
ax1.set_xlabel('Connections')
ax1.set_ylabel('Requests/sec')
ax1.set_title('Throughput vs Connections')
ax1.grid(True)

# Graphique latence
ax2.plot(connections, latency_values, 'r-o')
ax2.set_xlabel('Connections')
ax2.set_ylabel('Latency (ms)')
ax2.set_title('Latency vs Connections')
ax2.grid(True)

plt.tight_layout()
plt.savefig('wrk_analysis.png')
```

### Comparaison avec autres outils

| Outil | RPS Max | Latence P99 | Ressources CPU | Facilité d'usage |
|-------|---------|-------------|----------------|------------------|
| wrk | 100,000+ | 5-50ms | Très faible | Moyenne |
| Apache Bench | 50,000 | 10-100ms | Faible | Élevée |
| JMeter | 10,000 | 50-200ms | Élevée | Élevée |
| Artillery | 30,000 | 20-80ms | Moyenne | Élevée |

## Troubleshooting

### Problèmes courants

**Erreurs de connexion**
```bash
# Vérifier les limites système
ulimit -n
ulimit -u

# Augmenter les limites temporairement
ulimit -n 65536

# Erreurs "Cannot assign requested address"
echo 'net.ipv4.ip_local_port_range = 1024 65535' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Performance dégradée**
```bash
# Vérifier l'utilisation des ressources
top -p $(pgrep wrk)
netstat -an | grep ESTABLISHED | wc -l

# Optimiser les paramètres réseau
echo 'net.core.rmem_max = 16777216' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max = 16777216' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_rmem = 4096 65536 16777216' | sudo tee -a /etc/sysctl.conf
```

**Erreurs SSL/TLS**
```bash
# Test HTTPS avec certificat auto-signé
wrk -t4 -c100 -d30s --insecure https://localhost:8443/

# Vérifier la configuration SSL
openssl s_client -connect example.com:443 -servername example.com
```

**Scripts Lua qui ne fonctionnent pas**
```bash
# Déboguer les scripts Lua
wrk -t1 -c1 -d1s -s debug_script.lua http://example.com/

# Script de débogage
cat > debug_script.lua << 'EOF'
function request()
    print("Making request...")
    return wrk.format("GET", "/")
end

function response(status, headers, body)
    print("Response status: " .. status)
    print("Response body length: " .. #body)
end
EOF
```

### Optimisation des performances
```bash
# Configuration optimale pour haute charge
wrk -t$(nproc) -c1000 -d60s \
    --timeout 10s \
    --latency \
    -s optimized_script.lua \
    http://target-server/api
```

```lua
-- optimized_script.lua
-- Pool de connexions réutilisables
local connections = {}

function init(args)
    -- Initialisation par thread
    connections[wrk.thread.id] = {}
end

function request()
    -- Réutiliser les connexions existantes
    return wrk.format("GET", "/api/fast-endpoint")
end
```

## Ressources

### Documentation officielle
- [wrk GitHub Repository](https://github.com/wg/wrk)
- [wrk Wiki](https://github.com/wg/wrk/wiki)
- [Lua Scripting Guide](https://github.com/wg/wrk/blob/master/SCRIPTING)

### Tutoriels complémentaires
- [HTTP Load Testing Best Practices](https://example.com/load-testing-guide)
- [wrk vs Apache Bench Comparison](https://example.com/wrk-vs-ab)

### Articles de recherche
- Glozer, W. (2012). *wrk - a HTTP benchmarking tool*. Retrieved from https://github.com/wg/wrk
- Bondi, A. B. (2000). Characteristics of scalability and their impact on performance. *Proceedings of the 2nd international workshop on Software and performance*, 195-203.

### Code source
- [wrk GitHub](https://github.com/wg/wrk)
- [wrk2 (Constant Rate)](https://github.com/giltene/wrk2)
- [Scripts Lua Examples](https://github.com/wg/wrk/tree/master/scripts)

## Sources et Références

1. Glozer, W. (2012). *wrk - a HTTP benchmarking tool*. Retrieved from https://github.com/wg/wrk
2. Fielding, R., et al. (1999). *Hypertext Transfer Protocol -- HTTP/1.1*. RFC 2616.
3. Belshe, M., Peon, R., & Thomson, M. (2015). *Hypertext Transfer Protocol Version 2 (HTTP/2)*. RFC 7540.
4. Bondi, A. B. (2000). Characteristics of scalability and their impact on performance. *Proceedings of the 2nd international workshop on Software and performance*, 195-203.