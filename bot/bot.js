// bot/bot.js
const { scrapeValuebets } = require('./scraper.js');
const { dbQuery } = require('../db/database.js');
const schedule = require('node-schedule');

let nextUpdateTime = null;

async function checkForNewValuebets(newValuebets) {
  for (const valuebet of newValuebets) {
    const existingValuebet = await dbQuery(
      'SELECT * FROM valuebets WHERE evento = ? AND mercado = ?',
      [valuebet.evento, valuebet.mercado]
    );

    if (!existingValuebet.length) {
      await dbQuery(
        `INSERT INTO valuebets (casaDeApuestas, tipoDeEvento, fechaEvento, horaEvento, evento, mercado, cuota, probabilidad, excesoValor, stake, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [valuebet.casaDeApuestas, valuebet.tipoDeEvento, valuebet.fechaEvento, valuebet.horaEvento, valuebet.evento, valuebet.mercado, valuebet.cuota, valuebet.probabilidad, valuebet.excesoValor, valuebet.stake, valuebet.link]
      );
    } else {
      const cuotaActual = parseFloat(existingValuebet[0].cuota);
      const nuevaCuota = parseFloat(valuebet.cuota);

      if (cuotaActual !== nuevaCuota) {
        const direccionCambio = nuevaCuota > cuotaActual ? '⬆️' : '⬇️';
        await dbQuery(
          'UPDATE valuebets SET cuota = ? WHERE evento = ? AND mercado = ?',
          [nuevaCuota, valuebet.evento, valuebet.mercado]
        );
      }
    }
  }
}

async function updateEventStatus() {
  const currentTime = new Date().toISOString();
  await dbQuery(
    'UPDATE valuebets SET estado = ? WHERE strftime("%Y-%m-%d %H:%M", fechaEvento || " " || horaEvento) <= ? AND estado = "pendiente"',
    ['en_juego', currentTime]
  );
}

async function startBot() {
  const newValuebets = await scrapeValuebets();

  if (newValuebets.length > 0) {
    await checkForNewValuebets(newValuebets);
  }

  await updateEventStatus();

  const job = schedule.scheduleJob('*/1 * * * *', async () => {
    const newValuebets = await scrapeValuebets();

    if (newValuebets.length > 0) {
      await checkForNewValuebets(newValuebets);
    }

    await updateEventStatus();
    
    nextUpdateTime = job.nextInvocation();
  });

  nextUpdateTime = job.nextInvocation();
}

function getNextUpdateTime() {
  return nextUpdateTime;
}

module.exports = { startBot, getNextUpdateTime };