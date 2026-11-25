// Per-post view counts - same Vercel Postgres `blog_views` table as the old site.
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const slug = body.slug;
      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Blog post slug is required' });
      }
      const result = await sql`
        INSERT INTO blog_views (slug, view_count)
        VALUES (${slug}, 1)
        ON CONFLICT (slug)
        DO UPDATE SET view_count = blog_views.view_count + 1
        RETURNING view_count
      `;
      return res.status(200).json({ success: true, viewCount: result.rows[0].view_count, slug });
    }
    const slug = req.query?.slug;
    if (slug) {
      const result = await sql`SELECT view_count FROM blog_views WHERE slug = ${slug}`;
      return res.status(200).json({ success: true, slug, viewCount: result.rows.length ? result.rows[0].view_count : 0 });
    }
    const result = await sql`SELECT slug, view_count FROM blog_views ORDER BY view_count DESC`;
    return res.status(200).json({ success: true, views: result.rows });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch blog view counts' });
  }
}
