# Benchmark Content Validation Plugin
# Validates benchmark front matter and content structure

require 'uri'
require 'date'

module BenchmarkValidator
  class Generator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      @site = site
      @config = site.config
      @schema = @config['benchmark_schema'] || {}
      @errors = []
      @warnings = []

      # Validate all benchmark documents
      site.collections['benchmarks'].docs.each do |doc|
        validate_benchmark(doc)
      end

      # Report validation results
      report_results if @errors.any? || @warnings.any?
      
      # Fail build if there are errors (can be disabled in development)
      if @errors.any? && ENV['JEKYLL_ENV'] == 'production'
        raise "Benchmark validation failed with #{@errors.length} errors"
      end
    end

    private

    def validate_benchmark(doc)
      @current_doc = doc
      @current_path = doc.relative_path
      
      Jekyll.logger.info "Validating benchmark:", @current_path
      
      # Validate front matter
      validate_front_matter(doc.data)
      
      # Validate content structure
      validate_content_structure(doc.content)
      
      # Validate external links
      validate_external_links(doc.data, doc.content)
    end

    def validate_front_matter(data)
      # Check required fields
      required_fields = @schema['required_fields'] || []
      required_fields.each do |field|
        unless data.key?(field) && !data[field].nil? && data[field] != ''
          add_error("Missing required field: #{field}")
        end
      end

      # Validate field types and values
      data.each do |key, value|
        validate_field(key, value)
      end

      # Validate category-specific requirements
      validate_category_specific_fields(data)
    end

    def validate_field(key, value)
      field_types = @schema['field_types'] || {}
      enums = @schema['enums'] || {}
      
      return unless field_types.key?(key)
      
      expected_type = field_types[key]
      
      case expected_type
      when 'string'
        unless value.is_a?(String)
          add_error("Field '#{key}' must be a string, got #{value.class}")
        end
      when 'array'
        unless value.is_a?(Array)
          add_error("Field '#{key}' must be an array, got #{value.class}")
        end
      when 'integer'
        unless value.is_a?(Integer)
          add_error("Field '#{key}' must be an integer, got #{value.class}")
        end
      when 'boolean'
        unless [true, false].include?(value)
          add_error("Field '#{key}' must be a boolean, got #{value.class}")
        end
      when 'date'
        validate_date_field(key, value)
      when 'url'
        validate_url_field(key, value)
      when 'enum'
        if enums.key?(key)
          unless enums[key].include?(value)
            add_error("Field '#{key}' must be one of #{enums[key].join(', ')}, got '#{value}'")
          end
        end
      end
    end

    def validate_date_field(key, value)
      if value.is_a?(String)
        begin
          Date.parse(value)
        rescue ArgumentError
          add_error("Field '#{key}' must be a valid date, got '#{value}'")
        end
      elsif !value.is_a?(Date)
        add_error("Field '#{key}' must be a date, got #{value.class}")
      end
    end

    def validate_url_field(key, value)
      return unless value.is_a?(String)
      
      begin
        uri = URI.parse(value)
        unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
          add_error("Field '#{key}' must be a valid HTTP/HTTPS URL, got '#{value}'")
        end
      rescue URI::InvalidURIError
        add_error("Field '#{key}' must be a valid URL, got '#{value}'")
      end
    end

    def validate_category_specific_fields(data)
      category = data['category']
      
      case category
      when 'parallel-computing'
        validate_parallel_computing_fields(data)
      when 'hpc'
        validate_hpc_fields(data)
      end
    end

    def validate_parallel_computing_fields(data)
      # Parallel computing benchmarks should have parallel_models
      unless data['parallel_models'] && data['parallel_models'].is_a?(Array) && !data['parallel_models'].empty?
        add_warning("Parallel computing benchmarks should specify 'parallel_models' (e.g., OpenMP, MPI, CUDA)")
      end
      
      # Validate parallel models
      if data['parallel_models']
        valid_models = ['OpenMP', 'MPI', 'CUDA', 'OpenCL', 'Pthreads', 'TBB', 'Cilk', 'Chapel', 'UPC', 'Coarray Fortran']
        invalid_models = data['parallel_models'] - valid_models
        if invalid_models.any?
          add_warning("Unknown parallel models: #{invalid_models.join(', ')}. Consider using: #{valid_models.join(', ')}")
        end
      end
    end

    def validate_hpc_fields(data)
      # HPC benchmarks should have specific fields
      hpc_recommended_fields = ['min_nodes', 'memory_requirements']
      missing_recommended = hpc_recommended_fields.select { |field| !data.key?(field) || data[field].nil? }
      
      if missing_recommended.any?
        add_warning("HPC benchmarks should specify: #{missing_recommended.join(', ')}")
      end
      
      # Validate node requirements
      if data['min_nodes'] && data['max_nodes']
        if data['min_nodes'] > data['max_nodes']
          add_error("min_nodes (#{data['min_nodes']}) cannot be greater than max_nodes (#{data['max_nodes']})")
        end
      end
      
      # Validate interconnect types
      if data['interconnect']
        valid_interconnects = ['InfiniBand', 'Ethernet', 'Omni-Path', 'Cray Aries', 'Cray Gemini', 'Myrinet']
        invalid_interconnects = data['interconnect'] - valid_interconnects
        if invalid_interconnects.any?
          add_warning("Unknown interconnect types: #{invalid_interconnects.join(', ')}")
        end
      end
      
      # Validate rankings
      if data['rankings_used']
        valid_rankings = ['Top500', 'Green500', 'HPCG', 'Graph500', 'HPL-AI', 'MLPerf HPC']
        invalid_rankings = data['rankings_used'] - valid_rankings
        if invalid_rankings.any?
          add_warning("Unknown HPC rankings: #{invalid_rankings.join(', ')}")
        end
      end
    end

    def validate_content_structure(content)
      return if content.nil? || content.empty?
      
      # Check for required sections
      required_sections = [
        'Vue d\'ensemble',
        'Prérequis', 
        'Installation',
        'Configuration',
        'Utilisation',
        'Métriques et Performance',
        'Ressources'
      ]
      
      missing_sections = required_sections.select do |section|
        !content.include?("## #{section}") && !content.include?("# #{section}")
      end
      
      if missing_sections.any?
        add_warning("Missing recommended sections: #{missing_sections.join(', ')}")
      end
      
      # Check for code blocks without language specification
      unspecified_code_blocks = content.scan(/```\s*\n/).length
      if unspecified_code_blocks > 0
        add_warning("Found #{unspecified_code_blocks} code block(s) without language specification")
      end
      
      # Check for proper heading hierarchy
      validate_heading_hierarchy(content)
    end

    def validate_heading_hierarchy(content)
      headings = content.scan(/^(#+)\s+(.+)$/)
      
      previous_level = 0
      headings.each do |heading_match|
        level = heading_match[0].length
        title = heading_match[1].strip
        
        # Check for skipped levels (e.g., h2 directly to h4)
        if level > previous_level + 1 && previous_level > 0
          add_warning("Heading hierarchy skip detected: '#{title}' (h#{level}) follows h#{previous_level}")
        end
        
        previous_level = level
      end
    end

    def validate_external_links(data, content)
      # Extract URLs from front matter
      urls_to_check = []
      
      if data['official_website']
        urls_to_check << data['official_website']
      end
      
      # Extract URLs from content (basic regex)
      content_urls = content.scan(/https?:\/\/[^\s\)]+/)
      urls_to_check.concat(content_urls)
      
      # Note: Actual HTTP checking would be too slow for build time
      # This is a placeholder for future enhancement
      urls_to_check.each do |url|
        validate_url_format(url)
      end
    end

    def validate_url_format(url)
      begin
        uri = URI.parse(url)
        unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
          add_warning("Potentially invalid URL format: #{url}")
        end
      rescue URI::InvalidURIError
        add_warning("Invalid URL format: #{url}")
      end
    end

    def add_error(message)
      @errors << "ERROR [#{@current_path}]: #{message}"
      Jekyll.logger.error "Benchmark Validation Error:", "#{@current_path} - #{message}"
    end

    def add_warning(message)
      @warnings << "WARNING [#{@current_path}]: #{message}"
      Jekyll.logger.warn "Benchmark Validation Warning:", "#{@current_path} - #{message}"
    end

    def report_results
      Jekyll.logger.info "Benchmark Validation Results:"
      Jekyll.logger.info "  Errors: #{@errors.length}"
      Jekyll.logger.info "  Warnings: #{@warnings.length}"
      
      if @errors.any?
        Jekyll.logger.error "Validation Errors:"
        @errors.each { |error| Jekyll.logger.error "  #{error}" }
      end
      
      if @warnings.any?
        Jekyll.logger.warn "Validation Warnings:"
        @warnings.each { |warning| Jekyll.logger.warn "  #{warning}" }
      end
    end
  end

  # Hook to validate on file changes during development
  Jekyll::Hooks.register :documents, :post_init do |doc|
    if doc.collection.label == 'benchmarks' && ENV['JEKYLL_ENV'] != 'production'
      # Quick validation during development
      validator = BenchmarkValidator::Generator.new
      validator.send(:validate_benchmark, doc) rescue nil
    end
  end
end