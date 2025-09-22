---
title: "RAPL (Running Average Power Limit)"
category: "green-computing"
subcategory: "Power Monitoring"
description: "Intel's hardware-based power monitoring and control interface for real-time energy measurement"
tags: ["energy", "monitoring", "intel", "hardware", "real-time", "power-capping"]
difficulty: "intermediate"
last_updated: "2024-01-15"
version: "Hardware-dependent"
official_website: "https://software.intel.com/content/www/us/en/develop/articles/intel-power-gadget.html"
license: "Intel License / Open Source Tools"
platforms: ["Linux", "Windows", "macOS"]
languages: ["C", "C++", "Python", "Shell"]
maintainer: "Intel Corporation"
citation: "David, H., et al. (2010). RAPL: Memory power estimation and capping. *ACM SIGARCH Computer Architecture News*, 38(3), 189-200."
---

# RAPL (Running Average Power Limit)

## Vue d'ensemble

RAPL (Running Average Power Limit) est une interface matérielle intégrée aux processeurs Intel modernes qui permet de surveiller et contrôler la consommation énergétique en temps réel. Introduit avec l'architecture Sandy Bridge, RAPL fournit des mesures précises de l'énergie consommée par différents domaines du processeur.

### Cas d'usage principaux
- Monitoring énergétique en temps réel des applications
- Optimisation de la consommation énergétique
- Recherche en efficacité énergétique
- Power capping et gestion thermique
- Profilage énergétique des algorithmes

### Avantages
- Intégré directement dans le matériel
- Mesures en temps réel avec faible overhead
- Granularité fine (domaines séparés)
- Pas d'équipement externe requis
- Interface standardisée via MSR

### Limitations
- Limité aux processeurs Intel (Sandy Bridge+)
- Précision variable selon l'architecture
- Accès privilégié requis (root)
- Pas de mesure des périphériques externes
- Calibration dépendante du fabricant

## Prérequis

### Système d'exploitation
- Linux avec support MSR (Module msr)
- Windows 10+ avec Intel Power Gadget
- macOS avec Intel Power Gadget

### Processeurs supportés
- **Sandy Bridge** (2011+): Support basique
- **Ivy Bridge** (2012+): Amélioration précision
- **Haswell** (2013+): Support DRAM
- **Skylake** (2015+): Support Platform
- **Ice Lake** (2019+): Support Uncore amélioré

### Dépendances logicielles
```bash
# Linux - Module MSR
sudo modprobe msr
sudo chmod 644 /dev/cpu/*/msr

# Outils de développement
sudo apt-get install build-essential linux-headers-$(uname -r)
```

### Vérification du support RAPL
```bash
# Vérifier la disponibilité RAPL
ls /sys/class/powercap/intel-rapl/

# Vérifier les domaines disponibles
for domain in /sys/class/powercap/intel-rapl/intel-rapl:*; do
    echo "Domain: $(cat $domain/name)"
    echo "Max energy range: $(cat $domain/max_energy_range_uj) µJ"
done
```

## Installation

### Méthode 1 : Outils système Linux
```bash
# Installation des utilitaires RAPL
sudo apt-get install powercap-utils

# Vérification de l'installation
powercap-info -p intel-rapl
```

### Méthode 2 : Intel Power Gadget
```bash
# Télécharger depuis Intel
wget https://software.intel.com/content/dam/develop/external/us/en/documents/power-gadget-3.7.0-linux.tar.gz
tar -xzf power-gadget-3.7.0-linux.tar.gz
cd power_gadget
sudo ./install.sh
```

### Méthode 3 : Compilation depuis les sources
```bash
# Cloner le repository PAPI (inclut support RAPL)
git clone https://github.com/icl-utk-edu/papi.git
cd papi/src
./configure --with-components="rapl"
make && sudo make install
```

### Méthode 4 : Bibliothèque Python
```bash
# Installation de pyRAPL
pip install pyRAPL

# Ou compilation depuis les sources
git clone https://github.com/powerapi-ng/pyRAPL.git
cd pyRAPL
pip install .
```

