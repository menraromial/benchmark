# Research Benchmark Hub - Makefile

.PHONY: help validate validate-verbose build serve clean install test

# Default target
help:
	@echo "Research Benchmark Hub - Available Commands:"
	@echo ""
	@echo "  make install          Install dependencies"
	@echo "  make validate         Validate all benchmark content"
	@echo "  make validate-verbose Validate with verbose output"
	@echo "  make build            Build the Jekyll site"
	@echo "  make serve            Serve the site locally"
	@echo "  make clean            Clean build artifacts"
	@echo "  make test             Run all tests"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	bundle install
	@echo "✅ Dependencies installed"

# Validate benchmark content
validate:
	@echo "🔍 Validating benchmark content..."
	ruby scripts/validate_benchmarks.rb

# Validate with verbose output
validate-verbose:
	@echo "🔍 Validating benchmark content (verbose)..."
	ruby scripts/validate_benchmarks.rb --verbose

# Build the site
build: validate
	@echo "🏗️  Building Jekyll site..."
	bundle exec jekyll build
	@echo "✅ Site built successfully"

# Serve the site locally
serve:
	@echo "🚀 Starting local server..."
	bundle exec jekyll serve --livereload

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	bundle exec jekyll clean
	rm -rf _site
	@echo "✅ Clean complete"

# Run tests (validation + build)
test: validate build
	@echo "✅ All tests passed"

# Development workflow
dev: validate serve

# Production build
production: clean validate
	@echo "🏭 Building for production..."
	JEKYLL_ENV=production bundle exec jekyll build
	@echo "✅ Production build complete"