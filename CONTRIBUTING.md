# Contributing to Research Benchmark Hub

Thank you for your interest in contributing to the Research Benchmark Hub! This guide will help you understand how to contribute effectively.

## 🎯 What We're Looking For

We welcome contributions of:

- **New benchmark guides** for research computing domains
- **Updates to existing benchmarks** with new versions or improved instructions
- **Bug fixes** in documentation or code
- **Improvements** to validation, templates, or site functionality

## 📋 Before You Start

1. **Check existing content** - Browse the site to avoid duplicating existing benchmarks
2. **Read our standards** - Familiarize yourself with our content structure and quality requirements
3. **Set up your environment** - Follow the setup instructions below

## 🛠️ Development Setup

### Prerequisites

- Ruby 3.1 or higher
- Bundler gem
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/research-benchmark-hub/research-benchmark-hub.git
cd research-benchmark-hub

# Install dependencies
make install

# Validate existing content
make validate

# Start local development server
make serve
```

The site will be available at `http://localhost:4000`

## 📝 Adding a New Benchmark

### 1. Choose the Right Category

Place your benchmark in the appropriate directory:

- `_benchmarks/cloud-computing/` - Cloud and virtualization benchmarks
- `_benchmarks/green-computing/` - Energy efficiency and sustainability benchmarks
- `_benchmarks/distributed-systems/` - Distributed systems and databases
- `_benchmarks/iot/` - Internet of Things and edge computing
- `_benchmarks/energy/` - Energy measurement and profiling tools
- `_benchmarks/parallel-computing/` - Parallel programming benchmarks
- `_benchmarks/hpc/` - High Performance Computing benchmarks

### 2. Create the Benchmark File

Create a new Markdown file: `_benchmarks/category/benchmark-name.md`

### 3. Use the Required Front Matter

```yaml
---
title: "Benchmark Name"
category: "category-name"
subcategory: "optional-subcategory"
description: "Brief description (max 200 characters)"
tags: ["tag1", "tag2", "tag3"]
difficulty: "beginner|intermediate|advanced"
last_updated: "YYYY-MM-DD"
version: "1.0.0"
official_website: "https://example.com"
license: "License Name"
platforms: ["Linux", "Windows", "macOS"]
languages: ["C++", "Python", "Java"]
maintainer: "Organization or Person Name"
citation: "Proper academic citation"

# Additional fields for parallel computing benchmarks
parallel_models: ["OpenMP", "MPI", "CUDA"] # if applicable

# Additional fields for HPC benchmarks
min_nodes: 1 # if applicable
max_nodes: 1000 # if applicable
memory_requirements: "8GB" # if applicable
gpu_support: true # if applicable
interconnect: ["InfiniBand"] # if applicable
rankings_used: ["Top500"] # if applicable
---
```

### 4. Follow the Content Structure

Your benchmark guide should include these sections:

```markdown
# Benchmark Name

## Vue d'ensemble

- What the benchmark measures
- Primary use cases
- Advantages and limitations

## Prérequis

- Operating system requirements
- Software dependencies
- Hardware recommendations

## Installation

### Method 1: Package Manager

### Method 2: Source Compilation

### Method 3: Container/Docker

## Configuration

- Configuration files
- Important parameters
- Recommended optimizations

## Utilisation

### Basic Example

### Advanced Use Cases

### Result Interpretation

## Métriques et Performance

- Types of metrics collected
- Reference benchmarks
- Comparison with other tools
- Performance analysis guidelines

## Troubleshooting

- Common issues
- Solutions and workarounds

## Ressources

- Official documentation
- Additional tutorials
- Research papers
- Source code repositories

## Sources et Références
```

### 5. Code Block Guidelines

Always specify the language for syntax highlighting:

````bash
# Good
```bash
./configure --prefix=/usr/local
make && make install
````

````python
# Good
```python
import benchmark_tool
result = benchmark_tool.run()
````

```
# Avoid - no language specified
./configure --prefix=/usr/local
make && make install
```

## ✅ Quality Standards

### Content Requirements

- **Accuracy**: All technical information must be correct and up-to-date
- **Completeness**: Include installation, configuration, usage, and troubleshooting
- **Clarity**: Write for your target audience (researchers, students, practitioners)
- **Citations**: Properly cite all sources and references

### Technical Requirements

- **Validation**: All content must pass our validation checks
- **Links**: External links must be valid and accessible
- **Code**: All code examples must be tested and working
- **Formatting**: Follow Markdown best practices

## 🔍 Validation Process

Before submitting, run these commands:

```bash
# Validate your content
make validate

# Check for verbose output
make validate-verbose

# Test the build
make build

# Test locally
make serve
```

Fix any errors or warnings before submitting your pull request.

## 📤 Submission Process

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b add-benchmark-name
   ```
3. **Add your benchmark** following the guidelines above
4. **Validate your changes**:
   ```bash
   make validate
   make build
   ```
5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add [Benchmark Name] guide"
   ```
6. **Push to your fork**:
   ```bash
   git push origin add-benchmark-name
   ```
7. **Create a Pull Request** on GitHub using our template

## 📋 Pull Request Guidelines

- Use the provided PR template
- Include a clear description of your changes
- Reference any related issues
- Ensure all validation checks pass
- Be responsive to feedback during review

## 🔄 Review Process

1. **Automated checks** run on all PRs (validation, build tests)
2. **Content review** by maintainers for accuracy and quality
3. **Technical review** for formatting and standards compliance
4. **Final approval** and merge by maintainers

## 🆘 Getting Help

- **Issues**: Open a GitHub issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: Contact us at [contact@research-benchmark-hub.org]

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and constructive in all interactions
- Focus on the content and technical merit
- Help others learn and improve
- Report any inappropriate behavior

## 🏷️ Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License). Ensure you have the right to contribute any content you submit.

## 🙏 Recognition

Contributors are recognized in:

- Git commit history
- Contributors section (for significant contributions)
- Annual contributor acknowledgments

Thank you for helping make research benchmarking more accessible to everyone!
