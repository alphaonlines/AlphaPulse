import { API_CONFIG, API_ENDPOINTS } from '../config/api-config.js';

export class FacebookService {
  constructor() {
    this.accessToken = API_CONFIG.FACEBOOK_ACCESS_TOKEN;
    this.pageId = API_CONFIG.FACEBOOK_PAGE_ID;
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
    try {
      const [pageInfo, postsData] = await Promise.all([
        this.getPageInfo(),
        this.getPosts()
      ]);
      
      return {
        pageInfo,
        posts: postsData.data || []
      };
    } catch (error) {
      console.error('Error fetching Facebook data:', error);
      throw error;
    }
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