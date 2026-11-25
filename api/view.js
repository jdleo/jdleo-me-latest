// Hit counter - same Vercel Postgres `views` table as the old Next.js site.
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { rows } = await sql`UPDATE views SET view_count = view_count + 1 RETURNING view_count`;
      return res.status(200).json({ views: rows[0]?.view_count ?? 0 });
    }
    const { rows } = await sql`SELECT view_count FROM views LIMIT 1`;
    return res.status(200).json({ views: rows[0]?.view_count ?? 0 });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch views' });
  }
}
