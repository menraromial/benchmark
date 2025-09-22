---
title: "PowerAPI"
category: "energy"
subcategory: "Energy Profiling"
description: "Software-defined power meter for real-time power consumption monitoring of software applications"
tags: ["energy", "power", "profiling", "monitoring", "software"]
difficulty: "intermediate"
last_updated: "2024-01-15"
version: "2.3.1"
official_website: "https://powerapi.org/"
license: "BSD 3-Clause License"
platforms: ["Linux", "macOS", "Windows"]
languages: ["Scala", "Python", "Java"]
maintainer: "Spirals Team, Inria"
citation: "Colmant, M., et al. (2015). PowerAPI: A software library to monitor the energy consumed at the process-level. ERCIM News, 100."
---

# PowerAPI

## Vue d'ensemble

PowerAPI est un middleware logiciel qui permet de surveiller la consommation énergétique des applications en temps réel au niveau processus. Il fournit une API pour accéder aux métriques de consommation d'énergie sans nécessiter de matériel de mesure spécialisé.

### Cas d'usage principaux
- Profilage énergétique des applications logicielles
- Optimisation de la consommation d'énergie
- Monitoring en temps réel de la consommation
- Recherche en green computing et efficacité énergétique

### Avantages
- Mesure au niveau processus sans instrumentation
- API simple et extensible
- Support multi-plateforme
- Intégration facile dans les applications existantes

### Limitations
- Précision dépendante des modèles de consommation
- Nécessite une calibration pour une précision optimale
- Overhead de monitoring non négligeable

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 18.04+, CentOS 7+, Debian 10+)
- macOS 10.14+ (support limité)
- Windows 10+ (support expérimental)

### Dépendances logicielles
- **Java**: OpenJDK 11+ ou Oracle JDK 11+
- **Scala**: 2.13+ (pour développement)
- **Python**: 3.7+ (pour bindings Python)
- **Docker**: 20.10+ (optionnel)

### Accès système requis
- Accès aux compteurs de performance (perf, MSR)
- Permissions root pour certaines fonctionnalités
- Accès aux informations système (/proc, /sys)

## Installation

### Méthode 1 : Installation via Docker
```bash
# Télécharger l'image PowerAPI
docker pull powerapi/powerapi:latest

# Lancer PowerAPI avec monitoring
docker run -d \
  --name powerapi \
  --privileged \
  -v /proc:/proc:ro \
  -v /sys:/sys:ro \
  powerapi/powerapi:latest
```

### Méthode 2 : Installation depuis les sources
```bash
# Cloner le repository
git clone https://github.com/powerapi-ng/powerapi.git
cd powerapi

# Compiler avec SBT
sbt compile
sbt assembly
```

### Méthode 3 : Installation Python
```bash
# Installer via pip
pip3 install powerapi

# Ou depuis les sources
git clone https://github.com/powerapi-ng/powerapi-python.git
cd powerapi-python
pip3 install -e .
```

### Configuration des permissions
```bash
# Ajouter l'utilisateur au groupe perf
sudo usermod -a -G perf $USER

# Configurer les permissions MSR (Intel)
sudo modprobe msr
sudo chmod 644 /dev/cpu/*/msr

# Activer les compteurs de performance
echo -1 | sudo tee /proc/sys/kernel/perf_event_paranoid
```

## Configuration

### Fichier de configuration principal
```yaml
# config/powerapi.yml
powerapi:
  actors:
    - name: "cpu-sensor"
      type: "hwpc-sensor"
      config:
        events: ["CPU_CLK_UNHALTED:THREAD", "INSTRUCTIONS_RETIRED"]
        sampling-interval: 1000  # ms
        
    - name: "rapl-sensor"
      type: "rapl-sensor"
      config:
        domains: ["package", "core", "uncore", "dram"]
        sampling-interval: 1000
        
    - name: "cpu-formula"
      type: "smartwatts-formula"
      config:
        sensor: "cpu-sensor"
        output: "power-report"
        
  reports:
    - name: "power-report"
      type: "csv-report"
      config:
        filename: "power_consumption.csv"
```

### Configuration des capteurs

