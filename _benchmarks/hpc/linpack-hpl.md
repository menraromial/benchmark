---
title: "LINPACK (HPL)"
category: "hpc"
subcategory: "Scientific Computing"
description: "High Performance LINPACK benchmark for measuring peak floating-point performance of supercomputers"
tags: ["linpack", "hpl", "flops", "top500", "linear-algebra", "dense-matrix"]
difficulty: "advanced"
last_updated: "2024-01-15"
version: "2.3"
official_website: "https://www.netlib.org/benchmark/hpl/"
license: "BSD-like License"
platforms: ["Linux", "Unix"]
languages: ["C", "Fortran"]
maintainer: "University of Tennessee, Knoxville"
citation: "Petitet, A., et al. (2008). HPL - A Portable Implementation of the High-Performance Linpack Benchmark for Distributed-Memory Computers."
# Specialized metadata for HPC
parallel_models: ["MPI", "OpenMP", "CUDA", "ROCm"]
min_nodes: 1
max_nodes: 100000
memory_requirements: "80% of available system memory"
gpu_support: true
interconnect: ["InfiniBand", "Omni-Path", "Cray Aries", "Ethernet"]
# HPC-specific fields
rankings_used: ["Top500", "Green500"]
flops_category: "dense_linear_algebra"
memory_pattern: "streaming"
communication_pattern: "all-to-all"
---

# LINPACK (HPL) - High Performance LINPACK

## Vue d'ensemble

HPL (High Performance LINPACK) est l'implémentation portable du benchmark LINPACK utilisée pour le classement Top500 des supercalculateurs les plus puissants au monde. Il mesure la capacité d'un système à résoudre un système dense d'équations linéaires en double précision.

### Cas d'usage principaux
- Classement Top500 des supercalculateurs
- Mesure de la performance crête en FLOPS
- Validation des installations HPC
- Test de stabilité des systèmes à grande échelle
- Évaluation de l'efficacité des interconnexions

### Avantages
- Benchmark de référence reconnu mondialement
- Excellent test de stress pour les systèmes HPC
- Mesure la performance théorique maximale
- Révèle les goulots d'étranglement système

### Limitations
- Ne représente qu'un type de calcul (algèbre linéaire dense)
- Optimisé pour la performance crête, pas les applications réelles
- Consommation mémoire très importante
- Configuration complexe pour optimiser les performances

## Prérequis

### Système d'exploitation
- Linux (RHEL, CentOS, Ubuntu, SUSE)
- Unix (Solaris, AIX)
- Systèmes HPC spécialisés (Cray, IBM)

### Dépendances logicielles
- **MPI**: OpenMPI, Intel MPI, Cray MPI, IBM Spectrum MPI
- **BLAS**: Intel MKL, OpenBLAS, ATLAS, Cray LibSci
- **Compilateurs**: Intel Compiler, GCC, PGI/NVIDIA HPC SDK
- **GPU** (optionnel): CUDA, ROCm, OpenACC

### Configuration matérielle recommandée
- **CPU**: Architecture x86_64, ARM64, ou Power
- **RAM**: Maximum disponible (HPL utilise ~80% de la mémoire)
- **Réseau**: InfiniBand HDR/EDR pour performance optimale
- **GPU**: NVIDIA Tesla/A100, AMD Instinct pour versions accélérées

### Prérequis réseau
- Latence faible (<1μs pour InfiniBand)
- Bande passante élevée (>100 Gb/s par nœud)
- Topologie optimisée (fat-tree, dragonfly)

## Installation

### Méthode 1 : Compilation optimisée
```bash
# Télécharger HPL
wget http://www.netlib.org/benchmark/hpl/hpl-2.3.tar.gz
tar -xzf hpl-2.3.tar.gz
cd hpl-2.3

# Copier un makefile de base
cp setup/Make.Linux_PII_CBLAS Make.$(arch)
```

