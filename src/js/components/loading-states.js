import { domHelpers } from '../utils/helpers.js';

export class LoadingStates {
  constructor() {
    this.loadingTemplates = {
      spotlight: this.createSpotlightSkeleton(),
      latest: this.createLatestGridSkeleton(),
      leaderboard: this.createLeaderboardSkeleton()
    };
  }

  createSpotlightSkeleton() {
    return `
      <div class="skeleton-loader">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-text skeleton-pill"></div>
          <div class="skeleton skeleton-text skeleton-title"></div>
          <div class="skeleton skeleton-text skeleton-paragraph"></div>
          <div class="skeleton skeleton-metrics">
            <div class="skeleton skeleton-text skeleton-metric"></div>
            <div class="skeleton skeleton-text skeleton-metric"></div>
            <div class="skeleton skeleton-text skeleton-metric"></div>
          </div>
        </div>
      </div>
    `;
  }

  createLatestGridSkeleton() {
    let skeletons = '';
    for (let i = 0; i < 3; i++) {
      skeletons += `
        <div class="skeleton-loader latest-card">
          <div class="skeleton skeleton-text skeleton-pill"></div>
          <div class="skeleton skeleton-text skeleton-title"></div>
          <div class="skeleton skeleton-text skeleton-paragraph"></div>
          <div class="skeleton skeleton-text skeleton-timestamp"></div>
        </div>
      `;
    }
    return skeletons;
  }

  createLeaderboardSkeleton() {
    let skeletons = '';
    for (let i = 0; i < 3; i++) {
      skeletons += `
        <li class="skeleton-loader leaderboard-item">
          <div class="skeleton-content">
            <div class="skeleton skeleton-text skeleton-rank"></div>
            <div class="skeleton skeleton-text skeleton-title"></div>
          </div>
          <div class="skeleton-meta">
            <div class="skeleton skeleton-text skeleton-metric"></div>
            <div class="skeleton skeleton-text skeleton-timestamp"></div>
          </div>
        </li>
      `;
    }
    return skeletons;
  }

  setLoadingState(sectionId, isLoading) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    if (isLoading) {
      // Show skeleton loader
      if (sectionId === 'spotlight-card') {
        sectionElement.innerHTML = this.loadingTemplates.spotlight;
      } else if (sectionId === 'latest-grid') {
        sectionElement.innerHTML = this.loadingTemplates.latest;
      } else if (sectionId === 'leaderboard-list') {
        sectionElement.innerHTML = this.loadingTemplates.leaderboard;
      }
      
      sectionElement.classList.add('loading');
    } else {
      sectionElement.classList.remove('loading');
    }
  }

  setGlobalLoading(isLoading) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      if (isLoading) {
        statusElement.textContent = 'Loading data...';
        statusElement.classList.add('loading');
      } else {
        statusElement.textContent = 'Live data active · Auto-refresh every 5 minutes';
        statusElement.classList.remove('loading');
      }
    }
  }

  // Show error state for a section
  setErrorState(sectionId, message = 'Failed to load data') {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    sectionElement.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>${message}</p>
        <button class="retry-button" onclick="window.location.reload()">Retry</button>
      </div>
    `;
    
    sectionElement.classList.add('error');
  }
}