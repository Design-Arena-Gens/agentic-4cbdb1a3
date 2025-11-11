# BuyBot

E-Commerce Checkout AI Agent that detects hesitation, offers instant help, integrates with Stripe/Razorpay, and uses data to optimize UX.

## Running locally

```bash
npm install
npm run dev
```

## Environment variables (optional for live providers)

- `STRIPE_SECRET_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_BASE_URL` (e.g., https://agentic-4cbdb1a3.vercel.app)

If not set, payments fall back to a demo confirmation flow.
