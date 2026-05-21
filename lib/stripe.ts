import 'server-only'

import Stripe from 'stripe'

// Use a default test key for build time, actual key will be used at runtime
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build')
