/**
 * Benchmark page functionality
 * Handles table of contents generation, syntax highlighting, and interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize syntax highlighting
  initializeSyntaxHighlighting();
  
  // Initialize copy code functionality
  initializeCopyCode();
});

/**
 * Generate table of contents from headings in the content
 */
function generateTableOfContents() {
  const tocList = document.getElementById('toc-list');
  const content = document.querySelector('.benchmark-article');
  
  if (!tocList || !content) return;
  
  // Find all headings (h2, h3, h4) in the content
  const headings = content.querySelectorAll('h2, h3, h4');
  
  if (headings.length === 0) {
    // Hide TOC if no headings found
    const tocSection = document.querySelector('.toc-section');
    if (tocSection) {
      tocSection.style.display = 'none';
    }
    return;
  }
  
  let tocHTML = '';
  let currentLevel = 2;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent.trim();
    const id = generateHeadingId(text, index);
    
    // Add ID to heading for linking
    heading.id = id;
    
    // Determine nesting level
    if (level > currentLevel) {
      tocHTML += '<ul class="toc-sublist">';
    } else if (level < currentLevel) {
      const levelDiff = currentLevel - level;
      tocHTML += '</ul>'.repeat(levelDiff);
    }
    
    tocHTML += `
      <li class="toc-item toc-level-${level}">
        <a href="#${id}" class="toc-link" data-target="${id}">
          ${text}
        </a>
      </li>
    `;
    
    currentLevel = level;
  });
  
  // Close any remaining open lists
  if (currentLevel > 2) {
    tocHTML += '</ul>'.repeat(currentLevel - 2);
  }
  
  tocList.innerHTML = tocHTML;
  
  // Add click handlers for smooth scrolling
  const tocLinks = tocList.querySelectorAll('.toc-link');
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL hash
        history.pushState(null, null, `#${targetId}`);
      }
    });
  });
}

/**
 * Generate a unique ID for a heading
 */
function generateHeadingId(text, index) {
  // Convert to lowercase, replace spaces and special chars with hyphens
  let id = text.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
  
  // Ensure ID is not empty
  if (!id) {
    id = `heading-${index}`;
  }
  
  // Ensure uniqueness
  let finalId = id;
  let counter = 1;
  while (document.getElementById(finalId)) {
    finalId = `${id}-${counter}`;
    counter++;
  }
  
  return finalId;
}

/**
 * Initialize syntax highlighting with Prism.js
 */
function initializeSyntaxHighlighting() {
  // Load Prism.js if not already loaded
  if (typeof Prism === 'undefined') {
    loadPrismJS();
  } else {
    // Highlight all code blocks
    Prism.highlightAll();
    addCopyButtons();
  }
}

/**
 * Load Prism.js dynamically
 */
function loadPrismJS() {
  // Load Prism CSS
  const prismCSS = document.createElement('link');
  prismCSS.rel = 'stylesheet';
  prismCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
  document.head.appendChild(prismCSS);
  
  // Load Prism JS
  const prismJS = document.createElement('script');
  prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
  prismJS.onload = function() {
    // Load additional language components
    loadPrismLanguages();
  };
  document.head.appendChild(prismJS);
}

/**
 * Load additional Prism language components
 */
function loadPrismLanguages() {
  const languages = [
    'bash',
    'python',
    'javascript',
    'java',
    'cpp',
    'c',
    'yaml',
    'json',
    'dockerfile',
    'makefile',
    'cmake'
  ];
  
  let loadedCount = 0;
  const totalLanguages = languages.length;
  
  languages.forEach(lang => {
    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
    script.onload = function() {
      loadedCount++;
      if (loadedCount === totalLanguages) {
        // All languages loaded, highlight code and add copy buttons
        Prism.highlightAll();
        addCopyButtons();
      }
    };
    script.onerror = function() {
      loadedCount++;
      if (loadedCount === totalLanguages) {
        Prism.highlightAll();
        addCopyButtons();
      }
    };
    document.head.appendChild(script);
  });
}

/**
 * Add copy buttons to code blocks
 */
function addCopyButtons() {
  const codeBlocks = document.querySelectorAll('pre[class*="language-"]');
  
  codeBlocks.forEach(codeBlock => {
    // Skip if copy button already exists
    if (codeBlock.querySelector('.copy-button')) return;
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copier le code';
    
    copyButton.addEventListener('click', function() {
      const code = codeBlock.querySelector('code');
      const text = code.textContent;
      
      navigator.clipboard.writeText(text).then(function() {
        // Show success feedback
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        copyButton.classList.add('copied');
        
        setTimeout(() => {
          copyButton.innerHTML = '<i class="fas fa-copy"></i>';
          copyButton.classList.remove('copied');
        }, 2000);
        
        showNotification('Code copié dans le presse-papiers!');
      }).catch(function() {
        showNotification('Erreur lors de la copie', 'error');
      });
    });
    
    codeBlock.style.position = 'relative';
    codeBlock.appendChild(copyButton);
  });
}

/**
 * Initialize copy code functionality for inline code
 */
function initializeCopyCode() {
  // Add double-click to copy for inline code
  const inlineCodes = document.querySelectorAll('code:not(pre code)');
  
  inlineCodes.forEach(code => {
    code.addEventListener('dblclick', function() {
      const text = this.textContent;
      navigator.clipboard.writeText(text).then(function() {
        showNotification('Code copié!');
      });
    });
    
    code.title = 'Double-cliquez pour copier';
    code.style.cursor = 'pointer';
  });
}

/**
 * Initialize scroll spy for table of contents
 */
function initializeScrollSpy() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('.benchmark-article h2, .benchmark-article h3, .benchmark-article h4');
  
  if (tocLinks.length === 0 || headings.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const tocLink = document.querySelector(`.toc-link[data-target="${id}"]`);
      
      if (entry.isIntersecting) {
        // Remove active class from all links
        tocLinks.forEach(link => link.classList.remove('active'));
        // Add active class to current link
        if (tocLink) {
          tocLink.classList.add('active');
        }
      }
    });
  }, {
    rootMargin: '-20% 0px -80% 0px'
  });
  
  headings.forEach(heading => {
    observer.observe(heading);
  });
}

/**
 * Copy URL to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    showNotification('Lien copié dans le presse-papiers!');
  }).catch(function() {
    showNotification('Erreur lors de la copie', 'error');
  });
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
  
  // Allow manual removal by clicking
  notification.addEventListener('click', () => {
    notification.remove();
  });
}

/**
 * Print page functionality
 */
function printPage() {
  window.print();
}

/**
 * Initialize page when DOM is ready
 */
function initializePage() {
  // Add smooth scrolling to all anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Handle hash on page load
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}