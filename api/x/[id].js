// Short-link resolver - keeps every existing jdleo.me/x/<id> link working.
// Same `links` / `link_visits` tables as the old Next.js route.
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const id = req.query?.id || String(req.url || '').split('/').pop().split('?')[0];
  if (!id || !/^[A-Za-z0-9]{5}$/.test(id)) {
    return res.status(404).send('Link not found');
  }
  try {
    const { rows } = await sql`SELECT url FROM links WHERE id = ${id}`;
    if (rows.length === 0) return res.status(404).send('Link not found');
    try {
      await sql`
        INSERT INTO link_visits (link_id, visit_date, visit_count)
        VALUES (${id}, CURRENT_DATE, 1)
        ON CONFLICT (link_id, visit_date)
        DO UPDATE SET visit_count = link_visits.visit_count + 1
      `;
    } catch {}
    res.writeHead(302, { Location: rows[0].url });
    return res.end();
  } catch {
    return res.status(404).send('Link not found');
  }
}