## Configuration

### Configuration des permissions
```bash
# Script de configuration des permissions
#!/bin/bash
# setup_rapl_permissions.sh

# Permettre l'accès aux MSR
sudo modprobe msr
sudo chmod 644 /dev/cpu/*/msr

# Créer un groupe pour RAPL
sudo groupadd rapl
sudo usermod -a -G rapl $USER

# Configuration udev pour permissions persistantes
cat << 'EOF' | sudo tee /etc/udev/rules.d/99-rapl.rules
SUBSYSTEM=="powercap", KERNEL=="intel-rapl:*", GROUP="rapl", MODE="0664"
KERNEL=="msr", GROUP="rapl", MODE="0664"
EOF

sudo udevadm control --reload-rules
```

### Calibration et validation
```bash
# Script de validation RAPL
#!/bin/bash
# validate_rapl.sh

echo "=== RAPL Validation ==="

# Tester la lecture des compteurs
for pkg in /sys/class/powercap/intel-rapl/intel-rapl:*; do
    if [[ -d "$pkg" ]]; then
        name=$(cat $pkg/name)
        energy=$(cat $pkg/energy_uj)
        echo "$name: $energy µJ"
    fi
done

# Test de cohérence temporelle
echo "Testing temporal consistency..."
for i in {1..5}; do
    energy1=$(cat /sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj)
    sleep 1
    energy2=$(cat /sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj)
    power=$(( (energy2 - energy1) / 1000000 ))
    echo "Iteration $i: ${power}W"
done
```

### Configuration pour applications
```c
// rapl_config.h
#ifndef RAPL_CONFIG_H
#define RAPL_CONFIG_H

#define RAPL_PKG_PATH "/sys/class/powercap/intel-rapl/intel-rapl:0"
#define RAPL_DRAM_PATH "/sys/class/powercap/intel-rapl/intel-rapl:0/intel-rapl:0:0"
#define RAPL_UNCORE_PATH "/sys/class/powercap/intel-rapl/intel-rapl:0/intel-rapl:0:1"

// Domaines RAPL disponibles
typedef enum {
    RAPL_PKG = 0,      // Package (CPU entier)
    RAPL_PP0,          // Power Plane 0 (Cores)
    RAPL_PP1,          // Power Plane 1 (GPU intégré)
    RAPL_DRAM,         // Mémoire DRAM
    RAPL_PLATFORM      // Platform (Skylake+)
} rapl_domain_t;

#endif
```

## Utilisation

### Exemple basique - Lecture simple
```bash
# Lecture directe des compteurs RAPL
#!/bin/bash
# simple_rapl_read.sh

PKG_ENERGY="/sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj"
DRAM_ENERGY="/sys/class/powercap/intel-rapl/intel-rapl:0/intel-rapl:0:0/energy_uj"

# Lecture initiale
pkg_start=$(cat $PKG_ENERGY)
dram_start=$(cat $DRAM_ENERGY)
start_time=$(date +%s.%N)

# Exécuter la charge de travail
stress-ng --cpu 4 --timeout 10s

# Lecture finale
pkg_end=$(cat $PKG_ENERGY)
dram_end=$(cat $DRAM_ENERGY)
end_time=$(date +%s.%N)

# Calculer la consommation
duration=$(echo "$end_time - $start_time" | bc)
pkg_energy=$(echo "($pkg_end - $pkg_start) / 1000000" | bc)
dram_energy=$(echo "($dram_end - $dram_start) / 1000000" | bc)

echo "Duration: ${duration}s"
echo "Package energy: ${pkg_energy}J"
echo "DRAM energy: ${dram_energy}J"
echo "Average package power: $(echo "$pkg_energy / $duration" | bc -l)W"
```

