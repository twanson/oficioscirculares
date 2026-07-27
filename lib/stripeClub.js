'use strict';
// Stripe para el Club: cliente + mapa price->plan + secreto del webhook.
// Degrada a null si faltan las env vars.
const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Price IDs de los payment links del Club (sobreescribibles por env).
const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL || 'price_1TwQF6DytfUJink6YjRYrrjk';
const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || 'price_1TwQFNDytfUJink6V8OYL1ZT';
const PRICE_TO_PLAN = { [PRICE_ANNUAL]: 'annual', [PRICE_MONTHLY]: 'monthly' };

let _stripe = null;
function getStripe() {
  if (!STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(STRIPE_SECRET_KEY);
  return _stripe;
}

module.exports = { getStripe, STRIPE_WEBHOOK_SECRET, PRICE_TO_PLAN };
