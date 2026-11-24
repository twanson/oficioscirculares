const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

// Si falla: node scripts/menu-estatico.mjs
test('las páginas estáticas llevan el menú de views/partials/header.ejs', async () => {
  const { desfasadas, paginas } = await import('../scripts/menu-estatico.mjs');
  assert.ok(paginas().length > 0);
  assert.deepStrictEqual(desfasadas().map((r) => path.basename(path.dirname(r))), []);
});
