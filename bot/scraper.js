// bot/scraper.js

const puppeteer = require('puppeteer');
const { loadCookies, loginIfNeeded } = require('./auth');

async function scrapeValuebets() {
    let browser;
    try {
        console.log('Iniciando el navegador...');
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        await loadCookies(page);
        
        await page.goto('https://es.surebet.com/valuebets', { waitUntil: 'networkidle2' });
        
        await loginIfNeeded(page);

        const valuebets = await page.evaluate(() => {
            function calcularStake(cuota, probabilidad) {
                const b = cuota - 1;
                const p = probabilidad / 100;
                const q = 1 - p;
                const stake = (b * p - q) / b;
                return Math.max(stake * 0.15 * 100, 0); // Multiplicar por 100 para obtener el porcentaje
            }

            const rows = document.querySelectorAll('table tbody tr');
            const data = [];

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 8) {
                    return;
                }

                const casaDeApuestasConTipo = cells[1].innerText.trim().split('\n');
                const casaDeApuestas = casaDeApuestasConTipo[0] || 'N/A';
                const tipoDeEvento = casaDeApuestasConTipo[1] || 'N/A';

                const fechaHora = cells[2].innerText.trim().split('\n');
                const fechaEvento = fechaHora[0] || 'N/A';
                const horaEvento = fechaHora[1] || 'N/A';

                const originalLink = cells[3].querySelector('a')?.href || 'N/A';
                const modifiedLink = originalLink.includes('bet365.com') 
                                      ? originalLink.replace('bet365.com', 'bet365.bet.ar') 
                                      : originalLink;

                const cuota = parseFloat(cells[5].innerText.trim()) || 0;
                const probabilidad = parseFloat(cells[7].innerText.trim()) || 0;
                const stake = calcularStake(cuota, probabilidad).toFixed(2);

                const valuebet = {
                    casaDeApuestas,
                    tipoDeEvento,
                    fechaEvento,
                    horaEvento,
                    evento: cells[3].innerText.trim() || 'N/A',
                    mercado: cells[4].innerText.trim() || 'N/A',
                    cuota: cells[5].innerText.trim() || 'N/A',
                    probabilidad: cells[7].innerText.trim() || 'N/A',
                    excesoValor: cells[8].innerText.trim() || 'N/A',
                    stake: `${stake}%`,
                    link: modifiedLink
                };

                data.push(valuebet);
            });
            
            return data; // Devolver el array de data
        });

        return valuebets;

    } catch (error) {
        console.error('Error al scrapear la página:', error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { scrapeValuebets };
