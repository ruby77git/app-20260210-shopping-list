const { getPool } = require('./db');

module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === 'GET') {
    const [rows] = await pool.query(
      'SELECT id, name, checked, created_at FROM shopping_items ORDER BY created_at ASC'
    );
    const items = rows.map(r => ({ ...r, checked: !!r.checked }));
    return res.json(items);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    await pool.query(
      'INSERT INTO shopping_items (id, name) VALUES (UUID(), ?)', [name.trim()]
    );
    return res.status(201).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
