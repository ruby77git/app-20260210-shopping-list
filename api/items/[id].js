const { getPool } = require('../db');

module.exports = async function handler(req, res) {
  const pool = getPool();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { checked } = req.body;
    await pool.query(
      'UPDATE shopping_items SET checked = ? WHERE id = ?', [checked ? 1 : 0, id]
    );
    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM shopping_items WHERE id = ?', [id]);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
