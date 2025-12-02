document.addEventListener('DOMContentLoaded', () => {
  // Hardcoded Facebook API Credentials for Demo
  const FACEBOOK_APP_ID = '1398427595003988';
  const FACEBOOK_ACCESS_TOKEN = 'c22d09e6877e67dc362187f94f5023dd'; // This is likely a Page Access Token or User Access Token

  // NOTE: For a real application, you would typically use a server-side component
  // to handle API keys and make requests, to prevent exposure of sensitive tokens.
  // This approach is for demo purposes only as requested.

  // Assuming a Facebook Page ID for "Furniture Distributors".
  // You would need to replace this with your actual Facebook Page ID.
  const FACEBOOK_PAGE_ID = '95489941835'; // Updated with correct Page ID

  // Animate stat counters
  const counters = document.querySelectorAll('.stat-value');
  const speed = 200; // The lower the slower

  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-count');
      const count = +counter.innerText;

      const inc = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + inc);
        setTimeout(updateCount, 1);
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  });

  // Set last updated timestamp
  const lastUpdated = document.getElementById('last-updated');
  if (lastUpdated) {
    const now = new Date();
    lastUpdated.innerText = `Last updated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }

  // --- Facebook API Integration ---
  const fetchFacebookData = async () => {
    try {
      // Fetch Page Fan Count (Followers)
      const pageInfoResponse = await fetch(
        `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}?fields=fan_count&access_token=${FACEBOOK_ACCESS_TOKEN}`
      );
      const pageInfo = await pageInfoResponse.json();

      if (pageInfo.fan_count) {
        const facebookFollowersElement = document.querySelector('#stat-facebook .stat-value');
        if (facebookFollowersElement) {
          facebookFollowersElement.setAttribute('data-count', pageInfo.fan_count);
          // Re-trigger counter animation for Facebook followers
          const target = +pageInfo.fan_count;
          let count = 0;
          const updateFanCount = () => {
            const inc = target / speed;
            if (count < target) {
              count += inc;
              facebookFollowersElement.innerText = Math.ceil(count);
              setTimeout(updateFanCount, 1);
            } else {
              facebookFollowersElement.innerText = target;
            }
          };
          updateFanCount();
        }
      }

      // Fetch latest post for Spotlight Card
      const postsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/posts?fields=message,created_time,shares,comments.summary(true),likes.summary(true),full_picture&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=3`
      );
      const postsData = await postsResponse.json();

      if (postsData.data && postsData.data.length > 0) {
        // Update Spotlight Card with the very latest post
        const latestPost = postsData.data[0];
        const spotlightCard = document.getElementById('spotlight-card');
        if (spotlightCard) {
          spotlightCard.querySelector('h3').innerText = 'Furniture Distributors'; // Page Name
          spotlightCard.querySelector('p').innerText = latestPost.message || 'Latest update from Furniture Distributors.';
          if (latestPost.full_picture) {
            spotlightCard.querySelector('.spotlight-media img').src = latestPost.full_picture;
          }
          // Update the existing metrics or add new ones if structure changes
          const metrics = spotlightCard.querySelectorAll('.metric');
          if (metrics[0]) metrics[0].innerText = `${latestPost.likes.summary.total_count || 0} Likes`;
          if (metrics[1]) metrics[1].innerText = `${latestPost.comments.summary.total_count || 0} Comments`;
          if (metrics[2]) metrics[2].innerText = `${latestPost.shares ? latestPost.shares.count : 0} Shares`;
          
          // Update the link to the connect page
          const spotlightActionLink = spotlightCard.querySelector('.spotlight-actions a');
          if (spotlightActionLink) {
              spotlightActionLink.href = 'https://www.furnituredistributors.net/Content/connect';
              spotlightActionLink.innerText = 'Go to Connect Page →';
          }
        }

        // Populate Latest Highlights with fetched posts
        const latestGrid = document.getElementById('latest-grid');
        if (latestGrid) {
          latestGrid.innerHTML = ''; // Clear existing static content

          postsData.data.forEach(post => {
            const postDate = new Date(post.created_time);
            const timeAgo = (date) => {
                const seconds = Math.floor((new Date() - date) / 1000);
                let interval = seconds / 31536000;
                if (interval > 1) return Math.floor(interval) + " years ago";
                interval = seconds / 2592000;
                if (interval > 1) return Math.floor(interval) + " months ago";
                interval = seconds / 86400;
                if (interval > 1) return Math.floor(interval) + " days ago";
                interval = seconds / 3600;
                if (interval > 1) return Math.floor(interval) + " hours ago";
                interval = seconds / 60;
                if (interval > 1) return Math.floor(interval) + " minutes ago";
                return Math.floor(seconds) + " seconds ago";
            };

            const postElement = document.createElement('article');
            postElement.classList.add('latest-card');
            postElement.innerHTML = `
              <span class="platform-pill">Facebook</span>
              <h3>Furniture Distributors</h3>
              <p>${post.message || 'Click to view post.'}</p>
              <div class="post-timestamp">${timeAgo(postDate)}</div>
              <a href="https://www.facebook.com/${post.id.split('_')[0]}/posts/${post.id.split('_')[1]}" target="_blank">View Post</a>
            `;
            latestGrid.appendChild(postElement);
          });
        }
      }

    } catch (error) {
      console.error('Error fetching Facebook data:', error);
      // Optionally update the status message or relevant elements to show an error
      const statusMessage = document.getElementById('status-message');
      if (statusMessage) {
        statusMessage.innerText = 'Error fetching live data. Check console for details.';
      }
    }
  };

  // --- Content Toggling Logic ---
  const ctaInstagramFeed = document.getElementById('cta-instagram-feed');
  const ctaFacebookFeed = document.getElementById('cta-facebook-feed');

  const instagramSections = [
    document.getElementById('stat-instagram'),
    document.querySelector('.instagram-embed')
  ].filter(Boolean); // Filter out nulls if elements aren't found

  const facebookSections = [
    document.getElementById('stat-facebook'),
    document.getElementById('spotlight-card'),
    document.querySelector('.community')
  ].filter(Boolean); // Filter out nulls

  // Function to show/hide elements
  const toggleVisibility = (elements, show) => {
    elements.forEach(el => {
      el.style.display = show ? '' : 'none'; // Use '' to revert to default display
    });
  };

  if (ctaInstagramFeed && ctaFacebookFeed) {
    ctaInstagramFeed.addEventListener('click', (e) => {
      e.preventDefault();
      toggleVisibility(instagramSections, true);
      toggleVisibility(facebookSections, false);
      ctaInstagramFeed.classList.add('active'); // Add active state
      ctaFacebookFeed.classList.remove('active');
    });

    ctaFacebookFeed.addEventListener('click', (e) => {
      e.preventDefault();
      fetchFacebookData(); // Fetch data when Facebook feed is activated
      toggleVisibility(instagramSections, false);
      toggleVisibility(facebookSections, true);
      ctaFacebookFeed.classList.add('active'); // Add active state
      ctaInstagramFeed.classList.remove('active');
    });

    // Initial state: show both by default
    // Or set a default active button
    ctaInstagramFeed.click(); // Simulate click to set initial state to Instagram
  }

  // Initial fetch for Facebook data (can be optimized if only fetched on demand)
  // fetchFacebookData(); // Commented out to fetch only on demand via button click
});


