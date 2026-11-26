'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const raiz = path.join(__dirname, '..');
const locals = abiertas => ({
  precios: require('../lib/precios'), testimoniosLib: require('../lib/testimonios'),
  config: require('../lib/clubConfig').getConfig(), directosVisible: false, plazasAbiertas: abiertas
});
const club = abiertas => ejs.renderFile(path.join(raiz, 'views/club.ejs'), locals(abiertas));

test('con las plazas cerradas, /club no lleva enlaces de pago y mantiene noindex', async () => {
  const html = await club(false);
  assert.ok(!/buy\.stripe\.com|club_checkout_click/.test(html));
  assert.match(html, /action="\/club\/lista-espera"/);
  assert.match(html, /noindex/);
  assert.ok((await club(true)).includes('buy.stripe.com'));
});

test('la configuración tiene las plazas cerradas', () => {
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(raiz, 'club-config.json'), 'utf8')).plazas_abiertas, false);
});

test('la lista de espera no da por bueno un alta sin Brevo configurado', async () => {
  delete process.env.BREVO_API_KEY; delete process.env.BREVO_WAITLIST_LIST_ID;
  delete require.cache[require.resolve('../lib/brevoWaitlist')];
  const r = await require('../lib/brevoWaitlist').addToWaitlist('x@example.com');
  assert.strictEqual(r.ok, false);
});
