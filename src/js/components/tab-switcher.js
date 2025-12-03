export class TabSwitcher {
  constructor() {
    this.instagramTab = document.getElementById('cta-instagram-feed');
    this.facebookTab = document.getElementById('cta-facebook-feed');
    this.tabContainer = document.getElementById('social-media-tabs');
    this.tabSlider = this.tabContainer?.querySelector('.tab-slider');
    
    this.instagramSections = [
      document.getElementById('stat-instagram'),
      document.querySelector('.instagram-embed')
    ].filter(Boolean);

    this.facebookSections = [
      document.getElementById('stat-facebook'),
      document.getElementById('spotlight-card'),
      document.querySelector('.community')
    ].filter(Boolean);

    this.currentPlatform = 'instagram';
    this.callbacks = new Map();
    this.isTransitioning = false;
  }

  initialize() {
    if (!this.instagramTab || !this.facebookTab || !this.tabContainer) {
      console.error('Tab elements not found');
      return;
    }

    this.setupEventListeners();
    this.showInstagram(); // Default to Instagram
  }

  setupEventListeners() {
    this.instagramTab.addEventListener('click', (e) => {
      e.preventDefault();
      this.showInstagram();
    });

    this.facebookTab.addEventListener('click', (e) => {
      e.preventDefault();
      this.showFacebook();
    });
  }

  showInstagram() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    this.setActiveTab(this.instagramTab, this.facebookTab);
    this.animateTabSlider('instagram');
    this.toggleSections(this.instagramSections, this.facebookSections);
    this.currentPlatform = 'instagram';
    
    // Trigger callback if registered
    const callback = this.callbacks.get('instagram');
    if (callback) callback();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  showFacebook() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    this.setActiveTab(this.facebookTab, this.instagramTab);
    this.animateTabSlider('facebook');
    this.toggleSections(this.facebookSections, this.instagramSections);
    this.currentPlatform = 'facebook';
    
    // Trigger callback if registered
    const callback = this.callbacks.get('facebook');
    if (callback) callback();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  setActiveTab(activeTab, inactiveTab) {
    activeTab.classList.add('active');
    inactiveTab.classList.remove('active');
  }

  toggleSections(sectionsToShow, sectionsToHide) {
    // Fade out sections to hide
    sectionsToHide.forEach(section => {
      if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(10px)';
        section.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
          section.style.display = 'none';
          section.classList.remove('active');
        }, 300);
      }
    });

    // Show and fade in sections to display
    sectionsToShow.forEach(section => {
      if (section) {
        section.style.display = '';
        section.classList.add('active');
        
        // Force reflow
        section.offsetHeight;
        
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.style.transition = 'all 0.3s ease-out';
      }
    });
  }

  animateTabSlider(platform) {
    if (!this.tabSlider) return;
    
    const containerRect = this.tabContainer.getBoundingClientRect();
    const activeTab = platform === 'instagram' ? this.instagramTab : this.facebookTab;
    const tabRect = activeTab.getBoundingClientRect();
    
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;
    
    this.tabSlider.style.left = `${left}px`;
    this.tabSlider.style.width = `${width}px`;
  }

  getCurrentPlatform() {
    return this.currentPlatform;
  }

  // Register callbacks for tab changes
  onTabChange(platform, callback) {
    this.callbacks.set(platform, callback);
  }

  // Programmatic tab switching
  switchToPlatform(platform) {
    if (platform === 'instagram') {
      this.showInstagram();
    } else if (platform === 'facebook') {
      this.showFacebook();
    }
  }
}