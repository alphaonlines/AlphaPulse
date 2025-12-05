import { FacebookService } from '../services/facebook-service.js';
import { InstagramService } from '../services/instagram-service.js';
import { CounterManager } from './stat-counter.js';
import { LoadingStates } from './loading-states.js';
import { TabSwitcher } from './tab-switcher.js';
import { DataVisualization } from './data-visualization.js';
import { CollapsibleSections } from './collapsible-sections.js';
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
    this.collapsibleSections = new CollapsibleSections();

    this.latestPosts = [];
    this.facebookPostsRaw = [];
    this.instagramMediaRaw = [];
    this.likesHistory = [];
    this.likeWindowDays = 14;
    this.dataStatus = {
      facebook: 'Pending live fetch',
      instagram: 'Pending live fetch'
    };
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
      this.collapsibleSections.initialize();
      
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
      this.updateStatusBanner();
      
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
    try {
      this.loadingStates.setGlobalLoading(true);
      this.loadingStates.setLoadingState('latest-grid', true);

      const data = await this.facebookService.getAllData();
      this.dataStatus.facebook = data.isFallback
        ? this.describeFallback('facebook', data.fallbackReason)
        : 'Live Graph API data';

      // Update follower count
      const facebookFollowers = this.getFacebookFollowers(data.pageInfo);
      const facebookElement = document.querySelector('#stat-facebook .stat-value');
      if (facebookElement) {
        facebookElement.setAttribute('data-count', facebookFollowers);
        this.counterManager.updateCounter(facebookElement, facebookFollowers);
      }

      this.facebookPostsRaw = data.posts || [];

      // Update total community count
      this.updateTotalCount();

      // Update sections if we have posts
      if (data.posts.length > 0) {
        const facebookPosts = this.transformFacebookPosts(data.posts);
        this.mergeLatestPosts(facebookPosts, 'facebook');
      }

      this.refreshLikeHistory();

      this.loadingStates.setLoadingState('latest-grid', false);

    } catch (error) {
      errorHandler.handle(error, 'Facebook data');
      this.dataStatus.facebook = 'Error contacting Facebook API';
      this.loadingStates.setErrorState('latest-grid', 'Unable to load Facebook posts');
    } finally {
      this.loadingStates.setGlobalLoading(false);
      this.updateStatusBanner();
    }
  }

  async loadInstagramData() {
    try {
      this.loadingStates.setGlobalLoading(true);
      this.loadingStates.setLoadingState('latest-grid', true);

      const data = await this.instagramService.getAllData();
      this.dataStatus.instagram = data.isFallback
        ? this.describeFallback('instagram', data.fallbackReason)
        : 'Live Graph API data';

      // Update follower count (fall back to media count if follower data is unavailable)
      const instagramFollowers = this.getInstagramFollowers(data.userInfo);
      const instagramElement = document.querySelector('#stat-instagram .stat-value');
      if (instagramElement) {
        instagramElement.setAttribute('data-count', instagramFollowers);
        this.counterManager.updateCounter(instagramElement, instagramFollowers);
      }

      this.instagramMediaRaw = data.media || [];

      // Update total community count
      this.updateTotalCount();

      // Update latest posts grid with Instagram media
      if (data.media.length > 0) {
        const instagramPosts = this.transformInstagramMedia(data.media);
        this.mergeLatestPosts(instagramPosts, 'instagram');
      }

      this.refreshLikeHistory();

    } catch (error) {
      errorHandler.handle(error, 'Instagram data');
      this.dataStatus.instagram = 'Error contacting Instagram API';
    } finally {
      this.loadingStates.setLoadingState('latest-grid', false);
      this.loadingStates.setGlobalLoading(false);
      this.updateStatusBanner();
    }
  }

  updateTotalCount() {
    const instagramElement = document.querySelector('#stat-instagram .stat-value');
    const facebookElement = document.querySelector('#stat-facebook .stat-value');
    const totalElement = document.querySelector('#stat-total .stat-value');
    const followerTotalElement = document.getElementById('follower-total');

    if (instagramElement && facebookElement && totalElement) {
      const instagramCount = parseInt(instagramElement.getAttribute('data-count')) || 0;
      const facebookCount = parseInt(facebookElement.getAttribute('data-count')) || 0;
      const total = instagramCount + facebookCount;

      totalElement.setAttribute('data-count', total);
      this.counterManager.updateCounter(totalElement, total);

      if (followerTotalElement) {
        followerTotalElement.textContent = total.toLocaleString();
      }

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

  getInstagramFollowers(userInfo = {}) {
    return userInfo.followers_count || userInfo.followers || userInfo.media_count || 0;
  }

  getFacebookFollowers(pageInfo = {}) {
    return pageInfo.followers_count || pageInfo.fan_count || 0;
  }

  refreshLikeHistory() {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const timeline = Array.from({ length: this.likeWindowDays }, () => 0);

    const bucketLikes = (timestamp, likes) => {
      if (!timestamp) return;
      const dayDiff = Math.floor((now - new Date(timestamp)) / dayMs);

      if (dayDiff >= 0 && dayDiff < this.likeWindowDays) {
        const bucketIndex = this.likeWindowDays - 1 - dayDiff;
        timeline[bucketIndex] += likes;
      }
    };

    this.facebookPostsRaw.forEach(post => {
      const likes = post.likes?.summary?.total_count || 0;
      bucketLikes(post.created_time, likes);
    });

    this.instagramMediaRaw.forEach(media => {
      const likes = media.like_count || 0;
      bucketLikes(media.timestamp, likes);
    });

    this.likesHistory = timeline;
    this.updateLikesSummary(timeline);
    this.dataViz.renderLikesChart(timeline);
  }

  updateLikesSummary(timeline) {
    if (!timeline.length) return;

    const totalLikes = timeline.reduce((sum, value) => sum + value, 0);
    const averageLikes = totalLikes / timeline.length;
    const peakLikes = Math.max(...timeline);
    const latestLikes = timeline[timeline.length - 1];

    const averageElement = document.getElementById('likes-average');
    const peakElement = document.getElementById('likes-peak');
    const latestElement = document.getElementById('likes-latest');

    if (averageElement) {
      averageElement.textContent = averageLikes.toFixed(1);
    }

    if (peakElement) {
      peakElement.textContent = peakLikes.toLocaleString();
    }

    if (latestElement) {
      latestElement.textContent = latestLikes.toLocaleString();
    }
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

  describeFallback(platform, reason) {
    const platformLabel = platform === 'facebook' ? 'Facebook' : 'Instagram';

    if (reason === 'missing-credentials') {
      return `${platformLabel} demo data (add credentials to go live)`;
    }

    if (reason === 'api-error') {
      return `${platformLabel} demo data (API error)`;
    }

    return `${platformLabel} demo data`;
  }

  composeStatusMessage() {
    const parts = [];

    if (this.dataStatus.facebook) {
      parts.push(`Facebook: ${this.dataStatus.facebook}`);
    }

    if (this.dataStatus.instagram) {
      parts.push(`Instagram: ${this.dataStatus.instagram}`);
    }

    const summary = parts.join(' · ');
    return summary
      ? `${summary} · Auto-refresh every 5 minutes`
      : 'Live data active · Auto-refresh every 5 minutes';
  }

  updateStatusBanner() {
    const message = this.composeStatusMessage();
    this.loadingStates.setStatusMessage(message);
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
