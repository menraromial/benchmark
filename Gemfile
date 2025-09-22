source "https://rubygems.org"

# Jekyll core
gem "jekyll", "~> 4.4.1"

# Theme (we'll build custom theme, but keep minima as fallback)
gem "minima", "~> 2.5"

# For GitHub Pages deployment (uncomment if using GitHub Pages)
# gem "github-pages", group: :jekyll_plugins

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-paginate", "~> 1.1"
end

# Search functionality
gem "json", "~> 2.6"

# SCSS support (included with Jekyll 4.x)
gem "sass-embedded", "~> 1.93"

# Development dependencies
group :development do
  gem "webrick", "~> 1.8"
end

# Platform-specific gems
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
