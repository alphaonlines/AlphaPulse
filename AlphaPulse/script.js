document.addEventListener('DOMContentLoaded', () => {
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


  // Helper function to manage loading states
  const setLoadingState = (sectionId, isLoading) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    const loadingIndicator = sectionElement.querySelector('.loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }

    // Clear content when loading starts, or populate when loading ends
    // For simplicity, we'll clear the content area and let the fetch repopulate
    if (isLoading) {
      // Clear relevant content based on sectionId
      if (sectionId === 'spotlight-card') {
        sectionElement.innerHTML = '<div class="loading-indicator">Loading Spotlight Post...</div>';
      } else if (sectionId === 'latest-grid') {
        sectionElement.innerHTML = '<div class="loading-indicator">Loading Latest Highlights...</div>';
      } else if (sectionId === 'leaderboard-list') {
        sectionElement.innerHTML = '<li class="loading-indicator">Loading Interaction Leaderboard...</li>';
      }
    }
  };

  // --- Facebook API Integration ---
  const fetchFacebookData = async () => {
    // Show loading indicators before fetch
    setLoadingState('spotlight-card', true);
    setLoadingState('latest-grid', true);
    setLoadingState('leaderboard-list', true); // Add loading for leaderboard

    try {
      const response = await fetch('/api/facebook-data');
      const data = await response.json();
      const { pageInfo, postsData } = data;

      // Hide loading for general Facebook data once fetched
      // Specific sections will re-hide their loading as they are populated

      if (pageInfo.fan_count) {
        const facebookFollowersElement = document.querySelector('#stat-facebook .stat-value');
        if (facebookFollowersElement) {
          facebookFollowersElement.setAttribute('data-count', pageInfo.fan_count);
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

      if (postsData.data && postsData.data.length > 0) {
        // Clear loading and populate Spotlight Card
        const spotlightCard = document.getElementById('spotlight-card');
        if (spotlightCard) {
          spotlightCard.innerHTML = `
            <div class="spotlight-media">
              <img src="${postsData.data[0].full_picture || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'}" alt="Spotlight Post">
            </div>
            <div class="spotlight-content">
              <span class="platform-pill">Facebook</span>
              <h3>Furniture Distributors</h3>
              <p>${postsData.data[0].message || 'Latest update from Furniture Distributors.'}</p>
              <div class="metric-row">
                <div class="metric">${postsData.data[0].likes ? postsData.data[0].likes.summary.total_count : 0} Likes</div>
                <div class="metric">${postsData.data[0].comments ? postsData.data[0].comments.summary.total_count : 0} Comments</div>
                <div class="metric">${postsData.data[0].shares ? postsData.data[0].shares.count : 0} Shares</div>
              </div>
              <div class="spotlight-actions">
                <a href="https://www.facebook.com/${postsData.data[0].id.split('_')[0]}/posts/${postsData.data[0].id.split('_')[1]}" target="_blank">View Post →</a>
              </div>
            </div>
          `;
          setLoadingState('spotlight-card', false);
        }

        // Populate Latest Highlights with fetched posts
        const latestGrid = document.getElementById('latest-grid');
        if (latestGrid) {
          latestGrid.innerHTML = ''; // Clear loading and existing content

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
          setLoadingState('latest-grid', false);
        }

        // Populate Interaction Leaderboard
        const leaderboardList = document.getElementById('leaderboard-list');
        if (leaderboardList) {
          leaderboardList.innerHTML = ''; // Clear loading and existing content

          // Simple sorting by total interactions (likes + comments + shares)
          const sortedPosts = [...postsData.data].sort((a, b) => {
            const interactionsA = (a.likes ? a.likes.summary.total_count : 0) + (a.comments ? a.comments.summary.total_count : 0) + (a.shares ? a.shares.count : 0);
            const interactionsB = (b.likes ? b.likes.summary.total_count : 0) + (b.comments ? b.comments.summary.total_count : 0) + (b.shares ? b.shares.count : 0);
            return interactionsB - interactionsA;
          });

          sortedPosts.slice(0, 3).forEach((post, index) => { // Top 3 posts
            const interactions = (post.likes ? post.likes.summary.total_count : 0) + (post.comments ? post.comments.summary.total_count : 0) + (post.shares ? post.shares.count : 0);
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

            const listItem = document.createElement('li');
            listItem.classList.add('leaderboard-item');
            listItem.innerHTML = `
              <div>
                <strong>#${index + 1} · Facebook</strong>
                <div>${post.message ? post.message.substring(0, 50) + '...' : 'Post'}</div>
              </div>
              <div class="leaderboard-meta">
                <div>${interactions} interactions</div>
                <small>${timeAgo(postDate)}</small>
              </div>
            `;
            leaderboardList.appendChild(listItem);
          });
          setLoadingState('leaderboard-list', false);
        }
      }

    } catch (error) {
      console.error('Error fetching Facebook data:', error);
      const statusMessage = document.getElementById('status-message');
      if (statusMessage) {
        statusMessage.innerText = 'Error fetching live data. Check console for details.';
      }
      // Hide all loading indicators on error
      setLoadingState('spotlight-card', false);
      setLoadingState('latest-grid', false);
      setLoadingState('leaderboard-list', false);
    }
  };

  // --- Content Toggling Logic ---
  const socialMediaTabs = document.getElementById('social-media-tabs');
  const instagramTabButton = document.getElementById('cta-instagram-feed');
  const facebookTabButton = document.getElementById('cta-facebook-feed');
  // tabSlider and moveSlider are no longer needed as styling is handled by CSS active states


  const instagramSections = [
    document.getElementById('stat-instagram'),
    document.querySelector('.instagram-embed')
  ].filter(Boolean);

  const facebookSections = [
    document.getElementById('stat-facebook'),
    document.getElementById('spotlight-card'),
    document.querySelector('.community')
  ].filter(Boolean);

  const toggleVisibility = (elements, show) => {
    elements.forEach(el => {
      el.style.display = show ? '' : 'none';
    });
  };

  if (instagramTabButton && facebookTabButton && socialMediaTabs) {
    const activateTab = (activeButton, deactivateButton, sectionsToShow, sectionsToHide, fetchData = false) => {
      deactivateButton.classList.remove('active');
      activeButton.classList.add('active');
      toggleVisibility(sectionsToHide, false);
      toggleVisibility(sectionsToShow, true);
      // moveSlider(activeButton); // No longer needed
      if (fetchData) {
        fetchFacebookData();
      }
    };

    instagramTabButton.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(instagramTabButton, facebookTabButton, instagramSections, facebookSections, false);
    });

    facebookTabButton.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(facebookTabButton, instagramTabButton, facebookSections, instagramSections, true);
    });

    // Initial state: show Instagram sections by default
    activateTab(instagramTabButton, facebookTabButton, instagramSections, facebookSections, false);

    // Recalculate slider position on window resize - no longer needed
    // window.addEventListener('resize', () => {
    //   const activeButton = document.querySelector('.social-media-tabs .tab-button.active');
    //   moveSlider(activeButton);
    // });
  }

  // Initial fetch for Facebook data (can be optimized if only fetched on demand)
  // fetchFacebookData(); // Commented out to fetch only on demand via button click
});


