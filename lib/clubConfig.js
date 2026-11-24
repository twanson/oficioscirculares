'use strict';
// Configuración editable del Club (flag de plazas, próximo directo, telegram…).
// Editar club-config.json + redeploy basta para cambiar el comportamiento de la
// landing y del área de miembros; no hace falta tocar código.
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'club-config.json');

const DEFAULTS = {
  plazas_abiertas: true,
  proximo_directo: '',
  telegram_invite_url: '',
  stripe_billing_portal: 'https://billing.stripe.com/p/login/9AQbMF7WPe2nfccdQQ',
  // Se activa el día del lanzamiento: muestra en el Diagnóstico que quien lo compra
  // puede entrar en el Club aunque las plazas estén cerradas.
  club_abierto: false,
  // Sección «Directos con artesanos»: oculta hasta tener tres invitados con fecha.
  directos_visible: false,
  // Fechas de apertura y cierre de plazas (ISO). Provisional: 18-27 de enero de 2027.
  club_apertura: '2027-01-18',
  club_cierre: '2027-01-27T23:59:00+01:00'
};

// Flags booleanos que pueden sobreescribirse por variable de entorno (Railway):
// CLUB_ABIERTO=true|false. La variable de entorno manda sobre el JSON.
function envBool(name) {
  const v = process.env[name];
  if (v === undefined || v === '') return undefined;
  return /^(1|true|si|sí|yes)$/i.test(String(v).trim());
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// '2027-01-27T23:59:00+01:00' -> '27 de enero de 2027' (sin depender de la zona del servidor)
function fechaLarga(iso, conAnio = true) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return '';
  const txt = `${Number(m[3])} de ${MESES[Number(m[2]) - 1]}`;
  return conAnio ? `${txt} de ${m[1]}` : txt;
}

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
  // Nº de plazas de fundador: única fuente en data/precios.json.
  cfg.plazas_totales = require('./precios').plazasFundador();
  const envAbierto = envBool('CLUB_ABIERTO');
  cfg.club_abierto = envAbierto !== undefined ? envAbierto : cfg.club_abierto === true;
  const envDirectos = envBool('DIRECTOS_VISIBLE');
  cfg.directos_visible = envDirectos !== undefined ? envDirectos : cfg.directos_visible === true;
  if (process.env.CLUB_APERTURA) cfg.club_apertura = process.env.CLUB_APERTURA.trim();
  if (process.env.CLUB_CIERRE) cfg.club_cierre = process.env.CLUB_CIERRE.trim();
  cfg.fechas = {
    apertura: fechaLarga(cfg.club_apertura),            // "18 de enero de 2027"
    apertura_corta: fechaLarga(cfg.club_apertura, false), // "18 de enero"
    cierre: fechaLarga(cfg.club_cierre),
    cierre_corta: fechaLarga(cfg.club_cierre, false)
  };
  return cfg;
}

module.exports = { getConfig, fechaLarga };
