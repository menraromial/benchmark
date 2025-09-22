---
title: "Green500"
category: "green-computing"
subcategory: "HPC Energy Efficiency"
description: "Ranking of the most energy-efficient supercomputers in the world based on FLOPS per watt"
tags: ["energy", "hpc", "supercomputing", "efficiency", "ranking", "FLOPS"]
difficulty: "advanced"
last_updated: "2024-01-15"
version: "2024.1"
official_website: "https://www.top500.org/green500/"
license: "Open Access"
platforms: ["Linux", "Various HPC Systems"]
languages: ["C", "Fortran", "CUDA", "OpenCL"]
maintainer: "Green500 Organization"
citation: "Green500 List. (2024). The Green500 List. https://www.top500.org/green500/"
parallel_models: ["MPI", "OpenMP", "CUDA", "OpenCL", "OpenACC"]
min_nodes: 1
max_nodes: 10000
memory_requirements: "Varies by system"
gpu_support: true
interconnect: ["InfiniBand", "Ethernet", "Proprietary"]
---

# Green500

## Vue d'ensemble

Le Green500 est un classement semestriel des superordinateurs les plus économes en énergie au monde. Il mesure l'efficacité énergétique en FLOPS (opérations en virgule flottante par seconde) par watt, offrant une perspective complémentaire au classement TOP500 qui se concentre uniquement sur la performance brute.

### Cas d'usage principaux
- Évaluation de l'efficacité énergétique des superordinateurs
- Comparaison des architectures HPC modernes
- Promotion du calcul haute performance durable
- Guide pour l'acquisition de systèmes HPC économes en énergie

### Avantages
- Métrique standardisée (MFLOPS/Watt)
- Données publiques et transparentes
- Couvre toutes les architectures HPC
- Encourage l'innovation en efficacité énergétique
- Corrélation avec les coûts opérationnels

