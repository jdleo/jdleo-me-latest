// Social card generator - screenshots theme-matched HTML cards at 1200x630.
// Outputs: assets-og/og-image.png, assets-og/og/blog-<slug>.png, assets/apple-touch-icon.png
import { chromium } from 'playwright-core';
import { mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { SITE, POSTS } from './data.mjs';

const ROOT = dirname(new URL(import.meta.url).pathname);
mkdirSync(join(ROOT, 'assets-og', 'og'), { recursive: true });
mkdirSync(join(ROOT, 'assets'), { recursive: true });

const FONT = `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`;
const card = (inner) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fbf9f3;color:#23201a;font-family:${FONT};padding:72px 80px;display:flex;flex-direction:column}
.kicker{font-size:19px;letter-spacing:4px;color:#97917e;font-weight:600}
.rule{border-top:2px solid #e3ddcc;margin:26px 0}
.bottom{margin-top:auto;display:flex;justify-content:space-between;align-items:baseline;font-size:21px;color:#6f6a5c}
.bottom b{color:#23201a}
</style></head><body>${inner}</body></html>`;

const siteCard = card(`
<div>
  <div style="font-size:88px;font-weight:700;letter-spacing:-1.5px;line-height:1.05">John Leonardo</div>
  <div style="font-size:34px;color:#6f6a5c;margin-top:18px">Senior Software Engineer at Roblox</div>
  <div class="rule"></div>
  <div style="font-size:26px;line-height:1.55;color:#2b2822;max-width:900px">Distributed systems, high-scale architectures, and AI services. Free iOS apps and a technical blog.</div>
</div>
<div class="bottom"><span><b>jdleo.me</b></span><span>Apps &nbsp;·&nbsp; Blog</span></div>`);

const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
const titleSize = (t) => (t.length <= 48 ? 66 : t.length <= 85 ? 54 : 43);
const postCard = (p) => card(`
<div>
  <div class="kicker">JDLEO.ME - BLOG</div>
  <div style="font-size:${titleSize(p.title)}px;font-weight:700;letter-spacing:-1px;line-height:1.18;margin-top:30px">${p.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>
</div>
<div class="bottom"><span><b>John Leonardo</b></span><span>${fmtDate(p.date)}</span></div>`);

const iconHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0}body{width:180px;height:180px;background:#fbf9f3;display:flex;align-items:center;justify-content:center}
</style></head><body>
<svg width="150" height="150" viewBox="0 0 64 64"><rect x="7" y="4" width="50" height="56" rx="6" fill="#fbf9f3" stroke="#23201a" stroke-width="3"/><path d="M19 24h26M19 33h26M19 42h16" stroke="#23201a" stroke-width="3.5" stroke-linecap="round"/></svg>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(siteCard, { waitUntil: 'load' });
await page.screenshot({ path: join(ROOT, 'assets-og', 'og-image.png') });
for (const p of POSTS) {
  await page.setContent(postCard(p), { waitUntil: 'load' });
  await page.screenshot({ path: join(ROOT, 'assets-og', 'og', 'blog-' + p.slug + '.png') });
}
const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
await icon.setContent(iconHtml, { waitUntil: 'load' });
await icon.screenshot({ path: join(ROOT, 'assets', 'apple-touch-icon.png') });
await browser.close();

const kb = (p) => Math.round(statSync(p).size / 1024) + 'KB';
console.log('og-image.png', kb(join(ROOT, 'assets-og', 'og-image.png')));
for (const p of POSTS) console.log('og/blog-' + p.slug + '.png', kb(join(ROOT, 'assets-og', 'og', 'blog-' + p.slug + '.png')));
console.log('apple-touch-icon.png', kb(join(ROOT, 'assets', 'apple-touch-icon.png')));
