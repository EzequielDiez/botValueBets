// db/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./valuebets.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS valuebets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    casaDeApuestas TEXT,
    tipoDeEvento TEXT,
    fechaEvento TEXT,
    horaEvento TEXT,
    evento TEXT,
    mercado TEXT,
    cuota REAL,
    probabilidad REAL,
    excesoValor TEXT,
    stake TEXT,
    link TEXT,
    estado TEXT DEFAULT 'pendiente',
    resultado TEXT
  )`, (err) => {
    if (err) {
      console.error("Error al crear la tabla:", err.message);
    } else {
      console.log("Tabla 'valuebets' creada o ya existe.");
    }
  });
});

function dbQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Error en la consulta:", err.message);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

module.exports = { db, dbQuery };