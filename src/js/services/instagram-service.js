import { API_CONFIG, API_ENDPOINTS } from '../config/api-config.js';

export class InstagramService {
  constructor() {
    this.accessToken = API_CONFIG.INSTAGRAM_ACCESS_TOKEN;
    this.userId = API_CONFIG.INSTAGRAM_USER_ID;
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
    try {
      const [userInfo, mediaData] = await Promise.all([
        this.getUserInfo(),
        this.getMedia()
      ]);
      
      return {
        userInfo,
        media: mediaData.data || []
      };
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
      throw error;
    }
  }

  calculateTotalInteractions(media) {
    return media.reduce((total, item) => {
      return total + (item.like_count || 0) + (item.comments_count || 0);
    }, 0);
  }
}