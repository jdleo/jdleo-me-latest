// jdleo.me view counters - one tiny script for the home, blog index and post pages.
// External (not inline) so the site can run a strict Content-Security-Policy.
(function () {
  function fmt(v) { return Number(v).toLocaleString('en-US'); }
  function get(u, o) { return fetch(u, o).then(function (r) { return r.json(); }); }
  var vc = document.getElementById('vc');
  if (vc && vc.getAttribute('data-count') === 'home') {
    get('/api/view', { method: 'POST' }).then(function (d) {
      if (d && d.views != null) vc.textContent = fmt(d.views);
    }).catch(function () {});
  }
  if (vc && vc.getAttribute('data-count') === 'post') {
    get('/api/blog-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: vc.getAttribute('data-slug') }),
    }).then(function (d) {
      if (d && d.viewCount != null) vc.textContent = fmt(d.viewCount);
    }).catch(function () {});
  }
  if (document.querySelector('[data-bv]')) {
    get('/api/blog-views').then(function (d) {
      if (d && d.views) d.views.forEach(function (v) {
        var el = document.querySelector('[data-bv="' + v.slug + '"]');
        if (el) el.textContent = fmt(v.view_count);
      });
    }).catch(function () {});
  }
})();
