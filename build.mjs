// jdleo.me static build - no framework, raw HTML/CSS, one tiny counter script.
// Reads: data.mjs, src/blog/posts/*.md, baked view counts. Writes: dist/.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import { SITE, APPS, POSTS, appUrl } from './data.mjs';

const ROOT = dirname(new URL(import.meta.url).pathname);
const DIST = join(ROOT, 'dist');
const out = (rel, content) => {
  const p = join(DIST, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
const fmtNum = (n) => Number(n).toLocaleString('en-US');
const postsDesc = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
const liveApps = APPS.filter((a) => a.live);

// Baked view counts (refreshed at build; JS updates them live on the page).
let homeViews = 7918;
try { homeViews = JSON.parse(readFileSync(join(ROOT, 'views-baked.json'), 'utf8')).views; } catch {}
const blogViews = {};
try { for (const r of JSON.parse(readFileSync(join(ROOT, 'blog-views.json'), 'utf8'))) blogViews[r.slug] = r.view_count; } catch {}

const CSS = `
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fbf9f3;color:#23201a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:44px 22px 40px}
.col{max-width:600px;margin:0 auto}
.col-wide{max-width:640px;margin:0 auto}
h1.name{font-size:31px;font-weight:700;letter-spacing:-.5px;margin:0 0 6px}
.role{font-size:15px;color:#6f6a5c;margin:0 0 26px}
nav.nav{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;letter-spacing:1.5px;font-weight:600;padding:13px 0;border-top:1px solid #e3ddcc;border-bottom:1px solid #e3ddcc;margin-bottom:34px}
nav.nav a{color:#23201a;text-decoration:none;margin-right:24px}
nav.nav a.on{border-bottom:2px solid #23201a;padding-bottom:2px}
nav.nav .views{font-weight:400;letter-spacing:.5px;color:#6f6a5c;font-size:13px;white-space:nowrap}
nav.nav .views b{color:#23201a;font-weight:700}
h2.sec{font-size:11.5px;letter-spacing:2.5px;color:#6f6a5c;font-weight:600;margin:34px 0 8px}
p.body{font-size:16px;line-height:1.7;margin:0 0 14px}
p.body a{color:#23201a}
.post{padding:11px 0;border-bottom:1px solid #eee8d8}
.post:last-child{border-bottom:none}
.post a{color:#23201a;text-decoration:none;font-size:16px;font-weight:550}
.post .d{display:block;font-size:12px;color:#6f6a5c;margin-top:3px;letter-spacing:1px}
.app{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:10px 0;border-bottom:1px solid #eee8d8;font-size:15.5px;white-space:nowrap}
.app:last-child{border-bottom:none}
.app .nm{overflow:hidden;text-overflow:ellipsis}
.app .desc{color:#6f6a5c;font-size:13.5px;white-space:nowrap}
.app a{color:#23201a;text-decoration:none}
.foot{margin-top:40px;padding-top:16px;border-top:1px solid #e3ddcc;font-size:12.5px;color:#6f6a5c;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
.foot a{color:#6f6a5c;text-decoration:none}
.top{display:flex;justify-content:space-between;font-size:12.5px;letter-spacing:1.5px;font-weight:600;margin-bottom:38px}
.top a{color:#23201a;text-decoration:none}
.top .r{color:#6f6a5c;font-weight:400;letter-spacing:.5px}
h1.title{font-size:33px;line-height:1.2;font-weight:700;letter-spacing:-.5px;margin:0 0 10px}
.meta{font-size:13px;color:#6f6a5c;letter-spacing:1px;padding-bottom:20px;border-bottom:1px solid #e3ddcc;margin-bottom:30px}
.md{font-size:17px;line-height:1.78;color:#2b2822}
.md p{margin:0 0 22px}
.md h2{font-size:21.5px;font-weight:700;letter-spacing:-.3px;margin:44px 0 14px;color:#23201a}
.md h3{font-size:18.5px;font-weight:700;margin:34px 0 12px;color:#23201a}
.md a{color:#23201a;text-decoration:underline;text-decoration-color:#b3a888;text-underline-offset:3px}
.md ul,.md ol{margin:0 0 22px;padding-left:26px}
.md li{margin-bottom:8px}
.md li>ul,.md li>ol{margin-top:8px;margin-bottom:4px}
.md code{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:.86em;background:#f0ead8;padding:2px 6px;border-radius:5px}
.md pre{background:#f4efe0;border:1px solid #e3ddcc;border-radius:8px;padding:16px 18px;overflow-x:auto;margin:0 0 24px}
.md pre code{background:none;padding:0;font-size:13.5px;line-height:1.65;display:block;white-space:pre}
.md blockquote{margin:0 0 22px;padding:2px 0 2px 18px;border-left:3px solid #23201a;color:#55503f}
.md blockquote p{margin:0}
.md table{width:100%;border-collapse:collapse;font-size:14.5px;margin:0 0 24px;display:block;overflow-x:auto}
.md th{text-align:left;font-size:11.5px;letter-spacing:1.5px;color:#6f6a5c;font-weight:600;padding:8px 10px 8px 0;border-bottom:2px solid #e3ddcc}
.md td{padding:9px 10px 9px 0;border-bottom:1px solid #eee8d8}
.md img{max-width:100%;height:auto;border:1px solid #e3ddcc;border-radius:8px}
.md hr{border:none;border-top:1px solid #e3ddcc;margin:36px 0}
.endmark{text-align:center;color:#6f6a5c;margin:36px 0 6px;font-size:13px;letter-spacing:6px}
@media (max-width:520px){h1.title{font-size:27px}.md{font-size:16px}}
`.replace(/\n\s*/g, '').trim();

const personLd = {
  '@context': 'https://schema.org', '@type': 'Person', name: SITE.name, url: SITE.url,
  image: SITE.url + '/og-image.png', jobTitle: 'Senior Software Engineer',
  worksFor: { '@type': 'Organization', name: 'Roblox' },
  alumniOf: [{ '@type': 'Organization', name: 'Amazon' }, { '@type': 'Organization', name: 'IBM' }],
  sameAs: [SITE.linkedin, SITE.github],
  knowsAbout: ['Software Engineering', 'Distributed Systems', 'AI Engineering', 'System Design', 'AWS', 'TypeScript', 'Rust', 'Go', 'Java', 'Python'],
  email: 'mailto:' + SITE.email,
};
const websiteLd = {
  '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.title, url: SITE.url,
  description: SITE.description, author: { '@type': 'Person', name: SITE.name },
};

function head({ title, description, path, type = 'website', image = '/og-image.png', extraLd = [], published, tags }) {
  const url = SITE.url + (path === '/' ? '' : path);
  const mdAlt = path === '/' ? '/index.md' : path + '.md';
  const ld = [personLd, websiteLd, ...extraLd];
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(SITE.keywords.join(', '))}">
<meta name="author" content="${SITE.name}">
<meta name="creator" content="${SITE.name}">
<meta name="publisher" content="${SITE.name}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#fbf9f3">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="${url}">
<link rel="me" href="${SITE.url}">
<link rel="me" href="${SITE.linkedin}">
<link rel="me" href="${SITE.github}">
<link rel="alternate" type="text/markdown" href="${SITE.url}${mdAlt}">
<link rel="alternate" type="application/rss+xml" title="${SITE.name} - Blog" href="${SITE.url}/feed.xml">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(SITE.title)}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
${published ? `<meta property="article:published_time" content="${published}T12:00:00Z">\n<meta property="article:author" content="${SITE.url}">\n${(tags || []).map((t) => `<meta property="article:tag" content="${esc(t)}">`).join('\n')}\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:creator" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.url}${image}">
<meta name="twitter:image:alt" content="${esc(title)}">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<style>${CSS}</style>`;
}

const shell = ({ headHtml, bodyHtml, wide = false }) => `<!DOCTYPE html>
<html lang="en">
<head>
${headHtml}
</head>
<body>
<main class="${wide ? 'col-wide' : 'col'}">
${bodyHtml}
</main>
</body>
</html>
`;

const footLinks = `<div class="foot"><span></span><span><a href="${SITE.github}">GitHub</a> &nbsp;·&nbsp; <a href="${SITE.linkedin}">LinkedIn</a> &nbsp;·&nbsp; <a href="/feed.xml">RSS</a> &nbsp;·&nbsp; <a href="mailto:${SITE.email}">${SITE.email}</a></span></div>`;
const nav = (active, viewsHtml = '') => `<nav class="nav"><span><a href="/"${active === 'about' ? ' class="on"' : ''}>ABOUT</a><a href="/apps"${active === 'apps' ? ' class="on"' : ''}>APPS</a><a href="/blog"${active === 'blog' ? ' class="on"' : ''}>BLOG</a></span>${viewsHtml}</nav>`;
const headerBlock = `<h1 class="name">${SITE.name}</h1><p class="role">${SITE.role}<br>${SITE.location}</p>`;

// ---------- HOME ----------
const latestPosts = postsDesc.slice(0, 3);
const homeBody = `${headerBlock}
${nav('about', `<span class="views"><b id="vc" data-count="home">${fmtNum(homeViews)}</b> views</span>`)}
<p class="body">${esc(SITE.bio)}</p>
<p class="body">I also build free iOS apps. They're all on the App Store, listed below.</p>
<h2 class="sec">LATEST WRITING</h2>
${latestPosts.map((p) => `<div class="post"><a href="/blog/${p.slug}">${esc(p.title)}</a><span class="d">${fmtDate(p.date)}</span></div>`).join('\n')}
<h2 class="sec">APPS</h2>
${liveApps.map((a) => `<div class="app"><span class="nm"><a href="${appUrl(a)}">${esc(a.name)}</a></span><span class="desc">${esc(a.tagline)}</span></div>`).join('\n')}
${footLinks}
<script src="/counter.js" defer></script>`;
out('index.html', shell({ headHtml: head({ title: SITE.title, description: SITE.description, path: '/' }), bodyHtml: homeBody }));

// ---------- APPS ----------
const appsBody = `${headerBlock}
${nav('apps')}
<p class="body">Free iOS apps, built solo. No ads, no subscriptions - just free.</p>
<h2 class="sec">ON THE APP STORE</h2>
${liveApps.map((a) => `<div class="app"><span class="nm"><a href="${appUrl(a)}">${esc(a.name)}</a></span><span class="desc">${esc(a.tagline)}</span></div>`).join('\n')}
${footLinks}`;
out('apps/index.html', shell({ headHtml: head({ title: 'Apps | ' + SITE.title, description: 'Free iOS apps by John Leonardo: ' + liveApps.map((a) => a.name).join(', ') + '.', path: '/apps' }), bodyHtml: appsBody }));

// ---------- BLOG INDEX ----------
const blogIndexBody = `${headerBlock}
${nav('blog')}
<h2 class="sec">ALL WRITING</h2>
${postsDesc.map((p) => `<div class="post"><a href="/blog/${p.slug}">${esc(p.title)}</a><span class="d">${fmtDate(p.date)}${blogViews[p.slug] ? ` &nbsp;·&nbsp; <span data-bv="${p.slug}">${fmtNum(blogViews[p.slug])}</span> VIEWS` : ''}</span></div>`).join('\n')}
${footLinks}
<script src="/counter.js" defer></script>`;
out('blog/index.html', shell({ headHtml: head({ title: 'Blog | ' + SITE.title, description: 'Writing by John Leonardo on AI, machine learning experiments, and software engineering.', path: '/blog' }), bodyHtml: blogIndexBody }));

// ---------- POSTS ----------
marked.setOptions({ gfm: true, breaks: false });
for (const p of POSTS) {
  const raw = readFileSync(join(ROOT, 'src/blog/posts', p.slug + '.md'), 'utf8');
  let html = marked.parse(raw);
  html = html.replace(/<img /g, '<img loading="lazy" decoding="async" ');
  const postLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title,
    description: p.description, datePublished: p.date, dateModified: p.date,
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Person', name: SITE.name, url: SITE.url },
    image: SITE.url + '/og/blog-' + p.slug + '.png',
    mainEntityOfPage: SITE.url + '/blog/' + p.slug,
    keywords: p.tags.join(', '),
  };
  const views = blogViews[p.slug];
  const body = `<div class="top"><a href="/blog">&larr; ALL WRITING</a><span class="r">jdleo.me</span></div>
<h1 class="title">${esc(p.title)}</h1>
<div class="meta">${fmtDate(p.date)}${views ? ` &nbsp;·&nbsp; <span id="vc" data-count="post" data-slug="${p.slug}">${fmtNum(views)}</span> VIEWS` : ''}</div>
<div class="md">
${html}
</div>
<div class="endmark">· · ·</div>
<div class="foot"><span><a href="/blog">&larr; All writing</a></span><span><a href="/">Home</a></span></div>
<script src="/counter.js" defer></script>`;
  out(join('blog', p.slug, 'index.html'), shell({
    headHtml: head({ title: p.title + ' | ' + SITE.title, description: p.description, path: '/blog/' + p.slug, type: 'article', image: '/og/blog-' + p.slug + '.png', extraLd: [postLd], published: p.date, tags: p.tags }),
    bodyHtml: body, wide: true,
  }));
  out(join('blog', p.slug + '.md'), `# ${p.title}\n\n> ${p.description}\n> ${fmtDate(p.date)} - ${SITE.url}/blog/${p.slug}\n\n${raw}\n`);
}

