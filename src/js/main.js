import { DashboardManager } from './components/dashboard.js';

// Initialize the dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardManager();
  dashboard.initialize();
  
  // Make dashboard available globally for debugging
  window.dashboard = dashboard;
  
  console.log('AlphaPulse Dashboard loaded');
});