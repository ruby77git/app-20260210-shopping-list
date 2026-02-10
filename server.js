require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shopping_items (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      checked TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('shopping_items 테이블 준비 완료');
}

app.get('/api/items', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, checked, created_at FROM shopping_items ORDER BY created_at ASC'
  );
  const items = rows.map(r => ({ ...r, checked: !!r.checked }));
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const [result] = await pool.query(
    'INSERT INTO shopping_items (id, name) VALUES (UUID(), ?)', [name.trim()]
  );
  res.status(201).json({ success: true });
});

app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  await pool.query(
    'UPDATE shopping_items SET checked = ? WHERE id = ?', [checked ? 1 : 0, id]
  );
  res.json({ success: true });
});

app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM shopping_items WHERE id = ?', [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('DB 초기화 실패:', err.message);
  process.exit(1);
});