// ---------- 404 ----------
out('404.html', shell({
  headHtml: head({ title: 'Not Found | ' + SITE.title, description: 'Page not found.', path: '/404' }),
  bodyHtml: `${headerBlock}\n${nav('')}\n<p class="body">That page doesn't exist. It may have been one of the old mini apps - those are gone. The writing and the apps are still here.</p>\n${footLinks}`,
}));

// ---------- MARKDOWN TWINS / LLMS / FEEDS ----------
const appsMd = liveApps.map((a) => `- [${a.name}](${appUrl(a)}) - ${a.tagline}`).join('\n');
const postsMd = postsDesc.map((p) => `- [${p.title}](${SITE.url}/blog/${p.slug}) (${p.date}) - ${p.description}`).join('\n');
out('index.md', `# John Leonardo (jdleo.me)\n\n> Personal site of John Leonardo, Senior Software Engineer at Roblox. Free iOS apps and a technical blog covering AI/ML experiments.\n\n${SITE.description}\n\n- Site: ${SITE.url}\n- Contact: ${SITE.email}\n- GitHub: ${SITE.github}\n- LinkedIn: ${SITE.linkedin}\n\nEvery page on this site is available in both HTML and clean Markdown. Append \`.md\` to any page URL to get the Markdown version (e.g. ${SITE.url}/blog/tinysafe.md).\n\n## Apps\n\n${appsMd}\n\n## Latest writing\n\n${postsMd}\n`);
out('apps.md', `# Apps by John Leonardo\n\nFree iOS apps, built solo.\n\n${appsMd}\n`);
out('blog.md', `# Blog - John Leonardo\n\n${postsMd}\n`);
out('llms.txt', `# John Leonardo (jdleo.me)\n\n> Personal site of John Leonardo, Senior Software Engineer at Roblox (previously Amazon Search Science, IBM). Free iOS apps and a technical blog covering AI/ML experiments and software engineering.\n\nEvery page is available as HTML and as clean Markdown (append .md to any URL).\n\n## Pages\n\n- [Home](${SITE.url}/): bio, latest writing, app list\n- [Apps](${SITE.url}/apps): free iOS apps on the App Store\n- [Blog](${SITE.url}/blog): all writing\n\n## Apps\n\n${appsMd}\n\n## Blog posts\n\n${postsMd}\n`);