### Configuration du Makefile
```makefile
# Make.Linux_Intel64
SHELL        = /bin/sh
CD           = cd
CP           = cp
LN_S         = ln -s
MKDIR        = mkdir
RM           = /bin/rm -f
TOUCH        = touch

# Compilateurs et flags
ARCH         = Linux_Intel64
TOPdir       = $(HOME)/hpl-2.3
INCdir       = $(TOPdir)/include
BINdir       = $(TOPdir)/bin/$(ARCH)
LIBdir       = $(TOPdir)/lib/$(ARCH)

# MPI
MPdir        = /opt/intel/mpi/2021.5.1
MPinc        = -I$(MPdir)/include
MPlib        = -L$(MPdir)/lib -lmpi

# BLAS (Intel MKL)
LAdir        = /opt/intel/mkl
LAinc        = -I$(LAdir)/include
LAlib        = -L$(LAdir)/lib/intel64 -lmkl_intel_lp64 -lmkl_intel_thread -lmkl_core -liomp5 -lpthread -lm -ldl

# Compilateur
CC           = mpicc
CCNOOPT      = $(HPL_DEFS)
CCFLAGS      = $(HPL_DEFS) -fomit-frame-pointer -O3 -funroll-loops -W -Wall
LINKER       = mpicc
LINKFLAGS    = $(CCFLAGS)
ARCHIVER     = ar
ARFLAGS      = r
RANLIB       = echo
```

### Méthode 2 : Installation avec Spack
```bash
# Installation avec Spack (recommandé)
spack install hpl +openmp ^openmpi ^intel-mkl
spack load hpl

# Ou avec CUDA
spack install hpl +cuda ^openmpi ^cuda ^intel-mkl
```

## Configuration

### Fichier HPL.dat
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
4            Ps
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

### Optimisation des paramètres

#### Taille du problème (N)
```bash
# Calculer N optimal (utilise ~80% de la mémoire)
# N = sqrt(0.8 * total_memory_bytes / 8)
total_mem_gb=1024  # Mémoire totale en GB
n_optimal=$(echo "sqrt(0.8 * $total_mem_gb * 1024^3 / 8)" | bc -l | cut -d. -f1)
echo "N optimal: $n_optimal"
```

#### Grille de processus (P x Q)
```bash
# P x Q = nombre total de processus MPI
# Optimiser pour P ≈ Q, avec P légèrement < Q
total_procs=64
p=$(echo "sqrt($total_procs)" | bc -l | cut -d. -f1)
q=$(($total_procs / $p))
echo "Grille optimale: P=$p, Q=$q"
```

#### Taille de bloc (NB)
- **Intel MKL**: NB = 192-256
- **OpenBLAS**: NB = 128-192
- **GPU**: NB = 512-1024

## Utilisation

### Exemple basique
```bash
# Compilation
make arch=Linux_Intel64

# Exécution sur 16 processus
mpirun -np 16 ./xhpl
```

### Exemple optimisé pour cluster
```bash
# Variables d'environnement
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
export I_MPI_PIN_DOMAIN=auto

# Exécution avec placement optimal
mpirun -np 64 \
       --map-by node \
       --bind-to core \
       --report-bindings \
       ./xhpl
```

### Exemple pour système GPU
```bash
# Configuration CUDA
export CUDA_VISIBLE_DEVICES=0,1,2,3
export CUDA_MPS_PIPE_DIRECTORY=/tmp/nvidia-mps
export CUDA_MPS_LOG_DIRECTORY=/tmp/nvidia-log

# Lancement avec support GPU
mpirun -np 4 --bind-to none ./xhpl
```

### Script de benchmark automatisé
```bash
#!/bin/bash
# benchmark_hpl.sh

# Configuration système
nodes=16
ppn=32  # processus par nœud
total_procs=$((nodes * ppn))

# Calcul des paramètres optimaux
mem_per_node_gb=256
total_mem_gb=$((nodes * mem_per_node_gb))
n_optimal=$(echo "sqrt(0.8 * $total_mem_gb * 1024^3 / 8)" | bc -l | cut -d. -f1)

# Génération HPL.dat
cat > HPL.dat << EOF
HPLinpack benchmark input file
HPL.out
6
1
$n_optimal
1
256
0
1
$(echo "sqrt($total_procs)" | bc -l | cut -d. -f1)
$(($total_procs / $(echo "sqrt($total_procs)" | bc -l | cut -d. -f1)))
16.0
1
2
1
4
1
2
1
2
1
1
2
64
0
0
1
8
EOF

# Exécution
mpirun -np $total_procs \
       --hostfile hostfile \
       --map-by node:PE=1 \
       --bind-to core \
       ./xhpl
```

