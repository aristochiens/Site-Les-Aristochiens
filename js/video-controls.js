(function () {
  function init() {
    const video = document.querySelector('.lazy-video');
    if (!video) {
      return;
    }

    // Hide native controls if JS is working
    video.removeAttribute('controls');
    // Also set property just in case
    try { video.controls = false; } catch (e) { }

    const container = video.closest('.interview-inner');
    if (!container) return;

    // Elements
    const controls = container.querySelector('.video-controls');
    if (!controls) return;

    // Show custom controls
    container.classList.add('has-controls');

    const btnPlay = controls.querySelector('.vc-play');
    const btnMute = controls.querySelector('.vc-mute');
    const btnFull = controls.querySelector('.vc-full');
    const seek = controls.querySelector('.vc-seek');
    const time = controls.querySelector('.vc-time');

    // --- UI Update Functions ---

    function updatePlay() {
      if (!btnPlay) return;
      if (video.paused || video.ended) {
        btnPlay.innerHTML = "<i class='bx bx-play' aria-hidden='true'></i>";
        btnPlay.setAttribute('aria-pressed', 'false');
        btnPlay.setAttribute('aria-label', 'Lire');
      } else {
        btnPlay.innerHTML = "<i class='bx bx-pause' aria-hidden='true'></i>";
        btnPlay.setAttribute('aria-pressed', 'true');
        btnPlay.setAttribute('aria-label', 'Pause');
      }
    }

    function updateMute() {
      if (!btnMute) return;
      if (video.muted) {
        btnMute.innerHTML = "<i class='bx bx-volume-mute' aria-hidden='true'></i>";
        btnMute.setAttribute('aria-pressed', 'true');
        btnMute.setAttribute('aria-label', 'Activer le son');
      } else {
        btnMute.innerHTML = "<i class='bx bx-volume-full' aria-hidden='true'></i>";
        btnMute.setAttribute('aria-pressed', 'false');
        btnMute.setAttribute('aria-label', 'Couper le son');
      }
    }

    function formatTime(t) {
      if (!isFinite(t)) return '0:00';
      const hrs = Math.floor(t / 3600);
      const mins = Math.floor((t % 3600) / 60);
      const secs = Math.floor(t % 60);
      const mm = (hrs ? String(mins).padStart(2, '0') : mins);
      const ss = String(secs).padStart(2, '0');
      return (hrs ? hrs + ':' + mm + ':' + ss : mm + ':' + ss);
    }

    function updateTime() {
      if (seek) {
        const val = (video.currentTime / video.duration) * 100;
        seek.value = isFinite(val) ? val : 0;
        seek.style.setProperty('--seek-before-width', `${seek.value}%`);
      }
      if (time) {
        time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }
    }

    // --- Event Listeners ---

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (video.paused || video.ended) {
          const p = video.play();
          if (p && typeof p.catch === 'function') {
            p.catch(e => console.warn("Play failed", e));
          }
        } else {
          video.pause();
        }
      });
    }

    if (btnMute) {
      btnMute.addEventListener('click', () => {
        video.muted = !video.muted;
      });
    }

    if (btnFull) {
      btnFull.addEventListener('click', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      });
    }

    if (seek) {
      seek.addEventListener('input', e => {
        const t = (video.duration / 100) * e.target.value;
        if (isFinite(t)) video.currentTime = t;
      });
    }

    const volumeSlider = controls.querySelector('.vc-volume');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = (e.target.value == 0);
      });
    }

    function updateVolumeUI() {
      if (volumeSlider) {
        const vol = video.muted ? 0 : video.volume;
        volumeSlider.value = vol;
        volumeSlider.style.setProperty('--volume-percent', `${vol * 100}%`);
      }
    }

    // Sync UI with video state
    video.addEventListener('play', updatePlay);
    video.addEventListener('pause', updatePlay);
    video.addEventListener('volumechange', () => {
      updateMute();
      updateVolumeUI();
    });
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);

    // Initial check
    updatePlay();
    updateMute();
    updateVolumeUI();

    // --- Lazy Load ---
    const source = video.querySelector('source[data-src]');

    function loadAndPlay() {
      if (!source) return;
      if (source.src === source.dataset.src) return; // Already loaded

      source.src = source.dataset.src;
      video.load();

      // Mute for autoplay
      video.muted = true;

      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { /* Autoplay blocked */ });
      }
    }

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadAndPlay();
            obs.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      obs.observe(video);
    } else {
      loadAndPlay();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();