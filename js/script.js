document.addEventListener('DOMContentLoaded', function() {
    const htmlElement = document.documentElement;
    const headerElement = document.querySelector('header#header');
    let headerHeight = headerElement ? headerElement.offsetHeight : 70;
    const loadingScreen = document.getElementById('loadingScreen');

    // --- Loading Screen ---
    if (loadingScreen) {
        // Use a class to hide, allowing for CSS transitions
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            // Optional: remove from DOM after transition
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }, 300);
    }

    // --- Smooth Scrolling ---
    const navLinks = document.querySelectorAll('nav ul li a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let targetId = this.getAttribute('href');
            let targetElement = document.querySelector(targetId);

            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });

                // Close mobile nav if open
                const navMenu = document.getElementById('navLinks');
                const navToggle = document.getElementById('navToggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (navToggle) navToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navLinks');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            this.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }

    // --- Dynamic Year for Footer ---
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- Active Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('main section[id]');
    const headerNavLinks = document.querySelectorAll('header nav ul li a'); // Ensure this matches your nav structure

    function changeLinkState() {
        let currentSectionId = '';
        const scrollOffset = headerHeight + 80; // Generous offset for when section is "active"

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - scrollOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });

        headerNavLinks.forEach(link => {
            link.classList.remove('active'); // Use a more descriptive class like 'active-nav-link'
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
        // Handle case for top of the page (e.g., hero section)
        if (currentSectionId === '' && headerNavLinks.length > 0 && window.scrollY < (sections[0] ? sections[0].offsetTop - scrollOffset : 100)) {
             if (headerNavLinks[0].getAttribute('href') === '#hero') { // Or your first section ID
                headerNavLinks[0].classList.add('active');
            }
        }
    }

    if (sections.length > 0 && headerNavLinks.length > 0) {
        setTimeout(changeLinkState, 150); // Initial check
        window.addEventListener('scroll', changeLinkState, { passive: true });
    }


    // --- Theme Toggle ---
    const themeToggleButton = document.getElementById('theme-toggle');

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        if (themeToggleButton) {
            themeToggleButton.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggleButton.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        }
        localStorage.setItem('theme', theme);

        // Re-initialize or update particle effects with new theme colors
        // Wrapped in a small timeout to ensure CSS variables are updated in the DOM
        setTimeout(() => {
            initGeneralParticles();
            initHeroPlexusEffect();
        }, 50);
    }

    function getCssVariable(variableName) {
        return getComputedStyle(htmlElement).getPropertyValue(variableName).trim();
    }

    // --- General Background Particles (particles.js) ---
    function initGeneralParticles() {
        if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;

        // Destroy existing instance if it exists (important for theme changes)
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom[0].pJS = null; // Clear reference
        }

        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        let particleColorValue = getCssVariable('--current-particle-color1'); // Defined in CSS for each theme
        const defaultParticleColorLight = '#333333';
        const defaultParticleColorDark = '#FFFFFF';

        if (!particleColorValue || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(particleColorValue)) {
            particleColorValue = currentTheme === 'dark' ? defaultParticleColorDark : defaultParticleColorLight;
        }

        particlesJS("particles-js", {
            "particles": {
                "number": {"value": currentTheme === 'dark' ? 40 : 60, "density": {"enable": true, "value_area": 800}},
                "color": {"value": particleColorValue },
                "shape": {"type": "circle"},
                "opacity": {"value": currentTheme === 'dark' ? 0.3 : 0.4, "random": true, "anim": {"enable": true, "speed": 0.5, "opacity_min": 0.05, "sync": false}},
                "size": {"value": currentTheme === 'dark' ? 1.5 : 2.5, "random": true},
                "line_linked": {"enable": false}, // Typically off for this general effect
                "move": {"enable": true, "speed": currentTheme === 'dark' ? 0.6 : 0.8, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false}
            },
            "interactivity": {"detect_on": "canvas", "events": {"onhover": {"enable": false}, "onclick": {"enable": false}, "resize": true}},
            "retina_detect": true
        });
    }


    // --- Hero Section Plexus Effect (Custom Canvas Animation) ---
    const heroPlexusCanvas = document.getElementById('hero-plexus-canvas');
    let ctxPlexus, particlesArrayPlexus = [], animationFrameIdPlexus;

    function initHeroPlexusEffect() {
        if (!heroPlexusCanvas) return;
        ctxPlexus = heroPlexusCanvas.getContext('2d');
        if (animationFrameIdPlexus) cancelAnimationFrame(animationFrameIdPlexus);

        setHeroCanvasSize(); // Set size first
        if (heroPlexusCanvas.width > 0 && heroPlexusCanvas.height > 0) {
            createPlexusParticles(); // Then create particles based on new size
            animatePlexusHero();
        }
    }

    function setHeroCanvasSize() {
        if (!heroPlexusCanvas) return;
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            // Set canvas to match the hero section's rendered size
            heroPlexusCanvas.width = heroSection.offsetWidth;
            heroPlexusCanvas.height = heroSection.offsetHeight;
        } else {
            // Fallback if hero section isn't found (though it should be)
            heroPlexusCanvas.width = window.innerWidth;
            heroPlexusCanvas.height = window.innerHeight;
        }
    }

    class ParticlePlexus {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
        }
        draw() {
            if (!ctxPlexus) return;
            ctxPlexus.beginPath(); ctxPlexus.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctxPlexus.fillStyle = this.color; ctxPlexus.fill();
        }
        update() {
            if (!heroPlexusCanvas || !ctxPlexus) return;
            if (this.x + this.size > heroPlexusCanvas.width || this.x - this.size < 0) this.directionX = -this.directionX;
            if (this.y + this.size > heroPlexusCanvas.height || this.y - this.size < 0) this.directionY = -this.directionY;
            this.x += this.directionX; this.y += this.directionY; this.draw();
        }
    }

    function createPlexusParticles() {
        if (!heroPlexusCanvas || heroPlexusCanvas.width === 0 || heroPlexusCanvas.height === 0 || !ctxPlexus) return;
        particlesArrayPlexus = []; // Clear existing particles

        const particleColor = getCssVariable('--current-plexus-particle');
        let numberOfParticles = (heroPlexusCanvas.width * heroPlexusCanvas.height) / 9000; // Density factor
        numberOfParticles = Math.max(20, Math.min(100, Math.floor(numberOfParticles))); // Cap particle count

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 1.2) + 0.3; // Slightly larger and more varied
            let x = Math.random() * heroPlexusCanvas.width;
            let y = Math.random() * heroPlexusCanvas.height;
            let directionX = (Math.random() * 0.2) - 0.1; // Slower movement
            let directionY = (Math.random() * 0.2) - 0.1;
            particlesArrayPlexus.push(new ParticlePlexus(x, y, directionX, directionY, size, particleColor));
        }
    }

    function connectPlexusLines() {
        if (!heroPlexusCanvas || !particlesArrayPlexus || !ctxPlexus || particlesArrayPlexus.length === 0) return;

        const lineColorWithOpacity = getCssVariable('--current-plexus-line'); // This should be an rgba value from CSS
        const maxDistance = Math.min(heroPlexusCanvas.width / 7, heroPlexusCanvas.height / 7, 120); // Connection distance

        // Extract base RGB from the CSS variable (e.g., "rgba(R,G,B,A)")
        const rgbMatch = lineColorWithOpacity.match(/rgba?\((\d+,\s*\d+,\s*\d+)(?:,\s*[\d.]+)?\)/);
        const baseRgbColor = rgbMatch && rgbMatch[1] ? rgbMatch[1] : '102,102,102'; // Fallback base color

        for (let a = 0; a < particlesArrayPlexus.length; a++) {
            for (let b = a + 1; b < particlesArrayPlexus.length; b++) {
                let dx = particlesArrayPlexus[a].x - particlesArrayPlexus[b].x;
                let dy = particlesArrayPlexus[a].y - particlesArrayPlexus[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = Math.max(0, (1 - (distance / maxDistance)) * 0.7); // Line opacity based on distance
                    ctxPlexus.strokeStyle = `rgba(${baseRgbColor}, ${opacity})`;
                    ctxPlexus.lineWidth = 0.3; // Thinner lines
                    ctxPlexus.beginPath();
                    ctxPlexus.moveTo(particlesArrayPlexus[a].x, particlesArrayPlexus[a].y);
                    ctxPlexus.lineTo(particlesArrayPlexus[b].x, particlesArrayPlexus[b].y);
                    ctxPlexus.stroke();
                }
            }
        }
    }

    function animatePlexusHero() {
        if (!heroPlexusCanvas || !particlesArrayPlexus || !ctxPlexus) return;
        animationFrameIdPlexus = requestAnimationFrame(animatePlexusHero);
        ctxPlexus.clearRect(0, 0, heroPlexusCanvas.width, heroPlexusCanvas.height);

        if (particlesArrayPlexus) { // Ensure array exists
            for (let i = 0; i < particlesArrayPlexus.length; i++) {
                particlesArrayPlexus[i].update();
            }
            connectPlexusLines();
        }
    }

    if (heroPlexusCanvas) {
        let resizeTimeoutPlexus;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeoutPlexus);
            resizeTimeoutPlexus = setTimeout(() => {
                if (animationFrameIdPlexus) cancelAnimationFrame(animationFrameIdPlexus); // Stop old animation
                initHeroPlexusEffect(); // Re-initialize completely on resize
            }, 250); // Debounce resize
        });
    }

    // --- Scroll Animations for Sections (Fade-in) ---
    const fadeElements = document.querySelectorAll('.fade-in'); // Your CSS should have .fade-in and .fade-in.visible
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the element is visible
    };

    const intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Add 'visible' class for CSS transition
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => intersectionObserver.observe(el));

    // --- Initial Theme Setup ---
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // Default to light
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Adjust header height on resize for smooth scrolling calculations
    let resizeTimeoutHeader;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeoutHeader);
        resizeTimeoutHeader = setTimeout(() => {
            if (headerElement) headerHeight = headerElement.offsetHeight;
        }, 100);
    });

});