## Métriques et Performance

### Types de métriques collectées
- **Performance**: GFLOPS (milliards d'opérations par seconde)
- **Efficacité**: Pourcentage de la performance théorique
- **Temps d'exécution**: Durée totale du benchmark
- **Résidu**: Précision de la solution (doit être < 16.0)

### Calcul des FLOPS
```
FLOPS = (2/3 * N³ - 2 * N²) / temps_execution
Efficacité = FLOPS_mesurés / FLOPS_théoriques * 100%
```

### Performances de référence (2024)
- **Frontier (ORNL)**: 1.194 ExaFLOPS
- **Fugaku (RIKEN)**: 442.0 PetaFLOPS  
- **Summit (ORNL)**: 148.6 PetaFLOPS
- **Sierra (LLNL)**: 94.6 PetaFLOPS

### Analyse des résultats
```bash
# Extraction des métriques depuis HPL.out
grep "WR00C2R2" HPL.out | awk '{print "Performance: " $7 " GFLOPS"}'
grep "WR00C2R2" HPL.out | awk '{print "Temps: " $6 " secondes"}'
grep "WR00C2R2" HPL.out | awk '{print "Résidu: " $8}'
```

## Troubleshooting

### Problèmes courants

**Erreur de mémoire insuffisante**
```bash
# Réduire N dans HPL.dat
# Vérifier la mémoire disponible
free -h
cat /proc/meminfo | grep MemAvailable
```

**Performance dégradée**
```bash
# Vérifier l'affinité des processus
numactl --show
lstopo --of png > topology.png

# Optimiser les variables d'environnement
export OMP_PROC_BIND=true
export OMP_PLACES=cores
```

**Problèmes réseau**
```bash
# Test de bande passante
ib_write_bw -a -F --report_gbits

# Test de latence
ib_write_lat -a

# Vérification de la topologie
ibnetdiscover
```

**Échec de convergence (résidu > 16.0)**
- Problème matériel (mémoire, CPU)
- Erreur de configuration BLAS
- Problème de précision numérique

## Ressources

### Documentation officielle
- [HPL User Guide](http://www.netlib.org/benchmark/hpl/hpl.pdf)
- [HPL Tuning Guide](http://www.netlib.org/benchmark/hpl/tuning.html)
- [Top500 Submission Guidelines](https://www.top500.org/project/linpack/)

### Tutoriels complémentaires
- [Optimizing HPL for Modern HPC Systems](https://example.com/hpl-optimization)
- [HPL Performance Analysis](https://example.com/hpl-analysis)

### Articles de recherche
- Dongarra, J. J., et al. (2003). The LINPACK benchmark: past, present and future. *Concurrency and Computation: practice and experience*, 15(9), 803-820.
- Luszczek, P., et al. (2005). The HPC Challenge (HPCC) benchmark suite. *Proceedings of the 2005 ACM/IEEE conference on Supercomputing*, 40.

### Code source
- [HPL Official Repository](http://www.netlib.org/benchmark/hpl/)
- [Optimized Versions](https://github.com/hpc/hpl)

## Sources et Références

1. Petitet, A., Whaley, R. C., Dongarra, J., & Cleary, A. (2008). HPL-a portable implementation of the high-performance Linpack benchmark for distributed-memory computers. *University of Tennessee, Knoxville*.
2. Dongarra, J. J., Luszczek, P., & Petitet, A. (2003). The LINPACK benchmark: past, present and future. *Concurrency and Computation: Practice and Experience*, 15(9), 803-820.
3. Top500.org. (2024). *Performance Development*. https://www.top500.org/statistics/perfdevel/