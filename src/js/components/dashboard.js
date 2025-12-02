import { FacebookService } from '../services/facebook-service.js';
import { InstagramService } from '../services/instagram-service.js';
import { CounterManager } from './stat-counter.js';
import { LoadingStates } from './loading-states.js';
import { TabSwitcher } from './tab-switcher.js';
import { timeFormatter, errorHandler } from '../utils/helpers.js';
import { API_CONFIG } from '../config/api-config.js';

export class DashboardManager {
  constructor() {
    this.facebookService = new FacebookService();
    this.instagramService = new InstagramService();
    this.counterManager = new CounterManager();
    this.loadingStates = new LoadingStates();
    this.tabSwitcher = new TabSwitcher();
    
    this.refreshInterval = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize components
      this.counterManager.initialize();
      this.tabSwitcher.initialize();
      
      // Set up tab change callbacks
      this.tabSwitcher.onTabChange('instagram', () => this.loadInstagramData());
      this.tabSwitcher.onTabChange('facebook', () => this.loadFacebookData());
      
      // Load initial data
      await this.loadInitialData();
      
      // Set up auto-refresh
      this.setupAutoRefresh();
      
      // Update timestamp
      this.updateTimestamp();
      
      this.isInitialized = true;
      console.log('Dashboard initialized successfully');
      
    } catch (error) {
      errorHandler.handle(error, 'dashboard initialization');
    }
  }

  async loadInitialData() {
    const currentPlatform = this.tabSwitcher.getCurrentPlatform();
    
    if (currentPlatform === 'instagram') {
      await this.loadInstagramData();
    } else {
      await this.loadFacebookData();
    }
  }

  async loadFacebookData() {
    try {
      this.loadingStates.setGlobalLoading(true);
      this.loadingStates.setLoadingState('spotlight-card', true);
      this.loadingStates.setLoadingState('latest-grid', true);
      this.loadingStates.setLoadingState('leaderboard-list', true);

      const data = await this.facebookService.getAllData();
      
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
        this.updateLatestGrid(data.posts, 'facebook');
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
      this.loadingStates.setGlobalLoading(false);
    }
  }

  async loadInstagramData() {
    try {
      this.loadingStates.setGlobalLoading(true);

      const data = await this.instagramService.getAllData();
      
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

      // Update Instagram embed section
      if (data.media.length > 0) {
        this.updateInstagramEmbed(data.media[0]);
      }

    } catch (error) {
      errorHandler.handle(error, 'Instagram data');
    } finally {
      this.loadingStates.setGlobalLoading(false);
    }
  }

  updateSpotlightCard(post, platform) {
    const spotlightCard = document.getElementById('spotlight-card');
    if (!spotlightCard) return;

    const interactions = this.facebookService.calculateInteractions(post);
    
    spotlightCard.innerHTML = `
      <div class="spotlight-media">
        <img src="${post.full_picture || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'}" alt="Spotlight Post">
      </div>
      <div class="spotlight-content">
        <span class="platform-pill">${platform}</span>
        <h3>Furniture Distributors</h3>
        <p>${post.message || 'Latest update from Furniture Distributors.'}</p>
        <div class="metric-row">
          <div class="metric">${post.likes?.summary?.total_count || 0} Likes</div>
          <div class="metric">${post.comments?.summary?.total_count || 0} Comments</div>
          <div class="metric">${post.shares?.count || 0} Shares</div>
        </div>
        <div class="spotlight-actions">
          <a href="${this.facebookService.generatePostUrl(post.id)}" target="_blank">View Post →</a>
        </div>
      </div>
    `;
  }

  updateLatestGrid(posts, platform) {
    const latestGrid = document.getElementById('latest-grid');
    if (!latestGrid) return;

    latestGrid.innerHTML = '';

    posts.forEach(post => {
      const postDate = new Date(post.created_time);
      const postElement = document.createElement('article');
      postElement.classList.add('latest-card');
      postElement.innerHTML = `
        <span class="platform-pill">${platform}</span>
        <h3>Furniture Distributors</h3>
        <p>${post.message || 'Click to view post.'}</p>
        <div class="post-timestamp">${timeFormatter.timeAgo(postDate)}</div>
        <a href="${this.facebookService.generatePostUrl(post.id)}" target="_blank">View Post</a>
      `;
      latestGrid.appendChild(postElement);
    });
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

    sortedPosts.slice(0, 3).forEach((post, index) => {
      const interactions = this.facebookService.calculateInteractions(post);
      const postDate = new Date(post.created_time);
      
      const listItem = document.createElement('li');
      listItem.classList.add('leaderboard-item');
      listItem.innerHTML = `
        <div>
          <strong>#${index + 1} · Facebook</strong>
          <div>${post.message ? post.message.substring(0, 50) + '...' : 'Post'}</div>
        </div>
        <div class="leaderboard-meta">
          <div>${interactions} interactions</div>
          <small>${timeFormatter.timeAgo(postDate)}</small>
        </div>
      `;
      leaderboardList.appendChild(listItem);
    });
  }

  updateInstagramEmbed(media) {
    const instagramEmbed = document.querySelector('.instagram-embed .embed-wrapper');
    if (!instagramEmbed || media.media_type !== 'IMAGE') return;

    instagramEmbed.innerHTML = `
      <div class="instagram-post">
        <img src="${media.media_url}" alt="Instagram Post" style="max-width: 100%; border-radius: 8px;">
        <p>${media.caption || 'Instagram post from Furniture Distributors'}</p>
        <div class="metric-row">
          <div class="metric">${media.like_count || 0} Likes</div>
          <div class="metric">${media.comments_count || 0} Comments</div>
        </div>
        <a href="${media.permalink}" target="_blank">View on Instagram →</a>
      </div>
    `;
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
    }
  }

  updateTimestamp() {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.innerText = `Last updated: ${timeFormatter.formatTimestamp(now)}`;
    }
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
    }, API_CONFIG.REFRESH_INTERVAL);
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}