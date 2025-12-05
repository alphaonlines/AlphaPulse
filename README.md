# AlphaPulse - Social Media Dashboard

A real-time social media dashboard for Furniture Distributors that displays live follower counts, spotlight posts, latest highlights, and interaction leaderboards from Facebook and Instagram.

## Features

- **Live Social Media Data**: Real-time follower counts and post engagement
- **Multi-Platform Support**: Facebook and Instagram integration
- **Interactive Dashboard**: Spotlight posts, latest highlights, and interaction leaderboards
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-Refresh**: Data updates automatically every 5 minutes

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/alphapulse.git
cd alphapulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root of the project and add your API credentials.

> **IMPORTANT:** You must prefix the environment variables with `VITE_` for them to be exposed to the client-side code.

```env
# AlphaPulse API Credentials
# -----------------------------
# IMPORTANT: Replace the placeholder values below with your actual API keys and IDs.
# You can get these from the developer portals of Facebook and Instagram.

# Facebook API Credentials
VITE_FACEBOOK_ACCESS_TOKEN="your_facebook_access_token_here"
VITE_FACEBOOK_APP_ID="your_facebook_app_id_here"
VITE_FACEBOOK_PAGE_ID="your_facebook_page_id_here"

# Instagram API Credentials
VITE_INSTAGRAM_ACCESS_TOKEN="your_instagram_access_token_here"
VITE_INSTAGRAM_USER_ID="your_instagram_user_id_here"
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

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
├── src/
│   ├── css/
│   ├── js/
│   │   ├── components/
│   │   ├── config/
│   │   ├── services/
│   │   └── utils/
│   └── main.js
├── .env                # Environment variables (API keys)
├── .gitignore          # Git ignore file
├── index.html          # Main HTML file
├── package.json        # Project metadata
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure you are running the application using `npm run dev` and not by opening the `index.html` file directly.

### API Errors
- Check that your access tokens are valid and not expired
- Ensure your Facebook Page ID is correct
- Verify Instagram permissions are properly configured
- Check the browser's developer console for more specific error messages.

### Data Not Loading
- Open browser developer tools to check console for errors
- Verify API credentials in your `.env` file are correct and prefixed with `VITE_`
- Check network connectivity

## Deployment

This application can be deployed to any static hosting service that supports Vite builds:
- Netlify
- Vercel
- GitHub Pages

You will need to configure your environment variables in the hosting provider's settings.

## License

ISC