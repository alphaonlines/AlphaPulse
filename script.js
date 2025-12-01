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

  // Smooth scrolling for CTA buttons
  const ctaInstagram = document.getElementById('cta-instagram');
  const ctaFacebook = document.getElementById('cta-facebook');
  const topElement = document.getElementById('top');
  const qrFooter = document.getElementById('qr-footer');

  if (ctaInstagram && topElement) {
    ctaInstagram.addEventListener('click', (e) => {
      e.preventDefault();
      topElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (ctaFacebook && qrFooter) {
    ctaFacebook.addEventListener('click', (e) => {
      e.preventDefault();
      qrFooter.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