### Cas d'usage avancés - Monitoring continu
```c
// continuous_monitor.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <time.h>

typedef struct {
    long long energy_uj;
    struct timespec timestamp;
} rapl_reading_t;

long long read_rapl_energy(const char* path) {
    FILE* file = fopen(path, "r");
    if (!file) return -1;
    
    long long energy;
    fscanf(file, "%lld", &energy);
    fclose(file);
    return energy;
}

int main() {
    const char* pkg_path = "/sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj";
    rapl_reading_t prev, curr;
    
    // Lecture initiale
    prev.energy_uj = read_rapl_energy(pkg_path);
    clock_gettime(CLOCK_MONOTONIC, &prev.timestamp);
    
    printf("Time(s)\tPower(W)\tEnergy(J)\n");
    
    while (1) {
        sleep(1);
        
        curr.energy_uj = read_rapl_energy(pkg_path);
        clock_gettime(CLOCK_MONOTONIC, &curr.timestamp);
        
        double dt = (curr.timestamp.tv_sec - prev.timestamp.tv_sec) +
                   (curr.timestamp.tv_nsec - prev.timestamp.tv_nsec) / 1e9;
        
        long long energy_diff = curr.energy_uj - prev.energy_uj;
        double power = (energy_diff / 1e6) / dt;  // Watts
        
        printf("%.1f\t%.2f\t\t%.3f\n", 
               curr.timestamp.tv_sec + curr.timestamp.tv_nsec/1e9,
               power, 
               energy_diff / 1e6);
        
        prev = curr;
    }
    
    return 0;
}
```

### Utilisation avec Python (pyRAPL)
```python
#!/usr/bin/env python3
# rapl_profiler.py

import pyRAPL
import time
import numpy as np

# Initialiser pyRAPL
pyRAPL.setup()

# Décorateur pour mesurer l'énergie d'une fonction
@pyRAPL.measureit
def compute_intensive_task():
    """Tâche intensive en calcul pour test"""
    # Simulation d'un calcul matriciel
    size = 1000
    a = np.random.rand(size, size)
    b = np.random.rand(size, size)
    c = np.dot(a, b)
    return c

# Mesure manuelle avec contexte
def manual_measurement():
    meter = pyRAPL.Measurement('manual_test')
    meter.begin()
    
    # Code à mesurer
    time.sleep(2)
    result = sum(i**2 for i in range(100000))
    
    meter.end()
    
    # Afficher les résultats
    print(f"Energy consumed: {meter.result.pkg} µJ (Package)")
    if hasattr(meter.result, 'dram'):
        print(f"DRAM energy: {meter.result.dram} µJ")
    
    return result

# Monitoring en temps réel
class RealTimeMonitor:
    def __init__(self, interval=1.0):
        self.interval = interval
        self.running = False
        
    def start_monitoring(self):
        self.running = True
        prev_energy = pyRAPL.get_energy()
        prev_time = time.time()
        
        print("Time\tPackage(W)\tDRAM(W)")
        
        while self.running:
            time.sleep(self.interval)
            
            curr_energy = pyRAPL.get_energy()
            curr_time = time.time()
            
            dt = curr_time - prev_time
            pkg_power = (curr_energy['pkg'] - prev_energy['pkg']) / (dt * 1e6)
            
            if 'dram' in curr_energy:
                dram_power = (curr_energy['dram'] - prev_energy['dram']) / (dt * 1e6)
                print(f"{curr_time:.1f}\t{pkg_power:.2f}\t\t{dram_power:.2f}")
            else:
                print(f"{curr_time:.1f}\t{pkg_power:.2f}\t\tN/A")
            
            prev_energy = curr_energy
            prev_time = curr_time

if __name__ == "__main__":
    # Test des différentes méthodes
    print("=== Test avec décorateur ===")
    result = compute_intensive_task()
    
    print("\n=== Test manuel ===")
    manual_measurement()
    
    print("\n=== Monitoring temps réel (Ctrl+C pour arrêter) ===")
    monitor = RealTimeMonitor(interval=0.5)
    try:
        monitor.start_monitoring()
    except KeyboardInterrupt:
        monitor.running = False
        print("\nMonitoring arrêté.")
```

