'use strict';
// Configuración editable del Club (flag de plazas, próximo directo, telegram…).
// Editar club-config.json + redeploy basta para cambiar el comportamiento de la
// landing y del área de miembros; no hace falta tocar código.
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'club-config.json');

const DEFAULTS = {
  plazas_abiertas: true,
  plazas_totales: 40,
  proximo_directo: '',
  telegram_invite_url: '',
  stripe_billing_portal: 'https://billing.stripe.com/p/login/9AQbMF7WPe2nfccdQQ'
};

function getConfig() {
  let cfg = { ...DEFAULTS };
  try {
    cfg = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
  } catch (e) {
    console.error('⚠️  club-config.json no legible, usando defaults:', e.message);
  }
  // El env var TELEGRAM_INVITE_URL puede sobreescribir el del JSON si el JSON lo deja vacío.
  if (!cfg.telegram_invite_url && process.env.TELEGRAM_INVITE_URL) {
    cfg.telegram_invite_url = process.env.TELEGRAM_INVITE_URL;
  }
  cfg.plazas_abiertas = cfg.plazas_abiertas !== false; // por defecto abiertas
  return cfg;
}

module.exports = { getConfig };
