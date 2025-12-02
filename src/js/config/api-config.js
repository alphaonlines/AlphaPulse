// API Configuration
export const API_CONFIG = {
  FACEBOOK_ACCESS_TOKEN: 'EAAT33MwLWFQBQL8Lt9QyZAAXJU6sEvAZBdDaAga62oREMRYjsD0w3QgwktIzpWsHAXFgGFsNIB4F5OWrZCENYesFOx2U64f5viuWtc5yY6TuHoBLlyVeo3No3SHgy9HtzRE1sorEf3VxJZBe9kUnJPg8FlQZAGhK17XCNZCWysOvmn0AZCg8ZCNE3ScZAonkYf7sZA38YJZCcCX36XZAbX8YIgMQMyCssvAZCrZBYG4mh12mItl78iAxVWdgZDZD',
  FACEBOOK_APP_ID: '281568812546439',
  FACEBOOK_PAGE_ID: '95489941835',
  INSTAGRAM_ACCESS_TOKEN: 'your_instagram_access_token_here',
  INSTAGRAM_USER_ID: 'your_instagram_user_id_here',
  REFRESH_INTERVAL: 300000 // 5 minutes
};

// API Endpoints
export const API_ENDPOINTS = {
  FACEBOOK_PAGE_INFO: (pageId, accessToken) => 
    `https://graph.facebook.com/v19.0/${pageId}?fields=fan_count&access_token=${accessToken}`,
  
  FACEBOOK_POSTS: (pageId, accessToken, limit = 3) => 
    `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message,created_time,shares,comments.summary(true),likes.summary(true),full_picture&access_token=${accessToken}&limit=${limit}`,
  
  INSTAGRAM_USER: (accessToken) => 
    `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`,
  
  INSTAGRAM_MEDIA: (accessToken, limit = 3) => 
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}&limit=${limit}`
};