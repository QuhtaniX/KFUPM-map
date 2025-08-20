const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe only if STRIPE_SECRET_KEY is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Create payment intent for premium subscription
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not available' });
    }

    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount < 500) { // Minimum $5.00
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId: req.user._id.toString(),
        email: req.user.email
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create subscription
router.post('/create-subscription', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not available' });
    }

    const { paymentMethodId, priceId } = req.body;

    if (!paymentMethodId || !priceId) {
      return res.status(400).json({ error: 'Payment method and price ID are required' });
    }

    // Create or get Stripe customer
    let customer;
    if (req.user.subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.subscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update user with Stripe customer ID
      req.user.subscription.stripeCustomerId = customer.id;
      await req.user.save();
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user subscription
    req.user.subscription.tier = 'premium';
    req.user.subscription.stripeSubscriptionId = subscription.id;
    req.user.subscription.expiresAt = new Date(subscription.current_period_end * 1000);
    await req.user.save();

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not available' });
    }

    if (!req.user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const subscription = await stripe.subscriptions.update(
      req.user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    res.json({
      message: 'Subscription will be cancelled at the end of the current period',
      cancelAt: new Date(subscription.cancel_at * 1000)
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not available' });
    }

    if (!req.user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const subscription = await stripe.subscriptions.update(
      req.user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    res.json({
      message: 'Subscription reactivated successfully',
      status: subscription.status
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Get subscription status
router.get('/subscription-status', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not available' });
    }

    if (!req.user.subscription.stripeSubscriptionId) {
      return res.json({
        hasSubscription: false,
        tier: req.user.subscription.tier
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      req.user.subscription.stripeSubscriptionId
    );

    res.json({
      hasSubscription: true,
      tier: req.user.subscription.tier,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Get payment history
router.get('/payment-history', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not available' });
    }

    if (!req.user.subscription.stripeCustomerId) {
      return res.json({ payments: [] });
    }

    const payments = await stripe.paymentIntents.list({
      customer: req.user.subscription.stripeCustomerId,
      limit: 10
    });

    const paymentHistory = payments.data.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100, // Convert from cents
      currency: payment.currency,
      status: payment.status,
      created: new Date(payment.created * 1000)
    }));

    res.json({ payments: paymentHistory });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment service not available' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) return;

  if (subscription.status === 'active') {
    user.subscription.tier = 'premium';
    user.subscription.expiresAt = new Date(subscription.current_period_end * 1000);
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    user.subscription.tier = 'free';
    user.subscription.expiresAt = null;
  }

  await user.save();
}

async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) return;

  user.subscription.tier = 'free';
  user.subscription.expiresAt = null;
  await user.save();
}

async function handlePaymentFailed(invoice) {
  const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
  if (!user) return;

  // Could send email notification here
  console.log(`Payment failed for user ${user.email}`);
}

module.exports = router;