### Power Capping avec RAPL
```bash
# Script de power capping
#!/bin/bash
# power_capping.sh

PACKAGE_PATH="/sys/class/powercap/intel-rapl/intel-rapl:0"
CONSTRAINT_PATH="$PACKAGE_PATH/constraint_0_power_limit_uw"

# Lire la limite actuelle
current_limit=$(cat $CONSTRAINT_PATH)
echo "Current power limit: $((current_limit / 1000000))W"

# Définir une nouvelle limite (ex: 50W)
new_limit_watts=50
new_limit_uw=$((new_limit_watts * 1000000))

echo "Setting power limit to ${new_limit_watts}W..."
echo $new_limit_uw | sudo tee $CONSTRAINT_PATH

# Vérifier la nouvelle limite
actual_limit=$(cat $CONSTRAINT_PATH)
echo "New power limit: $((actual_limit / 1000000))W"

# Monitoring avec la nouvelle limite
echo "Monitoring power consumption with limit..."
for i in {1..10}; do
    energy=$(cat $PACKAGE_PATH/energy_uj)
    sleep 1
    energy2=$(cat $PACKAGE_PATH/energy_uj)
    power=$(( (energy2 - energy) / 1000000 ))
    echo "Power: ${power}W (Limit: ${new_limit_watts}W)"
done
```

## Métriques et Performance

### Types de métriques collectées
- **Package Energy**: Énergie totale du processeur
- **Core Energy**: Énergie des cœurs de calcul
- **Uncore Energy**: Énergie des composants non-cœur
- **DRAM Energy**: Énergie de la mémoire (Haswell+)
- **Platform Energy**: Énergie de la plateforme (Skylake+)

### Précision et limites

| Architecture | Précision Package | Précision DRAM | Fréquence mise à jour |
|--------------|------------------|----------------|----------------------|
| Sandy Bridge | ±5% | N/A | ~1ms |
| Ivy Bridge | ±3% | N/A | ~1ms |
| Haswell | ±3% | ±10% | ~1ms |
| Skylake | ±2% | ±5% | ~1ms |
| Ice Lake | ±2% | ±3% | ~1ms |

### Comparaison avec autres méthodes

| Méthode | Précision | Overhead | Granularité | Coût |
|---------|-----------|----------|-------------|------|
| RAPL | ±2-5% | <1% | Domaine | Gratuit |
| Wattmètre externe | ±0.5% | 0% | Système | €€€ |
| PMU Counters | ±10% | <1% | Instruction | Gratuit |
| Software estimation | ±20% | 5-10% | Application | Gratuit |

### Benchmarks de validation
```python
# Validation contre charge connue
def validate_rapl_accuracy():
    """Valider la précision RAPL avec une charge contrôlée"""
    
    # Charge CPU intensive (théoriquement ~TDP)
    def cpu_stress(duration=10):
        import multiprocessing
        import time
        
        def worker():
            end_time = time.time() + duration
            while time.time() < end_time:
                pass  # Boucle intensive
        
        processes = []
        for _ in range(multiprocessing.cpu_count()):
            p = multiprocessing.Process(target=worker)
            p.start()
            processes.append(p)
        
        for p in processes:
            p.join()
    
    # Mesurer avec RAPL
    meter = pyRAPL.Measurement('validation')
    meter.begin()
    cpu_stress(10)
    meter.end()
    
    measured_power = meter.result.pkg / (10 * 1e6)  # Watts
    
    # Comparer avec TDP théorique
    with open('/proc/cpuinfo', 'r') as f:
        cpu_info = f.read()
    
    print(f"Measured power: {measured_power:.2f}W")
    print(f"Expected range: 65-95W (typical desktop CPU)")
    
    return measured_power
```

## Troubleshooting

### Problèmes courants

**Accès refusé aux MSR**
```bash
# Vérifier les permissions
ls -la /dev/cpu/*/msr
sudo chmod 644 /dev/cpu/*/msr

# Charger le module MSR
sudo modprobe msr
lsmod | grep msr
```

