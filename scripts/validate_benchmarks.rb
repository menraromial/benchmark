#!/usr/bin/env ruby

# Standalone benchmark validation script
# Can be run independently of Jekyll build process

require 'yaml'
require 'uri'
require 'date'
require 'optparse'

class BenchmarkValidator
  def initialize(config_path = '_config.yml')
    @config = YAML.load_file(config_path)
    @schema = @config['benchmark_schema'] || {}
    @errors = []
    @warnings = []
    @verbose = false
  end

  def validate_all(verbose: false)
    @verbose = verbose
    
    puts "🔍 Starting benchmark validation..."
    
    benchmark_files = Dir.glob('_benchmarks/**/*.md')
    
    if benchmark_files.empty?
      puts "❌ No benchmark files found in _benchmarks/"
      return false
    end
    
    puts "📁 Found #{benchmark_files.length} benchmark files"
    
    benchmark_files.each do |file_path|
      validate_file(file_path)
    end
    
    report_results
    
    @errors.empty?
  end

  def validate_file(file_path)
    @current_file = file_path
    
    puts "  📄 Validating #{file_path}..." if @verbose
    
    begin
      content = File.read(file_path)
      
      # Parse front matter
      if content =~ /\A---\s*\n(.*?)\n---\s*\n(.*)\z/m
        front_matter_yaml = $1
        markdown_content = $2
        
        begin
          front_matter = YAML.load(front_matter_yaml)
          validate_front_matter(front_matter)
          validate_content_structure(markdown_content)
        rescue Psych::SyntaxError => e
          add_error("Invalid YAML front matter: #{e.message}")
        end
      else
        add_error("Missing or invalid front matter")
      end
      
    rescue => e
      add_error("Failed to read file: #{e.message}")
    end
  end

  private

  def validate_front_matter(data)
    return unless data.is_a?(Hash)
    
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
    unless data['parallel_models'] && data['parallel_models'].is_a?(Array) && !data['parallel_models'].empty?
      add_warning("Parallel computing benchmarks should specify 'parallel_models'")
    end
    
    if data['parallel_models']
      valid_models = ['OpenMP', 'MPI', 'CUDA', 'OpenCL', 'Pthreads', 'TBB', 'Cilk', 'Chapel', 'UPC', 'Coarray Fortran']
      invalid_models = data['parallel_models'] - valid_models
      if invalid_models.any?
        add_warning("Unknown parallel models: #{invalid_models.join(', ')}")
      end
    end
  end

  def validate_hpc_fields(data)
    hpc_recommended_fields = ['min_nodes', 'memory_requirements']
    missing_recommended = hpc_recommended_fields.select { |field| !data.key?(field) || data[field].nil? }
    
    if missing_recommended.any?
      add_warning("HPC benchmarks should specify: #{missing_recommended.join(', ')}")
    end
    
    if data['min_nodes'] && data['max_nodes']
      if data['min_nodes'] > data['max_nodes']
        add_error("min_nodes cannot be greater than max_nodes")
      end
    end
    
    if data['interconnect']
      valid_interconnects = ['InfiniBand', 'Ethernet', 'Omni-Path', 'Cray Aries', 'Cray Gemini', 'Myrinet']
      invalid_interconnects = data['interconnect'] - valid_interconnects
      if invalid_interconnects.any?
        add_warning("Unknown interconnect types: #{invalid_interconnects.join(', ')}")
      end
    end
  end

  def validate_content_structure(content)
    return if content.nil? || content.empty?
    
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
  end

  def add_error(message)
    @errors << "❌ ERROR [#{@current_file}]: #{message}"
  end

  def add_warning(message)
    @warnings << "⚠️  WARNING [#{@current_file}]: #{message}"
  end

  def report_results
    puts "\n📊 Validation Results:"
    puts "  ✅ Files validated: #{Dir.glob('_benchmarks/**/*.md').length}"
    puts "  ❌ Errors: #{@errors.length}"
    puts "  ⚠️  Warnings: #{@warnings.length}"
    
    if @errors.any?
      puts "\n❌ Errors:"
      @errors.each { |error| puts "  #{error}" }
    end
    
    if @warnings.any?
      puts "\n⚠️  Warnings:"
      @warnings.each { |warning| puts "  #{warning}" }
    end
    
    if @errors.empty? && @warnings.empty?
      puts "\n🎉 All benchmarks are valid!"
    elsif @errors.empty?
      puts "\n✅ No errors found, but there are warnings to address."
    else
      puts "\n💥 Validation failed with errors that must be fixed."
    end
  end
end

# Command line interface
if __FILE__ == $0
  options = {}
  
  OptionParser.new do |opts|
    opts.banner = "Usage: #{$0} [options]"
    
    opts.on("-v", "--verbose", "Verbose output") do |v|
      options[:verbose] = v
    end
    
    opts.on("-c", "--config CONFIG", "Path to _config.yml") do |config|
      options[:config] = config
    end
    
    opts.on("-h", "--help", "Show this help") do
      puts opts
      exit
    end
  end.parse!
  
  config_path = options[:config] || '_config.yml'
  
  unless File.exist?(config_path)
    puts "❌ Configuration file not found: #{config_path}"
    exit 1
  end
  
  validator = BenchmarkValidator.new(config_path)
  success = validator.validate_all(verbose: options[:verbose])
  
  exit(success ? 0 : 1)
end