// utils/helpers.js
function calcularStake(cuota, probabilidad) {

    const b = cuota - 1;

    const p = probabilidad / 100;

    const q = 1 - p;

    const stake = Math.max((b * p - q) / b, 0);

    return stake;
}

module.exports = { calcularStake };
