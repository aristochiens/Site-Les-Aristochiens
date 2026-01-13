(function(){
  function init(){
    const video = document.querySelector('.lazy-video');
    if(!video){
      console.info('No .lazy-video element found on this page.');
      return;
    }
    const source = video.querySelector('source[data-src]');

    function loadVideo(){
      if(!source || !source.dataset || !source.dataset.src){
        console.error('Video <source> with data-src missing. Vérifie le chemin et la casse des fichiers sur le serveur.');
        return;
      }
      if(source.src !== source.dataset.src) source.src = source.dataset.src;
      try{ video.load(); }catch(e){ console.warn('video.load() failed', e); }
      try{ video.muted = true; video.playsInline = true; }catch(e){}
      const p = video.play();
      if(p && typeof p.catch === 'function') p.catch(() => { console.info('Autoplay blocked by browser'); });
    }

    function setupVideoControls(){
      const container = video.closest('.interview-inner');
      if(!container) return;
      const controls = container.querySelector('.video-controls');
      if(!controls) return;

      try { video.controls = false; } catch(e) {}
      container.classList.add('has-controls');

      const btnPlay = controls.querySelector('.vc-play');
      const btnMute = controls.querySelector('.vc-mute');
      const btnFull = controls.querySelector('.vc-full');
      const seek = controls.querySelector('.vc-seek');
      const time = controls.querySelector('.vc-time');

      function formatTime(t){
        if(!isFinite(t)) return '0:00';
        const hrs = Math.floor(t / 3600);
        const mins = Math.floor((t % 3600) / 60);
        const secs = Math.floor(t % 60);
        const mm = (hrs ? String(mins).padStart(2,'0') : mins);
        const ss = String(secs).padStart(2,'0');
        return (hrs ? hrs + ':' + mm + ':' + ss : mm + ':' + ss);
      }

      function updatePlay(){
        if(video.paused){
          btnPlay.innerHTML = "<i class='bx bx-play' aria-hidden='true'></i>";
          btnPlay.setAttribute('aria-pressed','false');
        } else {
          btnPlay.innerHTML = "<i class='bx bx-pause' aria-hidden='true'></i>";
          btnPlay.setAttribute('aria-pressed','true');
        }
      }

      function updateMute(){
        if(video.muted){
          btnMute.innerHTML = "<i class='bx bx-volume-mute' aria-hidden='true'></i>";
          btnMute.setAttribute('aria-pressed','true');
        } else {
          btnMute.innerHTML = "<i class='bx bx-volume-full' aria-hidden='true'></i>";
          btnMute.setAttribute('aria-pressed','false');
        }
      }

      function updateTime(){
        const d = isFinite(video.duration) ? video.duration : 0;
        const c = isFinite(video.currentTime) ? video.currentTime : 0;
        const pct = d ? (c / d) * 100 : 0;
        if(seek){ seek.value = pct; seek.setAttribute('aria-valuenow', Math.round(pct)); }
        if(time){ time.textContent = formatTime(c) + ' / ' + (d ? formatTime(d) : '0:00'); }
      }

      if(seek){
        seek.addEventListener('input', (e) => {
          const d = isFinite(video.duration) ? video.duration : 0;
          if(d){ video.currentTime = (e.target.value / 100) * d; }
        });
      }

      btnPlay.addEventListener('click', () => {
        if(video.paused) {
          const p = video.play();
          if(p && typeof p.catch === 'function') p.catch(() => {});
        } else {
          video.pause();
        }
      });

      btnMute.addEventListener('click', () => {
        video.muted = !video.muted;
        updateMute();
      });

      btnFull.addEventListener('click', () => {
        const el = container;
        if(document.fullscreenElement){
          document.exitFullscreen();
        } else if(el.requestFullscreen){
          el.requestFullscreen();
        }
      });

      video.addEventListener('loadedmetadata', updateTime);
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('play', updatePlay);
      video.addEventListener('pause', updatePlay);
      video.addEventListener('volumechange', updateMute);

      video.muted = false;
      updatePlay();
      updateMute();
      updateTime();
    }

    setupVideoControls();

    if('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            loadVideo();
            obs.disconnect();
          }
        });
      }, {rootMargin: '200px 0px'});
      obs.observe(video);
    } else {
      loadVideo();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init, {once:true});
})();