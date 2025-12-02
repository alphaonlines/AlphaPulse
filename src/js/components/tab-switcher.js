export class TabSwitcher {
  constructor() {
    this.instagramTab = document.getElementById('cta-instagram-feed');
    this.facebookTab = document.getElementById('cta-facebook-feed');
    this.tabContainer = document.getElementById('social-media-tabs');
    
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
    this.setActiveTab(this.instagramTab, this.facebookTab);
    this.toggleSections(this.instagramSections, this.facebookSections);
    this.currentPlatform = 'instagram';
    
    // Trigger callback if registered
    const callback = this.callbacks.get('instagram');
    if (callback) callback();
  }

  showFacebook() {
    this.setActiveTab(this.facebookTab, this.instagramTab);
    this.toggleSections(this.facebookSections, this.instagramSections);
    this.currentPlatform = 'facebook';
    
    // Trigger callback if registered
    const callback = this.callbacks.get('facebook');
    if (callback) callback();
  }

  setActiveTab(activeTab, inactiveTab) {
    activeTab.classList.add('active');
    inactiveTab.classList.remove('active');
  }

  toggleSections(sectionsToShow, sectionsToHide) {
    sectionsToShow.forEach(section => {
      if (section) {
        section.style.display = '';
        section.classList.add('active');
      }
    });

    sectionsToHide.forEach(section => {
      if (section) {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });
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