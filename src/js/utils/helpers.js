// Time formatting utilities
export const timeFormatter = {
  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${Math.floor(seconds)} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(seconds / 3600);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(seconds / 86400);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(seconds / 2592000);
    if (months < 12) return `${months} months ago`;
    
    const years = Math.floor(seconds / 31536000);
    return `${years} years ago`;
  },

  formatTimestamp(date) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
};

// DOM manipulation utilities
export const domHelpers = {
  createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  },

  safeQuerySelector(selector) {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return null;
    }
  },

  safeQuerySelectorAll(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return [];
    }
  }
};

// Error handling utilities
export class APIError extends Error {
  constructor(message, status = null, context = '') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.context = context;
  }
}

export const errorHandler = {
  handle(error, context = 'Unknown operation') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly message
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      statusElement.textContent = `Unable to load ${context}. Please try again later.`;
      statusElement.classList.add('error');
      
      // Remove error class after 5 seconds
      setTimeout(() => {
        statusElement.classList.remove('error');
      }, 5000);
    }
    
    // Log error details for debugging
    if (error instanceof APIError) {
      console.error('API Error Details:', {
        message: error.message,
        status: error.status,
        context: error.context
      });
    }
  },

  logError(error, context) {
    // Implementation for error logging service
    // Could integrate with analytics service here
    console.warn('Error logged:', { error: error.message, context, timestamp: new Date().toISOString() });
  }
};