**Compteurs qui débordent**
```python
# Gestion du débordement des compteurs RAPL
def handle_rapl_overflow(prev_energy, curr_energy, max_range):
    """Gérer le débordement des compteurs RAPL"""
    if curr_energy < prev_energy:
        # Débordement détecté
        return (max_range - prev_energy) + curr_energy
    else:
        return curr_energy - prev_energy

# Exemple d'utilisation
max_energy_range = 262143328850  # µJ (exemple Sandy Bridge)
energy_diff = handle_rapl_overflow(prev_reading, curr_reading, max_energy_range)
```

**Mesures incohérentes**
```bash
# Diagnostic des problèmes RAPL
#!/bin/bash
# rapl_diagnostic.sh

echo "=== RAPL Diagnostic ==="

# Vérifier l'architecture CPU
echo "CPU Architecture:"
lscpu | grep "Model name"
lscpu | grep "Architecture"

# Vérifier les domaines disponibles
echo -e "\nAvailable RAPL domains:"
for domain in /sys/class/powercap/intel-rapl/intel-rapl:*; do
    if [[ -d "$domain" ]]; then
        name=$(cat $domain/name 2>/dev/null || echo "Unknown")
        max_range=$(cat $domain/max_energy_range_uj 2>/dev/null || echo "N/A")
        echo "  $name: max_range=${max_range}µJ"
    fi
done

# Test de cohérence
echo -e "\nCoherence test (5 readings):"
for i in {1..5}; do
    energy=$(cat /sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj 2>/dev/null || echo "ERROR")
    echo "  Reading $i: $energy µJ"
    sleep 0.1
done
```

## Ressources

### Documentation officielle
- [Intel Power Gadget](https://software.intel.com/content/www/us/en/develop/articles/intel-power-gadget.html)
- [Intel 64 and IA-32 Architectures Software Developer's Manual](https://software.intel.com/content/www/us/en/develop/articles/intel-sdm.html)
- [Linux PowerCap Framework](https://www.kernel.org/doc/Documentation/power/powercap/powercap.txt)

### Outils et bibliothèques
- [pyRAPL - Python RAPL Interface](https://github.com/powerapi-ng/pyRAPL)
- [PAPI - Performance API](http://icl.utk.edu/papi/)
- [PowerAPI - Power Monitoring Framework](http://powerapi.org/)
- [Intel PCM - Performance Counter Monitor](https://github.com/intel/pcm)

### Articles de recherche
- David, H., et al. (2010). "RAPL: Memory power estimation and capping". *ACM SIGARCH Computer Architecture News*, 38(3), 189-200.
- Hackenberg, D., et al. (2013). "An energy efficiency feature survey of the Intel Haswell processor". *IEEE International Parallel and Distributed Processing Symposium Workshops*.
- Khan, K. N., et al. (2018). "RAPL in action: Experiences in using RAPL for power measurements". *ACM Transactions on Modeling and Performance Evaluation of Computing Systems*, 3(2), 1-26.

### Code source et exemples
- [RAPL Examples Repository](https://github.com/deater/rapl-read)
- [Energy Measurement Tools](https://github.com/powerapi-ng)
- [Intel Power Gadget Source](https://software.intel.com/content/www/us/en/develop/articles/intel-power-gadget.html)

## Sources et Références

1. David, H., Gorbatov, E., Hanebutte, U. R., Khanna, R., & Le, C. (2010). RAPL: Memory power estimation and capping. *ACM SIGARCH Computer Architecture News*, 38(3), 189-200.
2. Intel Corporation. (2016). *Intel 64 and IA-32 Architectures Software Developer's Manual Volume 3B: System Programming Guide, Part 2*.
3. Hackenberg, D., Ilsche, T., Schone, R., Molka, D., Schmidt, M., & Nagel, W. E. (2013). An energy efficiency feature survey of the Intel Haswell processor. *2013 IEEE International Parallel & Distributed Processing Symposium Workshops*.
4. Khan, K. N., Hirki, M., Niemi, T., Nurminen, J. K., & Ou, Z. (2018). RAPL in action: Experiences in using RAPL for power measurements. *ACM Transactions on Modeling and Performance Evaluation of Computing Systems (TOMPECS)*, 3(2), 1-26.