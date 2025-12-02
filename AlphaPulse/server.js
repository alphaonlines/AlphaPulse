const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static('.'));

app.get('/api/facebook-data', async (req, res) => {
  try {
    const { FACEBOOK_ACCESS_TOKEN, FACEBOOK_PAGE_ID } = process.env;

    // Fetch Page Fan Count (Followers)
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}?fields=fan_count&access_token=${FACEBOOK_ACCESS_TOKEN}`
    );
    const pageInfo = await pageInfoResponse.json();

    // Fetch latest post for Spotlight Card
    const postsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/posts?fields=message,created_time,shares,comments.summary(true),likes.summary(true),full_picture&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=3`
    );
    const postsData = await postsResponse.json();
    
    res.json({ pageInfo, postsData });
  } catch (error) {
    console.error('Error fetching Facebook data:', error);
    res.status(500).json({ error: 'Failed to fetch Facebook data' });
  }
});

app.listen(port, () => {
  console.log(`AlphaPulse server listening at http://localhost:${port}`);
});
