import { API_CONFIG, API_ENDPOINTS } from '../config/api-config.js';

export class InstagramService {
  constructor() {
    this.accessToken = API_CONFIG.INSTAGRAM_ACCESS_TOKEN;
    this.userId = API_CONFIG.INSTAGRAM_USER_ID;
    this.hasCredentials = Boolean(this.accessToken && this.userId);

    this.fallbackData = {
      userInfo: {
        id: 'demo-instagram-user',
        username: 'furnituredistributorsnc',
        account_type: 'BUSINESS',
        media_count: 314,
        followers_count: 12500
      },
      media: [
        {
          id: 'demo_media_1',
          caption: 'Sunlit showroom mornings hit different ☀️ Come test out the new walnut dining sets.',
          media_type: 'IMAGE',
          media_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
          permalink: 'https://www.instagram.com/p/demo1',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          like_count: 180,
          comments_count: 22
        },
        {
          id: 'demo_media_2',
          caption: 'Layered textures and brass accents for a modern, cozy living room.',
          media_type: 'IMAGE',
          media_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
          permalink: 'https://www.instagram.com/p/demo2',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          like_count: 142,
          comments_count: 18
        }
      ]
    };
  }

  buildFallback(reason = 'unknown') {
    return {
      ...this.cloneFallbackData(),
      isFallback: true,
      fallbackReason: reason
    };
  }

  async getUserInfo() {
    try {
      const response = await fetch(API_ENDPOINTS.INSTAGRAM_USER(this.accessToken));
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Instagram user info:', error);
      throw error;
    }
  }

  async getMedia(limit = 3) {
    try {
      const response = await fetch(API_ENDPOINTS.INSTAGRAM_MEDIA(this.accessToken, limit));
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Instagram media:', error);
      throw error;
    }
  }

  async getAllData() {
    if (!this.hasCredentials) {
      console.warn('Instagram credentials missing; skipping live Graph API call and using fallback data.');
      return this.buildFallback('missing-credentials');
    }

    try {
      console.info('Fetching live Instagram data from Graph API...');
      const [userInfo, mediaData] = await Promise.all([
        this.getUserInfo(),
        this.getMedia()
      ]);

      return {
        userInfo,
        media: mediaData.data || [],
        isFallback: false,
        fallbackReason: null
      };
    } catch (error) {
      console.warn('Falling back to sample Instagram data after API error:', error);
      return this.buildFallback('api-error');
    }
  }

  cloneFallbackData() {
    return {
      userInfo: { ...this.fallbackData.userInfo },
      media: this.fallbackData.media.map(item => ({ ...item }))
    };
  }

  calculateTotalInteractions(media) {
    return media.reduce((total, item) => {
      return total + (item.like_count || 0) + (item.comments_count || 0);
    }, 0);
  }
}