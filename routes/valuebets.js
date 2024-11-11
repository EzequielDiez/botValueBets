// routes/valuebets.js

const express = require('express');
const { dbQuery } = require('../db/database.js');
const router = express.Router();

router.get('/valuebets', async (req, res) => {
    const { sortColumn, sortOrder, filters } = req.query;
    const filterParams = JSON.parse(filters);
  
    let query = 'SELECT * FROM valuebets WHERE 1=1';
    const values = [];
  
    for (const [key, value] of Object.entries(filterParams)) {
      if (value) {
        query += ` AND ${key} LIKE ?`;
        values.push(`%${value}%`);
      }
    }
  
    if (sortColumn) {
      query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    }
  
    try {
      const rows = await dbQuery(query, values);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching data:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

router.post('/updateResult', async (req, res) => {
    const { id, resultado } = req.body;
    try {
        await dbQuery('UPDATE valuebets SET resultado = ?, estado = "finalizado" WHERE id = ?', [resultado, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating result:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;