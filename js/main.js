document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const carouselSlideWrapper = document.getElementById('carouselSlideWrapper');
    const prevSlideBtn = document.getElementById('prevSlide');
    const nextSlideBtn = document.getElementById('nextSlide');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const articlesGridContent = document.getElementById('articlesGridContent');
    const currentYearSpan = document.getElementById('currentYear');

    // --- State Variables ---
    let articlesData = []; // Will be populated by fetching JSON
    let currentSlideIndex = 0;
    let autoSlideInterval;
    const autoSlideDelay = 7000; // 7 seconds for auto-slide

    // --- Helper Functions ---

    /**
     * Updates the visual position of the carousel slides.
     */
    function updateCarouselPosition() {
        if (!carouselSlideWrapper || articlesData.length === 0) return;
        const offset = -currentSlideIndex * 100;
        carouselSlideWrapper.style.transform = `translateX(${offset}%)`;
        updateIndicatorDots();
    }

    /**
     * Updates the active state of indicator dots.
     */
    function updateIndicatorDots() {
        if (!carouselIndicators || articlesData.length === 0) return;
        const dots = carouselIndicators.querySelectorAll('.indicator-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlideIndex);
            dot.setAttribute('aria-current', index === currentSlideIndex ? 'true' : 'false');
        });
    }

    /**
     * Clears and restarts the auto-slide timer.
     */
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    /**
     * Shows a loading message in a specified container.
     * @param {HTMLElement} container - The container to show the loading message in.
     * @param {string} message - The message to display.
     */
    function showLoadingMessage(container, message = "Loading...") {
        if (!container) return;
        container.innerHTML = `
            <div class="loading-spinner-container ${container.id === 'articlesGridContent' ? 'full-grid-width' : ''}">
                <div class="loading-spinner"></div>
                <p class="text-sm text-neutral-600 mt-2">${message}</p>
            </div>`;
    }

    /**
     * Shows an error message in a specified container.
     * @param {HTMLElement} container - The container to show the error message in.
     * @param {string} message - The error message to display.
     */
    function showErrorMessage(container, message = "Could not load content.") {
        if (!container) return;
        let fullWidthClass = '';
        if (container.classList.contains('articles-grid') || container.id === 'articlesGridContent') {
            fullWidthClass = 'full-grid-width';
        }
        container.innerHTML = `<div class="error-message ${fullWidthClass}">${message}</div>`;
    }


    // --- Carousel Logic ---

    /**
     * Renders the carousel slides and indicators based on articlesData.
     */
    function renderCarouselSlides() {
        if (!carouselSlideWrapper || !carouselIndicators) {
            console.warn("Carousel elements not found.");
            return;
        }

        if (articlesData.length === 0) {
            showErrorMessage(carouselSlideWrapper, 'No featured articles available at the moment.');
            if(prevSlideBtn) prevSlideBtn.style.display = 'none';
            if(nextSlideBtn) nextSlideBtn.style.display = 'none';
            if(carouselIndicators) carouselIndicators.style.display = 'none';
            return;
        }

        carouselSlideWrapper.innerHTML = ''; // Clear existing (e.g., loading message)
        carouselIndicators.innerHTML = ''; // Clear existing indicators

        articlesData.forEach((article, index) => {
            // Create slide
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('carousel-slide');
            slideDiv.setAttribute('role', 'group');
            slideDiv.setAttribute('aria-label', `Slide ${index + 1} of ${articlesData.length}: ${article.title}`);
            slideDiv.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.summary}</p>
                <a href="${article.url}">Read More &rarr;</a>
            `;
            carouselSlideWrapper.appendChild(slideDiv);

            // Create indicator dot
            const dot = document.createElement('button');
            dot.classList.add('indicator-dot');
            dot.setAttribute('type', 'button');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${article.title}`);
            dot.addEventListener('click', () => {
                currentSlideIndex = index;
                updateCarouselPosition();
                resetAutoSlide();
            });
            carouselIndicators.appendChild(dot);
        });

        if(prevSlideBtn) prevSlideBtn.style.display = articlesData.length > 1 ? 'block' : 'none';
        if(nextSlideBtn) nextSlideBtn.style.display = articlesData.length > 1 ? 'block' : 'none';
        if(carouselIndicators) carouselIndicators.style.display = articlesData.length > 1 ? 'flex' : 'none';
        
        updateCarouselPosition(); // Set initial position
        updateIndicatorDots(); // Ensure dots are updated correctly
    }

    /**
     * Shows the next slide in the carousel.
     */
    function showNextSlide() {
        if (articlesData.length === 0) return;
        currentSlideIndex = (currentSlideIndex + 1) % articlesData.length;
        updateCarouselPosition();
    }

    /**
     * Shows the previous slide in the carousel.
     */
    function showPrevSlide() {
        if (articlesData.length === 0) return;
        currentSlideIndex = (currentSlideIndex - 1 + articlesData.length) % articlesData.length;
        updateCarouselPosition();
    }

    /**
     * Starts the automatic sliding of the carousel.
     */
    function startAutoSlide() {
        if (articlesData.length > 1) { 
            autoSlideInterval = setInterval(showNextSlide, autoSlideDelay);
        }
    }
    
    // --- Article Grid Logic ---

    /**
     * Renders article tiles in the grid based on articlesData.
     */
    function renderArticleTiles() {
        if (!articlesGridContent) {
            console.warn("Articles grid content area not found.");
            return;
        }

        if (articlesData.length === 0) {
            showErrorMessage(articlesGridContent, 'No articles available at the moment. Please check back later.');
            return;
        }
        
        articlesGridContent.innerHTML = ''; // Clear existing (e.g., loading message)
        articlesData.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.classList.add('article-card');
            articleCard.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <a href="${article.url}">Learn More &rarr;</a>
            `;
            articlesGridContent.appendChild(articleCard);
        });
    }

    // --- Footer Logic ---
    /**
     * Sets the current year in the footer.
     */
    function setCurrentFooterYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- Data Fetching ---
    /**
     * Fetches article data from articles.json.
     */
    async function fetchArticlesData() {
        // Show loading messages while fetching
        if (carouselSlideWrapper) showLoadingMessage(carouselSlideWrapper, "Loading featured articles...");
        if (articlesGridContent) showLoadingMessage(articlesGridContent, "Loading articles...");

        try {
            const response = await fetch('js/articles.json'); // Path relative to index.html
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            articlesData = await response.json();
            // Successfully fetched data, now render it
            renderCarouselSlides();
            renderArticleTiles();
            
            if (articlesData.length > 0) {
                startAutoSlide(); // Start auto-slide only if there's data and more than one slide
                 // Add event listeners only after data is loaded and elements are rendered
                if (prevSlideBtn) {
                    prevSlideBtn.addEventListener('click', () => {
                        showPrevSlide();
                        resetAutoSlide(); 
                    });
                }
                if (nextSlideBtn) {
                    nextSlideBtn.addEventListener('click', () => {
                        showNextSlide();
                        resetAutoSlide(); 
                    });
                }
                if (carouselSlideWrapper) {
                    carouselSlideWrapper.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
                    carouselSlideWrapper.addEventListener('mouseleave', startAutoSlide);
                }
            }

        } catch (error) {
            console.error("Error fetching articles data:", error);
            if (carouselSlideWrapper) showErrorMessage(carouselSlideWrapper, "Could not load featured articles. Please try again later.");
            if (articlesGridContent) showErrorMessage(articlesGridContent, "Could not load articles. Please try again later.");
            // Hide carousel controls on error
            if(prevSlideBtn) prevSlideBtn.style.display = 'none';
            if(nextSlideBtn) nextSlideBtn.style.display = 'none';
            if(carouselIndicators) carouselIndicators.style.display = 'none';
        }
    }


    // --- Initialization and Event Listeners ---
    async function init() {
        setCurrentFooterYear();
        await fetchArticlesData(); // Fetch data and then render

        // Global event listeners that don't depend on fetched data
        document.addEventListener('keydown', (e) => {
            if (articlesData.length > 0) { // Only enable keyboard nav if there's data
                if (e.key === 'ArrowLeft') {
                    if (document.activeElement === prevSlideBtn || 
                        document.activeElement === nextSlideBtn || 
                        carouselSlideWrapper.contains(document.activeElement) || 
                        carouselIndicators.contains(document.activeElement)
                    ) {
                        showPrevSlide();
                        resetAutoSlide();
                    }
                } else if (e.key === 'ArrowRight') {
                     if (document.activeElement === prevSlideBtn || 
                        document.activeElement === nextSlideBtn || 
                        carouselSlideWrapper.contains(document.activeElement) || 
                        carouselIndicators.contains(document.activeElement)
                    ) {
                        showNextSlide();
                        resetAutoSlide();
                    }
                }
            }
        });

        const ctaButton = document.querySelector('.cta-button[href="#articlesGridSection"]');
        if (ctaButton) {
            ctaButton.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // Run initialization
    init();
});