const sitemapUrls = ['/', '/apps', '/blog', ...POSTS.map((p) => '/blog/' + p.slug)];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((u) => {
  const post = POSTS.find((p) => '/blog/' + p.slug === u);
  const lm = post ? post.date : postsDesc[0].date;
  return `<url><loc>${SITE.url}${u === '/' ? '' : u}</loc><lastmod>${lm}</lastmod></url>`;
}).join('\n')}\n</urlset>\n`);

const rssDate = (iso) => new Date(iso + 'T12:00:00Z').toUTCString();
out('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n<title>${SITE.name} - Blog</title>\n<link>${SITE.url}/blog</link>\n<description>Writing by John Leonardo on AI, machine learning experiments, and software engineering.</description>\n<language>en-us</language>\n<lastBuildDate>${rssDate(postsDesc[0].date)}</lastBuildDate>\n<atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>\n${postsDesc.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE.url}/blog/${p.slug}</link><guid isPermaLink="true">${SITE.url}/blog/${p.slug}</guid><pubDate>${rssDate(p.date)}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}\n</channel>\n</rss>\n`);

out('robots.txt', 'User-Agent: *\nAllow: /\nDisallow: /api/\nDisallow: /private/\n\nSitemap: https://jdleo.me/sitemap.xml\n');

