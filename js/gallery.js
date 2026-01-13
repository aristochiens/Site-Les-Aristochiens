(function(){
  function init(){
    const grid = document.querySelector('.gallery-grid');
    if(!grid) return;

    const items = Array.from(grid.querySelectorAll('.gallery-item'));
    if(!items.length) return;

    // compute number of columns from CSS grid (fallback to 3)
    let cols = 3;
    try{
      const gs = window.getComputedStyle(grid);
      const colsDef = gs.gridTemplateColumns;
      if(colsDef && colsDef.trim()){
        cols = colsDef.split(' ').length;
      }
    }catch(e){}

    const rowsToShow = 2;
    const visibleCount = cols * rowsToShow;

    if(items.length <= visibleCount) return; // nothing to do

    // hide items after visibleCount
    items.forEach((it, idx) => {
      if(idx >= visibleCount){
        it.classList.add('is-collapsed');
        it.setAttribute('aria-hidden','true');
      }
    });

    // Add toggle button
    const controls = document.createElement('div');
    controls.className = 'gallery-toggle';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-ghost gallery-toggle-btn';
    btn.textContent = 'Afficher plus';
    btn.setAttribute('aria-expanded','false');
    controls.appendChild(btn);
    grid.parentNode.insertBefore(controls, grid.nextSibling);

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if(!expanded){
        // reveal
        items.forEach(it => {
          it.classList.remove('is-collapsed');
          it.removeAttribute('aria-hidden');
        });
        btn.setAttribute('aria-expanded','true');
        btn.textContent = 'Afficher moins';
      } else {
        // collapse
        items.forEach((it, idx) => {
          if(idx >= visibleCount){
            it.classList.add('is-collapsed');
            it.setAttribute('aria-hidden','true');
          }
        });
        btn.setAttribute('aria-expanded','false');
        btn.textContent = 'Afficher plus';
        // scroll back to gallery top to avoid user losing context
        grid.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });

    // Optional: reveal when user scrolls near gallery (progressive reveal)
    if('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(en => {
          if(en.isIntersecting && btn.getAttribute('aria-expanded') === 'false'){
            // don't auto-expand but ensure button is visible; we could lazy-load images here
            // no auto action to respect user's choice
          }
        });
      }, {rootMargin: '200px 0px'});
      obs.observe(grid);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init, {once:true});
})();