### Limitations
- Basé uniquement sur LINPACK HPL
- Ne reflète pas tous les types de charges de travail
- Mesures ponctuelles (pas de profil d'utilisation)
- Dépendant de la précision des mesures de puissance

## Prérequis

### Système d'exploitation
- Linux (distribution HPC recommandée)
- Système de gestion de tâches (SLURM, PBS, LSF)
- Pilotes optimisés pour accélérateurs (CUDA, ROCm)

### Dépendances logicielles
- **Compilateurs**: GCC, Intel, PGI, ou équivalents
- **Bibliothèques MPI**: OpenMPI, Intel MPI, MVAPICH2
- **BLAS optimisées**: Intel MKL, OpenBLAS, ATLAS
- **Outils de mesure**: PAPI, RAPL, ou wattmètres externes

### Configuration matérielle recommandée
- **Processeurs**: Multi-cœurs modernes (Intel Xeon, AMD EPYC)
- **Accélérateurs**: GPU NVIDIA, AMD, ou Intel (optionnel)
- **Mémoire**: Suffisante pour la taille de matrice choisie
- **Réseau**: Interconnexion haute performance pour systèmes multi-nœuds
- **Alimentation**: Mesure précise de la consommation électrique

### Équipement de mesure
- Wattmètres de précision (±1% recommandé)
- PDU (Power Distribution Units) intelligentes
- Capteurs RAPL intégrés (processeurs Intel)
- Outils de monitoring système

## Installation

### Méthode 1 : HPL (High Performance LINPACK)
```bash
# Télécharger HPL
wget http://www.netlib.org/benchmark/hpl/hpl-2.3.tar.gz
tar -xzf hpl-2.3.tar.gz
cd hpl-2.3

# Configuration pour système avec MPI et BLAS optimisées
cp setup/Make.Linux_PII_CBLAS Make.$(arch)
```

### Méthode 2 : Utilisation de modules HPC
```bash
# Charger les modules nécessaires
module load gcc/11.2.0
module load openmpi/4.1.1
module load mkl/2022.1.0

# Compiler HPL
make arch=$(arch)
```

### Méthode 3 : Container optimisé
```bash
# Utiliser un container HPC pré-configuré
singularity pull docker://nvcr.io/hpc/hpl:latest
singularity run --nv hpl_latest.sif
```

## Configuration

### Fichier HPL.dat pour Green500
```
HPLinpack benchmark input file
Innovative Computing Laboratory, University of Tennessee
HPL.out      output file name (if any)
6            device out (6=stdout,7=stderr,file)
1            # of problems sizes (N)
29184        Ns
1            # of NBs
192          NBs
0            PMAP process mapping (0=Row-,1=Column-major)
1            # of process grids (P x Q)
2            Ps
4            Qs
16.0         threshold
1            # of panel fact
2            PFACTs (0=left, 1=Crout, 2=Right)
1            # of recursive stopping criterium
4            NBMINs (>= 1)
1            # of panels in recursion
2            NDIVs
1            # of recursive panel fact.
2            RFACTs (0=left, 1=Crout, 2=Right)
1            # of broadcast
1            BCASTs (0=1rg,1=1rM,2=2rg,3=2rM,4=Lng,5=LnM)
1            # of lookahead depth
1            DEPTHs (>=0)
2            SWAP (0=bin-exch,1=long,2=mix)
64           swapping threshold
0            L1 in (0=transposed,1=no-transposed) form
0            U  in (0=transposed,1=no-transposed) form
1            Equilibration (0=no,1=yes)
8            memory alignment in double (> 0)
```

### Configuration de mesure de puissance
```bash
# Script de mesure RAPL (Intel)
#!/bin/bash
# measure_power.sh

# Initialiser les compteurs RAPL
echo "Initializing RAPL counters..."
for pkg in /sys/class/powercap/intel-rapl/intel-rapl:*; do
    if [[ -d "$pkg" ]]; then
        echo "Package: $(basename $pkg)"
        cat $pkg/name
        cat $pkg/energy_uj > /tmp/energy_start_$(basename $pkg)
    fi
done

# Lancer HPL
echo "Starting HPL benchmark..."
mpirun -np 8 ./xhpl

# Mesurer l'énergie finale
total_energy=0
for pkg in /sys/class/powercap/intel-rapl/intel-rapl:*; do
    if [[ -d "$pkg" ]]; then
        start_energy=$(cat /tmp/energy_start_$(basename $pkg))
        end_energy=$(cat $pkg/energy_uj)
        energy_diff=$((end_energy - start_energy))
        total_energy=$((total_energy + energy_diff))
    fi
done

echo "Total energy consumed: $((total_energy / 1000000)) Joules"
```

### Optimisation pour efficacité énergétique
```bash
# Configuration CPU pour efficacité
echo powersave > /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Optimisation mémoire
echo 1 > /proc/sys/vm/drop_caches
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# Configuration GPU (NVIDIA)
nvidia-smi -pm 1  # Mode persistance
nvidia-smi -ac 877,1215  # Fréquences optimales
```

## Utilisation

### Exemple basique - Système mono-nœud
```bash
# Mesure simple avec RAPL
./measure_power.sh &
POWER_PID=$!

# Lancer HPL
mpirun -np $(nproc) ./xhpl

# Arrêter la mesure
kill $POWER_PID

# Calculer MFLOPS/Watt
python3 calculate_efficiency.py results.txt power.log
```

### Cas d'usage avancés - Cluster multi-nœuds
```bash
# Script SLURM pour mesure distribuée
#!/bin/bash
#SBATCH --job-name=green500_benchmark
#SBATCH --nodes=4
#SBATCH --ntasks-per-node=32
#SBATCH --time=02:00:00
#SBATCH --exclusive

# Synchroniser les horloges
srun ntpdate -s time.nist.gov

# Démarrer la mesure de puissance sur tous les nœuds
srun --ntasks=$SLURM_NNODES --ntasks-per-node=1 ./start_power_measurement.sh &

# Lancer HPL
srun ./xhpl

# Collecter les mesures de puissance
srun --ntasks=$SLURM_NNODES --ntasks-per-node=1 ./collect_power_data.sh

# Calculer l'efficacité globale
./calculate_cluster_efficiency.py
```

### Interprétation des résultats
```python
# calculate_efficiency.py
import re
import sys

def parse_hpl_output(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Extraire les GFLOPS
    gflops_match = re.search(r'(\d+\.\d+e[+-]\d+)\s+(\d+\.\d+e[+-]\d+)', content)
    if gflops_match:
        gflops = float(gflops_match.group(2))
        return gflops * 1000  # Convertir en MFLOPS
    return None

def calculate_efficiency(mflops, power_watts, runtime_seconds):
    """Calculer MFLOPS/Watt"""
    if power_watts > 0:
        return mflops / power_watts
    return 0

# Exemple d'utilisation
mflops = parse_hpl_output('HPL.out')
average_power = 1500  # Watts (à mesurer)
efficiency = calculate_efficiency(mflops, average_power, 3600)

print(f"Performance: {mflops:.2f} MFLOPS")
print(f"Puissance moyenne: {average_power:.2f} W")
print(f"Efficacité énergétique: {efficiency:.2f} MFLOPS/Watt")
```

## Métriques et Performance

### Types de métriques collectées
- **MFLOPS/Watt**: Métrique principale du Green500
- **Performance absolue**: MFLOPS ou GFLOPS
- **Puissance moyenne**: Watts pendant l'exécution
- **Énergie totale**: Joules consommés
- **Efficacité par composant**: CPU, GPU, mémoire, réseau

### Benchmarks de référence Green500 (Juin 2024)
- **#1 - Henri (CEA)**: 65.09 GFLOPS/Watt
- **#10**: ~45 GFLOPS/Watt  
- **#100**: ~15 GFLOPS/Watt
- **Seuil d'entrée**: ~5 GFLOPS/Watt

### Comparaison par architecture

| Architecture | GFLOPS/Watt typique | Avantages | Inconvénients |
|--------------|-------------------|-----------|---------------|
| GPU NVIDIA A100 | 40-60 | Très haute efficacité | Coût élevé |
| GPU AMD MI250X | 35-50 | Bon rapport perf/prix | Écosystème logiciel |
| CPU Intel Xeon | 5-15 | Polyvalence | Efficacité limitée |
| CPU AMD EPYC | 8-20 | Bon équilibre | Consommation mémoire |

### Évolution historique
- **2007**: ~0.5 GFLOPS/Watt (premiers classements)
- **2015**: ~5 GFLOPS/Watt (adoption GPU)
- **2020**: ~20 GFLOPS/Watt (architectures modernes)
- **2024**: ~65 GFLOPS/Watt (systèmes optimisés)

## Troubleshooting

### Problèmes courants

**Mesures de puissance incohérentes**
```bash
# Vérifier les capteurs RAPL
ls /sys/class/powercap/intel-rapl/
cat /sys/class/powercap/intel-rapl/intel-rapl:0/name

# Tester la précision
./rapl_validation.sh --duration 60 --load stress-ng
```

**Performance HPL sous-optimale**
```bash
# Vérifier la configuration NUMA
numactl --hardware
lstopo

# Optimiser le placement mémoire
export OMP_PROC_BIND=true
export OMP_PLACES=cores
```

**Problèmes de scalabilité multi-nœuds**
```bash
# Tester la bande passante réseau
mpirun -np 2 --hostfile hosts ./osu_bw

# Vérifier la latence
mpirun -np 2 --hostfile hosts ./osu_latency
```

## Ressources

### Documentation officielle
- [Green500 Methodology](https://www.top500.org/green500/methodology/)
- [HPL Benchmark Guide](http://www.netlib.org/benchmark/hpl/)
- [LINPACK FAQ](http://www.netlib.org/benchmark/hpl/faqs.html)

### Outils de mesure
- [PAPI - Performance API](http://icl.utk.edu/papi/)
- [PowerAPI](http://powerapi.org/)
- [Intel Power Gadget](https://software.intel.com/content/www/us/en/develop/articles/intel-power-gadget.html)

### Articles de recherche
- Dongarra, J., et al. (2014). "The international exascale software project roadmap". *International Journal of High Performance Computing Applications*, 25(1), 3-60.
- Feng, W., & Cameron, K. (2007). "The green500 list: Encouraging sustainable supercomputing". *Computer*, 40(12), 50-55.
- Koomey, J., et al. (2011). "Implications of historical trends in the electrical efficiency of computing". *IEEE Annals of the History of Computing*, 33(3), 46-54.

### Code source et outils
- [HPL Source Code](http://www.netlib.org/benchmark/hpl/)
- [Green500 Tools](https://github.com/green500org/tools)
- [Energy Measurement Scripts](https://github.com/powerapi-ng/powerapi)

## Sources et Références

1. Green500 Organization. (2024). *The Green500 List*. https://www.top500.org/green500/
2. Dongarra, J. J., Luszczek, P., & Petitet, A. (2003). The LINPACK benchmark: past, present and future. *Concurrency and Computation: practice and experience*, 15(9), 803-820.
3. Feng, W. C., & Cameron, K. W. (2007). The green500 list: Encouraging sustainable supercomputing. *Computer*, 40(12), 50-55.
4. Rajovic, N., et al. (2013). Supercomputing with commodity CPUs: Are mobile SoCs ready for HPC?. *Proceedings of the International Conference on High Performance Computing, Networking, Storage and Analysis*.