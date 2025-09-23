// Global Language Toggle Functionality with Auto-Detection
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system with auto-detection
    initializeLanguageSystem();
});

function initializeLanguageSystem() {
    // Fix navbar links for current language first
    fixNavbarLinksForLanguage();
    
    // Create language toggle button in navbar
    createLanguageToggle();
    
    // Handle language switching
    setupLanguageSwitching();
    
    // Auto-redirect based on saved preference
    handleLanguageRedirect();
}

function createLanguageToggle() {
    // Find the navbar
    const navbar = document.querySelector('.navbar-nav') || document.querySelector('.navbar-custom .navbar-nav');
    
    if (navbar) {
        // Create language toggle container
        const langContainer = document.createElement('li');
        langContainer.className = 'nav-item dropdown';
        
        // Get current language from page, not from storage
        const currentLang = getCurrentLanguage();
        const isZh = currentLang === 'zh';
        
        langContainer.innerHTML = `
            <a class="nav-link dropdown-toggle lang-toggle" href="#" id="langDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-globe"></i> ${isZh ? '中文' : 'EN'}
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="langDropdown">
                <a class="dropdown-item lang-switch" href="#" data-lang="en">
                    English
                </a>
                <a class="dropdown-item lang-switch" href="#" data-lang="zh">
                    中文
                </a>
            </div>
        `;
        
        // Add to navbar (as the last item)
        navbar.appendChild(langContainer);
    } else {
        // Fallback: create a simple toggle button
        createSimpleLanguageToggle();
    }
}

function createSimpleLanguageToggle() {
    const header = document.querySelector('.intro-header') || document.querySelector('header') || document.body.firstElementChild;
    
    if (header) {
        const currentLang = getCurrentLanguage();
        const isZh = currentLang === 'zh';
        
        const langToggle = document.createElement('div');
        langToggle.className = 'global-lang-toggle';
        langToggle.innerHTML = `
            <div class="lang-toggle-container">
                <button class="lang-btn ${!isZh ? 'active' : ''}" data-lang="en">EN</button>
                <button class="lang-btn ${isZh ? 'active' : ''}" data-lang="zh">中文</button>
            </div>
        `;
        
        // Insert at the beginning of header
        header.insertBefore(langToggle, header.firstChild);
    }
}

function setupLanguageSwitching() {
    // Handle dropdown language switching
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('lang-switch')) {
            e.preventDefault();
            const targetLang = e.target.getAttribute('data-lang');
            switchLanguage(targetLang);
        }
        
        if (e.target.classList.contains('lang-btn') || e.target.closest('.lang-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('lang-btn') ? e.target : e.target.closest('.lang-btn');
            const targetLang = btn.getAttribute('data-lang');
            switchLanguage(targetLang);
        }
    });
}

function fixNavbarLinksForLanguage() {
    const currentLang = getCurrentLanguage();
    
    // Set HTML lang attribute
    document.documentElement.lang = currentLang;
    
    if (currentLang === 'zh') {
        // Auto-detect and update navigation links to Chinese versions
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        // Language mapping for navigation text
        const langMap = {
            'Home': '首页',
            'About': '关于我', 
            'About Me': '关于我',
            'Projects': '项目',
            'Resume': '简历',
            'Blog': '博客',
            'Contact': '联系我'
        };
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            
            if (href && !href.startsWith('#') && !href.includes('mailto:') && !href.includes('http')) {
                // Auto-detect and convert paths to Chinese versions
                let newHref = convertToChinesePath(href);
                let newText = langMap[text] || text;
                
                if (newHref !== href) {
                    link.setAttribute('href', newHref);
                }
                if (newText !== text) {
                    link.textContent = newText;
                }
            }
        });
    }
}

function convertToChinesePath(path) {
    // Handle root path
    if (path === '/' || path === '/index.html' || path === '') {
        return '/index-zh';
    }
    
    // If already Chinese path, return as is
    if (path.includes('-zh')) {
        return path;
    }
    
    // Remove leading slash and trailing slash for processing
    let cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    
    // If it's a simple page name, add -zh suffix
    if (!cleanPath.includes('/') && cleanPath) {
        return '/' + cleanPath + '-zh';
    }
    
    // For complex paths, try to add -zh before file extension or at the end
    if (cleanPath.includes('.html')) {
        return '/' + cleanPath.replace('.html', '-zh.html');
    }
    
    // Default: add -zh at the end
    return '/' + cleanPath + '-zh';
}

function getCurrentLanguage() {
    // Check URL for language indicator (most reliable)
    const path = window.location.pathname;
    if (path.includes('-zh') || path === '/index-zh') return 'zh';
    
    // Check page language attribute in YAML front matter
    const htmlLang = document.documentElement.lang || document.body.getAttribute('lang');
    if (htmlLang === 'zh') return 'zh';
    
    // Check meta tag set by Jekyll
    const metaLang = document.querySelector('meta[name="language"]');
    if (metaLang && metaLang.content === 'zh') return 'zh';
    
    // Default to English
    return 'en';
}

function switchLanguage(targetLang) {
    // Save language preference
    localStorage.setItem('preferredLanguage', targetLang === 'zh' ? '中文' : 'EN');
    
    // Add transition effect
    document.body.style.opacity = '0.8';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        const currentPath = window.location.pathname;
        let targetPath = getTargetPath(currentPath, targetLang);
        
        if (targetPath !== currentPath) {
            window.location.href = targetPath;
        } else {
            // Reset opacity if no redirect
            document.body.style.opacity = '1';
        }
    }, 150);
}

function getTargetPath(currentPath, targetLang) {
    if (targetLang === 'zh') {
        // Switch to Chinese version
        return convertToChinesePath(currentPath);
    } else {
        // Switch to English version
        return convertToEnglishPath(currentPath);
    }
}

function convertToEnglishPath(path) {
    // Handle Chinese homepage
    if (path === '/index-zh' || path === '/index-zh.html') {
        return '/';
    }
    
    // If already English path (no -zh), return as is
    if (!path.includes('-zh')) {
        return path;
    }
    
    // Remove -zh suffix
    let englishPath = path.replace('-zh', '');
    
    // Handle edge cases where removing -zh might leave empty path
    if (englishPath === '/' || englishPath === '') {
        return '/';
    }
    
    return englishPath;
}

function handleLanguageRedirect() {
    const savedLang = localStorage.getItem('preferredLanguage');
    const currentPath = window.location.pathname;
    
    // Don't auto-redirect if user just manually switched languages
    if (sessionStorage.getItem('manualLanguageSwitch')) {
        sessionStorage.removeItem('manualLanguageSwitch');
        return;
    }
    
    // Auto-redirect based on saved preference
    if (savedLang && !sessionStorage.getItem('languageRedirectDone')) {
        sessionStorage.setItem('languageRedirectDone', 'true');
        
        let targetPath = currentPath;
        
        if (savedLang === '中文' && !currentPath.includes('-zh')) {
            targetPath = convertToChinesePath(currentPath);
        } else if (savedLang === 'EN' && currentPath.includes('-zh')) {
            targetPath = convertToEnglishPath(currentPath);
        }
        
        if (targetPath !== currentPath) {
            window.location.href = targetPath;
        }
    }
}