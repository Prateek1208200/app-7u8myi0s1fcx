# Stripe Integration Setup Guide

## Required Environment Variables

To enable payment processing, you need to configure the following Supabase secrets:

### 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### 2. Configure Supabase Secrets

You need to add the following secret to your Supabase project:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### 3. Test the Integration

1. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any 3-digit CVC

2. Navigate to `/pricing` page
3. Click "Subscribe Now" on any paid tier
4. Complete the checkout process
5. Verify payment success on `/payment-success` page

## Subscription Tiers

- **Free**: $0/month - Basic features
- **Premium**: $9.99/month - Premium content access
- **Creator**: $29.99/month - Full creator tools

## Edge Functions

The following Edge Functions handle payment processing:

1. **create_stripe_checkout**: Creates Stripe checkout sessions
2. **verify_stripe_payment**: Verifies payment completion and updates user subscription

## Security Notes

- Never commit Stripe keys to version control
- Use test keys during development
- Switch to live keys only in production
- Stripe keys are stored securely in Supabase secrets