// ---------- STATIC ASSETS ----------
out('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="7" y="4" width="50" height="56" rx="6" fill="#fbf9f3" stroke="#23201a" stroke-width="3"/><path d="M19 24h26M19 33h26M19 42h16" stroke="#23201a" stroke-width="3.5" stroke-linecap="round"/></svg>\n`);
if (existsSync(join(ROOT, 'counter.js'))) copyFileSync(join(ROOT, 'counter.js'), join(DIST, 'counter.js'));
for (const img of ['Clash_Royale_LightGBM_Results.png', 'Clash_Royale_NN_Results.png', 'political-compass.png']) {
  const src = join(ROOT, 'assets', img);
  if (existsSync(src)) copyFileSync(src, join(DIST, img));
}
const ogDir = join(ROOT, 'assets-og');
if (existsSync(ogDir)) {
  for (const f of readdirSync(ogDir, { withFileTypes: true })) if (f.isFile()) copyFileSync(join(ogDir, f.name), join(DIST, f.name));
  const ogSub = join(ogDir, 'og');
  if (existsSync(ogSub)) { mkdirSync(join(DIST, 'og'), { recursive: true }); for (const f of readdirSync(ogSub)) copyFileSync(join(ogSub, f), join(DIST, 'og', f)); }
}
if (existsSync(join(ROOT, 'assets', 'apple-touch-icon.png'))) copyFileSync(join(ROOT, 'assets', 'apple-touch-icon.png'), join(DIST, 'apple-touch-icon.png'));

// ---------- BUDGET REPORT ----------
const sizes = {};
for (const rel of ['index.html', 'apps/index.html', 'blog/index.html', ...POSTS.map((p) => join('blog', p.slug, 'index.html'))]) {
  sizes[rel] = readFileSync(join(DIST, rel)).length;
}
console.log('page sizes (raw bytes):');
for (const [k, v] of Object.entries(sizes)) console.log(' ', k, v);
const home = sizes['index.html'];
if (home > 20480) { console.error('BUDGET FAIL: home', home, '> 20480'); process.exit(1); }
console.log('budget OK: home', home, 'bytes');
