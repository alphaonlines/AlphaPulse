import { API_CONFIG, API_ENDPOINTS } from '../config/api-config.js';

export class FacebookService {
  constructor() {
    this.accessToken = API_CONFIG.FACEBOOK_ACCESS_TOKEN;
    this.pageId = API_CONFIG.FACEBOOK_PAGE_ID;
    this.hasCredentials = Boolean(this.accessToken && this.pageId);

    this.fallbackData = {
      pageInfo: {
        fan_count: 2400,
        followers_count: 2425,
        name: 'Furniture Distributors'
      },
      posts: [
        {
          id: '95489941835_1',
          message: 'Cozy up your living room with our new modular sectionals — crafted for comfort and built to last.',
          created_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          full_picture: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
          likes: { summary: { total_count: 86 } },
          comments: { summary: { total_count: 14 } },
          shares: { count: 6 }
        },
        {
          id: '95489941835_2',
          message: 'Weekend delivery window is open! Schedule a slot and we’ll bring the showroom to you.',
          created_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          full_picture: 'https://images.unsplash.com/photo-1484100356142-db6ab6244067?auto=format&fit=crop&w=800&q=80',
          likes: { summary: { total_count: 64 } },
          comments: { summary: { total_count: 8 } },
          shares: { count: 4 }
        },
        {
          id: '95489941835_3',
          message: 'Thank you to the Greenville community for the incredible response to our new bedroom collection.',
          created_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          full_picture: 'https://images.unsplash.com/photo-1484100356142-db6ab6244067?auto=format&fit=crop&w=800&q=80',
          likes: { summary: { total_count: 52 } },
          comments: { summary: { total_count: 11 } },
          shares: { count: 3 }
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

  async getPageInfo() {
    try {
      const response = await fetch(API_ENDPOINTS.FACEBOOK_PAGE_INFO(this.pageId, this.accessToken));
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Facebook page info:', error);
      throw error;
    }
  }

  async getPosts(limit = 3) {
    try {
      const response = await fetch(API_ENDPOINTS.FACEBOOK_POSTS(this.pageId, this.accessToken, limit));
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Facebook posts:', error);
      throw error;
    }
  }

  async getAllData() {
    if (!this.hasCredentials) {
      console.warn('Facebook credentials missing; skipping live Graph API call and using fallback data.');
      return this.buildFallback('missing-credentials');
    }

    try {
      console.info('Fetching live Facebook data from Graph API...');
      const [pageInfo, postsData] = await Promise.all([
        this.getPageInfo(),
        this.getPosts()
      ]);

      return {
        pageInfo,
        posts: postsData.data || [],
        isFallback: false,
        fallbackReason: null
      };
    } catch (error) {
      console.warn('Falling back to sample Facebook data after API error:', error);
      return this.buildFallback('api-error');
    }
  }

  cloneFallbackData() {
    return {
      pageInfo: { ...this.fallbackData.pageInfo },
      posts: this.fallbackData.posts.map(post => ({ ...post }))
    };
  }

  generatePostUrl(postId) {
    const [pageId, postIdPart] = postId.split('_');
    return `https://www.facebook.com/${pageId}/posts/${postIdPart}`;
  }

  calculateInteractions(post) {
    const likes = post.likes?.summary?.total_count || 0;
    const comments = post.comments?.summary?.total_count || 0;
    const shares = post.shares?.count || 0;
    return likes + comments + shares;
  }
}