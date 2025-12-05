// Resolve config from a runtime env object (env.js) when present,
// falling back to Vite-style import.meta.env for local development.
const ENV_SOURCE =
  (typeof window !== 'undefined' && window.__ALPHAPULSE_ENV__) ||
  (typeof import.meta !== 'undefined' && import.meta.env) ||
  {};

// API Configuration
export const API_CONFIG = {
  FACEBOOK_ACCESS_TOKEN: ENV_SOURCE.VITE_FACEBOOK_ACCESS_TOKEN,
  FACEBOOK_APP_ID: ENV_SOURCE.VITE_FACEBOOK_APP_ID,
  FACEBOOK_PAGE_ID: ENV_SOURCE.VITE_FACEBOOK_PAGE_ID,
  INSTAGRAM_ACCESS_TOKEN: ENV_SOURCE.VITE_INSTAGRAM_ACCESS_TOKEN,
  INSTAGRAM_USER_ID: ENV_SOURCE.VITE_INSTAGRAM_USER_ID,
  REFRESH_INTERVAL: 300000 // 5 minutes
};

// API Endpoints
export const API_ENDPOINTS = {
  FACEBOOK_PAGE_INFO: (pageId, accessToken) =>
    `https://graph.facebook.com/v19.0/${pageId}?fields=fan_count,followers_count,name&access_token=${accessToken}`,
  
  FACEBOOK_POSTS: (pageId, accessToken, limit = 3) => 
    `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message,created_time,shares,comments.summary(true),likes.summary(true),full_picture&access_token=${accessToken}&limit=${limit}`,
  
  INSTAGRAM_USER: (accessToken) =>
    `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${accessToken}`,
  
  INSTAGRAM_MEDIA: (accessToken, limit = 3) => 
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}&limit=${limit}`
};
