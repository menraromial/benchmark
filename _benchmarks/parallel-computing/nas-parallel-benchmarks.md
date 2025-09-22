---
title: "NAS Parallel Benchmarks (NPB)"
category: "parallel-computing"
subcategory: "OpenMP Benchmarks"
description: "Suite of benchmarks for evaluating parallel supercomputers, derived from computational fluid dynamics applications"
tags: ["openmp", "mpi", "cfd", "scientific-computing", "scalability"]
difficulty: "intermediate"
last_updated: "2024-01-15"
version: "3.4.2"
official_website: "https://www.nas.nasa.gov/software/npb.html"
license: "NASA Open Source Agreement"
platforms: ["Linux", "Unix", "macOS"]
languages: ["C", "Fortran", "C++"]
maintainer: "NASA Advanced Supercomputing (NAS) Division"
citation: "Bailey, D. et al. (1991). The NAS Parallel Benchmarks. NASA Ames Research Center, RNR-91-002."
# Specialized metadata for parallel computing
parallel_models: ["OpenMP", "MPI", "CUDA", "OpenACC"]
min_nodes: 1
max_nodes: 65536
memory_requirements: "2GB per process"
gpu_support: true
interconnect: ["InfiniBand", "Ethernet", "Omni-Path"]
---

# NAS Parallel Benchmarks (NPB)

## Vue d'ensemble

Les NAS Parallel Benchmarks (NPB) constituent une suite de benchmarks développée par la NASA pour évaluer les performances des supercalculateurs parallèles. Dérivés d'applications de dynamique des fluides computationnelle (CFD), ils représentent des charges de travail scientifiques réalistes.

### Cas d'usage principaux

- Évaluation des performances des systèmes parallèles
- Test de scalabilité des algorithmes parallèles
- Comparaison de différentes architectures HPC
- Validation des implémentations de programmation parallèle

### Avantages

- Benchmarks représentatifs des applications scientifiques
- Support multiple des modèles de parallélisme
- Classes de problèmes variées (S, W, A, B, C, D, E, F)
- Code source ouvert et bien documenté

### Limitations

- Focus sur les applications CFD
- Peut ne pas représenter tous les types de charges HPC
- Configuration complexe pour les très gros systèmes

## Prérequis

### Système d'exploitation

- Linux (RHEL, CentOS, Ubuntu, SUSE)
- Unix (Solaris, AIX)
- macOS (pour développement)

### Dépendances logicielles

- **Compilateurs**: GCC 7+, Intel Compiler, PGI/NVIDIA HPC SDK
- **MPI**: OpenMPI 3.0+, Intel MPI, MPICH 3.0+
- **OpenMP**: Support dans le compilateur
- **CUDA**: NVIDIA CUDA Toolkit 10.0+ (pour version GPU)

### Configuration matérielle recommandée

- **CPU**: Architecture x86_64 ou ARM64
- **RAM**: 4GB minimum par processus MPI
- **Réseau**: InfiniBand recommandé pour multi-nœuds
- **GPU**: NVIDIA Tesla/A100 pour versions CUDA

## Installation

### Méthode 1 : Compilation depuis les sources

```bash
# Télécharger NPB
wget https://www.nas.nasa.gov/assets/npb/NPB3.4.2.tar.gz
tar -xzf NPB3.4.2.tar.gz
cd NPB3.4.2

# Configuration pour OpenMP
cd NPB3.4-OMP
cp config/make.def.template config/make.def
```

### Méthode 2 : Installation via gestionnaire de paquets

```bash
# Sur Ubuntu/Debian
sudo apt-get install npb

# Sur CentOS/RHEL avec EPEL
sudo yum install npb-openmpi npb-mpich

# Avec Spack (recommandé pour HPC)
spack install npb +openmp +mpi
```

### Configuration du fichier make.def

```makefile
# config/make.def
FORTRAN = gfortran
CC = gcc
FFLAGS = -O3 -fopenmp -mcmodel=medium
CFLAGS = -O3 -fopenmp -mcmodel=medium
FLINK = $(FORTRAN)
CLINK = $(CC)
FLINKFLAGS = $(FFLAGS)
CLINKFLAGS = $(CFLAGS)
RAND = randi8
```

## Configuration

### Configuration OpenMP

```bash
# Variables d'environnement OpenMP
export OMP_NUM_THREADS=16
export OMP_PROC_BIND=true
export OMP_PLACES=cores
export OMP_SCHEDULE=static
```

### Configuration MPI

```bash
# Variables d'environnement MPI
export OMPI_MCA_btl=^openib  # Si problèmes InfiniBand
export I_MPI_PIN_DOMAIN=omp  # Intel MPI avec OpenMP
```

### Compilation des benchmarks

```bash
# Compiler tous les benchmarks classe A
make suite CLASS=A

# Compiler un benchmark spécifique
make bt CLASS=B NPROCS=16

# Compilation avec MPI
make bt CLASS=C NPROCS=64
```

## Utilisation

### Exemple basique - OpenMP

```bash
# Exécuter CG (Conjugate Gradient) classe A
export OMP_NUM_THREADS=8
./bin/cg.A.x

# Exécuter avec monitoring
time ./bin/mg.B.x
```

### Exemple MPI

