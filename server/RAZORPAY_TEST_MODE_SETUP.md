# Razorpay Test Mode Setup (SportsBuddy)

This project uses Razorpay for **paid event join** in test mode.

## 1) Environment Variables

Set the following variables in `server/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Notes:
- Use **Test Mode** keys from your Razorpay dashboard.
- Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-side only.

## 2) Webhook Configuration

In Razorpay dashboard (Test mode):
- Webhook URL: `https://<your-domain>/api/events/payments/webhook/razorpay`
- Secret: same value as `RAZORPAY_WEBHOOK_SECRET`
- Events to subscribe:
  - `payment.captured`
  - `payment.failed`
  - `order.paid`

## 3) Integration Flow

1. Client requests server to create order: `POST /api/events/:id/payment/order`
2. Server creates Razorpay order and stores `EventPayment` with status `created`
3. Client opens checkout using returned `keyId` + `order.id`
4. Client sends Razorpay response to server: `POST /api/events/:id/payment/verify`
5. Server verifies HMAC signature and payment status, then registers participant
6. Webhook endpoint reconciles late or asynchronous updates

## 4) Admin Monitoring

Admin panel route:
- `/admin/event-payments`

It shows payment status, order/payment IDs, failure reason, and paid revenue.

## 5) Test Data

Use Razorpay test card/UPI values from official docs in test mode.
No real money is charged.

## 6) Security Guarantees

- Orders are created only on server.
- Signature verification is done server-side using HMAC SHA256.
- Payment records are persisted in MongoDB (`EventPayment`).
- Join for paid event is blocked unless payment verification succeeds.
