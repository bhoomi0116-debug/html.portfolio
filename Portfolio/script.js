// Combined script: load shared nav and dark mode toggle
document.addEventListener('DOMContentLoaded', () => {
  // Load shared navigation into #site-nav
  const container = document.getElementById('site-nav');
  if (container) {
    fetch('nav.html')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load nav');
        return response.text();
      })
      .then(html => {
        container.innerHTML = html;
        // Setup active state based on current filename
        const links = container.querySelectorAll('a');

        function updateActiveFromLocation() {
          const current = window.location.pathname.split('/').pop() || 'index.html';
          links.forEach(a => {
            const href = a.getAttribute('href') || '';
            const file = href.split('#')[0] || 'index.html';
            const name = file.split('/').pop();
            if (name === current) {
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
        }

        // update active when nav is loaded
        updateActiveFromLocation();
        window.addEventListener('popstate', updateActiveFromLocation);

        // Wire the theme toggle (nav or fallback)
        const navToggle = container.querySelector('#theme-toggle') || document.getElementById('theme-toggle');
        if (navToggle) {
          const setToggleState = () => {
            const isDark = document.body.classList.contains('dark');
            if (navToggle.tagName.toLowerCase() === 'button') {
              navToggle.textContent = isDark ? '☀️' : '🌙';
              navToggle.setAttribute('aria-pressed', isDark);
            }
          };

          navToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            setToggleState();
          });

          // Initialize toggle state after nav loads
          setToggleState();
        }

        // update active when nav is loaded
        updateActiveFromHash();
        window.addEventListener('hashchange', updateActiveFromHash);
      })
      .catch(err => console.error('Error loading nav:', err));
  }

  // Dark mode toggle
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
  }

  // Contact form handling (client-side validation + mailto fallback)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('contact-name') || {}).value || '';
      const email = (document.getElementById('contact-email') || {}).value || '';
      const message = (document.getElementById('contact-message') || {}).value || '';

      // Simple validation
      if (!name.trim()) return showInlineAlert('Please enter your name.');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) return showInlineAlert('Please enter a valid email address.');
      if (!message.trim()) return showInlineAlert('Please enter a message.');

      // Serverless form endpoint configuration
      // To receive messages without relying on the visitor's mail client, sign up for a form service
      // (e.g. Formspree) and paste the form endpoint URL below or add it as `data-endpoint` on the <form>.
      // Example Formspree endpoint: https://formspree.io/f/yourFormId
      const FORM_ENDPOINT = ''; // <- REPLACE with your endpoint or set data-endpoint on the form

      const formEl = document.getElementById('contact-form');
      const endpoint = (formEl && formEl.dataset && formEl.dataset.endpoint) ? formEl.dataset.endpoint : FORM_ENDPOINT;
      if (!endpoint) {
        // If no endpoint configured, notify the user (no redirect) and clear the form locally
        showFormSuccess('Message prepared locally — form endpoint not configured.');
        // clear fields
        formEl.querySelectorAll('input,textarea').forEach(i => i.value = '');
        return;
      }

      // Send form data to the configured endpoint using FormData (compatible with Getform)
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('message', message);

      fetch(endpoint, {
        method: 'POST',
        // Do NOT set Content-Type header; browser sets multipart/form-data boundary
        body: fd
      })
      .then(async res => {
        if (res.ok) {
          showFormSuccess('Message sent — thank you!');
          // clear inputs
          formEl.querySelectorAll('input,textarea').forEach(i => i.value = '');
        } else {
          let errText = 'Failed to send message.';
          try { const data = await res.json(); if (data && data.error) errText = data.error; } catch(e){}
          showInlineAlert(errText + ' Please try again later.');
        }
      })
      .catch(err => {
        console.error('Form submit error', err);
        showInlineAlert('Network error — please try again later.');
      });
    });
  }

  // Inline alert helper (non-blocking)
  function showInlineAlert(text){
    const form = document.getElementById('contact-form');
    if (!form) { alert(text); return; }
    let existing = form.querySelector('.form-alert');
    if (!existing){
      existing = document.createElement('div');
      existing.className = 'form-alert';
      form.prepend(existing);
    }
    existing.textContent = text;
    existing.style.opacity = '1';
    setTimeout(()=>{ existing.style.opacity = '0'; }, 3500);
  }

  // Show a success banner on the page and run a confetti burst
  function showFormSuccess(message){
    // Avoid duplicating
    if (document.querySelector('.form-success')) return;
    const container = document.querySelector('.card') || document.body;
    const banner = document.createElement('div');
    banner.className = 'form-success';
    banner.innerHTML = `<strong>Success</strong><span class="msg"> ${message}</span><button class="close-success" aria-label="Close">✕</button>`;
    container.prepend(banner);

    // Close button
    banner.querySelector('.close-success').addEventListener('click', () => banner.remove());

    // Trigger confetti
    confettiBurst();

    // Auto-dismiss after 7s
    setTimeout(() => { banner.remove(); }, 7000);
  }

  // Lightweight confetti burst (canvas particles)
  function confettiBurst(){
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 9999;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    function resize(){
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      ctx.scale(DPR, DPR);
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#cfa4ff','#b58bff','#ffe6fb','#ffd8e8','#cde6ff'];
    const particles = [];
    const count = 90;
    for (let i=0;i<count;i++){
      particles.push({
        x: window.innerWidth/2 + (Math.random()-0.5)*200,
        y: window.innerHeight/2 + (Math.random()-0.5)*80,
        vx: (Math.random()-0.5)*8,
        vy: (Math.random()*-6)-2,
        size: 6 + Math.random()*8,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*8
      });
    }

    let t0 = performance.now();
    function frame(t){
      const dt = (t - t0) / 1000; t0 = t;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (let p of particles){
        p.vy += 9.8 * dt * 0.5; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      }
      // remove particles off-screen
      for (let i = particles.length-1; i>=0; i--){
        if (particles[i].y > window.innerHeight + 50) particles.splice(i,1);
      }
      if (particles.length) requestAnimationFrame(frame); else cleanup();
    }
    function cleanup(){
      window.removeEventListener('resize', resize);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    requestAnimationFrame(frame);
    setTimeout(() => { /* ensure removal after 5s */ cleanup(); }, 5200);
  }

  // Subtle parallax for floating shapes (mouse move)
  (function setupShapesParallax(){
    const container = document.querySelector('.shapes');
    if (!container) return;
    const wrappers = Array.from(container.querySelectorAll('.shape-wrap'));
    if (!wrappers.length) return;

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let mouseX = 0, mouseY = 0;

    function onMove(e){
      mouseX = (e.clientX - cx) / cx; // -1 .. 1
      mouseY = (e.clientY - cy) / cy; // -1 .. 1
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', () => { cx = window.innerWidth / 2; cy = window.innerHeight / 2; });

    function animate(){
      wrappers.forEach(w => {
        const depth = parseFloat(w.dataset.depth) || 0.05;
        const tx = (mouseX * 30 * depth).toFixed(2);
        const ty = (mouseY * 20 * depth).toFixed(2);
        const rot = (mouseX + mouseY) * (8 * depth);
        w.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
      });
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  })();

    // Fade-in on scroll: observe elements with .fade-in and add .in-view when visible
    (function setupFadeOnScroll(){
      if (!('IntersectionObserver' in window)) {
        // Fallback: simply reveal all
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('in-view'));
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    })();

    // Scroll / swipe / key navigation between separate pages
    (function setupPageScrollNavigation(){
      // Define the ordered list of pages in the site (update if you rename files)
      const pages = ['index.html','aboutme.html','gallery.html','projects.html','Contact.html'];
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      let idx = pages.indexOf(currentFile);
      if (idx === -1) idx = 0;

      // Helper to navigate with a fade-out animation
      let busy = false;
      function navigateToIndex(targetIndex){
        if (busy) return;
        if (targetIndex < 0 || targetIndex >= pages.length) return;
        const target = pages[targetIndex];
        if (!target || target === currentFile) return;
        const pageEl = document.querySelector('.page');
        busy = true;
        if (pageEl) pageEl.classList.add('fade-out');
        // allow animation to play, then navigate
        setTimeout(() => { window.location.href = target; }, 620);
      }

      function goNext(){ navigateToIndex(idx + 1); }
      function goPrev(){ navigateToIndex(idx - 1); }

      // Wheel handler (debounced)
      let wheelTimeout = null;
      window.addEventListener('wheel', (e) => {
        if (wheelTimeout) return; // simple throttle
        const delta = e.deltaY;
        if (Math.abs(delta) < 8) return; // ignore tiny scrolls
        if (delta > 0) goNext(); else goPrev();
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 900);
      }, { passive: true });

      // Keyboard navigation: Arrow/Page keys
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goPrev(); }
      });

      // Touch swipe support (basic)
      let touchStartY = null;
      window.addEventListener('touchstart', (e) => { touchStartY = e.touches && e.touches[0] ? e.touches[0].clientY : null; }, { passive: true });
      window.addEventListener('touchend', (e) => {
        if (touchStartY == null) return;
        const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : null;
        if (touchEndY == null) { touchStartY = null; return; }
        const diff = touchStartY - touchEndY;
        if (Math.abs(diff) < 30) { touchStartY = null; return; }
        if (diff > 0) goNext(); else goPrev();
        touchStartY = null;
      }, { passive: true });
    })();
});