```bash
# Exécuter BT (Block Tridiagonal) avec 16 processus
mpirun -np 16 ./bin/bt.C.16

# Avec placement spécifique
mpirun -np 32 --map-by node:PE=4 ./bin/sp.D.32
```

### Exemple hybride MPI+OpenMP

```bash
# 4 processus MPI, 8 threads OpenMP chacun
export OMP_NUM_THREADS=8
mpirun -np 4 ./bin/bt.C.4x8
```

### Cas d'usage avancés

```bash
# Test de scalabilité forte
for np in 1 2 4 8 16 32; do
    mpirun -np $np ./bin/cg.C.$np
done

# Test de scalabilité faible
mpirun -np 64 ./bin/mg.D.64   # Classe D pour 64 processus
mpirun -np 128 ./bin/mg.E.128 # Classe E pour 128 processus
```

## Métriques et Performance

### Types de métriques collectées

- **Temps d'exécution**: Temps total et par phase
- **MFLOPS**: Millions d'opérations flottantes par seconde
- **Speedup**: Accélération par rapport à la version séquentielle
- **Efficacité parallèle**: Speedup / nombre de processeurs
- **Scalabilité**: Performance en fonction du nombre de processeurs

### Benchmarks disponibles

| Benchmark | Description             | Caractéristiques           |
| --------- | ----------------------- | -------------------------- |
| **BT**    | Block Tridiagonal       | Résolution de systèmes 5x5 |
| **CG**    | Conjugate Gradient      | Méthodes itératives        |
| **EP**    | Embarrassingly Parallel | Parallélisme trivial       |
| **FT**    | Fourier Transform       | Transformées de Fourier 3D |
| **IS**    | Integer Sort            | Tri d'entiers              |
| **LU**    | Lower-Upper             | Factorisation LU           |
| **MG**    | Multi-Grid              | Méthodes multi-grilles     |
| **SP**    | Scalar Pentadiagonal    | Systèmes pentadiagonaux    |

### Classes de problèmes

- **S (Small)**: Tests rapides, développement
- **W (Workstation)**: Stations de travail
- **A, B, C**: Tailles croissantes pour clusters
- **D, E, F**: Très grandes tailles pour supercalculateurs

### Analyse de scalabilité

```bash
# Script d'analyse de performance
#!/bin/bash
echo "Processes,Time,MFLOPS,Efficiency" > results.csv
for np in 1 2 4 8 16 32; do
    result=$(mpirun -np $np ./bin/cg.C.$np | grep "Time in seconds")
    time=$(echo $result | awk '{print $4}')
    mflops=$(echo $result | awk '{print $7}')
    efficiency=$(echo "scale=3; $mflops / ($np * $baseline_mflops)" | bc)
    echo "$np,$time,$mflops,$efficiency" >> results.csv
done
```

## Troubleshooting

### Problèmes courants

**Erreurs de compilation**

```bash
# Problème de mémoire lors de la compilation
export FFLAGS="-O2 -mcmodel=medium"  # Réduire l'optimisation

# Problème avec les grands tableaux
export FFLAGS="$FFLAGS -fmax-stack-var-size=65536"
```

**Erreurs d'exécution MPI**

```bash
# Problème de mémoire partagée
echo 1000000000 | sudo tee /proc/sys/kernel/shmmax

# Problème InfiniBand
export OMPI_MCA_btl=self,sm,tcp
```

**Performance dégradée**

```bash
# Vérifier l'affinité des processus
numactl --show
lstopo

# Optimiser le placement mémoire
export OMP_PROC_BIND=spread
export OMP_PLACES=threads
```

## Ressources

### Documentation officielle

- [NPB User Guide](https://www.nas.nasa.gov/assets/npb/npb_users_guide.pdf)
- [Implementation Notes](https://www.nas.nasa.gov/assets/npb/npb_implementation.pdf)
- [Performance Results](https://www.nas.nasa.gov/software/npb-results.html)

### Tutoriels complémentaires

- [Running NPB on Modern HPC Systems](https://example.com/npb-modern-hpc)
- [NPB Performance Analysis](https://example.com/npb-performance)

### Articles de recherche

- Bailey, D. H., et al. (1991). The NAS parallel benchmarks summary and preliminary results. _Proceedings of the 1991 ACM/IEEE conference on Supercomputing_, 158-165.
- Jin, H., Frumkin, M., & Yan, J. (1999). The OpenMP implementation of NAS parallel benchmarks and its performance. _NASA Ames Research Center_, NAS-99-011.

### Code source

- [NPB Official Repository](https://github.com/NASA-Ames/NPB)
- [Community Versions](https://github.com/benchmark-subsetting/NPB3.0-omp-c)

## Sources et Références

1. Bailey, D. H., Barszcz, E., Barton, J. T., Browning, D. S., Carter, R. L., Dagum, L., ... & Weeratunga, S. K. (1991). The NAS parallel benchmarks. _The International Journal of Supercomputer Applications_, 5(3), 63-73.
2. Frumkin, M., Schultz, M., Jin, H., & Yan, J. (2003). Performance and scalability of the NAS parallel benchmarks in Java. _Proceedings of the 2003 ACM/IEEE conference on Supercomputing_, 35.
3. Müller, M. S., et al. (2005). Memory performance and cache coherency effects on an Intel Nehalem multiprocessor system. _Proceedings of the 18th International Conference on Parallel Architectures and Compilation Techniques_, 261-270.
