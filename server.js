const express = require('express');
const { exec } = require('child_process');
const valuebetsRoutes = require('./routes/valuebets.js');
const { startBot, getNextUpdateTime } = require('./bot/bot.js');
const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware para registrar cada solicitud
app.use((req, res, next) => {
  next();
});

// Rutas de la API
app.use('/api', valuebetsRoutes);

// Servir la carpeta "public" para archivos estáticos
app.use(express.static('public'));

// Endpoint para iniciar el bot
app.get('/start-bot', (req, res) => {
  startBot();
  res.send('Bot iniciado correctamente');
});

// Endpoint para obtener el tiempo de la próxima actualización
app.get('/next-update-time', (req, res) => {
  const nextUpdate = getNextUpdateTime();
  res.json({ nextUpdate: nextUpdate ? nextUpdate.toDate() : null });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});