#### Capteur HWPC (Hardware Performance Counters)
```yaml
hwpc-sensor:
  events:
    - "CPU_CLK_UNHALTED:THREAD"
    - "INSTRUCTIONS_RETIRED"
    - "LLC_MISSES"
    - "BRANCH_MISSES"
  sampling-interval: 1000
  target-processes: ["firefox", "chrome", "java"]
```

#### Capteur RAPL (Running Average Power Limit)
```yaml
rapl-sensor:
  domains:
    - "package"    # Processeur complet
    - "core"       # Cœurs CPU
    - "uncore"     # Contrôleurs mémoire, cache L3
    - "dram"       # Mémoire RAM
  sampling-interval: 500
```

### Formules de calcul de puissance
```scala
// Exemple de formule personnalisée
class CustomPowerFormula extends PowerFormula {
  def computePower(hwpcReport: HWPCReport): PowerReport = {
    val cycles = hwpcReport.getCounter("CPU_CLK_UNHALTED:THREAD")
    val instructions = hwpcReport.getCounter("INSTRUCTIONS_RETIRED")
    
    // Modèle simplifié basé sur l'activité CPU
    val power = (cycles * 0.5 + instructions * 0.3) / 1000000
    
    PowerReport(hwpcReport.timestamp, hwpcReport.target, power)
  }
}
```

## Utilisation

### Exemple basique
```bash
# Lancer PowerAPI avec configuration par défaut
powerapi --config config/powerapi.yml

# Monitoring d'un processus spécifique
powerapi --target firefox --duration 300 --output firefox_power.csv
```

### Utilisation avec l'API Python
```python
#!/usr/bin/env python3
import powerapi
import time

# Initialiser PowerAPI
power_meter = powerapi.PowerMeter()

# Démarrer le monitoring
power_meter.start()

# Monitorer un processus spécifique
pid = 1234  # PID du processus à monitorer
power_meter.monitor_process(pid)

# Collecter les données pendant 60 secondes
for i in range(60):
    power_data = power_meter.get_power_consumption(pid)
    print(f"Power consumption: {power_data.power:.2f} W")
    time.sleep(1)

# Arrêter le monitoring
power_meter.stop()
```

### Monitoring en temps réel
```bash
# Monitoring continu avec affichage temps réel
powerapi monitor --target-name "java" --real-time --interval 1

# Avec seuils d'alerte
powerapi monitor --target-name "chrome" --threshold 10.0 --alert-script alert.sh
```

### Cas d'usage avancés
```python
# Profilage énergétique d'une application
import powerapi
import subprocess
import time

def profile_application(command, duration=60):
    """Profile la consommation énergétique d'une application"""
    
    # Démarrer PowerAPI
    power_meter = powerapi.PowerMeter(
        sensors=['hwpc', 'rapl'],
        sampling_interval=100  # ms
    )
    power_meter.start()
    
    # Lancer l'application
    process = subprocess.Popen(command, shell=True)
    pid = process.pid
    
    # Monitorer la consommation
    power_data = []
    start_time = time.time()
    
    while time.time() - start_time < duration and process.poll() is None:
        power = power_meter.get_power_consumption(pid)
        if power:
            power_data.append({
                'timestamp': time.time(),
                'power': power.power,
                'energy': power.energy
            })
        time.sleep(0.1)
    
    # Arrêter l'application et PowerAPI
    if process.poll() is None:
        process.terminate()
    power_meter.stop()
    
    return power_data

# Exemple d'utilisation
results = profile_application("stress --cpu 4 --timeout 30s")
total_energy = sum(r['energy'] for r in results)
avg_power = sum(r['power'] for r in results) / len(results)

print(f"Énergie totale consommée: {total_energy:.2f} J")
print(f"Puissance moyenne: {avg_power:.2f} W")
```

### Intégration avec des benchmarks
```bash
# Profiler un benchmark SPEC CPU
powerapi start --config config/spec.yml &
POWERAPI_PID=$!

# Lancer le benchmark
runspec --config=gcc-linux-x86 --size=ref --iterations=3 int

# Arrêter PowerAPI
kill $POWERAPI_PID

# Analyser les résultats
powerapi analyze --input power_consumption.csv --benchmark spec_cpu
```

## Métriques et Performance

### Types de métriques collectées
- **Puissance instantanée**: Watts par processus
- **Énergie cumulée**: Joules sur une période
- **Répartition par composant**: CPU, mémoire, GPU
- **Efficacité énergétique**: Performance/Watt

