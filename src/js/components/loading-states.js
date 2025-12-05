import { domHelpers } from '../utils/helpers.js';

export class LoadingStates {
  constructor() {
    this.loadingTemplates = {
      latest: this.createLatestGridSkeleton()
    };
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

  setLoadingState(sectionId, isLoading) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    if (isLoading) {
      // Show skeleton loader
      if (sectionId === 'latest-grid') {
        sectionElement.innerHTML = this.loadingTemplates.latest;
      }

      sectionElement.classList.add('loading');
    } else {
      sectionElement.classList.remove('loading');
    }
  }

  setGlobalLoading(isLoading, message) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      if (isLoading) {
        statusElement.textContent = 'Loading data...';
        statusElement.classList.add('loading');
      } else {
        statusElement.textContent = message || 'Live data active · Auto-refresh every 5 minutes';
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