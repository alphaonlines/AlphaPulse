import { FacebookService } from '../services/facebook-service.js';
import { InstagramService } from '../services/instagram-service.js';
import { CounterManager } from './stat-counter.js';
import { LoadingStates } from './loading-states.js';
import { TabSwitcher } from './tab-switcher.js';
import { DataVisualization } from './data-visualization.js';
import { timeFormatter, errorHandler } from '../utils/helpers.js';
import { API_CONFIG } from '../config/api-config.js';

export class DashboardManager {
  constructor() {
    this.facebookService = new FacebookService();
    this.instagramService = new InstagramService();
    this.counterManager = new CounterManager();
    this.loadingStates = new LoadingStates();
    this.tabSwitcher = new TabSwitcher();
    this.dataViz = new DataVisualization();

    this.latestPosts = [];
    this.refreshInterval = null;
    this.tabRotationInterval = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize components
      this.counterManager.initialize();
      this.tabSwitcher.initialize();
      this.dataViz.initialize();
      this.dataViz.addInteractiveEffects();
      
      // Set up tab change callbacks
      this.tabSwitcher.onTabChange('instagram', () => this.loadInstagramData());
      this.tabSwitcher.onTabChange('facebook', () => this.loadFacebookData());

      // Load initial data
      await this.loadInitialData();
      
      // Set up auto-refresh
      this.setupAutoRefresh();
      
      // Update timestamp
      this.updateTimestamp();
      this.updateEngagementRate();
      
      this.isInitialized = true;
      console.log('Dashboard initialized successfully');
      
    } catch (error) {
      errorHandler.handle(error, 'dashboard initialization');
    }
  }

  async loadInitialData() {
    await Promise.all([this.loadFacebookData(), this.loadInstagramData()]);

    this.setupTabRotation();
  }

  async loadFacebookData() {
    let statusMessage;

    try {
      this.loadingStates.setGlobalLoading(true);
      this.loadingStates.setLoadingState('spotlight-card', true);
      this.loadingStates.setLoadingState('latest-grid', true);
      this.loadingStates.setLoadingState('leaderboard-list', true);

      const data = await this.facebookService.getAllData();

      if (data.isFallback) {
        statusMessage = 'Demo mode: showing sample Facebook data';
      }

      // Update follower count
      if (data.pageInfo.fan_count) {
        const facebookElement = document.querySelector('#stat-facebook .stat-value');
        if (facebookElement) {
          facebookElement.setAttribute('data-count', data.pageInfo.fan_count);
          this.counterManager.updateCounter(facebookElement, data.pageInfo.fan_count);
        }
      }

      // Update total community count
      this.updateTotalCount();

      // Update sections if we have posts
      if (data.posts.length > 0) {
        this.updateSpotlightCard(data.posts[0], 'facebook');
        const facebookPosts = this.transformFacebookPosts(data.posts);
        this.mergeLatestPosts(facebookPosts, 'facebook');
        this.updateLeaderboard(data.posts);
      }

      this.loadingStates.setLoadingState('spotlight-card', false);
      this.loadingStates.setLoadingState('latest-grid', false);
      this.loadingStates.setLoadingState('leaderboard-list', false);

    } catch (error) {
      errorHandler.handle(error, 'Facebook data');
      this.loadingStates.setErrorState('spotlight-card', 'Unable to load Facebook data');
      this.loadingStates.setErrorState('latest-grid', 'Unable to load Facebook posts');
      this.loadingStates.setErrorState('leaderboard-list', 'Unable to load Facebook interactions');
    } finally {
      this.loadingStates.setGlobalLoading(false, statusMessage);
    }
  }

  async loadInstagramData() {
    let statusMessage;

    try {
      this.loadingStates.setGlobalLoading(true);
      this.loadingStates.setLoadingState('latest-grid', true);

      const data = await this.instagramService.getAllData();

      if (data.isFallback) {
        statusMessage = 'Demo mode: showing sample Instagram data';
      }
      
      // Update media count (Instagram doesn't provide follower count via Basic Display API)
      if (data.userInfo.media_count) {
        const instagramElement = document.querySelector('#stat-instagram .stat-value');
        if (instagramElement) {
          instagramElement.setAttribute('data-count', data.userInfo.media_count);
          this.counterManager.updateCounter(instagramElement, data.userInfo.media_count);
        }
      }

      // Update total community count
      this.updateTotalCount();

      // Update latest posts grid with Instagram media
      if (data.media.length > 0) {
        const instagramPosts = this.transformInstagramMedia(data.media);
        this.mergeLatestPosts(instagramPosts, 'instagram');
      }

    } catch (error) {
      errorHandler.handle(error, 'Instagram data');
    } finally {
      this.loadingStates.setLoadingState('latest-grid', false);
      this.loadingStates.setGlobalLoading(false, statusMessage);
    }
  }

  updateSpotlightCard(post, platform) {
    const spotlightCard = document.getElementById('spotlight-card');
    if (!spotlightCard) return;

    const interactions = this.facebookService.calculateInteractions(post);
    
    spotlightCard.innerHTML = `
      <div class="spotlight-media">
        <img src="${post.full_picture || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'}" alt="Spotlight Post">
        <div class="spotlight-overlay"></div>
      </div>
      <div class="spotlight-content">
        <span class="platform-pill">${platform}</span>
        <h3>Furniture Distributors</h3>
        <p>${post.message || 'Discover the latest updates and stories from Furniture Distributors, your trusted partner in quality furniture solutions.'}</p>
        <div class="latest-metrics">
          <div class="metric">
            <span>❤️</span>
            <span>${post.likes?.summary?.total_count || 0}</span>
          </div>
          <div class="metric">
            <span>💬</span>
            <span>${post.comments?.summary?.total_count || 0}</span>
          </div>
          <div class="metric">
            <span>🔄</span>
            <span>${post.shares?.count || 0}</span>
          </div>
        </div>
        <div class="spotlight-actions">
          <a href="${this.facebookService.generatePostUrl(post.id)}" target="_blank" class="btn btn-primary">View Post</a>
          <a href="#" class="btn btn-secondary">Share</a>
        </div>
      </div>
    `;
  }

  updateLeaderboard(posts) {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    leaderboardList.innerHTML = '';

    const sortedPosts = [...posts].sort((a, b) => {
      const interactionsA = this.facebookService.calculateInteractions(a);
      const interactionsB = this.facebookService.calculateInteractions(b);
      return interactionsB - interactionsA;
    });

    sortedPosts.slice(0, 5).forEach((post, index) => {
      const interactions = this.facebookService.calculateInteractions(post);
      const postDate = new Date(post.created_time);
      
      const listItem = document.createElement('li');
      listItem.classList.add('leaderboard-item');
      
      // Determine rank class
      let rankClass = 'default';
      if (index === 0) rankClass = 'gold';
      else if (index === 1) rankClass = 'silver';
      else if (index === 2) rankClass = 'bronze';
      
      listItem.innerHTML = `
        <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
        <div class="leaderboard-content">
          <h4>${post.message ? post.message.substring(0, 60) + '...' : 'Furniture Distributors Post'}</h4>
          <p>${timeFormatter.timeAgo(postDate)}</p>
        </div>
        <div class="leaderboard-meta">
          <div class="leaderboard-interactions">${interactions}</div>
          <div class="leaderboard-platform">Facebook</div>
        </div>
      `;
      leaderboardList.appendChild(listItem);
    });
  }

  updateTotalCount() {
    const instagramElement = document.querySelector('#stat-instagram .stat-value');
    const facebookElement = document.querySelector('#stat-facebook .stat-value');
    const totalElement = document.querySelector('#stat-total .stat-value');

    if (instagramElement && facebookElement && totalElement) {
      const instagramCount = parseInt(instagramElement.getAttribute('data-count')) || 0;
      const facebookCount = parseInt(facebookElement.getAttribute('data-count')) || 0;
      const total = instagramCount + facebookCount;
      
      totalElement.setAttribute('data-count', total);
      this.counterManager.updateCounter(totalElement, total);

      this.updatePlatformSplit(instagramCount, facebookCount);

      // Update progress ring toward a simple community goal
      const COMMUNITY_GOAL = 3000;
      const progressPercent = Math.min(100, Math.round((total / COMMUNITY_GOAL) * 100));

      if (this.dataViz && this.dataViz.charts.has('total-progress')) {
        this.dataViz.animateValue('total-progress', progressPercent);
      }
    }
  }

  updatePlatformSplit(instagramCount, facebookCount) {
    const splitPill = document.querySelector('.insight-pill.split');
    if (!splitPill) return;

    const total = instagramCount + facebookCount;
    if (!total) return;

    const igPercent = Math.round((instagramCount / total) * 100);
    const fbPercent = 100 - igPercent;

    const igBar = splitPill.querySelector('.pill-bar .bar.instagram');
    const fbBar = splitPill.querySelector('.pill-bar .bar.facebook');
    const igLabel = splitPill.querySelector('.pill-meta span:nth-child(1)');
    const fbLabel = splitPill.querySelector('.pill-meta span:nth-child(2)');

    if (igBar) igBar.style.width = `${igPercent}%`;
    if (fbBar) fbBar.style.width = `${fbPercent}%`;
    if (igLabel) igLabel.textContent = `IG ${igPercent}%`;
    if (fbLabel) fbLabel.textContent = `FB ${fbPercent}%`;
  }

  updateTimestamp() {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.innerText = `Last updated: ${timeFormatter.formatTimestamp(now)}`;
    }
  }

  updateEngagementRate() {
    const engagementValueElement = document.querySelector('.metric-block .metric-value');
    const engagementTrendElement = document.querySelector('.metric-block .metric-trend');
    const instagramElement = document.querySelector('#stat-instagram .stat-value');
    const facebookElement = document.querySelector('#stat-facebook .stat-value');

    if (!engagementValueElement || !engagementTrendElement || !instagramElement || !facebookElement) {
      return;
    }

    const instagramCount = parseInt(instagramElement.getAttribute('data-count')) || 0;
    const facebookCount = parseInt(facebookElement.getAttribute('data-count')) || 0;
    const total = instagramCount + facebookCount;

    if (!total) {
      engagementValueElement.textContent = '—';
      engagementTrendElement.textContent = '';
      return;
    }

    // Simple engagement proxy: ratio of Instagram posts to total community footprint
    const engagementPercent = Math.max(1, Math.min(99, Math.round((instagramCount / total) * 100)));
    engagementValueElement.textContent = `${engagementPercent}%`;
    engagementTrendElement.textContent = 'Live share of Instagram';
  }

  setupAutoRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Set up new interval
    this.refreshInterval = setInterval(() => {
      const currentPlatform = this.tabSwitcher.getCurrentPlatform();
      
      if (currentPlatform === 'facebook') {
        this.loadFacebookData();
      } else {
        this.loadInstagramData();
      }
      
      this.updateTimestamp();
      this.updateEngagementRate();
    }, API_CONFIG.REFRESH_INTERVAL);
  }

  setupTabRotation() {
    const ROTATION_INTERVAL = 30000; // 30 seconds for kiosk mode

    if (this.tabRotationInterval) {
      clearInterval(this.tabRotationInterval);
    }

    this.tabRotationInterval = setInterval(() => {
      const currentPlatform = this.tabSwitcher.getCurrentPlatform();
      const nextPlatform = currentPlatform === 'instagram' ? 'facebook' : 'instagram';
      this.tabSwitcher.switchToPlatform(nextPlatform);
    }, ROTATION_INTERVAL);
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.tabRotationInterval) {
      clearInterval(this.tabRotationInterval);
    }
  }

  transformFacebookPosts(posts) {
    return posts.slice(0, 6).map(post => ({
      id: post.id,
      platform: 'facebook',
      platformLabel: 'Facebook',
      caption: post.message || 'Furniture Distributors update',
      image: post.full_picture || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
      timestamp: post.created_time,
      metrics: {
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0
      }
    }));
  }

  transformInstagramMedia(mediaItems) {
    return mediaItems
      .filter(item => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
      .slice(0, 6)
      .map(item => ({
        id: item.id,
        platform: 'instagram',
        platformLabel: 'Instagram',
        caption: item.caption || 'Instagram highlight from Furniture Distributors',
        image: item.media_url,
        timestamp: item.timestamp,
        metrics: {
          likes: item.like_count || 0,
          comments: item.comments_count || 0,
          shares: null
        }
      }));
  }

  mergeLatestPosts(newPosts, platform) {
    const filteredExisting = this.latestPosts.filter(post => post.platform !== platform);
    this.latestPosts = [...filteredExisting, ...newPosts].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    this.renderLatestPostsGrid();
  }

  renderLatestPostsGrid() {
    const latestGrid = document.getElementById('latest-grid');
    if (!latestGrid) return;

    latestGrid.innerHTML = '';

    const postsToRender = this.latestPosts.slice(0, 6);

    if (!postsToRender.length) {
      latestGrid.innerHTML = '<div class="loading-indicator">Awaiting new posts...</div>';
      return;
    }

    postsToRender.forEach(post => {
      const postDate = new Date(post.timestamp);
      const card = document.createElement('article');
      card.classList.add('latest-card');

      const captionSnippet = post.caption.length > 140
        ? `${post.caption.substring(0, 140)}...`
        : post.caption;

      card.innerHTML = `
        <span class="platform-pill ${post.platform}">${post.platformLabel}</span>
        <h3>Furniture Distributors</h3>
        <p>${captionSnippet}</p>
        <div class="latest-media">
          <img src="${post.image}" alt="${post.platformLabel} post visual">
        </div>
        <div class="latest-meta">
          <span class="latest-timestamp">${timeFormatter.timeAgo(postDate)}</span>
        </div>
        <div class="latest-metrics">
          <div class="metric">
            <span>❤️</span>
            <span>${post.metrics.likes}</span>
          </div>
          <div class="metric">
            <span>💬</span>
            <span>${post.metrics.comments}</span>
          </div>
          ${post.metrics.shares !== null ? `
          <div class="metric">
            <span>🔄</span>
            <span>${post.metrics.shares}</span>
          </div>` : ''}
        </div>
      `;

      latestGrid.appendChild(card);
    });
  }
}
