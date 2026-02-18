/**
 * include.js
 * Used to load common HTML components like Header and Footer in a static HTML site.
 */

// Immediately apply stored theme to prevent FOUC
(function () {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (document.body) {
        document.body.setAttribute('data-theme', savedTheme);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.setAttribute('data-theme', savedTheme);
        });
    }
})();

document.addEventListener("DOMContentLoaded", function () {
    // Function to load HTML components
    function loadComponent(selector, file, callback) {
        const element = document.querySelector(selector);
        if (element) {
            fetch(file)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to load ${file}`);
                    return response.text();
                })
                .then(data => {
                    element.innerHTML = data;
                    if (callback) callback();

                    // Trigger custom event so other scripts know the component is ready
                    const event = new CustomEvent('componentLoaded', { detail: { selector, file } });
                    document.dispatchEvent(event);
                })
                .catch(error => console.error('Error loading component:', error));
        }
    }

    // Load Header and Footer
    loadComponent('.site-header', 'header.html', highlightActiveLink);
    loadComponent('.site-footer', 'footer.html');

    // Initialize Global Floating Hearts
    initFloatingHearts();

    // Initialize Global Scroll Reveal
    initScrollReveal();

    /**
     * Highlights the active link in the navigation based on the current URL
     */
    function highlightActiveLink() {
        const path = window.location.pathname.split("/").pop() || 'index.html';
        const navLinks = document.querySelectorAll('.header-nav a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const hrefPath = href.split('#')[0].split('?')[0];
            const match = hrefPath === path || (path === '' && (hrefPath === 'index.html' || hrefPath === ''));
            if (match) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Creates and animates floating background hearts
     */
    function initFloatingHearts() {
        // Find existing container or wait for it (since we are adding it to HTML)
        const container = document.getElementById('heartsContainer');
        if (!container) return;

        const heartCount = 20; // Increased count for smaller hearts
        const heartTypes = ['<i class="fa-solid fa-heart"></i>', '<i class="fa-regular fa-heart"></i>'];

        for (let i = 0; i < heartCount; i++) {
            createHeart(container, heartTypes);
        }
    }

    function createHeart(container, heartTypes) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = heartTypes[Math.floor(Math.random() * heartTypes.length)];

        // Randomize size between 10px and 20px
        const size = Math.random() * 15 + 15 + 'px';
        const left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 15 + 15 + 's';
        const delay = Math.random() * 20 + 's';
        const opacity = Math.random() * 0.1 + 0.05;

        heart.style.left = left;
        heart.style.fontSize = size;
        heart.style.animationDuration = duration;
        heart.style.animationDelay = delay;
        heart.style.opacity = opacity;

        container.appendChild(heart);

        // Re-randomize horizontal position after each animation cycle
        heart.addEventListener('animationiteration', () => {
            heart.style.left = Math.random() * 100 + 'vw';
        });
    }

    /**
     * Handles scroll reveal animations using Intersection Observer
     */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-text');

        if (revealElements.length === 0) return;

        const observerOptions = {
            threshold: 0.05, // Lower threshold to ensure even small elements trigger
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Small timeout to ensure layout is complete before observing
        setTimeout(() => {
            revealElements.forEach(el => {
                // If element is already in viewport, show it immediately
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('visible');
                } else {
                    observer.observe(el);
                }
            });
        }, 100);
    }
});


// Hamburger Menu & Click-based Dropdown Functionality


function initNavigation() {
    // Hamburger Menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeHamburger = document.getElementById('closeHamburger');

    // Create overlay
    let overlay = document.querySelector('.hamburger-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'hamburger-overlay';
        document.body.appendChild(overlay);
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function () {
            hamburgerMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeHamburger) {
        closeHamburger.addEventListener('click', closeMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    function closeMenu() {
        if (hamburgerMenu) hamburgerMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Hamburger dropdown toggle (Commented out to prevent conflict with inline onclick in header.html)
    /*
    const hamburgerItems = document.querySelectorAll('.hamburger-item');
    hamburgerItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('active');
        });
    });
    */

    // Main nav click-based dropdown
    const menuItems = document.querySelectorAll('.menu > li > a');
    menuItems.forEach(link => {
        link.addEventListener('click', function (e) {
            const parent = this.parentElement;
            const hasDropdown = parent.querySelector('.dropdown');

            if (hasDropdown) {
                e.preventDefault();

                // Close other dropdowns
                document.querySelectorAll('.menu > li').forEach(li => {
                    if (li !== parent) {
                        li.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                parent.classList.toggle('active');
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.menu')) {
            document.querySelectorAll('.menu > li').forEach(li => {
                li.classList.remove('active');
            });
        }
    });
}

// ===== SEARCH FUNCTIONALITY (Global) =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');

    // Only proceed if search elements exist
    if (!searchInput || !searchBtn) return;

    // Searchable content - shared across pages
    const searchableItems = [
        { title: "கல்வி உதவித் திட்டம் 2024", category: "திட்டங்கள்", url: "#", content: "1000+ மாணவர்களுக்கு உதவி" },
        { title: "மருத்துவ முகாம் வெற்றிகரமாக நடைபெற்றது", category: "நிகழ்வுகள்", url: "#", content: "500+ பயனாளிகள்" },
        { title: "மகளிர் ஒன்றிய புதிய திட்டங்கள்", category: "மகளிர்", url: "#", content: "தொழில் முயற்சி பயிற்சிகள்" },
        { title: "புயல் அனர்த்தத்தால் பாதிக்கப்பட்ட மக்களுக்கு உலர் உணவுப் பொருட்கள் வழங்கல்", category: "Helping Hearts News", url: "news_flood_relief_2026.html", content: "மட்டக்களப்பு மற்றும் பதுளை மாவட்ட பசறை பிரதேசத்தில் 60 குடும்பங்களுக்கு உதவி" },
        { title: "புது வருடம் மற்றும் பொங்கல் வாழ்த்துகள்", category: "Helping Hearts News", url: "aboutus.html", content: "எம் இனிய உறவுகளே! புது வருடம் மற்றும் பொங்கல் வாழ்த்துகள்" },
        { title: "பின் தங்கிய சங்கமன்கிராமம் பகுதியில் சிறுவர் முன்பள்ளி", category: "Helping Hearts Germany", url: "news.html", content: "கல்வியே எமது சிறார்களின் மூலதனம்" },
        { title: "மாலை நேரக் கல்வி நிலையம் பொத்துவில் ஊறணியில் பொங்கல் விழா", category: "Helping Hearts Germany", url: "news.html", content: "உதவும் இதயங்கள் நிறுவனத்தின் மாலை நேரக் கல்வி நிலையம்" },
        { title: "சிறுவர் இல்லக் குழந்தைகளுக்கு உணவு வழங்கியமை", category: "Helping Hearts News", url: "news.html", content: "பழுகாமம் மற்றும் காந்தி சிறுவர் இல்லம்" },
        { title: "குமார் இராசேந்திரம்", category: "மேலாண்மைக்குழு", url: "team.html", content: "நிறுவனர் & தலைவர்" },
        { title: "செல்வி தர்சினி", category: "மேலாண்மைக்குழு", url: "team.html", content: "செயலாளர்" },
        { title: "மேலாண்மைக்குழு", category: "பக்கங்கள்", url: "team.html", content: "உதவும் இதயங்கள் நிறுவனத்தின் மேலாண்மைக்குழு" },
        { title: "மதிவதனி சற்குணம்", category: "மேலாண்மைக்குழு", url: "team.html", content: "பொருளாளர்" },
        { title: "சுதாகர் ஜெயசிங்கம்", category: "மேலாண்மைக்குழு", url: "team.html", content: "திட்ட முகாமையாளர்" },
        { title: "எம்மைத் தொடர்புகொள்ள", category: "தொடர்பு", url: "contact.html", content: "Helping Hearts Foundation Contact" },
        { title: "எம்மைப்பற்றி", category: "பக்கங்கள்", url: "aboutus.html", content: "Helping Hearts Foundation About Us" },
    ];

    function performSearch(query) {
        if (!query || query.length < 2) {
            if (searchResults) searchResults.classList.remove('active');
            return;
        }

        query = query.toLowerCase();
        const results = searchableItems.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );

        displayResults(results);
    }

    function displayResults(results) {
        if (!searchResults) return;
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">முடிவுகள் எதுவும் இல்லை</div>';
        } else {
            results.slice(0, 5).forEach(result => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `
                    <a href="${result.url}">
                        <h4>${result.title}</h4>
                        <p>${result.category} - ${result.content.substring(0, 50)}...</p>
                    </a>
                `;
                searchResults.appendChild(div);
            });

            if (results.length > 5) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'search-result-item';
                moreDiv.innerHTML = `<a href="#"><strong>மேலும் ${results.length - 5} முடிவுகள்...</strong></a>`;
                searchResults.appendChild(moreDiv);
            }
        }

        searchResults.classList.add('active');
    }

    // Event listeners
    searchBtn.addEventListener('click', (e) => {
        // Prevent default if it's inside a form, though it's a button type=submit usually
        e.preventDefault();

        const container = document.querySelector('.search-container');
        if (!container.classList.contains('active')) {
            container.classList.add('active');
            searchInput.focus();
        } else {
            if (searchInput.value.trim() === "") {
                container.classList.remove('active');
            } else {
                performSearch(searchInput.value);
            }
        }
    });

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Close search bar and results when clicking outside
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.search-container');
        if (container && !container.contains(e.target) && !searchBtn.contains(e.target)) {
            container.classList.remove('active');
            if (searchResults) searchResults.classList.remove('active');
        }
    });
}

// Initialize Theme Toggle (Moved from index.html to here for global access)
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const themeColorMeta = document.getElementById('theme-color'); // Optional

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    bodyElement.setAttribute('data-theme', savedTheme);

    // Update icon based on theme
    const icon = themeToggle.querySelector('i');
    if (icon) {
        if (savedTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = bodyElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        bodyElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Toggle icon
        if (icon) {
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    });
}

// Update desktop top bar date
function updateDesktopDate() {
    const el = document.getElementById('desktopDate');
    if (!el) return;

    const d = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
        const dateStr = d.toLocaleDateString('ta-IN', options);
        el.textContent = dateStr;
    } catch (e) {
        // Fallback if Tamil locale is not supported
        el.textContent = d.toDateString();
    }
}

// Initialize header-dependent features after component is loaded
document.addEventListener('componentLoaded', function (e) {
    if (e.detail.selector === '.site-header') {
        initNavigation();
        initSearch();      // Initialize Search
        initThemeToggle(); // Initialize Theme Toggle
        updateDesktopDate(); // Initialize Top Bar Date
    }
});
