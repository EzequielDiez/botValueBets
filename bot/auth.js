// bot/auth.js

const fs = require('fs');
const credentials = require('../config/credentials.js');

const cookiesFilePath = './cookies.json';

// Función para cargar cookies
async function loadCookies(page) {
  try {
    if (fs.existsSync(cookiesFilePath)) {
      const cookiesString = fs.readFileSync(cookiesFilePath, 'utf-8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    } else {
    }
  } catch (error) {
  }
}

// Función para guardar cookies
async function saveCookies(page) {
  try {
    const cookies = await page.cookies();
    fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
  } catch (error) {
  }
}

// Función para iniciar sesión
async function loginIfNeeded(page) {
  const isLoggedIn = await page.evaluate(() => {
    return !!document.querySelector('.navbar-nav.login-part .nav-link.dropdown-toggle');
  });

  if (!isLoggedIn) {
    await page.goto('https://es.surebet.com/users/sign_in', { waitUntil: 'networkidle2' });
    await page.type('input[name="user[email]"]', credentials.username);
    await page.type('input[name="user[password]"]', credentials.password);
    await page.click('#sign_in_user');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await saveCookies(page);
  } else {
    console.log('Ya estás conectado.');
  }
}

module.exports = { loadCookies, saveCookies, loginIfNeeded };
