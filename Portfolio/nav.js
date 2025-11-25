document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('site-nav');
  if (!container) return;

  fetch('nav.html')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load nav');
      return response.text();
    })
    .then(html => {
      container.innerHTML = html;
      // Optional: mark active link
      const links = container.querySelectorAll('a');
      links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && href === window.location.pathname.split('/').pop()) {
          a.classList.add('active');
        }
      });
    })
    .catch(err => {
      console.error('Error loading nav:', err);
    });
});