### Exemple de données collectées
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "process": {
    "pid": 1234,
    "name": "firefox",
    "power": {
      "total": 8.5,
      "cpu": 6.2,
      "memory": 1.8,
      "gpu": 0.5
    },
    "energy_cumulative": 2547.3,
    "efficiency": {
      "instructions_per_joule": 1250000,
      "performance_per_watt": 145.2
    }
  }
}
```

### Précision et validation
- **Précision typique**: ±5-10% par rapport aux mesures matérielles
- **Résolution temporelle**: 100ms minimum
- **Overhead**: <2% de CPU pour le monitoring

### Comparaison avec d'autres outils
| Outil | Granularité | Précision | Overhead | Plateformes |
|-------|-------------|-----------|----------|-------------|
| PowerAPI | Processus | ±5-10% | <2% | Linux, macOS |
| Intel PCM | Système | ±2-5% | <1% | Intel uniquement |
| RAPL | Package | ±3-7% | Négligeable | Intel, AMD |
| Joulemeter | Application | ±10-15% | <3% | Windows |

## Troubleshooting

### Problèmes courants

**Erreur d'accès aux compteurs de performance**
```bash
# Vérifier les permissions perf
cat /proc/sys/kernel/perf_event_paranoid
# Doit être <= 1

# Configurer les permissions
echo 1 | sudo tee /proc/sys/kernel/perf_event_paranoid

# Vérifier l'accès MSR
ls -la /dev/cpu/*/msr
sudo chmod 644 /dev/cpu/*/msr
```

**Capteur RAPL non disponible**
```bash
# Vérifier le support RAPL
ls /sys/class/powercap/intel-rapl/
cat /sys/class/powercap/intel-rapl/intel-rapl:0/name

# Charger le module MSR
sudo modprobe msr
```

**Mesures incohérentes**
```bash
# Calibrer PowerAPI avec des mesures de référence
powerapi calibrate --reference-power 50.0 --duration 300

# Vérifier la stabilité du système
stress --cpu 1 --timeout 60s &
powerapi monitor --target stress --duration 60
```

**Performance dégradée**
```bash
# Réduire la fréquence d'échantillonnage
# Dans powerapi.yml:
sampling-interval: 5000  # 5 secondes au lieu de 1

# Limiter les processus monitorés
powerapi monitor --target-regex "firefox|chrome" --exclude-system
```

## Ressources

### Documentation officielle
- [PowerAPI Documentation](https://powerapi.org/documentation/)
- [API Reference](https://powerapi.org/api/)
- [Configuration Guide](https://powerapi.org/configuration/)

### Tutoriels complémentaires
- [Energy Profiling Best Practices](https://example.com/energy-profiling)
- [PowerAPI Integration Guide](https://example.com/powerapi-integration)

### Articles de recherche
- Colmant, M., et al. (2015). PowerAPI: A software library to monitor the energy consumed at the process-level. *ERCIM News*, 100.
- Noureddine, A., et al. (2013). Runtime discovery of energy hotspots in smartphone applications. *Proceedings of the 28th IEEE/ACM International Conference on Automated Software Engineering*, 36-46.

### Code source
- [PowerAPI Core](https://github.com/powerapi-ng/powerapi)
- [PowerAPI Python](https://github.com/powerapi-ng/powerapi-python)
- [SmartWatts Formula](https://github.com/powerapi-ng/smartwatts-formula)

## Sources et Références

1. Colmant, M., Kurpicz, M., Felber, P., Huertas, L., Rouvoy, R., & Sobe, A. (2015). Process-level power estimation in VM-based systems. *Proceedings of the Tenth European Conference on Computer Systems*, 1-14.
2. Noureddine, A., Bourdon, A., Rouvoy, R., & Seinturier, L. (2013). Runtime discovery of energy hotspots in smartphone applications. *Proceedings of the 28th IEEE/ACM International Conference on Automated Software Engineering*, 36-46.
3. Hähnel, M., Döbel, B., Völp, M., & Härtig, H. (2012). Measuring energy consumption for short code paths using RAPL. *ACM SIGMETRICS Performance Evaluation Review*, 40(3), 13-17.