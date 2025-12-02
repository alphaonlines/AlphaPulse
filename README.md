# AlphaPulse - Social Media Dashboard

A real-time social media dashboard for Furniture Distributors that displays live follower counts, spotlight posts, latest highlights, and interaction leaderboards from Facebook and Instagram.

## Features

- **Live Social Media Data**: Real-time follower counts and post engagement
- **Multi-Platform Support**: Facebook and Instagram integration
- **Interactive Dashboard**: Spotlight posts, latest highlights, and interaction leaderboards
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-Refresh**: Data updates automatically every 5 minutes

## Setup Instructions

### 1. Add Your API Credentials

Edit the `.env` file and replace the placeholder values with your actual API credentials:

```env
# Facebook API Credentials
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here

# Instagram API Credentials
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_USER_ID=your_instagram_user_id_here

# Application Settings
REFRESH_INTERVAL=300000
NODE_ENV=development
```

### 2. Update JavaScript Configuration

Edit the `API_CONFIG` object in `script.js` (lines 2-8) with your actual credentials:

```javascript
const API_CONFIG = {
  FACEBOOK_ACCESS_TOKEN: 'your_facebook_access_token_here',
  FACEBOOK_PAGE_ID: 'your_facebook_page_id_here',
  INSTAGRAM_ACCESS_TOKEN: 'your_instagram_access_token_here',
  INSTAGRAM_USER_ID: 'your_instagram_user_id_here',
  REFRESH_INTERVAL: 300000 // 5 minutes
};
```

### 3. Run the Application

Since this is a client-side application, you can run it using any local web server:

**Option 1: Python (Recommended)**
```bash
python3 -m http.server 3000
```

**Option 2: Node.js (if you have http-server installed)**
```bash
npx http-server -p 3000
```

**Option 3: Live Server in VS Code**
- Install the "Live Server" extension
- Right-click `index.html` and select "Open with Live Server"

Then open your browser and navigate to `http://localhost:3000`

## API Setup

### Facebook Graph API

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Facebook Login product
3. Get your Page ID from Facebook Page URL
4. Generate a Page Access Token with `pages_read_engagement` permission

### Instagram Basic Display API

1. Create an Instagram Basic Display App
2. Add your website URL as a valid redirect URI
3. Generate an access token
4. Get your Instagram User ID

## File Structure

```
AlphaPulse/
├── index.html          # Main HTML file
├── script.js           # JavaScript with API integrations
├── style.css           # Styling
├── .env                # Environment variables (API keys)
├── .gitignore          # Git ignore file
├── package.json        # Project metadata
└── README.md           # This file
```

## Customization

- **Refresh Interval**: Change `REFRESH_INTERVAL` in `.env` and `script.js` (in milliseconds)
- **Styling**: Modify `style.css` to change colors, fonts, and layout
- **API Endpoints**: Update API calls in `script.js` for different data fields

## Troubleshooting

### CORS Issues
If you encounter CORS errors, use a local web server (see setup instructions) instead of opening the HTML file directly.

### API Errors
- Check that your access tokens are valid and not expired
- Ensure your Facebook Page ID is correct
- Verify Instagram permissions are properly configured

### Data Not Loading
- Open browser developer tools to check console for errors
- Verify API credentials are correctly entered
- Check network connectivity

## Deployment

This application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

Simply upload the files and ensure your environment variables are configured for production.

## License

ISC